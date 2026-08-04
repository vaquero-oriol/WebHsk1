/* ---------------------------------------------------------------------------
 * Cloudflare Web Analytics — privacy-first, cookieless page-view stats.
 * Single source of truth: this file is loaded on every page of the site, so
 * the token lives here ONCE. No cookies, no consent banner needed.
 *
 * TO ACTIVATE (one-time, ~2 min):
 *   1. Cloudflare dashboard  →  Analytics & Logs  →  Web Analytics.
 *   2. Add a site for "hsklan.com" (or open the existing one).
 *   3. Copy the token: it's the value of  data-cf-beacon='{"token":"XXXX"}'
 *      shown in the JS snippet Cloudflare gives you.
 *   4. Paste it between the quotes in CF_TOKEN below and publish.
 *
 * Until a token is set this file does nothing (safe no-op).
 * To disable analytics later: just blank out CF_TOKEN again.
 * ------------------------------------------------------------------------- */
(function () {
  "use strict";

  var CF_TOKEN = "a4004f4cd70e4507aa4caf41038dfacc"; // Cloudflare Web Analytics token (hsklan.com)

  if (!CF_TOKEN) return; // no token yet → do nothing

  var s = document.createElement("script");
  s.defer = true;
  s.src = "https://static.cloudflareinsights.com/beacon.min.js";
  s.setAttribute("data-cf-beacon", JSON.stringify({ token: CF_TOKEN }));
  document.head.appendChild(s);
})();
