(function () {
  'use strict';
  const script = document.currentScript;
  if (!script) return;
  const app = script.dataset.app;
  const collector = script.dataset.collector || new URL(script.src).origin;
  if (!/^[a-z0-9-]{1,80}$/.test(app || '')) return;

  // A random tab-scoped identifier avoids persistent cookies, fingerprints,
  // emails and cross-app identity matching.
  let session;
  try {
    session = sessionStorage.getItem('mabrig.performance.session');
    if (!session || !/^[a-f0-9]{32}$/.test(session)) {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      session = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
      sessionStorage.setItem('mabrig.performance.session', session);
    }
  } catch (_) {
    return; // Privacy/restricted browsing mode: do not try to work around it.
  }

  let previousPath = null;
  let previousAt = 0;
  function track() {
    const pathname = window.location.pathname;
    const now = Date.now();
    if (pathname === previousPath && now - previousAt < 30000) return;
    if (document.visibilityState === 'hidden') return;
    previousPath = pathname;
    previousAt = now;

    try {
      fetch(new URL('/api/performance/event', collector).toString(), {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        cache: 'no-store',
        keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify({ app, session, path: pathname.slice(0, 160) }),
      }).catch(() => {});
    } catch (_) { /* Tracking must never interrupt the app. */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', track, { once: true });
  else track();
  window.addEventListener('popstate', track);
  window.addEventListener('hashchange', track);
  ['pushState', 'replaceState'].forEach((method) => {
    const original = history[method];
    if (typeof original !== 'function') return;
    history[method] = function () {
      const result = original.apply(this, arguments);
      track();
      return result;
    };
  });
})();
