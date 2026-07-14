(function () {
  try {
    var stored = null;
    try { stored = window.localStorage.getItem('laftah-theme'); } catch (e) {}
    var theme = stored;
    if (theme !== 'light' && theme !== 'dark') {
      theme = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark' : 'light';
    }
    var root = document.documentElement;
    if (theme === 'dark') { root.classList.add('dark'); } else { root.classList.remove('dark'); }
    root.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0f1f33' : '#14b8a6');
    }
  } catch (e) {}
})();
