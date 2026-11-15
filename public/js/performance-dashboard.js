(function () {
  'use strict';
  const el = (id) => document.getElementById(id);
  const nf = new Intl.NumberFormat('en-US');
  const BASE = 'https://mabrigkorie.org';
  let busy = false;

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[character]));
  }
  function formatNumber(value) { return nf.format(value || 0); }
  function freshness(iso) {
    if (!iso) return 'No tracked activity received';
    const date = new Date(iso);
    return Number.isNaN(+date) ? 'Unknown' : 'Last recorded ' + date.toLocaleString();
  }
  function metric(label, value, subtitle) {
    return '<div class="performance-metric"><span>' + escapeHtml(label) +
      '</span><strong>' + escapeHtml(value) + '</strong><small>' +
      escapeHtml(subtitle) + '</small></div>';
  }
  function paintMetrics(data) {
    const t = data.totals;
    el('metrics').innerHTML = [
      metric('Registered apps', formatNumber(t.apps), formatNumber(t.tracked) + ' have recorded traffic'),
      metric('Page views', t.tracked ? formatNumber(t.views) : '—', 'Tracked requests in this period'),
      metric('Visitor sessions', t.tracked ? formatNumber(t.sessions) : '—', 'Approximate, tab-based'),
      metric('Recently active', t.tracked ? formatNumber(t.active) : '—', 'Page view within 5 minutes'),
    ].join('');
  }
  function createSvg(name, attrs, parent) {
    const node = document.createElementNS('http://www.w3.org/2000/svg', name);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    parent.appendChild(node);
    return node;
  }
  function paintTrend(data) {
    const root = el('trendChart');
    root.textContent = '';
    el('trendTotal').textContent = data.totals.tracked ? formatNumber(data.totals.views) + ' views' : 'Not connected';
    const series = data.trend;
    if (!data.totals.tracked || !series.length) {
      root.innerHTML = '<p class="chart-empty">Connect at least one app to display authentic visitor traffic, not sample statistics.</p>';
      return;
    }
    const width = 840, height = 240;
    const left = 42, right = 16, top = 18, bottom = 42;
    const xWidth = width - left - right, yHeight = height - top - bottom;
    const max = Math.max(1, ...series.map((point) => point.views));
    const svg = createSvg('svg', {
      viewBox: '0 0 ' + width + ' ' + height,
      role: 'img',
      'aria-label': 'Recorded page views from ' + series[0].bucket + ' to ' + series[series.length - 1].bucket,
    }, root);
    for (let i = 0; i <= 4; i++) {
      const y = top + (yHeight * i / 4);
      createSvg('line', { x1: left, y1: y, x2: width - right, y2: y, stroke: '#323947', 'stroke-width': 1 }, svg);
      const label = createSvg('text', { x: left - 7, y: y + 4, fill: '#a4aabb', 'font-size': 11, 'text-anchor': 'end' }, svg);
      label.textContent = String(Math.round(max * (1 - i / 4)));
    }
    const points = series.map((point, i) => {
      const x = left + (series.length === 1 ? 0 : i * xWidth / (series.length - 1));
      const y = top + yHeight * (1 - point.views / max);
      return [x, y, point];
    });
    createSvg('polyline', {
      points: points.map(([x,y]) => x.toFixed(1) + ',' + y.toFixed(1)).join(' '),
      fill: 'none', stroke: '#d4af37', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round',
    }, svg);
    const every = Math.max(1, Math.ceil(series.length / 5));
    points.forEach(([x, y, point], i) => {
      const circle = createSvg('circle', { cx: x, cy: y, r: 3.5, fill: '#f0d98c' }, svg);
      createSvg('title', {}, circle).textContent = point.bucket + ': ' + point.views + ' page views';
      if (i % every === 0 || i === series.length - 1) {
        const label = createSvg('text', { x, y: height - 13, 'text-anchor': 'middle', 'font-size': 10, fill: '#b4bac7' }, svg);
        label.textContent = point.bucket.slice(data.period === '24h' ? -5 : 5);
      }
    });
  }
  function paintTop(data) {
    const top = data.apps.filter((app) => app.views > 0).sort((a,b) => b.views - a.views).slice(0, 6);
    if (!top.length) { el('topApps').innerHTML = '<p class="chart-empty">No recorded page views yet.</p>'; return; }
    const max = top[0].views;
    el('topApps').innerHTML = top.map((app) =>
      '<div><div class="top-app-name"><span>' + escapeHtml(app.title) + '</span><strong>' +
      formatNumber(app.views) + '</strong></div><div class="top-app-track"><div class="top-app-fill" style="width:' +
      Math.min(100, 100 * app.views / max).toFixed(1) + '%"></div></div></div>'
    ).join('');
  }
  function healthPresentation(health) {
    if (!health || health.state === 'not_checked') return { label: 'Not checked', status: '', detail: 'No external reachability probe available' };
    if (health.state === 'responding') return {
      label: 'Responding', status: 'good', detail: 'HTTP ' + health.httpStatus + ' · ' + health.responseMs + ' ms',
    };
    if (health.state === 'http_error') return {
      label: 'HTTP response issue', status: 'warn', detail: 'HTTP ' + health.httpStatus + ' · ' + health.responseMs + ' ms',
    };
    return { label: 'Unverified', status: 'warn', detail: 'A check failed; the site may still be reachable from elsewhere' };
  }
  function trackerSnippet(app) {
    // A public script URL and public app ID; not a secret credential.
    return '<script defer src="' + BASE + '/public/js/performance-tracker.js" data-app="' + app.id +
      '" data-collector="' + BASE + '"><' + '/script>';
  }
  function paintApps(data) {
    el('appCount').textContent = data.apps.length + ' registered apps';
    el('appsGrid').innerHTML = data.apps.map((app) => {
      const health = healthPresentation(app.health);
      const observed = !!app.lastEvent;
      let safeLink = '#';
      try { const u = new URL(app.url); if (u.protocol === 'https:') safeLink = u.href; } catch (_) {}
      return '<article class="performance-app">' +
        '<header><h3>' + escapeHtml(app.title) + '</h3><span class="status-pill ' + (observed ? 'good' : 'warn') + '">' +
        (observed ? 'Tracked' : 'Awaiting data') + '</span></header>' +
        '<a href="' + escapeHtml(safeLink) + '" target="_blank" rel="noopener noreferrer">Open application ↗</a>' +
        '<div class="performance-app-summary"><div><strong>' + (observed ? formatNumber(app.views) : '—') +
        '</strong><span>Page views</span></div><div><strong>' + (observed ? formatNumber(app.sessions) : '—') +
        '</strong><span>Visitor sessions</span></div></div>' +
        '<div class="performance-app-detail">' + escapeHtml(freshness(app.lastEvent)) + '</div>' +
        '<div class="performance-app-footer"><span class="status-pill ' + health.status + '">' +
        escapeHtml(health.label) + '</span><button type="button" data-copy="' + escapeHtml(app.id) +
        '">Copy tracker code</button></div>' +
        '<div class="performance-app-detail">' + escapeHtml(health.detail) + '</div>' +
        '</article>';
    }).join('');
  }
  function paintInsights(data) {
    el('insights').innerHTML = (data.insights || []).map((message) =>
      '<div class="agent-insight">' + escapeHtml(message) + '</div>'
    ).join('') || '<p>No verified observations available.</p>';
  }
  async function refresh() {
    if (busy) return;
    busy = true;
    el('refresh').disabled = true;
    el('syncStatus').classList.remove('error');
    el('syncStatus').textContent = 'Checking recorded visitor activity…';
    try {
      const response = await fetch('/api/performance/summary?period=' + encodeURIComponent(el('period').value), {
        credentials: 'same-origin', cache: 'no-store',
      });
      if (response.status === 401) { window.location.assign('/admin/login'); return; }
      if (!response.ok) throw new Error('The analytics service could not be reached (HTTP ' + response.status + ').');
      const data = await response.json();
      paintMetrics(data); paintTrend(data); paintTop(data); paintApps(data); paintInsights(data);
      el('syncStatus').textContent = 'Updated ' + new Date(data.generatedAt).toLocaleTimeString() +
        ' · refreshes every 30 seconds · numbers are recorded measurements, not simulated';
      window.performanceApps = data.apps; // current page only, to support copy buttons
    } catch (error) {
      el('syncStatus').classList.add('error');
      el('syncStatus').textContent = 'Live metrics unavailable: ' + error.message + ' Please check the database or try refreshing.';
    } finally {
      busy = false;
      el('refresh').disabled = false;
    }
  }
  el('period').addEventListener('change', refresh);
  el('refresh').addEventListener('click', refresh);
  el('appsGrid').addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-copy]');
    if (!button) return;
    const app = (window.performanceApps || []).find((a) => a.id === button.dataset.copy);
    if (!app) return;
    try {
      await navigator.clipboard.writeText(trackerSnippet(app));
      button.textContent = 'Copied!';
      setTimeout(() => { button.textContent = 'Copy tracker code'; }, 1800);
    } catch (_) { button.textContent = 'Copy unavailable in this browser'; }
  });
  refresh();
  setInterval(() => { if (!document.hidden) refresh(); }, 30000);
})();
