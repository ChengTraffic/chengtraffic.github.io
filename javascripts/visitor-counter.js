/**
 * Visitor Counter for chengtraffic.github.io
 *
 * Performance strategy:
 *   1. Instantly display the last known count from localStorage (< 1ms).
 *   2. If this is the first page load in the session, fetch from the API
 *      to increment (+1) and get the fresh total. Save to both
 *      sessionStorage (prevents re-increment) and localStorage (fast
 *      display on next visit).
 *   3. If already counted this session, skip the API call entirely.
 *
 * Net result: the number appears immediately on every page load; the
 * API is only called once per visitor session.
 */
(function () {
  var el = document.getElementById('visitor-count');
  if (!el) return;

  var SESSION_KEY = 'qc_visitor_total';
  var LOCAL_KEY   = 'qc_visitor_total_cache';

  var siteUrl  = encodeURIComponent('https://chengtraffic.github.io');
  var badgeUrl = 'https://hitscounter.dev/api/hit'
    + '?url=' + siteUrl
    + '&label=Visitors'
    + '&icon=eye'
    + '&color=%23198754'
    + '&style=flat';

  // ---------- Step 1: instant display from cache ----------
  var localCache = safeGet(localStorage, LOCAL_KEY);
  var sessionCache = safeGet(sessionStorage, SESSION_KEY);

  if (sessionCache) {
    // Already counted this session — show cached value, done
    display(parseInt(sessionCache, 10));
    return;
  }

  if (localCache) {
    // Show stale value immediately while we fetch the fresh one
    display(parseInt(localCache, 10));
  }

  // ---------- Step 2: fetch fresh count (once per session) ----------
  fetch(badgeUrl)
    .then(function (res) { return res.text(); })
    .then(function (svg) {
      var total = parseTotalFromSvg(svg);
      if (total > 0) {
        safeSet(sessionStorage, SESSION_KEY, String(total));
        safeSet(localStorage, LOCAL_KEY, String(total));
        display(total);
      } else if (!localCache) {
        showBadge();
      }
    })
    .catch(function () {
      if (!localCache) showBadge();
    });

  // ---------- helpers ----------

  function parseTotalFromSvg(svg) {
    // "today / total" format
    var m = svg.match(/>\s*(\d[\d,]*)\s*\/\s*(\d[\d,]*)\s*</);
    if (m) return parseInt(m[2].replace(/,/g, ''), 10);
    // fallback: largest number in the SVG
    var nums = [], re = />(\d[\d,]*)</g, r;
    while ((r = re.exec(svg)) !== null)
      nums.push(parseInt(r[1].replace(/,/g, ''), 10));
    return nums.length ? Math.max.apply(null, nums) : 0;
  }

  function display(n) {
    if (!n || n <= 0) { showBadge(); return; }
    el.textContent = 'You are the ' + ordinal(n)
      + ' visitor since March 21, 2026';
  }

  function showBadge() {
    el.textContent = '';
    var img = document.createElement('img');
    img.src = badgeUrl;
    img.alt = 'Visitor Count';
    img.style.height = '22px';
    img.style.verticalAlign = 'middle';
    el.appendChild(img);
    el.appendChild(document.createTextNode(' since March 21, 2026'));
  }

  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function safeGet(storage, key) {
    try { return storage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(storage, key, val) {
    try { storage.setItem(key, val); } catch (e) {}
  }
})();
