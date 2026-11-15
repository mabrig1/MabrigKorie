const latestApps = require('./latest-apps');

// Central allowlist for independent MABRIG platforms. These public URLs are not
// evidence that a deployment or its visitor tracking is already working.
const otherApps = [
  { slug: 'mabrig-portfolio', title: 'MABRIG Korie Portfolio', live: 'https://mabrigkorie.org/' },
  { slug: 'buildrx', title: 'BuildRx', live: 'https://www.buildrx.online/' },
  { slug: 'ddei', title: 'Destiny Skills Bridge', live: 'https://ddei.online/' },
  { slug: 'fintigen', title: 'FINTIGEN Academy', live: 'https://www.fintigen.com/' },
  { slug: 'afrigrant', title: 'AfriGrant Pipeline', live: 'https://www.afrigrantpipeline.com/' },
  { slug: 'scholar', title: 'MABRIG Scholar', live: 'https://scholar.mabrigkorie.org/' },
  { slug: 'academic-hub', title: 'Academic & Print Hub', live: 'https://academic.mabrigkorie.org/' },
  { slug: 'agridome', title: 'AgriDome Lite', live: 'https://agridome.mabrigkorie.org/' },
];
const registry = [...otherApps, ...latestApps].map((app) => ({
  id: app.slug,
  title: app.title,
  url: app.live,
  origin: new URL(app.live).origin,
  curated: true,
}));
module.exports = registry;
