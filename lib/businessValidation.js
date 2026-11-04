const STAGES = Object.freeze(['new', 'contacted', 'quoted', 'won', 'in-progress', 'completed', 'lost']);
const MARKETS = Object.freeze(['Nsukka / Enugu', 'Elsewhere in Nigeria', 'International']);
const CURRENCIES = Object.freeze(['NGN', 'USD', 'GBP', 'EUR']);
const PLATFORMS = Object.freeze(['Facebook', 'TikTok', 'YouTube', 'Instagram', 'LinkedIn']);
const PRODUCTS = Object.freeze(['MABRIG Technologies', 'DDEI Online', 'DevShield AI']);
const POST_STATUSES = Object.freeze(['draft', 'ready', 'published']);

function clean(value, max = 120, required = false) {
  if (Array.isArray(value) || value == null || typeof value === 'object') value = '';
  const result = String(value).replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
  if (required && !result) throw new Error('Required field is missing.');
  return result;
}

function pick(value, allowed) {
  const result = clean(value);
  if (!allowed.includes(result)) throw new Error('Unsupported field value.');
  return result;
}

function minorAmount(value) {
  const raw = clean(value, 40);
  if (!raw) return 0;
  if (!/^(?:0|[1-9]\d{0,10})(?:\.\d{1,2})?$/.test(raw)) throw new Error('Enter a valid non-negative amount with at most 2 decimals.');
  const [whole, fractional = ''] = raw.split('.');
  const minor = Number(whole) * 100 + Number(fractional.padEnd(2, '0'));
  if (!Number.isSafeInteger(minor) || minor > 1e13) throw new Error('Amount too large.');
  return minor;
}

function metric(value) {
  const raw = clean(value, 20);
  if (!raw) return 0;
  if (!/^\d{1,10}$/.test(raw)) throw new Error('Metrics must be non-negative whole numbers.');
  const n = Number(raw);
  if (n > 1e9) throw new Error('Metric too large.');
  return n;
}

function sourceSlug(value) {
  const v = clean(value, 64).toLowerCase();
  if (!/^[a-z0-9_-]{3,64}$/.test(v)) throw new Error('Use a source code with 3–64 letters, digits, hyphens or underscores.');
  return v;
}

function leadFromBody(body, mode = 'create') {
  if (mode === 'create') {
    return {
      business: clean(body.business, 100, true),
      contact: clean(body.contact, 120),
      market: pick(body.market, MARKETS),
      service: clean(body.service, 80, true),
      source: clean(body.source, 100) || 'manual',
      summary: clean(body.summary, 600),
      stage: 'new',
      currency: pick(body.currency, CURRENCIES)
    };
  }
  return {
    stage: pick(body.stage, STAGES),
    currency: pick(body.currency, CURRENCIES),
    quotedMinor: minorAmount(body.quoted),
    collectedMinor: minorAmount(body.collected),
    paymentNote: clean(body.paymentNote, 250)
  };
}

function postFromBody(body, mode = 'create') {
  if (mode === 'create') {
    const day = clean(body.day, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day + 'T00:00:00Z')) ||
       new Date(day + 'T00:00:00Z').toISOString().slice(0,10) !== day) throw new Error('Use a valid YYYY-MM-DD date.');
    return {
      day,
      platform: pick(body.platform, PLATFORMS),
      product: pick(body.product, PRODUCTS),
      source: sourceSlug(body.source),
      title: clean(body.title, 140, true),
      caption: clean(body.caption, 2400, true),
      status: 'draft'
    };
  }
  return {
    status: pick(body.status, POST_STATUSES),
    views: metric(body.views),
    followers: metric(body.followers),
    enquiries: metric(body.enquiries),
    sales: metric(body.sales)
  };
}

function formatAmount(minor, currency) {
  return new Intl.NumberFormat('en', {style: 'currency', currency, maximumFractionDigits: 2})
    .format((minor || 0) / 100);
}

module.exports = { STAGES, MARKETS, CURRENCIES, PLATFORMS, PRODUCTS,
  POST_STATUSES, leadFromBody, postFromBody, formatAmount, minorAmount, metric };
