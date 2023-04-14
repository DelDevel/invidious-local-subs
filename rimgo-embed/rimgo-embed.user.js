// ==UserScript==
// @name        Rimgo embed
// @description Replace Imgur embeds with Rimgo embeds.
// @author      SkauOfArcadia
// @homepage https://skau.neocities.org/
// @contactURL https://t.me/SkauOfArcadia
// @updateURL       https://codeberg.org/mthsk/userscripts/raw/branch/master/rimgo-embed/rimgo-embed.user.js
// @downloadURL     https://codeberg.org/mthsk/userscripts/raw/branch/master/rimgo-embed/rimgo-embed.user.js
// @include     *
// @exclude     http://web.archive.org/web/*
// @inject-into content
// @version     2023.04
// @grant       none
// @allFrames   true
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
    const rimgo = "rimgo.projectsegfau.lt";
    const observer = new MutationObserver(mutate);
    observer.observe(document, {
        childList: true,
        attributes: true,
        subtree: true
    });

    function mutate() {
        go();
    }

    function go() {
        let images = document.body.querySelectorAll('img[src*="imgur.com/"]');

        for (let x = 0; x < images.length; x++) {
            let imgurl = new URL(images[x].src.replace('.gifv', '.mp4'));

            if (imgurl.hostname === 'imgur.com' || imgurl.hostname.endsWith('.imgur.com'))
            {
                let rimgopathname = imgurl.pathname;
                if (imgurl.hostname === 'i.stack.imgur.com') { rimgopathname = "/stack" + imgurl.pathname; }
                let params = new URLSearchParams(imgurl.search);
                console.log("Changing imgur image embed to " + rimgo + ": " + imgurl);

                if (!!images[x].parentElement && images[x].parentElement.hasAttribute('href') && images[x].parentElement.href === images[x].src) {
                    if (imgurl.pathname.toLowerCase().endsWith('.mp4')) {
                        params.set('download', 1);
                    }
                    else {
                        params.set('no_webp', 1);
                    }
                    images[x].parentElement.setAttribute('href', 'https://' + rimgo + rimgopathname + '?' + params + imgurl.hash);
                }

                images[x].setAttribute('src', 'https://' + rimgo + rimgopathname + imgurl.search + imgurl.hash);
            }
        }
    }

    go();
})();