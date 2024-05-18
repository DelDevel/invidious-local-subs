// ==UserScript==
// @name        Simple Libre Redirects
// @description	Redirects you from big tech websites to their Free-as-in-freedom implementations.
// @author      SkauOfArcadia
// @version     2024.05
// @homepage    https://codeberg.org/mthsk/userscripts/src/branch/master/simple-libre-redirects
// @contactURL  https://t.me/SkauOfArcadia
// @updateURL       https://codeberg.org/mthsk/userscripts/raw/branch/master/simple-libre-redirects/simple-libre-redirects.user.js
// @downloadURL     https://codeberg.org/mthsk/userscripts/raw/branch/master/simple-libre-redirects/simple-libre-redirects.user.js
// @match       *://cinapse.co/*
// @match       *://imgur.com/*
// @match       *://i.imgur.com/*
// @match       *://imgur.io/*
// @exclude     *://www.instagram.com/*
// @match       *://*.medium.com/*
// @match       *://*.reddit.com/*
// @match       *://*.tiktok.com/*
// @match       *://*.tumblr.com/*
// @match       *://twitter.com/*
// @match       *://mobile.twitter.com/*
// @match       *://*.wikipedia.org/*
// @match       *://www.youtube.com/*
// @match       *://m.youtube.com/*
// @match       *://youtu.be/*
// @match       *://music.youtube.com/*
// @match       *://*.wikiless.org/*
// @exclude     *://www.instagram.com/explore/*
// @exclude     *://*.youtube.com/embed/*
// @run-at      document-start
// @grant       none
// @license     AGPL-3.0-or-later
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
(function() {
    "use strict";
    const rimgoInstance = "https://farside.link/rimgo"; //defines the Rimgo instance to be used.
    const gramInstance = "https://bibliogram.org"; //defines the Bibliogram instance to be used.
    const tedditInstance = "https://teddit.net"; //defines the Teddit/Libreddit instance to be used.
    const nitterInstance = "https://nitter.poast.org"; //defines the Nitter instance to be used.
    const invidInstance = "https://yewtu.be"; //defines the Invidious/Piped instance to be used.
    const bbInstance = "https://beatbump.ml"; //defines the Beatbump instance to be used.
    const numblrInstance = "https://numblr.net"; //defines the Numblr instance to be used.
    const tokInstance = "https://proxitok.pabloferreiro.es"; //defines the proxiTok instance to be used.
    const wikiInstance = "https://wikiless.org"; //defines the Wikiless instance to be used.
    const scribeInstance = "https://scribe.rip"; //defines the Scribe instance to be used.
    const invidDash = false; //defines if the quality=dash parameter will be used for invidious
    const invidNoJS = false; //defines if the nojs=1 parameter will be used for invidious
    let params = new URLSearchParams(window.location.search);
    switch (window.location.hostname) {
        case "imgur.com":
        case "i.imgur.com":
        case "i.stack.imgur.com":
        case "imgur.io":
            let imgpath = window.location.pathname.replace('.gifv', '.mp4').replace('.jpg', '.jpeg');
            if (window.location.hostname === "i.stack.imgur.com") { imgpath = "/stack" + imgpath }
            if (imgpath.toLowerCase().endsWith('.mp4')) {
                params.set('download', 1);
            } else if (imgpath.toLowerCase().match(/\.(jpeg|jpg|gif|png|bmp)$/)) {
                params.set('no_webp', 1);
            }
            window.location.replace(rimgoInstance + imgpath + '?' + params + window.location.hash);
            break;
        case "www.instagram.com":
            if (window.location.pathname === '/' || window.location.pathname.indexOf('/p/') === 0 || window.location.pathname.indexOf('/tv/') === 0 || window.location.pathname.indexOf('/reel/') === 0) {
                window.location.replace(gramInstance + window.location.pathname.replace('/tv/', '/p/') + window.location.search + window.location.hash);
            } else {
                window.location.replace(gramInstance + "/u" + window.location.pathname + window.location.search + window.location.hash);
            }
            break;
        case "reddit.com":
        case "amp.reddit.com":
        case "i.reddit.com":
        case "new.reddit.com":
        case "np.reddit.com":
        case "old.reddit.com":
        case "www.reddit.com":
            if ((window.location.pathname.indexOf('over18') !== -1 || window.location.pathname.indexOf('login') !== -1) && params.has('dest')) {
                window.location.replace(tedditInstance + "/" + decodeURIComponent(params.get('dest')).split('reddit.com/').pop());
            } else {
                window.location.replace(tedditInstance + window.location.pathname + window.location.search + window.location.hash);
            }
            break;
        case "cinapse.co":
            window.location.replace(scribeInstance + window.location.pathname + window.location.search + window.location.hash);
            break;
        case "tiktok.com":
        case "www.tiktok.com":
            window.location.replace(tokInstance + window.location.pathname);
            break;
        case "mobile.twitter.com":
        case "twitter.com":
            if (params.has('tok')) {
                const xjson = atob(decodeURIComponent(params.get('tok')));
                window.location.replace(nitterInstance + JSON.parse(xjson.substring(0, xjson.lastIndexOf("\x7D") + 1)).e);
            }
            else if (params.has('redirect_after_login'))
                window.location.replace(nitterInstance + decodeURIComponent(params.get('redirect_after_login')));
            else
                window.location.replace(nitterInstance + window.location.pathname + window.location.search + window.location.hash);
            break;
        case "youtu.be":
        case "m.youtube.com":
        case "www.youtube.com":
            if (invidDash)
                params.set('quality', 'dash');
            if (invidNoJS)
                params.set('nojs', 1);

            if (window.location.pathname.indexOf('/clip/') === 0) {
                window.addEventListener("load", function() {
                    const bar = document.getElementsByClassName('ytp-progress-bar')[0];
                    const check = window.setInterval(function(){
                        if (!!bar && !!bar.getAttribute('aria-valuemin') && !!bar.getAttribute('aria-valuemax')
                            && bar.getAttribute('aria-valuemin') !== bar.getAttribute('aria-valuemax')
                            && !!document.body.querySelector('[video-id]').getAttribute('video-id'))
                        {
                            params.set('v', document.body.querySelector('[video-id]').getAttribute('video-id'));
                            params.set('start', bar.getAttribute('aria-valuemin'));
                            params.set('end', bar.getAttribute('aria-valuemax'));
                            window.location.replace(invidInstance + "/watch?" + params + window.location.hash);
                            clearInterval(check);
                        }
                    }, 100);
                });
            }
            else if (window.location.pathname.indexOf('/shorts/') === 0) {
                window.location.replace(invidInstance + window.location.pathname.replace('/shorts/', '/watch?v=') + '&' + params + window.location.hash);
            } else {
                window.location.replace(invidInstance + window.location.pathname + '?' + params + window.location.hash);
            }
            break;
      case "music.youtube.com":
            params.set('id', params.get('v'));
            params.delete('v');
            window.location.replace(bbInstance + window.location.pathname.replace('/watch', '/listen') + '?' + params + window.location.hash);
            break;
      default:
            if (window.location.hostname === "tumblr.com" || window.location.hostname === "www.tumblr.com") {
                window.location.replace(numblrInstance + window.location.pathname.replace("/login_required","").replace("/explore/trending","/"));
            } else if (window.location.hostname.endsWith('.tumblr.com')) {
                const tumblrUser = window.location.hostname.replace(".tumblr.com","");
                if (!tumblrUser.endsWith(".media"))
                    window.location.replace(numblrInstance + "/" + tumblrUser + window.location.pathname);
            }
            else if (window.location.hostname === "wikipedia.org" || window.location.hostname.endsWith('.wikipedia.org')) {
                if (window.location.hostname !== "wikipedia.org" && window.location.hostname !== "www.wikipedia.org")
                    params.set('lang', window.location.hostname.split('.')[0]);
                params.set('useskin', 'vector');
                window.location.replace(wikiInstance + window.location.pathname + '?' + params);
            }
            else if (wikiInstance.endsWith(window.location.hostname) && !params.has('useskin')) {
                params.set('useskin', 'vector');
                window.location.replace(wikiInstance + window.location.pathname + '?' + params);
            }
            else if (window.location.hostname === "medium.com" || window.location.hostname.endsWith('.medium.com')) {
                window.location.replace(scribeInstance + window.location.pathname + window.location.search + window.location.hash);
            }
            break;
    }
})();