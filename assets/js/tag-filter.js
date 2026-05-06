(function () {
  var entries    = document.querySelectorAll('.blog-entry');
  var countEl    = document.querySelector('.blog-count');
  var searchEl   = document.getElementById('blog-search');
  var toggle     = document.getElementById('blog-tags-toggle');
  var panel      = document.getElementById('blog-tags-panel');
  var activeTag  = 'all';
  var activeQuery = '';

  // ── Collapse toggle ──────────────────────────────────────
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      var next = !open;
      toggle.setAttribute('aria-expanded', String(next));
      panel.setAttribute('aria-hidden', String(!next));
      var count = panel.querySelectorAll('.blog-tag-btn').length;
      toggle.innerHTML = (next ? '▼' : '▶') +
        ' Filter by tag <span class="blog-tags-count">(' + count + ' available)</span>';
    });
  }

  // ── Core filter ──────────────────────────────────────────
  function applyFilters() {
    var q = activeQuery.toLowerCase().trim();
    var visible = 0;
    entries.forEach(function (entry) {
      var tags    = (entry.getAttribute('data-tags') || '').toLowerCase();
      var title   = (entry.getAttribute('data-title') || '').toLowerCase();
      var excerpt = (entry.getAttribute('data-excerpt') || '').toLowerCase();

      var tagMatch  = activeTag === 'all' || tags.split(' ').indexOf(activeTag) !== -1;
      var textMatch = !q || title.indexOf(q) !== -1 || excerpt.indexOf(q) !== -1 || tags.indexOf(q) !== -1;

      var show = tagMatch && textMatch;
      entry.setAttribute('data-hidden', show ? 'false' : 'true');
      if (show) visible++;
    });
    if (countEl) countEl.textContent = visible;
  }

  // ── Tag buttons ──────────────────────────────────────────
  var buttons = document.querySelectorAll('.blog-tag-btn');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeTag = btn.getAttribute('data-filter') || 'all';
      buttons.forEach(function (b) {
        b.classList.toggle('active', b.getAttribute('data-filter') === activeTag);
      });
      var label = document.getElementById('active-tag-label');
      if (label) label.textContent = activeTag !== 'all' ? '#' + activeTag : '';
      applyFilters();
    });
  });

  // ── Search input ─────────────────────────────────────────
  if (searchEl) {
    searchEl.addEventListener('input', function () {
      activeQuery = searchEl.value;
      applyFilters();
    });
  }
})();
