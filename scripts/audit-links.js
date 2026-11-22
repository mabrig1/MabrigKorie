// Inventory public outbound links and optionally check them online.
// Usage: npm run audit:links (static); npm run audit:links:online (HTTP checks).
// 403/429 and network errors are reported as inconclusive, not false "dead link" claims.
const fs = require('node:fs');
const path = require('node:path');
const latestApps = require('../data/latest-apps');

const files = [
  'data/latest-apps.js', 'routes/public.js', 'seed.js',
  'views/academy.ejs', 'views/index.ejs', 'views/partials/footer.ejs'
];
const urls = new Set(latestApps.flatMap((app) => [app.live, app.repo]));
for (const relativePath of files) {
  const content = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8');
  for (const match of content.matchAll(/https?:\/\/[^\s"'\x60<>]+/g)) {
    const candidate = match[0].replace(/[),;]+$/, '');
    if (candidate.includes('${') || candidate.includes('sitemaps.org')) continue;
    urls.add(candidate);
  }
}
const targets = [...urls].sort();
const malformed = targets.filter((url) => {
  try { return new URL(url).protocol !== 'https:'; }
  catch { return true; }
});

async function checkUrl(url) {
  const run = async (method) => {
    const response = await fetch(url, {
      method, redirect: 'follow',
      headers: { 'User-Agent': 'MABRIG-Link-Audit/1.0' },
      signal: AbortSignal.timeout(8000)
    });
    return response.status;
  };
  try {
    let status = await run('HEAD');
    if (status === 405) status = await run('GET');
    const label = status === 404 || status === 410 ? 'BROKEN' :
      status >= 200 && status < 400 ? 'OK' : 'INCONCLUSIVE';
    return { url, status, label };
  } catch (err) {
    return { url, status: String(err.message || err), label: 'INCONCLUSIVE' };
  }
}
async function main() {
  console.log('Unique public HTTP(S) references:', targets.length);
  for (const url of malformed) console.error('INVALID', url);
  if (process.argv.includes('--online')) {
    // Run in batches to avoid flooding small sites or triggering rate limits.
    for (let index = 0; index < targets.length; index += 4) {
      const checks = await Promise.all(targets.slice(index, index + 4).map(checkUrl));
      for (const check of checks) {
        console.log(check.label, check.status, check.url);
        if (check.label === 'BROKEN') process.exitCode = 1;
      }
    }
  } else {
    console.log('Static inventory ready. Use npm run audit:links:online for live checks.');
  }
  if (malformed.length) process.exitCode = 1;
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
