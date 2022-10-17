// ==UserScript==
// @name        ProtonDB: Show PC reports on top
// @match       *://www.protondb.com/*
// @grant       none
// @version     2022.09
// @author      SkauOfArcadia
// @homepage    https://skau.neocities.org/
// @contactURL  https://t.me/SkauOfArcadia
// @description Since the release of the Steam Deck, Deck reports are displayed on top of PC reports on ProtonDB. This script aims to fix that.
// @downloadURL https://codeberg.org/mthsk/userscripts/raw/branch/master/protondb-pc-reports/protondb-pc-reports.user.js
// @updateURL   https://codeberg.org/mthsk/userscripts/raw/branch/master/protondb-pc-reports/protondb-pc-reports.user.js
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
(function(){
    "use strict";
    function go(containers)
    {
        if (containers[0].querySelector('img[src*="/images/steam_deck_logo.svg"]'))
        {
            let deckReports = containers[0];
            let pcReports = containers[containers.length - 1];
            let parent = containers[0].parentNode;
            let mid = document.createElement('div');
            parent.replaceChild(mid, pcReports);
            parent.replaceChild(pcReports, deckReports);
            parent.replaceChild(deckReports, mid);
            mid = null;
        }
    }

    const observer = new MutationObserver(function(mutations) {
        let containers = document.body.querySelectorAll('div[class*="GameReports__Container"]');
        if (location.pathname.indexOf('/app/') === 0 && containers.length >= 2)
        {
            go(containers);
        }
    });

    const config = {
        childList: true,
        subtree: true
    };

    observer.observe(document.body, config);
})();