/**
 * Visitor Counter for chengtraffic.github.io
 * Uses hitscounter.dev to track and display page views.
 *
 * hitscounter.dev API returns an SVG badge containing:
 *   [Icon] [Label] [Today count / Total count]
 *
 * We fetch the SVG, parse out the total count, and display it
 * as "You are the Nth visitor since March 21, 2026".
 *
 * If parsing fails, we fall back to showing the badge image directly.
 */
(function () {
  var el = document.getElementById('visitor-count');
  if (!el) return;

  var siteUrl = encodeURIComponent('https://chengtraffic.github.io');
  var badgeUrl = 'https://hitscounter.dev/api/hit'
    + '?url=' + siteUrl
    + '&label=Visitors'
    + '&icon=eye'
    + '&color=%23198754'
    + '&style=flat';

  fetch(badgeUrl)
    .then(function (res) { return res.text(); })
    .then(function (svg) {
      // The SVG badge text looks like "today / total"
      // We want the total (the number after the slash)
      // Match patterns like ">123 / 4567<" inside the SVG
      var slashMatch = svg.match(/>\s*(\d[\d,]*)\s*\/\s*(\d[\d,]*)\s*</);
      if (slashMatch) {
        var total = parseInt(slashMatch[2].replace(/,/g, ''), 10);
        if (!isNaN(total) && total > 0) {
          el.textContent = 'You are the ' + ordinal(total)
            + ' visitor since March 21, 2026';
          return;
        }
      }

      // Fallback: try to find any number in the SVG
      var nums = [];
      var re = />(\d[\d,]*)</g;
      var m;
      while ((m = re.exec(svg)) !== null) {
        nums.push(parseInt(m[1].replace(/,/g, ''), 10));
      }
      if (nums.length > 0) {
        // The largest number is most likely the total count
        var total = Math.max.apply(null, nums);
        el.textContent = 'You are the ' + ordinal(total)
          + ' visitor since March 21, 2026';
        return;
      }

      // If all parsing fails, show the badge image
      showBadge(el);
    })
    .catch(function () {
      showBadge(el);
    });

  function showBadge(element) {
    var img = document.createElement('img');
    img.src = badgeUrl;
    img.alt = 'Visitor Count';
    img.style.height = '22px';
    img.style.verticalAlign = 'middle';
    element.textContent = '';
    element.appendChild(img);
    var text = document.createTextNode(' since March 21, 2026');
    element.appendChild(text);
  }

  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
})();
