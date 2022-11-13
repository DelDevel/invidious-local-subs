// ==UserScript==
// @name        Simple Sponsor Skipper
// @author      SkauOfArcadia
// @homepage    https://codeberg.org/mthsk/userscripts/src/branch/master/simple-sponsor-skipper
// @downloadURL https://codeberg.org/mthsk/userscripts/raw/branch/master/simple-sponsor-skipper/simple-sponsor-skipper.user.js
// @updateURL   https://codeberg.org/mthsk/userscripts/raw/branch/master/simple-sponsor-skipper/simple-sponsor-skipper.user.js
// @match       *://m.youtube.com/*
// @match       *://youtu.be/*
// @match       *://www.youtube.com/*
// @match       *://www.youtube-nocookie.com/embed/*
// @match       *://inv.riverside.rocks/*
// @match       *://invidio.xamh.de/*
// @match       *://invidious.esmailelbob.xyz/*
// @match       *://invidious.flokinet.to/*
// @match       *://invidious-jp.kavin.rocks/*
// @match       *://invidious-us.kavin.rocks/*
// @match       *://invidious.kavin.rocks/*
// @match       *://invidious.lunar.icu/*
// @match       *://inv.bp.mutahar.rocks/*
// @match       *://invidious.mutahar.rocks/*
// @match       *://invidious.namazso.eu/*
// @match       *://invidious.osi.kr/*
// @match       *://invidious.privacy.gd/*
// @match       *://invidious.snopyta.org/*
// @match       *://invidious.weblibre.org/*
// @match       *://tube.cthd.icu/*
// @match       *://vid.mint.lgbt/*
// @match       *://vid.puffyan.us/*
// @match       *://yewtu.be/*
// @match       *://youtube.076.ne.jp/*
// @match       *://yt.artemislena.eu/*
// @match       *://tube.cadence.moe/*
// @grant       GM.getValue
// @grant       GM.setValue
// @grant       GM.notification
// @grant       GM.openInTab
// @grant       GM.registerMenuCommand
// @grant       GM.xmlHttpRequest
// @allFrames   true
// @connect     sponsor.ajay.app
// @connect     sponsorblock.kavin.rocks
// @connect     mirror.sb.mchang.xyz
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @run-at      document-start
// @version     2022.11
// @license     AGPL-3.0-or-later
// @description Skips annoying intros, sponsors and w/e on YouTube and its frontends like Invidious and CloudTube using the SponsorBlock API.
// ==/UserScript==
/**
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
 (async function() {
    "use strict";
    async function go(videoId) {
        console.log("New video ID: " + videoId);

        const inst = s3settings.instance || "sponsor.ajay.app";
        let segurl = "";
        let result = [];
        let rBefore = -1;
        let cat = ["poi_highlight"];
        if (s3settings.categories & categories.sponsor)
            cat.push("sponsor");
        if (s3settings.categories & categories.intro)
            cat.push("intro");
        if (s3settings.categories & categories.outro)
            cat.push("outro");
        if (s3settings.categories & categories.interaction)
            cat.push("interaction");
        if (s3settings.categories & categories.selfpromo)
            cat.push("selfpromo");
        if (s3settings.categories & categories.preview)
            cat.push("preview");
        if (s3settings.categories & categories.music_offtopic)
            cat.push("music_offtopic");
        if (s3settings.categories & categories.filler)
            cat.push("filler");

        if (s3settings.disable_hashing)
        {
            segurl = 'https://' + inst + '/api/skipSegments?videoID=' + videoId + "&categories=" + encodeURIComponent(JSON.stringify(shuffle(cat)));
        }
        else
        {
            let vidsha256 = await sha256(videoId);
            console.log("SHA256 hash: " + vidsha256);
            segurl = 'https://' + inst + '/api/skipSegments/' + vidsha256.substring(0,4) + "?categories=" + encodeURIComponent(JSON.stringify(shuffle(cat)));
        }
        console.log(segurl);

        const resp = await (function() {
            return new Promise(resolve => {
                GM.xmlHttpRequest({
                    method: 'GET',
                    url: segurl,
                    headers: {
                        'Accept': 'application/json'
                    },
                    onload: resolve
                });
            });
        })();
        try {
            let response;
            if (s3settings.disable_hashing)
                response = JSON.parse("[{\"videoID\":\"" + videoId + "\",\"segments\":" + resp.responseText + "}]");
            else
                response = JSON.parse(resp.responseText);

            for (let x = 0; x < response.length; x++)
            {
                if (response[x].videoID === videoId)
                {
                    rBefore = response[x].segments.length;
                    result = processSegments(response[x].segments);
                    break;
                }
            }
        } catch (e) { result = []; }
        let x = 0;
        let prevTime = -1;
        let player;
        let favicon = document.querySelector('link[rel=icon]');
        if (favicon && favicon.hasAttribute('href')){
            favicon = favicon.href;
        } else {
            favicon = null;
        }
        if (result.length > 0) {
            if (s3settings.notifications && window.self === window.top) {
                let ntxt = "";
                if (result.length === rBefore) {
                    ntxt = "Received " + result.length;
                    if (result.length > 1) {
                        ntxt += " segments."
                    } else {
                        ntxt += " segment."
                    }
                } else {
                    ntxt = "Received " + rBefore + " segments, " + result.length + " after processed.";
                }
                setTimeout(() => { GM.notification({
                    title: "Skippable segments found!",
                    text: ntxt + "\n\u00AD\n" + document.title + " (Video ID: " + videoId + ")",
                    silent: true,
                    timeout: 5000,
                    image: favicon,
                })}, 600);
            }
            if (location.hostname === 'youtube.com' || location.hostname.endsWith(".youtube.com") ||
                location.hostname === 'youtube-nocookie.com' || location.hostname.endsWith(".youtube-nocookie.com") ||
                location.hostname === 'youtu.be' || location.hostname.endsWith(".youtu.be")) // YouTube
            {
                let looped = false;
                const tfunc = function() {
                    if (location.pathname.indexOf(videoId) === -1 && location.search.indexOf('v=' + videoId) === -1) {
                        window.clearInterval(timer);
                        document.removeEventListener("visibilitychange", efunc);
                        console.log('Disposing of timer for video ID ' + videoId);
                    } //Dispose of the timer once we no longer need it.
                    else
                    {
                        player = unsafeWindow.document.getElementById("movie_player");
                        if (player.baseURI.indexOf(videoId) !== -1 && player.getPlayerState() === 1 && x < result.length && player.getCurrentTime() >= result[x].segment[0]) {
                            if (player.getCurrentTime() < result[x].segment[1]) {
                                if (player.getLoopVideo() === true &&
                                   Math.round(result[x].segment[1]) === Math.round(player.getDuration()))
                                {
                                    player.seekTo(0);
                                    looped = true;
                                }
                                else
                                    player.seekTo(result[x].segment[1]);

                                if (s3settings.notifications)
                                {
                                    GM.notification({
                                        title: "Skipped " + result[x].category.replace('music_offtopic','non-music').replace('selfpromo', 'self-promotion') + " segment.",
                                        text: "Segment " + (x + 1) + " out of " + result.length + "\n\u00AD\n" + document.title + " (Video ID: " + videoId + ")",
                                        silent: true,
                                        timeout: 5000,
                                        image: favicon,
                                    });
                                }
                                console.log("Skipping " + result[x].category + " segment (" + (x + 1) + " out of " + result.length + ") from " + result[x].segment[0] + " to " + result[x].segment[1]);
                            }
                            x++;
                        } else if (player.getCurrentTime() < prevTime || looped) {
                            looped = false;
                            for (let s = 0; s < result.length; s++) {
                                if (player.getCurrentTime() < result[s].segment[1]) {
                                    x = s;
                                    console.log("Next segment is " + s);
                                    break;
                                }
                            }
                        }
                        prevTime = player.getCurrentTime();
                    }
                };
                var timer = window.setInterval(tfunc, 333);
                const efunc = function() { //prevents the interval from being killed after switching tabs
                    window.clearInterval(timer);
                    timer = window.setInterval(tfunc, 333);
                };
                document.addEventListener("visibilitychange", efunc);
            }
            else // Invidious/CloudTube
            {
                player = await (function() {
                    return new Promise(resolve => {
                        let plr = document.getElementById("player_html5_api") || document.getElementById("player") || document.getElementById("video");
                        if (!!plr.video) {
                            resolve(plr.video);
                        }
                        else if (!!plr) {
                            resolve(plr);
                        }
                        else {
                            document.addEventListener('load', function(event){
                                plr = document.getElementById("player_html5_api") || document.getElementById("player") || document.getElementById("video");
                                if (!!plr.video) {
                                    resolve(plr.video);
                                }
                                else {
                                    resolve(plr);
                                }
                            });
                        }
                    });
                })();
                player.addEventListener('timeupdate', () => {
                    if (!player.paused && x < result.length && player.currentTime >= result[x].segment[0]) {
                        if (player.currentTime < result[x].segment[1]) {
                            player.currentTime = result[x].segment[1];
                            if (s3settings.notifications) {
                                GM.notification({
                                    title: "Skipped " + result[x].category.replace('music_offtopic','non-music').replace('selfpromo', 'self-promotion') + " segment.",
                                    text: "Segment " + (x + 1) + " out of " + result.length + "\n\u00AD\n" + document.title + " (Video ID: " + videoId + ")",
                                    silent: true,
                                    timeout: 5000,
                                    image: favicon,
                                });
                            }
                            console.log("Skipping " + result[x].category + " segment (" + (x + 1) + " out of " + result.length + ") from " + result[x].segment[0] + " to " + result[x].segment[1]);
                        }
                        x++;
                    } else if (player.currentTime < prevTime) {
                        for (let s = 0; s < result.length; s++) {
                            if (player.currentTime < result[s].segment[1]) {
                                x = s;
                                console.log("Next segment is " + s);
                                break;
                            }
                        }
                    }
                    prevTime = player.currentTime;
                });
            }
        }
    }

    function processSegments(segments) {
        if (typeof segments === 'object') {
            let newSegments = [];
            let newKey = 0;
            for (let x = 0; x < segments.length; x++) {
                if (x > 0 && Math.ceil(newSegments[newKey - 1].segment[1]) >= Math.floor(segments[x].segment[0]) && newSegments[newKey - 1].segment[1] < segments[x].segment[1] && segments[x].votes >= s3settings.upvotes) {
                    newSegments[newKey - 1].segment[1] = segments[x].segment[1];
                    newSegments[newKey - 1].category = "combined";
                    console.log(x + " combined with " + (newKey - 1));
                } else if (segments[x].votes < s3settings.upvotes || (x > 0 && Math.ceil(newSegments[newKey - 1].segment[1]) >= Math.floor(segments[x].segment[0]) && newSegments[newKey - 1].segment[1] >= segments[x].segment[1])) {
                    console.log("Ignoring segment " + x);
                } else {
                    newSegments[newKey] = segments[x];
                    console.log(newKey + " added");
                    newKey++;
                }
            }
            return newSegments;
        } else {
            return [];
        }
    }

    async function sha256(message) {
        // encode as UTF-8
        const msgBuffer = new TextEncoder().encode(message);

        // hash the message
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

        // convert ArrayBuffer to Array
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        // convert bytes to hex string
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    function shuffle(array) {
      let currentIndex = array.length,  randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
          array[randomIndex], array[currentIndex]];
      }

      return array;
    }

    const categories = {
        sponsor: 1,
        intro: 2,
        outro: 4,
        interaction: 8,
        selfpromo: 16,
        preview: 32,
        music_offtopic: 64,
        filler: 128
    }

    let s3settings;

    s3settings = await GM.getValue('s3settings');
    if(!!s3settings && Object.keys(s3settings).length > 0){
        console.log((new Date()).toTimeString().split(' ')[0] + ' - Simple Sponsor Skipper: Settings loaded!');
    } else {
        s3settings = JSON.parse('{ "categories":127, "upvotes":-2, "notifications":true, "disable_hashing":false, "instance":"sponsor.ajay.app", "darkmode":-1 }');
        if(navigator.userAgent.toLowerCase().indexOf('pale moon') !== -1
           || navigator.userAgent.toLowerCase().indexOf('mypal') !== -1
           || navigator.userAgent.toLowerCase().indexOf('male poon') !== -1)
        {
            s3settings.disable_hashing = true;
        }
        await GM.setValue('s3settings', s3settings);
        console.log((new Date()).toTimeString().split(' ')[0] + ' - Simple Sponsor Skipper: Default settings saved!');
        GM.notification({
            title: "Simple Sponsor Skipper",
            text: "It looks like this is your first time using Simple Sponsor Skipper.\n\u00AD\nClick here to open the configuration menu!",
            timeout: 10000,
            silent: true,
            onclick: function() { GM.openInTab(document.location.protocol + "//" + document.location.host.replace('youtube-nocookie.com', 'youtube.com') + document.location.pathname.replace('/embed/','/watch?v=').replace('/v/','/watch?v=') + document.location.search.replace('?','&').replace('&v=','?v=') + "#s3config"); },
        });
    }
    if (location.hash.toLowerCase() === '#s3config') {
        window.addEventListener("DOMContentLoaded", function() {
            const docHtml = document.getElementsByTagName('html')[0];
            docHtml.innerHTML = '\<center><h1>Simple Sponsor Skipper</h1><br><form><div><input type="checkbox" id="sponsor"><label for="sponsor">Skip sponsor segments</label><br><input type="checkbox" id="intro"><label for="intro">Skip intro segments</label><br><input type="checkbox" id="outro"><label for="outro">Skip outro segments</label><br><input type="checkbox" id="interaction"><label for="interaction">Skip interaction reminder segments</label><br><input type="checkbox" id="selfpromo"><label for="selfpromo">Skip self-promotion segments</label><br><input type="checkbox" id="preview"><label for="preview">Skip preview segments</label><br><input type="checkbox" id="music_offtopic"><label for="music_offtopic">Skip non-music segments in music videos</label><br><input type="checkbox" id="filler"><label for="filler">Skip filler segments (WARNING: very aggressive!)</label><br><label for="upvotes">Minimum segment upvotes:</label><input type="number" id="upvotes"><br><input type="checkbox" id="notifications"><label for="notifications">Enable Desktop Notifications</label><br><input type="checkbox" id="disable_hashing"><label for="disable_hashing">Disable Video ID Hashing (Pale Moon Compatibility Fix)</label><br><label for="instance">Database Instance:</label><input id="instance" type="text" list="instances" /><datalist id="instances"><option value="sponsor.ajay.app">sponsor.ajay.app (Official)</option><option value="sponsorblock.kavin.rocks">sponsorblock.kavin.rocks</option><option value="sponsorblock.gleesh.net">sponsorblock.gleesh.net</option><option value="sb.theairplan.com">sb.theairplan.com</option></datalist><br><label for="darkmode">Theme:</label><select id="darkmode"><option value="-1">auto</option><option value="0">light</option> <option value="1">dark</option></select></div><br><div><button type="button" id="btnsave" style="margin-right: 1em;">Save settings</button><button type="button" id="btnclose" style="margin-left: 1em;">Close</button></div></form></center>';
            docHtml.style = "";
            document.head.innerHTML = "\<style> body { background-color: white; color: black; } .dark-theme { background-color: black; color: white; } </style>";
            document.title = 'Simple Sponsor Skipper Configuration';
            document.getElementById('sponsor').checked = (s3settings.categories & categories.sponsor);
            document.getElementById('intro').checked = (s3settings.categories & categories.intro);
            document.getElementById('outro').checked = (s3settings.categories & categories.outro);
            document.getElementById('interaction').checked = (s3settings.categories & categories.interaction);
            document.getElementById('selfpromo').checked = (s3settings.categories & categories.selfpromo);
            document.getElementById('preview').checked = (s3settings.categories & categories.preview);
            document.getElementById('music_offtopic').checked = (s3settings.categories & categories.music_offtopic);
            document.getElementById('filler').checked = (s3settings.categories & categories.filler);
            document.getElementById('upvotes').value = s3settings.upvotes;
            document.getElementById('notifications').checked = s3settings.notifications;
            document.getElementById('disable_hashing').checked = s3settings.disable_hashing;
            document.getElementById('instance').value = s3settings.instance || "sponsor.ajay.app";
            document.getElementById('darkmode').value = s3settings.darkmode || -1;
            document.getElementById('darkmode').addEventListener("change", function(e) {
                const val = parseInt(e.target.value, 10);
                if (val === 1 ||
                    (val === -1 && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches))
                {
                    document.body.classList.add('dark-theme');
                }
                else { document.body.classList.remove('dark-theme'); }
            });
            document.getElementById('darkmode').dispatchEvent(new Event('change'));
            const btnSave = document.getElementById('btnsave');
            btnSave.addEventListener("click", async function() {
                s3settings.categories = 0;
                if (document.getElementById('sponsor').checked) {
                    s3settings.categories += categories.sponsor;
                }
                if (document.getElementById('intro').checked) {
                    s3settings.categories += categories.intro;
                }
                if (document.getElementById('outro').checked) {
                    s3settings.categories += categories.outro;
                }
                if (document.getElementById('interaction').checked) {
                    s3settings.categories += categories.interaction;
                }
                if (document.getElementById('selfpromo').checked) {
                    s3settings.categories += categories.selfpromo;
                }
                if (document.getElementById('preview').checked) {
                    s3settings.categories += categories.preview;
                }
                if (document.getElementById('music_offtopic').checked) {
                    s3settings.categories += categories.music_offtopic;
                }
                if (document.getElementById('filler').checked) {
                    s3settings.categories += categories.filler;
                } else if (s3settings.categories === 0) {
                    s3settings.categories = 1;
                }
                s3settings.upvotes = parseInt(document.getElementById('upvotes').value, 10) || -2;
                s3settings.notifications = document.getElementById('notifications').checked;
                s3settings.disable_hashing = document.getElementById('disable_hashing').checked;
                if (document.getElementById('instance').value.trim() != "")
                    s3settings.instance = document.getElementById('instance').value.trim();
                s3settings.darkmode = parseInt(document.getElementById('darkmode').value, 10);
                await GM.setValue('s3settings', s3settings);
                console.log((new Date()).toTimeString().split(' ')[0] + ' - Simple Sponsor Skipper: Settings saved!');
                btnSave.textContent = "Saved!";
                btnSave.disabled = true;
                setTimeout(() => { btnSave.textContent = "Save settings"; btnSave.disabled = false; }, 3000);
            });
            document.getElementById('btnclose').addEventListener("click", function() {
                location.replace(location.protocol + "//" + location.host + location.pathname + location.search)
            });
        });
    } else {
        var oldVidId = "";
        var params = new URLSearchParams(location.search);
        if (params.has('v')) {
            oldVidId = params.get('v');
            go(oldVidId);
        } else if (location.pathname.indexOf('/embed/') === 0 || location.pathname.indexOf('/v/') === 0) {
            oldVidId = location.pathname.replace('/v/', '').replace('/embed/', '').split('/')[0];
            go(oldVidId);
        }

        window.addEventListener("load", function() {
            let observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    params = new URLSearchParams(location.search);
                    if (params.has('v') && params.get('v') !== oldVidId) {
                        oldVidId = params.get('v');
                        go(oldVidId);
                    } else if ((location.pathname.indexOf('/embed/') === 0 || location.pathname.indexOf('/v/') === 0) && location.pathname.indexOf(oldVidId) === -1) {
                        oldVidId = location.pathname.replace('/v/', '').replace('/embed/', '').split('/')[0];
                        go(oldVidId);
                    } else if (!params.has('v') && location.pathname.indexOf('/embed/') === -1 && location.pathname.indexOf('/v/') === -1) {
                        oldVidId = "";
                    }
                });
            });

            let config = {
                childList: true,
                subtree: true
            };

            observer.observe(document.body, config);
        });
    }
    if (window.self === window.top) {
        GM.registerMenuCommand("Configuration", function() { window.location.replace(window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search + "#s3config"); window.location.reload(); });
    }
})();