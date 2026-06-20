const express = require('express');
const Work = require('../models/Work');
const router = express.Router();

const SITE_NAME = 'Mabrig Korie';
const SITE_URL = () => process.env.SITE_URL || 'https://mabrigkorie.org';

router.get('/', async (req, res) => {
  const works = await Work.find().sort({ order: 1, createdAt: -1 });
  const byCategory = {
    app: works.filter((w) => w.category === 'app'),
    research: works.filter((w) => w.category === 'research'),
    book: works.filter((w) => w.category === 'book'),
    music: works.filter((w) => w.category === 'music'),
    service: works.filter((w) => w.category === 'service'),
  };

  res.render('index', {
    siteName: SITE_NAME,
    siteUrl: SITE_URL(),
    meta: {
      title: 'Mabrig Korie — Developer, Author, Researcher & Gospel Artist',
      description:
        'Official portfolio of Mabrig Korie: full-stack developer, published author, academic researcher, and gospel musician.',
      url: SITE_URL(),
    },
    byCategory,
  });
});

router.get('/work/:slug', async (req, res) => {
  const work = await Work.findOne({ slug: req.params.slug });
  if (!work) return res.status(404).send('Not found');

  res.render('work', {
    siteName: SITE_NAME,
    siteUrl: SITE_URL(),
    meta: {
      title: work.seoTitle || `${work.title} — ${SITE_NAME}`,
      description: work.seoDescription || work.description,
      url: `${SITE_URL()}/work/${work.slug}`,
      keywords: (work.seoKeywords || []).join(', '),
      image: work.image,
    },
    work,
  });
});

router.get('/sitemap.xml', async (req, res) => {
  const works = await Work.find().select('slug updatedAt');
  const urls = [
    `${SITE_URL()}/`,
    ...works.map((w) => `${SITE_URL()}/work/${w.slug}`),
  ];
  res.set('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`);
});

router.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${SITE_URL()}/sitemap.xml\n`);
});

module.exports = router;
