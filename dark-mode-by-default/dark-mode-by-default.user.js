// ==UserScript==
// @name        Dark Mode by default
// @description	Automatically enables the built-in Dark Mode on select sites.
// @version		2022.10
// @author       SkauOfArcadia
// @homepage https://skau.neocities.org/
// @contactURL https://t.me/SkauOfArcadia
// @updateURL       https://codeberg.org/mthsk/userscripts/raw/branch/master/dark-mode-by-default/dark-mode-by-default.user.js
// @downloadURL     https://codeberg.org/mthsk/userscripts/raw/branch/master/dark-mode-by-default/dark-mode-by-default.user.js
// @match       *://15.ai/*
// @match       *://2ch.hk/*
// @match       *://*.3chan.co/*
// @match       *://8kun.top/*
// @match       *://9to5linux.com/*
// @match       *://www.bitchute.com/*
// @match       *://*.catbox.moe/
// @match       *://codeberg.org/*
// @match       *://community.ccleaner.com/*
// @match       *://*.chocolatey.org/*
// @match       *://www.elevenforum.com/*
// @match       *://*.fandom.com/*
// @match       *://*.facebook.com/*
// @match       *://favelachan.org/*
// @match       *://ffprofile.com/*
// @match       *://fujochan.org/*
// @match       *://gbatemp.net/*
// @match       *://*.gelbooru.com/*
// @match       *://*.getmusicbee.com/forum/*
// @match       *://*.github.com/*
// @match       *://support.google.com/*
// @match       *://forums.guru3d.com/*
// @match       *://www.ignboards.com/*
// @match       *://www.instagram.com/*
// @match       *://linustechtips.com/*
// @match       *://forum.losper.net/*
// @match       *://forums.malwarebytes.com/*
// @match       *://mangadex.org/*
// @match       *://mega.nz/file/*
// @match       *://mega.io/file/*
// @match       *://mega.co.nz/file/*
// @match       *://mega.nz/folder/*
// @match       *://mega.io/folder/*
// @match       *://mega.co.nz/folder/*
// @match       *://www.mixmods.com.br/*
// @match       *://moddota.com/*
// @match       *://*.newegg.com/*
// @match       *://*.nyaa.si/*
// @match       *://pastebin.com/*
// @match       *://www.pichau.com.br/*
// @match       *://*.playstation.com/*
// @match       *://*.presearch.com/*
// @match       *://*.presearch.org/*
// @match       *://rentry.co/*
// @match       *://*.soyjak.party/*
// @match       *://soyjak.wiki/*
// @match       *://steamid.uk/*
// @match       *://*.sushigirl.us/*
// @match       *://tecnoblog.net/*
// @match       *://*.twitch.tv/*
// @match       *://www.unknowncheats.me/*
// @match       *://www.vg-resource.com/*
// @match       *://web.whatsapp.com/*
// @match       *://whattomine.com/*
// @match       *://*.youtube.com/*
// @match       *://*/channel/*
// @match       *://*/watch?v=*
// @match       *://*/feed/popular
// @match       *://*/feed/trending
// @match       *://*/preferences?referer=*
// @match       *://*/login?referer=*
// @match       *://invidious.*.*/*
// @exclude     *://piped.*/*
// @exclude     *://m.twitch.tv/*
// @run-at      document-start
// @grant       none
// @inject-into content
// ==/UserScript==
/**
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
(function() {
    "use strict";
    window.addEventListener("load", function() {
        switch (window.location.hostname) {
            case "15.ai":
                let fifteen = document.getElementsByClassName('fas fa-moon');
                if (fifteen.length >= 1) {
                    fifteen[0].parentElement.parentElement.click();
                }
                break;
            case "2ch.hk":
                let dvach = document.getElementById("SwitchStyles");
                if (dvach.value !== "neutron") {
                    dvach.value = "neutron";
                    dvach.dispatchEvent(new Event("change"));
                }
                break;
            case "boards.3chan.co":
            case "img.3chan.co":
                let three = document.getElementsByClassName("styleswitcher")[0];
                if (three.value !== "Tomorrow") {
                    three.value = "Tomorrow";
                    three.dispatchEvent(new Event("change"));
                }
                break;
            case "8kun.top":
                let eight = document.getElementById("stylechooser");
                if (eight.value !== "Dark") {
                    var allBoards = document.getElementById("css-all-boards");
                    if (!allBoards.checked) {
                        allBoards.click();
                    }
                    eight.value = "Dark";
                    eight.dispatchEvent(new Event("change"));
                }
                break;
            case "9to5linux.com":
            case "www.mixmods.com.br":
                if (document.body.className.indexOf('wp-night-mode-on') === -1) {
                    document.getElementsByClassName('wpnm-button')[0].click();
                }
                break;
            case "www.bitchute.com":
                const chute = document.getElementById('night-theme');
                if (!!chute && !chute.classList.contains('hidden'))
                {
                    chute.getElementsByTagName('a')[0].click();
                }
                break;
            case "catbox.moe":
            case "www.catbox.moe":
            case "litterbox.catbox.moe":
                let catboxImg = document.getElementsByTagName('img')[0];
                if (catboxImg.src.indexOf('logo.png') !== -1 || catboxImg.src.indexOf('litterbox.png') !== -1) {
                    setTimeout(() => { document.getElementById("changeTheme").click(); }, 50);
                }
                break;
            case "codeberg.org":
                let cberg = document.head.querySelector('link[href*="/assets/css/theme-codeberg-auto.css"]');
                if (!!cberg) {
                    cberg.href = cberg.href.replace("codeberg-auto","codeberg-dark")
                }
                break;
            case "community.ccleaner.com":
            case "linustechtips.com":
            case "forum.losper.net":
            case "forums.malwarebytes.com":
                let invision = document.getElementById('elNavTheme_menu').querySelectorAll('li[class*=ipsMenu_item]');
                if (invision.length >= 2 && invision[1].className.indexOf('ipsMenu_itemChecked') === -1) {
                    invision[1].getElementsByTagName('button')[0].click();
                }
                if (window.location.hostname === "forum.losper.net"
                    && invision[1].className.indexOf('ipsMenu_itemChecked') !== -1
                    && (!document.getElementsByTagName('html')[0].hasAttribute('data-theme') || document.getElementsByTagName('html')[0].getAttribute('data-theme') !== "dark"))
                  { document.getElementsByClassName('aXenTopBar_theme')[0].click(); }
                break;
            case "chocolatey.org":
            case "blog.chocolatey.org":
            case "community.chocolatey.org":
            case "docs.chocolatey.org":
                if (document.getElementsByTagName('html')[0].getAttribute('data-user-color-scheme') != "dark") {
                    document.getElementById("themeToggle").click();
                }
                break;
            case "www.elevenforum.com":
                let eleven = document.body.querySelector('a[data-xf-init][href*="?style_id=7&t="]');
                if (eleven) {
                    eleven.click();
                }
                break;
            case "favelachan.org":
                let favela = document.getElementById("theme");
                if (favela.value !== "dark") {
                    favela.value = "dark";
                    favela.dispatchEvent(new Event("change"));
                }
                break;
            case "ffprofile.com":
                if (document.body.classList.contains('light-colors')) {
                    document.getElementById('darkmode-toggle').click();
                }
                break;
            case "fujochan.org":
            case "soyjak.party":
            case "www.soyjak.party":
                let soy = document.getElementById("style-select").lastChild;
                if (soy.value !== "4") {
                    soy.value = "4";
                    soy.dispatchEvent(new Event("change"));
                }
                break;
            case "gbatemp.net":
            case "www.ignboards.com":
                let xenf = document.getElementsByClassName("thstyleswitch_toggleSwitch__checkbox")[0];
                if (!xenf.checked) {
                    setTimeout(() => { xenf.click(); }, 10);
                }
                break;
            case "gelbooru.com":
            case "ja.gelbooru.com":
                let gel = document.body.querySelector('a[onclick^=darkModeToggle]');
                if (!!gel) {
                    for (let x = 0; x < document.styleSheets.length; x++) {
                        if (!!document.styleSheets[x].href && document.styleSheets[x].href.indexOf('dark.css') !== -1) {
                            break;
                        } else if (x === document.styleSheets.length - 1) {
                            gel.click();
                        }
                    }
                }
                break;
            case "getmusicbee.com":
            case "www.getmusicbee.com":
                let bee = document.body.querySelector('a[onclick="changeTheme();"]');
                if (!!bee && document.getElementsByTagName('html')[0].className.indexOf('dark_theme') === -1) {
                    bee.click();
                }
                break;
            case "github.com":
            case "gist.github.com":
                let git = document.getElementsByTagName('html')[0];
                if (git.getAttribute('data-color-mode') == 'auto') {
                    git.setAttribute('data-color-mode', 'dark');
                }
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (!git.hasAttribute('data-color-mode') ||
                            git.getAttribute('data-color-mode') === 'auto') {
                            git.setAttribute('data-color-mode', 'dark');
                        }
                    });
                });
                observer.observe(git, {
                    attributes: true
                });
                break;
            case "forums.guru3d.com":
                let guru = document.head.querySelector('link[rel="stylesheet"][href*="style=2"]');
                if (guru) {
                    window.location.replace("https://forums.guru3d.com/misc/style?style_id=3&redirect=" + encodeURIComponent(window.location));
                }
                break;
            case "mangadex.org":
                if (document.getElementsByTagName('html')[0].classList.contains('light')) {
                    setTimeout(() => { document.body.querySelectorAll('div[class=my-1]')[1].click(); }, 10);
                }
                break;
            case "mega.co.nz":
            case "mega.io":
            case "mega.nz":
                var observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                        if (document.body.className.indexOf('theme-light') !== -1) {
                            document.body.className = document.body.className.replace("theme-light", "theme-dark");
                        }
                    });
                });
                observer.observe(document.body, {
                    attributes: true
                });
                break;
            case "moddota.com":
                if (document.getElementsByTagName('html')[0].getAttribute('data-theme').indexOf('dark') === -1) {
                    document.getElementsByClassName('react-toggle')[0].click();
                }
                break;
            case "www.newegg.com":
            case "secure.newegg.com":
                if (!document.getElementsByTagName('html')[0].classList.contains('dark-mode')) {
                    document.getElementById('Dark_Mode').click();
                }
                break;
            case "nyaa.si":
            case "sukebei.nyaa.si":
                if (!document.body.classList.contains('dark')) {
                    document.getElementById('themeToggle').click();
                }
                break;
            case "pastebin.com":
                if (document.body.classList.contains('night-auto')) {
                    document.body.className = document.body.className.replace("night-auto", "night");
                }
                break;
            case "www.pichau.com.br":
                const pch = document.getElementsByTagName('header')[0].querySelector('button[aria-label=menu]');
                if (pch.parentNode.lastChild.lastChild.innerText.toLowerCase() === "escuro") {
                    pch.click();
                }
                break;
            case "blog.playstation.com":
                if (!document.getElementsByTagName('html')[0].classList.contains('prefers-color-mode-dark')) {
                    document.getElementsByClassName('dark-mode__toggle')[0].click();
                }
                break;
            case "store.playstation.com":
                if (!document.getElementsByTagName('html')[0].classList.contains('psw-dark-theme')) {
                    document.getElementsByTagName('html')[0].classList.add('psw-dark-theme');
                }
                break;
            case "presearch.com":
            case "keywords.presearch.com":
            case "marketplace.presearch.com":
            case "nodes.presearch.com":
            case "presearch.org":
            case "engine.presearch.org":
            case "keywords.presearch.org":
            case "marketplace.presearch.org":
            case "nodes.presearch.org":
            case "www.presearch.org":
                if (!document.getElementsByTagName('html')[0].classList.contains('dark')) {
                    document.body.querySelector("div[\\@click*=dark i]").click();
                }
                break;
            case "rentry.co":
                const ren = document.getElementById('darkModeBtn');
                if (!!ren && !document.getElementsByTagName('html')[0].classList.contains('dark-mode'))
                {
                    setTimeout(() => { ren.click(); }, 100);
                }
                break;
            case "soyjak.wiki":
                if (!document.getElementsByTagName('html')[0].classList.contains('client-darkmode'))
                {
                    setTimeout(() => { document.getElementById('pt-darkmode').getElementsByTagName('a')[0].click(); }, 10);
                }
                break;
            case "steamid.uk":
                let steamid = document.head.querySelector('link[href^="/css/steamid-boot.css"]');
                if (steamid) {
                    steamid.href = steamid.href.replace("steamid-boot.css","steamid-boot-dark.css")
                }
                break;
            case "sushigirl.us":
            case "www.sushigirl.us":
                let sushi = document.getElementById("style-select").lastChild;
                if (sushi.value !== "3") {
                    sushi.value = "3";
                    sushi.dispatchEvent(new Event("change"));
                }
                break;
            case "tecnoblog.net":
                if (!document.getElementsByTagName('html')[0].hasAttribute('dark-mode') || document.getElementsByTagName('html')[0].getAttribute('dark-mode') !== "yes") {
                    setTimeout(() => { document.getElementsByClassName('theme-mode-bg')[0].click(); }, 10);
                }
                break;
            case "www.twitch.tv":
            case "clips.twitch.tv":
                let twitch = document.getElementsByTagName('html')[0];
                if (twitch.className.indexOf('theme-light') !== -1) {
                    twitch.className = twitch.className.replace("theme-light", "theme-dark");
                }
                break;
            case "www.unknowncheats.me":
                let unk = document.body.querySelector('a[href="javascript:toggle_dark_theme();"]');
                if (!document.querySelector('link[href*="uc_dark.css"]') && unk)
                    unk.click();
                break;
            case "www.vg-resource.com":
                let vg = document.getElementById("theme_select").querySelector('select[name="theme"]');
                if (vg.value === "3") {
                    vg.value = 10;
                    vg.parentElement.querySelector('input[class="button"]').click();
                }
                break;
            case "web.whatsapp.com":
                document.body.className = "web dark";
                break;
            case "whattomine.com":
                let params = new URLSearchParams(window.location.search);
                if (!params.has('display_mode') && !!document.body.querySelector('a[href*="?display_mode=dark"]'))
                {
                    params.set('display_mode', 'dark');
                    window.location.replace(window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?' + params + window.location.hash);
                }
                break;
            case "www.youtube.com":
                let yt = document.getElementsByTagName('html')[0];
                var observer = new MutationObserver(function(mutations) {
                    if (!yt.hasAttribute('dark') ||
                        yt.getAttribute('dark') !== 'true') {
                        yt.setAttribute('dark', 'true');
                    }
                });
                observer.observe(yt, {
                    childList: true,
                    attributes: true,
                    subtree: true
                });
                break;
            default:
                if (window.location.hostname.endsWith('.facebook.com'))
                {
                    const html = document.getElementsByTagName('html')[0];
                    var observer = new MutationObserver(function(mutations) {
                        let fb = document.getElementsByClassName("__fb-light-mode");
                        for (let x = 0; x < fb.length; x++) {
                            fb[x].className = fb[x].className.replace('fb-light-mode','fb-dark-mode');
                        }
                    });
                    observer.observe(html, {
                        attributes: true,
                        childList: true
                    });
                    html.className = html.className.replace('fb-light-mode','fb-dark-mode');
                }
                else if (window.location.hostname.endsWith('.fandom.com'))
                {
                    let fandom = window.setInterval(function() {
                        if (!!document.body.querySelector('a[class*=wiki-tools__theme-switch]') &&
                            document.body.querySelector('a[class*=wiki-tools__theme-switch]').getAttribute('data-tracking') === 'theme-switch-dark') {
                            document.body.querySelector('a[class*=wiki-tools__theme-switch]').click();
                        } else {
                            window.clearInterval(fandom);
                        }
                    }, 333)
                }
                else
                {
                    const inviddark = document.getElementById('toggle_theme');
                    if (inviddark && !document.body.classList.contains('dark-theme'))
                    {
                        setTimeout(() => { inviddark.click(); }, 10);
                    }
                }
                break;
        }
    });

    let params = new URLSearchParams(window.location.search);
    if (window.location.hostname === "support.google.com" && !params.has('dark')) {
        params.set('dark', 1);
        window.location.replace(window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?' + params + window.location.hash);
    } else if (window.location.hostname === "www.instagram.com" && !params.has('theme')) {
        params.set('theme', 'dark');
        window.location.replace(window.location.protocol + '//' + window.location.hostname + window.location.pathname + '?' + params + window.location.hash);
    }
})();