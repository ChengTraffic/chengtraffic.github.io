/**
 * Visitor Counter for chengtraffic.github.io
 * Uses hitscounter.dev (open-source hit counter service) to track page views.
 * Displays total visitor count since March 21, 2026.
 */
(function() {
  var el = document.getElementById('visitor-count');
  if (!el) return;

  // Use the site-wide counter URL (counts all pages together)
  var counterUrl = 'https://hitscounter.dev/api/hit/'
    + encodeURIComponent('https://chengtraffic.github.io')
    + '/json';

  // Fallback: use the SVG badge approach which is more widely supported
  var badgeUrl = 'https://hitscounter.dev/api/hit/'
    + encodeURIComponent('https://chengtraffic.github.io')
    + '/svg';

  // Try fetching the count
  fetch(badgeUrl)
    .then(function(response) {
      return response.text();
    })
    .then(function(svgText) {
      // Extract the total count from the SVG badge
      // The SVG contains text elements with the count
      var matches = svgText.match(/>(\d+)<\/text>/g);
      if (matches && matches.length > 0) {
        // Get the last number found (usually the total count)
        var lastMatch = matches[matches.length - 1];
        var count = lastMatch.match(/(\d+)/);
        if (count) {
          el.textContent = 'You are the ' + ordinal(parseInt(count[1], 10))
            + ' visitor since March 21, 2026';
          return;
        }
      }
      // If SVG parsing fails, show the badge as an image instead
      showBadgeFallback(el);
    })
    .catch(function() {
      // On network error, show the badge image as fallback
      showBadgeFallback(el);
    });

  function showBadgeFallback(element) {
    var img = document.createElement('img');
    img.src = 'https://hitscounter.dev/api/hit/'
      + encodeURIComponent('https://chengtraffic.github.io')
      + '/svg?label=Visitors%20since%202026.3.21';
    img.alt = 'Visitor Count';
    img.style.height = '20px';
    img.style.verticalAlign = 'middle';
    element.textContent = '';
    element.appendChild(img);
    var text = document.createTextNode(' visitors since March 21, 2026');
    element.appendChild(text);
  }

  function ordinal(n) {
    var s = ['th', 'st', 'nd', 'rd'];
    var v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }
})();
