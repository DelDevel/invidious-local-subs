// ==UserScript==
// @name        Simple Libre Redirects
// @description	Redirects you from big tech websites to their Free-as-in-freedom implementations.
// @author      SkauOfArcadia
// @version     2022.09-2
// @homepage    https://skau.neocities.org/
// @contactURL  https://t.me/SkauOfArcadia
// @updateURL       https://codeberg.org/mthsk/userscripts/raw/branch/master/simple-libre-redirects/simple-libre-redirects.user.js
// @downloadURL     https://codeberg.org/mthsk/userscripts/raw/branch/master/simple-libre-redirects/simple-libre-redirects.user.js
// @match       *://imgur.com/*
// @match       *://i.imgur.com/*
// @match       *://imgur.io/*
// @match       *://www.instagram.com/*
// @match       *://*.reddit.com/*
// @match       *://*.tiktok.com/*
// @match       *://*.tumblr.com/*
// @match       *://twitter.com/*
// @match       *://mobile.twitter.com/*
// @match       *://www.youtube.com/*
// @match       *://m.youtube.com/*
// @match       *://youtu.be/*
// @match       *://music.youtube.com/*
// @exclude     *://www.instagram.com/explore/*
// @exclude     *://*.youtube.com/clip/*
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
    const rimgoInstance = "i.bcow.xyz"; //defines the Rimgo instance to be used.
    const gramInstance = "bibliogram.org"; //defines the Bibliogram instance to be used.
    const tedditInstance = "teddit.net"; //defines the Teddit/Libreddit instance to be used.
    const nitterInstance = "nitter.net"; //defines the Nitter instance to be used.
    const invidInstance = "yewtu.be"; //defines the Invidious/Piped instance to be used.
    const bbInstance = "beatbump.ml"; //defines the Beatbump instance to be used.
    const numblrInstance = "numblr.net"; //defines the Numblr instance to be used.
    const tokInstance = "proxitok.herokuapp.com"; //defines the proxiTok instance to be used.
    const invidDash = false; //defines if the quality=dash parameter will be used for invidious
    const invidNoJS = false; //defines if the nojs=1 parameter will be used for invidious
    let params = new URLSearchParams(window.location.search);
    switch (window.location.hostname) {
        case "imgur.com":
        case "i.imgur.com":
        case "i.stack.imgur.com":
        case "imgur.io":
            let imgpath = window.location.pathname.replace('.gifv', '.mp4').replace('.jpg', '.jpeg');
            console.log(imgpath);
            if (imgpath.toLowerCase().endsWith('.mp4')) {
                params.set('download', 1);
            } else if (imgpath.toLowerCase().match(/\.(jpeg|jpg|gif|png|bmp)$/)) {
                params.set('no_webp', 1);
            }
            if (window.location.hostname === "i.stack.imgur.com")
            {
                window.location.replace("https://" + rimgoInstance + "/stack" + imgpath + '?' + params + window.location.hash);
            }
            else
            {
                window.location.replace("https://" + rimgoInstance + imgpath + '?' + params + window.location.hash);
            }
            break;
        case "www.instagram.com":
            if (window.location.pathname === '/' || window.location.pathname.indexOf('/p/') === 0 || window.location.pathname.indexOf('/tv/') === 0) {
                window.location.replace("https://" + gramInstance + window.location.pathname.replace('/tv/', '/p/') + window.location.search + window.location.hash);
            } else {
                window.location.replace("https://" + gramInstance + "/u" + window.location.pathname + window.location.search + window.location.hash);
            }
            break;
        case "reddit.com":
        case "i.reddit.com":
        case "new.reddit.com":
        case "old.reddit.com":
        case "www.reddit.com":
            if ((window.location.pathname.indexOf('over18') !== -1 || window.location.pathname.indexOf('login') !== -1) && params.has('dest')) {
                window.location.replace("https://" + tedditInstance + "/" + decodeURIComponent(params.get('dest')).split('reddit.com/').pop());
            } else {
                window.location.replace("https://" + tedditInstance + window.location.pathname + window.location.search + window.location.hash);
            }
            break;
        case "tiktok.com":
        case "www.tiktok.com":
            window.location.replace("https://" + tokInstance + window.location.pathname);
            break;
        case "mobile.twitter.com":
        case "twitter.com":
            window.location.replace("https://" + nitterInstance + window.location.pathname + window.location.search + window.location.hash);
            break;
        case "youtu.be":
        case "m.youtube.com":
        case "www.youtube.com":
            if (invidDash) {
                params.set('quality', 'dash');
            }
            if (invidNoJS) {
                params.set('nojs', 1);
            }
            if (window.location.pathname.indexOf('/redirect') === 0 && params.has('q')) {
                window.location.replace(decodeURIComponent(params.get('q')))
            } else if (window.location.pathname.indexOf('/shorts/') === 0) {
                window.location.replace("https://" + invidInstance + window.location.pathname.replace('/shorts/', '/watch?v=') + '&' + params + window.location.hash);
            } else {
                window.location.replace("https://" + invidInstance + window.location.pathname + '?' + params + window.location.hash);
            }
            break;
      case "music.youtube.com":
            params.set('id', params.get('v'));
            params.delete('v');
            window.location.replace("https://" + bbInstance + window.location.pathname.replace('/watch', '/listen') + '?' + params + window.location.hash);
            break;
      default:
            if (window.location.hostname === "tumblr.com" || window.location.hostname === "www.tumblr.com") {
                window.location.replace("https://" + numblrInstance + window.location.pathname.replace("/login_required","").replace("/explore/trending","/"));
            } else if (window.location.hostname.endsWith('.tumblr.com')) {
                window.location.replace("https://" + numblrInstance + "/" + window.location.hostname.replace(".tumblr.com","") + window.location.pathname);
            }
            break;
    }
})();