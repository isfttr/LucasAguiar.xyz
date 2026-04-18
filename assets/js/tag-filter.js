(function () {
  var buttons = document.querySelectorAll('.blog-tag-btn');
  var entries = document.querySelectorAll('.blog-entry');
  var countEl = document.querySelector('.blog-count');
  if (!buttons.length) return;

  function filter(tag) {
    var visible = 0;
    entries.forEach(function (entry) {
      var entryTag = entry.getAttribute('data-tag') || '';
      var show = tag === 'all' || entryTag.toLowerCase() === tag.toLowerCase();
      entry.setAttribute('data-hidden', show ? 'false' : 'true');
      if (show) visible++;
    });
    if (countEl) countEl.textContent = visible;
    buttons.forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === tag);
    });
  }

  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filter(btn.getAttribute('data-filter') || 'all');
    });
  });
})();
