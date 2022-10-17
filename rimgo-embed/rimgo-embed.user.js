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
// @version     2022.09
// @grant       none
// @allFrames   true
// ==/UserScript==
(function() {
    "use strict";
    const rimgo = "i.bcow.xyz";
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