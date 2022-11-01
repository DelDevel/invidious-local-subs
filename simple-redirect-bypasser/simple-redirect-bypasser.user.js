// ==UserScript==
// @name        Simple Redirect Bypasser
// @match       *://*/redirect*
// @match       *://*/download2/campanha.php*
// @match       *://*/instagram/campanha.php*
// @match       *://*.4channel.org/derefer*
// @match       *://*.4chan.org/derefer*
// @match       *://*.instagram.com/linkshim/*
// @match       *://*.pixiv.net/jump.php*
// @match       *://redirect.epicgames.com/*
// @match       *://steamcommunity.com/linkfilter/*
// @grant       none
// @author      SkauOfArcadia
// @version     2022.10
// @contactURL  https://t.me/SkauOfArcadia
// @homepage    https://codeberg.org/mthsk/userscripts/src/branch/master/simple-redirect-bypasser
// @downloadURL https://codeberg.org/mthsk/userscripts/raw/branch/master/simple-redirect-bypasser/simple-redirect-bypasser.user.js
// @updateURL   https://codeberg.org/mthsk/userscripts/raw/branch/master/simple-redirect-bypasser/simple-redirect-bypasser.user.js
// @description Bypass link filters.
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
    testParams(location.search);

    function testParams(urlparams)
    {
        let params = new URLSearchParams(urlparams);
        params.forEach((param) => navigateIfUrl(param));
    }

    function navigateIfUrl(url)
    {
        if (isValidUrl(url))
        {
            console.log("Redirecting to: " + url);
            location.replace(url);
        }
        else if (isValidUrl(decodeURIComponent(url)))
        {
            let decoded = decodeURIComponent(url);
            console.log("Redirecting to: " + decoded);
            location.replace(decoded);
        }
        else if (isValidUrl(hex2a(url)))
        {
            let decoded = hex2a(url);
            console.log("Redirecting to: " + decoded);
            location.replace(decoded);
        }
        else if (isValidUrl(b64_to_utf8(url)))
        {
            let decoded = b64_to_utf8(url);
            console.log("Redirecting to: " + decoded);
            location.replace(decoded);
        }
        else if (isValidUrl(b64_to_utf8(reverseString(url))))
        {
            let decoded = b64_to_utf8(reverseString(url));
            console.log("Redirecting to: " + decoded);
            location.replace(decoded);
        }
    }

    function isValidUrl(string) {
        try {
            let url = new URL(string);
        } catch (_) {
            return false;
        }

        return true;
    }

    function b64_to_utf8(str) {
        try {
            return decodeURIComponent(escape(window.atob(str)));
        } catch (_) {
            return "";
        }
    }

    function hex2a(hexx) {
        var hex = hexx.toString();//force conversion
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

    function reverseString(str) {
        return str.split("").reverse().join("");
    }
})();