/**
 * Visitor Counter for chengtraffic.github.io
 *
 * Uses hitscounter.dev to track unique visits (not page views).
 *
 * Logic:
 *   - On first page load in a session, fetch the increment API → count +1.
 *   - Store the returned count in sessionStorage.
 *   - On subsequent navigations within the same session, display the
 *     cached count without calling the API again.
 *   - This way, one visitor = one count, regardless of how many pages
 *     they browse.
 */
(function () {
  var el = document.getElementById('visitor-count');
  if (!el) return;

  var STORAGE_KEY = 'qc_visitor_total';
  var siteUrl = encodeURIComponent('https://chengtraffic.github.io');
  var badgeUrl = 'https://hitscounter.dev/api/hit'
    + '?url=' + siteUrl
    + '&label=Visitors'
    + '&icon=eye'
    + '&color=%23198754'
    + '&style=flat';

  // Check if we already counted this session
  var cached = null;
  try { cached = sessionStorage.getItem(STORAGE_KEY); } catch (e) {}

  if (cached) {
    // Already counted this session — just display
    display(parseInt(cached, 10));
  } else {
    // First visit this session — call the API to increment
    fetch(badgeUrl)
      .then(function (res) { return res.text(); })
      .then(function (svg) {
        var total = parseTotalFromSvg(svg);
        if (total > 0) {
          try { sessionStorage.setItem(STORAGE_KEY, String(total)); } catch (e) {}
          display(total);
        } else {
          showBadge();
        }
      })
      .catch(function () {
        showBadge();
      });
  }

  /**
   * Parse the total hit count from the SVG badge text.
   * The badge shows "today / total" — we want the total.
   */
  function parseTotalFromSvg(svg) {
    // Pattern 1: "today / total" format
    var slashMatch = svg.match(/>\s*(\d[\d,]*)\s*\/\s*(\d[\d,]*)\s*</);
    if (slashMatch) {
      return parseInt(slashMatch[2].replace(/,/g, ''), 10);
    }

    // Pattern 2: grab all numbers, take the largest
    var nums = [];
    var re = />(\d[\d,]*)</g;
    var m;
    while ((m = re.exec(svg)) !== null) {
      nums.push(parseInt(m[1].replace(/,/g, ''), 10));
    }
    if (nums.length > 0) {
      return Math.max.apply(null, nums);
    }

    return 0;
  }

  function display(n) {
    if (!n || n <= 0) { showBadge(); return; }
    el.textContent = 'You are the ' + ordinal(n)
      + ' visitor since March 21, 2026';
  }

  function showBadge() {
    var img = document.createElement('img');
    img.src = badgeUrl;
    img.alt = 'Visitor Count';
    img.style.height = '22px';
    img.style.verticalAlign = 'middle';
    el.textContent = '';
    el.appendChild(img);
    var text = document.createTextNode(' since March 21, 2026');
    el.appendChild(text);
  }

  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
})();
