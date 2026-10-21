/* Runs before the app paints; the same store is reused by the React controls. */
(function () {
  if (typeof window === 'undefined' || !window.document || window.specelioAppearance) return;
  const key = 'specelio-theme';
  const normalize = value => value === 'dark' ? 'dark' : 'light';
  const listeners = new Set();
  const read = () => {
    try { return normalize(window.localStorage.getItem(key)); }
    catch { return 'light'; }
  };
  let theme = read();
  const apply = () => {
    const root = window.document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    root.style.backgroundColor = theme === 'dark' ? '#13171c' : '#ffffff';
    const chrome = window.document.querySelector('meta[name="theme-color"]');
    if (chrome) chrome.setAttribute('content', theme === 'dark' ? '#13171c' : '#ffffff');
  };
  const update = value => {
    const next = normalize(value);
    if (theme === next) return;
    theme = next;
    apply();
    listeners.forEach(listener => listener());
  };
  window.specelioAppearance = Object.freeze({
    getSnapshot: () => theme,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    setTheme: value => {
      if (value !== 'light' && value !== 'dark') return;
      try { window.localStorage.setItem(key, value); } catch { /* This tab still works without storage. */ }
      update(value);
    },
  });
  window.addEventListener('storage', event => {
    if (event.key === key) update(event.newValue);
    else if (event.key === null) update(read());
  });
  apply();
})();
