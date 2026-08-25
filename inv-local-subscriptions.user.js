// ==UserScript==
// @name        Invidious Local Subscriptions - DelDevel's Fork
// @author      mthsk, DelDevel
// @homepage    https://github.com/DelDevel/invidious-local-subs/
// @match       *://yewtu.be/*
// @match       *://inv.nadeko.net/*
// @match       *://yt.chocolatemoo53.com/*
// @match       *://invidious.f5.si/*
// @match       *://invidious.tiekoetter.com/*
// @match       *://invidious.nerdvpn.de/*
// @version     2026.08
// @description Implements local subscriptions on Invidious.
// @run-at      document-end
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.xmlHttpRequest
// @license     AGPL-3.0
// ==/UserScript==
/**
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
(async function () {
  "use strict";

  const DEFAULT_SETTINGS = {
    rssperchannel: 3,
  };

  const FEED_CACHE_DURATION = 1800000; // 30 minutes
  const BATCH_SIZE = 39;
  const RANDOM_ID_LENGTH_MIN = 16;
  const RANDOM_ID_LENGTH_MAX = 32;
  const RANDOM_CHARS = "abcdefghijklmnopqrstuvwxyz0123456789";

  let subscriptions = (await GM.getValue("subscriptions")) || [];
  let settings = (await GM.getValue("settings")) || { ...DEFAULT_SETTINGS };

  function randomId() {
    const length =
      Math.floor(
        Math.random() * (RANDOM_ID_LENGTH_MAX - RANDOM_ID_LENGTH_MIN + 1),
      ) + RANDOM_ID_LENGTH_MIN;
    let result = "";
    for (let i = 0; i < length; i++) {
      result += RANDOM_CHARS.charAt(
        Math.floor(Math.random() * RANDOM_CHARS.length),
      );
    }
    return result;
  }

  function roundViews(views) {
    if (views <= 1) return views === 1 ? "1 view" : "0 views";
    if (views >= 1e9)
      return (
        (Math.floor(views / 1e7) / 100).toFixed(views < 10 ? 1 : 0) + "B views"
      );
    if (views >= 1e6)
      return (
        (Math.floor(views / 1e4) / 100).toFixed(views < 10 ? 1 : 0) + "M views"
      );
    if (views >= 1e3)
      return (
        (Math.floor(views / 100) / 10).toFixed(views < 10 ? 1 : 0) + "K views"
      );
    return views + " views";
  }

  function msToHumanTime(ms) {
    const seconds = ms / 1000;
    const units = [
      { threshold: 31536000, label: "year" },
      { threshold: 2628000, label: "month" },
      { threshold: 604800, label: "week" },
      { threshold: 86400, label: "day" },
      { threshold: 3600, label: "hour" },
      { threshold: 60, label: "minute" },
    ];

    for (const { threshold, label } of units) {
      if (seconds >= threshold) {
        const value = Math.floor(seconds / threshold);
        return value > 1 ? `${value} ${label}s ago` : `${value} ${label} ago`;
      }
    }
    const value = Math.floor(seconds);
    return value > 1 ? `${value} seconds ago` : `${value} second ago`;
  }

  function durationString(scs) {
    const date = new Date(0);
    date.setSeconds(scs);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const secs = date.getUTCSeconds();
    const mm = minutes < 10 ? "0" + minutes : minutes;
    const ss = secs < 10 ? "0" + secs : secs;
    return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
  }

  async function parseRSS(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "text/xml");

    const ATOM_NS = "http://www.w3.org/2005/Atom";
    const YT_NS = "http://www.youtube.com/xml/schemas/2015";
    const MEDIA_NS = "http://search.yahoo.com/mrss/";

    const entries = xml.getElementsByTagNameNS(ATOM_NS, "entry");
    const videos = [];

    for (const entry of entries) {
      const getTitle = () => {
        const el = entry.getElementsByTagNameNS(ATOM_NS, "title")[0];
        return el ? el.textContent : "";
      };
      const getPublished = () => {
        const el = entry.getElementsByTagNameNS(ATOM_NS, "published")[0];
        return el ? el.textContent : "";
      };
      const getAuthor = () => {
        const author = entry.getElementsByTagNameNS(ATOM_NS, "author")[0];
        const name = author?.getElementsByTagNameNS(ATOM_NS, "name")[0];
        return name ? name.textContent : "";
      };
      const getLink = () => {
        const el = entry.getElementsByTagNameNS(ATOM_NS, "link")[0];
        return el ? el.getAttribute("href") || "" : "";
      };

      const ytVideoIdEl = entry.getElementsByTagNameNS(YT_NS, "videoId")[0];
      const ytVideoId = ytVideoIdEl ? ytVideoIdEl.textContent : "";

      const authorIdEl = entry.getElementsByTagNameNS(YT_NS, "channelId")[0];
      const authorId = authorIdEl ? authorIdEl.textContent : "";
      const link = getLink();
      const fallbackVideoId = link.match(/v=([^&]+)/)?.[1] || "";

      const duration = entry.getElementsByTagNameNS(MEDIA_NS, "duration")[0];
      const lengthSeconds = duration
        ? parseInt(duration.getAttribute("duration")) || 0
        : 0;
      const statisticsEl = entry.getElementsByTagNameNS(
        MEDIA_NS,
        "statistics",
      )[0];
      const viewCount = statisticsEl?.getAttribute("views");

      videos.push({
        title: getTitle(),
        videoId: ytVideoId || fallbackVideoId,
        author: getAuthor(),
        published: Date.parse(getPublished()),
        lengthSeconds,
        viewCount,
        authorId,
      });
    }

    return videos;
  }

  async function getRSSSubscriptionFeed() {
    let feed = await GM.getValue("feed", {
      last: Date.now(),
      feed: [],
    });

    if (feed.feed.length != 0 && Date.now() - feed.last < FEED_CACHE_DURATION) {
      return feed.feed;
    }

    const allVideos = [];
    const perChannelLimit = settings.rssperchannel || 5;

    for (let i = 0; i < subscriptions.length; i++) {
      const loadingEl = document.getElementById("invlocal-loading");
      if (loadingEl) {
        loadingEl.textContent = `Fetching channel ${i + 1} out of ${subscriptions.length}`;
      }

      const channelId = subscriptions[i].id;
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

      try {
        const result = await new Promise((resolve, reject) => {
          GM.xmlHttpRequest({
            method: "GET",
            url: rssUrl,
            timeout: 10000,
            onload: (resp) => {
              const status = resp.status || resp.readyState;
              if (resp.status === 200) {
                resolve({ text: resp.responseText, error: false });
              } else {
                resolve({ text: "", error: true });
              }
            },
            onerror: () => resolve({ text: "", error: true }),
            ontimeout: () => resolve({ text: "", error: true }),
          });
        });

        if (result.error) {
          continue;
        }

        const videos = await parseRSS(result.text);
        allVideos.push(...videos.slice(0, perChannelLimit));
      } catch {
        continue;
      }
    }

    allVideos.sort((a, b) => b.published - a.published);

    await GM.setValue("feed", { last: Date.now(), feed: allVideos });
    return allVideos;
  }

  function buildVideoCardHTML(video) {
    const ms = video.published;
    const shared = Date.now() - ms;

    return (
      `<div class="pure-u-1 pure-u-md-1-4">` +
      `<div class="h-box">` +
      `<div class="thumbnail">` +
      `<a tabindex="-1" href="/watch?v=${video.videoId}">` +
      `<img loading="lazy" class="thumbnail" src="/vi/${video.videoId}/mqdefault.jpg" alt="">` +
      `</a>` +
      `<div class="top-left-overlay">` +
      `</div>` +
      `<div class="bottom-right-overlay">` +
      `<p class="length">${durationString(video.lengthSeconds)}</p>` +
      `</div>` +
      `</div>` +
      `<div class="video-card-row">` +
      `<a href="/watch?v=${video.videoId}">` +
      `<p dir="auto">${video.title}</p>` +
      `</a>` +
      `</div>` +
      `<div class="video-card-row flexible">` +
      `<div class="flex-left">` +
      `<a href="/channel/${video.authorId}">` +
      `<p class="channel-name" dir="auto">${video.author}</p>` +
      `</a>` +
      `</div>` +
      `<div class="flex-right flexible">` +
      `<div class="icon-buttons">` +
      `<a title="Embed" rel="noopener" referrerpolicy="origin-when-cross-origin" href="https://www.youtube.com/embed/${video.videoId}">` +
      `<i class="icon ion-md-open"></i>` +
      `</a>` +
      `<a title="Watch on YouTube" rel="noreferrer noopener" href="https://www.youtube.com/watch?v=${video.videoId}">` +
      `<i class="icon ion-logo-youtube"></i>` +
      `</a>` +
      `<a title="Audio mode" href="/watch?v=${video.videoId}&amp;listen=1">` +
      `<i class="icon ion-md-headset"></i>` +
      `</a>` +
      `<a title="Switch Invidious Instance" href="https://redirect.invidious.io/watch?v=${video.videoId}">` +
      `<i class="icon ion-md-jet"></i>` +
      `</a>` +
      `</div>` +
      `</div>` +
      `</div>` +
      `<div class="video-card-row flexible">` +
      `<div class="flex-left">` +
      `<p class="video-data" dir="auto">Shared ${msToHumanTime(shared)}</p>` +
      `</div>` +
      `<div class="flex-right">` +
      `<p class="video-data" dir="auto">${roundViews(video.viewCount)}</p>` +
      `</div>` +
      `</div>` +
      `</div>` +
      `</div>`
    );
  }

  async function displaySubscriptionFeed(feed, start = 0) {
    const container = document.querySelector("hr ~ div.pure-g");
    if (!container) return;

    if (start === 0) {
      container.innerHTML = "";
    }

    const end = Math.min(start + BATCH_SIZE, feed.length) - 1;

    container.className = "hbox";

    for (let i = start; i <= end; i++) {
      container.innerHTML += buildVideoCardHTML(feed[i]);
    }
  }

  function renderSubscribedChannels() {
    const content = document.getElementById("contents");
    if (!content) return;

    document.title = "Your Subscribed Channels - Invidious";
    content.innerHTML =
      '<h2 style="margin-top:1em;">Subscribed Channels</h2><ul id="sub-list" style="list-style:none; padding:0;"></ul>';

    const list = document.getElementById("sub-list");
    const subs = subscriptions;

    if (subs.length === 0) {
      list.innerHTML = "<li>No local subscriptions yet.</li>";
      return;
    }

    subs.forEach((sub) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="/channel/${sub.id}" class="channel-name">${sub.name}</a>`;
      li.style.marginBottom = "0.5em";
      list.appendChild(li);
    });
  }

  function buildNavbarHTML(extraLinks = "") {
    return (
      `<a href="/feed/popular" class="feed-menu-item pure-menu-heading">Popular</a>` +
      `<a href="/feed/trending" class="feed-menu-item pure-menu-heading">Trending</a>` +
      `<a href="/search?q=${randomId()}#invlocal" class="feed-menu-item pure-menu-heading">Local Subscriptions</a>` +
      `<a href="javascript:void(0);" id="invlocal-subs-button" class="feed-menu-item pure-menu-heading">Subscribed Channels</a>` +
      extraLinks
    );
  }

  function replaceNavbar(html) {
    const existing = document.querySelector(".feed-menu");
    if (existing) {
      const newNav = document.createElement("div");
      newNav.classList.add("feed-menu");
      newNav.innerHTML = html;
      existing.parentElement.replaceChild(newNav, existing);
    }
  }

  function setupSubscribeButton() {
    const invsubbutton = document.getElementById("subscribe");
    if (!invsubbutton) return;

    const localsubbutton = invsubbutton.cloneNode(true);
    localsubbutton.id = "localsubscribe";
    localsubbutton.removeAttribute("href");
    invsubbutton.parentElement.appendChild(localsubbutton);

    let chid = "";
    let chname = "";

    if (location.pathname.startsWith("/channel/")) {
      chid = location.pathname.split("/")[2];
      chname =
        document
          .querySelector('div[class="channel-profile"] span')
          ?.textContent.trim() || "";
    } else {
      const channelLink = document.querySelector(
        "a[href] .channel-profile",
      )?.parentElement;
      chid = channelLink?.getAttribute("href")?.split("/")[2] || "";
      chname =
        document.getElementById("channel-name")?.textContent.trim() || "";
    }

    function updateButtonState() {
      const subscribed = subscriptions.some((e) => e.id === chid);
      localsubbutton.innerHTML = subscribed
        ? "<b>Unsubscribe Locally</b>"
        : "<b>Subscribe Locally</b>";
    }

    updateButtonState();

    localsubbutton.addEventListener("click", async function (ev) {
      const alreadySubscribed = subscriptions.some((e) => e.id === chid);

      if (alreadySubscribed) {
        if (!confirm(`Do you really want to unsubscribe from "${chname}"?`))
          return;

        const index = subscriptions.findIndex((e) => e.id === chid);
        if (index !== -1) {
          subscriptions.splice(index, 1);
        }
      } else {
        subscriptions.push({ id: chid, name: chname });
      }

      await GM.setValue("subscriptions", subscriptions);
      updateButtonState();
    });
  }

  async function initFeedPage() {
    replaceNavbar(
      `<a href="/feed/popular" class="feed-menu-item pure-menu-heading">Popular</a>` +
        `<a href="/feed/trending" class="feed-menu-item pure-menu-heading">Trending</a>` +
        `<a id="invlocal-refresh" href="javascript:void(0);" class="feed-menu-item pure-menu-heading">Refresh Subscriptions</a>`,
    );

    document.title = "Local Subscription Feed - Invidious";

    let feed = await getRSSSubscriptionFeed();


    let startIndex = 0;
    await displaySubscriptionFeed(feed, startIndex);

    window.addEventListener("scroll", function () {
      if (
        window.innerHeight + window.pageYOffset >= document.body.offsetHeight &&
        !document.getElementById("invlocal-loading")
      ) {
        startIndex += BATCH_SIZE;
        if (startIndex < feed.length) {
          displaySubscriptionFeed(feed, startIndex);
        }
      }
    });
  }

  function initHomePage() {
    const subsButton = document.getElementById("invlocal-subs-button");
    if (!subsButton) return;

    subsButton.addEventListener("click", async () => {
      const content = document.getElementById("contents");
      if (!content) return;

      document.title = "Your Subscribed Channels - Invidious";
      content.innerHTML =
        '<h2 style="margin-top:1em;">Subscribed Channels</h2><ul id="sub-list" style="list-style:none; padding:0;"></ul>';

      const list = document.getElementById("sub-list");
      const subs = (await GM.getValue("subscriptions")) || [];

      if (subs.length === 0) {
        list.innerHTML = "<li>No local subscriptions yet.</li>";
        return;
      }

      subs.forEach((sub) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="/channel/${sub.id}" class="channel-name">${sub.name}</a>`;
        li.style.marginBottom = "0.5em";
        list.appendChild(li);
      });
    });
  }

  const navbarHTML = buildNavbarHTML();
  replaceNavbar(navbarHTML);

  const path = location.pathname.toLowerCase();
  const search = location.search.toLowerCase();
  const hash = location.hash.toLowerCase();
  const isLocalFeedSearch =
    path === "/search" &&
    search.startsWith("?q=") &&
    !search.includes("&") &&
    hash === "#invlocal";
  const isFeedPage = path.startsWith("/feed/");

  if (isLocalFeedSearch) {
    initFeedPage();
  } else if (path === "/") {
    initHomePage();
  } else if (isFeedPage) {
    replaceNavbar(buildNavbarHTML());

    const subsButton = document.getElementById("invlocal-subs-button");
    if (subsButton) {
      subsButton.addEventListener("click", async () => {
        const content = document.getElementById("contents");
        if (!content) return;

        document.title = "Your Subscribed Channels - Invidious";
        content.innerHTML =
          '<h2 style="margin-top:1em;">Subscribed Channels</h2><ul id="sub-list" style="list-style:none; padding:0;"></ul>';

        const list = document.getElementById("sub-list");
        const subs = (await GM.getValue("subscriptions")) || [];

        if (subs.length === 0) {
          list.innerHTML = "<li>No local subscriptions yet.</li>";
          return;
        }

        subs.forEach((sub) => {
          const li = document.createElement("li");
          li.innerHTML = `<a href="/channel/${sub.id}" class="channel-name">${sub.name}</a>`;
          list.appendChild(li);
        });
      });
    }
  } else if (path.startsWith("/channel/") || path === "/watch") {
    setupSubscribeButton();
  } else if (path === "/subscriptions") {
    renderSubscribedChannels();
  }
})();
