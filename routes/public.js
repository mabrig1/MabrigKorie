const express = require('express');
const Work = require('../models/Work');
const SocialLink = require('../models/SocialLink');
const Blog = require('../models/Blog');
const router = express.Router();

const SITE_NAME = 'Mabrig Korie';
const SITE_URL = () => process.env.SITE_URL || 'https://mabrigkorie.org';

const BIO_POINTS = [
  'Founder of Mabrig Technologies',
  'Founder of Mabrig Research Institute',
  'Author of 40+ books',
  'Gospel Music Artist',
  'Creator of Destiny Skills Bridge',
  'Academic Researcher',
  'Full-Stack Developer',
];

const CATEGORY_PAGES = {
  projects: {
    category: 'app',
    eyebrow: 'Apps & Platforms Built',
    title: 'Web Applications & Research Platforms',
    intro: 'Live, deployed products designed and built end-to-end — backend, frontend, and content.',
  },
  research: {
    category: 'research',
    eyebrow: 'Academic & Scientific Writing',
    title: 'Mabrig Journal of Interdisciplinary Research',
    intro: 'Selected published work spanning AI Ethics, Security Studies, Political Economy, Theology, Public Health, and Pharmacology.',
  },
  books: {
    category: 'book',
    eyebrow: 'Authorship',
    title: 'Books & Publications',
    intro: '40+ published books on prayer, spiritual warfare, identity, and personal development.',
  },
  music: {
    category: 'music',
    eyebrow: 'Music & Ministry',
    title: 'Gospel Discography',
    intro: 'Prophetic worship and deliverance music as a Nigerian gospel artist and minister.',
  },
  services: {
    category: 'service',
    eyebrow: 'Hire Me',
    title: 'Core Service Offerings',
    intro: 'End-to-end capability across development, AI solutions, research, publishing, and content strategy.',
  },
};

async function getStats() {
  const [apps, research, books, music, services] = await Promise.all([
    Work.countDocuments({ category: 'app' }),
    Work.countDocuments({ category: 'research' }),
    Work.countDocuments({ category: 'book' }),
    Work.countDocuments({ category: 'music' }),
    Work.countDocuments({ category: 'service' }),
  ]);
  return { apps, research, books, music, services };
}

router.get('/', async (req, res) => {
  const [works, socialLinks, stats] = await Promise.all([
    Work.find().sort({ order: 1, createdAt: -1 }),
    SocialLink.find().sort({ order: 1 }),
    getStats(),
  ]);
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
      title: 'Mabrig Korie — Author, Researcher, Gospel Musician & Full-Stack Developer',
      description:
        'Official portfolio of Mabrig Korie: full-stack developer, published author, academic researcher, gospel musician, and digital entrepreneur.',
      url: SITE_URL(),
    },
    byCategory,
    bioPoints: BIO_POINTS,
    socialLinks,
    stats,
  });
});

router.get('/contact', (req, res) => {
  SocialLink.find()
    .sort({ order: 1 })
    .then((socialLinks) => {
      res.render('contact', {
        siteName: SITE_NAME,
        siteUrl: SITE_URL(),
        meta: {
          title: `Contact — ${SITE_NAME}`,
          description: 'Get in touch with Mabrig Korie for development, writing, research, or production projects.',
          url: `${SITE_URL()}/contact`,
        },
        socialLinks,
      });
    });
});

Object.keys(CATEGORY_PAGES).forEach((slug) => {
  router.get(`/${slug}`, async (req, res) => {
    const page = CATEGORY_PAGES[slug];
    const works = await Work.find({ category: page.category }).sort({ order: 1, createdAt: -1 });

    res.render('category', {
      siteName: SITE_NAME,
      siteUrl: SITE_URL(),
      meta: {
        title: `${page.title} — ${SITE_NAME}`,
        description: page.intro,
        url: `${SITE_URL()}/${slug}`,
      },
      page,
      works,
    });
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

router.get('/blog', async (req, res) => {
  const posts = await Blog.find({ published: true }).sort({ publishedAt: -1 });
  res.render('blog-list', {
    siteName: SITE_NAME,
    siteUrl: SITE_URL(),
    meta: {
      title: `Blog — ${SITE_NAME}`,
      description: 'Articles and writing from Mabrig Korie on faith, technology, research, and creative work.',
      url: `${SITE_URL()}/blog`,
    },
    posts,
  });
});

router.get('/blog/:slug', async (req, res) => {
  const post = await Blog.findOne({ slug: req.params.slug, published: true });
  if (!post) return res.status(404).send('Not found');

  res.render('blog-post', {
    siteName: SITE_NAME,
    siteUrl: SITE_URL(),
    meta: {
      title: post.seoTitle || `${post.title} — ${SITE_NAME}`,
      description: post.seoDescription || post.excerpt,
      url: `${SITE_URL()}/blog/${post.slug}`,
      keywords: (post.seoKeywords || []).join(', '),
      image: post.coverImage,
    },
    post,
  });
});

router.get('/sitemap.xml', async (req, res) => {
  const works = await Work.find().select('slug updatedAt');
  const posts = await Blog.find({ published: true }).select('slug updatedAt');
  const urls = [
    `${SITE_URL()}/`,
    ...Object.keys(CATEGORY_PAGES).map((slug) => `${SITE_URL()}/${slug}`),
    `${SITE_URL()}/contact`,
    `${SITE_URL()}/blog`,
    ...works.map((w) => `${SITE_URL()}/work/${w.slug}`),
    ...posts.map((p) => `${SITE_URL()}/blog/${p.slug}`),
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

// Legacy permalinks from the previous host had no /blog/ prefix — redirect them.
router.get('/:legacySlug', async (req, res, next) => {
  const post = await Blog.findOne({ slug: req.params.legacySlug, published: true });
  if (!post) return next();
  res.redirect(301, `/blog/${post.slug}`);
});

module.exports = router;
