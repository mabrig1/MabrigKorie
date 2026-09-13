const express = require('express');
const Work = require('../models/Work');
const SocialLink = require('../models/SocialLink');
const router = express.Router();

const SITE_NAME = 'Mabrig Korie';
const SITE_URL = () => process.env.SITE_URL || 'https://mabrigkorie.org';

const BIO_POINTS = [
  'Founder of MABRIG Technologies',
  'Full-Stack Web Developer & Product Builder',
  'Agentic AI Systems & Automation',
  'AI Evaluation, Verification & Technical Governance',
  'Research, Education, Grant-Tech & Developer Tools',
  'Published Author & Gospel Music Artist',
];

const FEATURED_PROJECTS = [
  {
    title: 'BuildRx',
    category: 'Agentic AI App Builder',
    description: 'A production-minded AI app builder that coordinates an 11-stage agent pipeline to plan, architect, code, debug, secure, test and deploy complete applications from a plain-English brief.',
    outcome: 'Idea → multi-agent build → IDE → GitHub → production deployment.',
    stack: ['Next.js', 'TypeScript', 'Supabase', 'MongoDB', 'OpenRouter', 'Cloudflare R2', 'Vercel'],
    repo: 'https://github.com/mabrig1/BuildRx',
    live: 'https://www.buildrx.online/',
  },
  {
    title: 'MABRIG DevShield AI',
    category: 'DevSecOps · AI Assurance',
    description: 'A GitHub-native security review layer combining deterministic scanning with optional AI analysis, SARIF reporting, dependency intelligence, baselines and merge-risk gating.',
    outcome: 'Fast, transparent pull-request security checks without requiring code to leave CI.',
    stack: ['GitHub Actions', 'Node.js', 'SARIF', 'OpenRouter', 'DevSecOps'],
    repo: 'https://github.com/mabrig1/mabrig-devshield-ai',
  },
  {
    title: 'AfriGrant Pipeline',
    category: 'Grant Intelligence · Research Infrastructure',
    description: 'An Africa-focused funding and research platform for grant discovery, eligibility analysis, proposal support, partnerships, publishing and project-based consultancy workflows.',
    outcome: 'Turns fragmented funding information into structured research and grant pipelines.',
    stack: ['Next.js', 'MongoDB', 'Agentic Search', 'AI Drafting', 'Vercel'],
    repo: 'https://github.com/mabrig1/AfrigrantPipeline',
    live: 'https://www.afrigrantpipeline.com/',
  },
  {
    title: 'Destiny Skills Bridge',
    category: 'EdTech · Opportunity Matching',
    description: 'A digital-skills platform for African learners with structured learning paths, an AI advisor, agentic learning tools, portfolio generation, opportunity matching and resilient backend failover.',
    outcome: 'Connects learning to practical portfolio evidence and income-oriented opportunities.',
    stack: ['Node.js', 'Express', 'MongoDB', 'Appwrite', 'OpenRouter', 'Paystack'],
    repo: 'https://github.com/mabrig1/DDEI-APP',
    live: 'https://ddei.online/',
  },
  {
    title: 'Mabrig Academic Assistance',
    category: 'Academic Workflow Automation',
    description: 'A student-facing academic services platform for document intake, formatting, order tracking, protected file handling, admin review, Word generation and campus service workflows.',
    outcome: 'Transforms manual academic-document operations into a trackable digital workflow.',
    stack: ['Next.js', 'Document Processing', 'Admin Workflow', 'Notifications'],
    repo: 'https://github.com/mabrig1/mabrig-academic-assistance',
  },
  {
    title: 'Scholar / Mabrig Researcher Pro',
    category: 'Research OS · Document Intelligence',
    description: 'A consolidated research workspace bringing publishing intelligence, citation audits, document generation, academic formatting and research-support workflows into one product.',
    outcome: 'One workspace for research preparation, document production and publication readiness.',
    stack: ['Next.js', 'Research Tools', 'Document AI', 'Workflow Automation'],
    repo: 'https://github.com/mabrig1/Scholar',
  },
  {
    title: 'AgriDome Lite',
    category: 'AgriTech · Offline-First AI',
    description: 'A PWA for Nigerian smallholder greenhouse farmers with climate tracking, crop guidance, AI pest analysis, yield prediction, multilingual advice and privacy-conscious pilot evidence collection.',
    outcome: 'Practical AI and farm records designed to remain useful under unreliable connectivity.',
    stack: ['Next.js', 'PWA', 'FastAPI', 'Claude', 'Recharts', 'Offline-First'],
    repo: 'https://github.com/mabrig1/agridome-lite',
  },
  {
    title: 'DocForge AI',
    category: 'Document AI · Academic Formatting',
    description: 'An AI-powered document formatter that converts natural-language formatting instructions into structured academic documents, citations and professional DOCX/PDF exports.',
    outcome: 'Reduces repetitive formatting work while preserving explicit document rules.',
    stack: ['FastAPI', 'React', 'Claude', 'python-docx', 'ReportLab'],
    repo: 'https://github.com/mabrig1/docforge-ai',
  },
  {
    title: 'FINTIGEN Academy',
    category: 'AI & Technology Education',
    description: 'A modern technology academy with structured AI, agentic AI, machine-learning and data courses, reusable course players, progress flows and career-oriented learning experiences.',
    outcome: 'Packages advanced digital skills into accessible, repeatable learning products.',
    stack: ['Next.js', 'React', 'Tailwind', 'Course Architecture'],
    repo: 'https://github.com/mabrig1/Fintigen',
  },
];

const CATEGORY_PAGES = {
  projects: {
    category: 'app',
    eyebrow: 'Apps & Platforms Built',
    title: 'Web Applications & Research Platforms',
    intro: 'Live products and technical systems spanning agentic AI, education, research, developer security, agriculture and digital infrastructure.',
  },
  research: {
    category: 'research',
    eyebrow: 'Academic & Scientific Writing',
    title: 'Research & Publications',
    intro: 'Selected work spanning AI ethics, security studies, political economy, theology, public health and applied research.',
  },
  books: {
    category: 'book',
    eyebrow: 'Authorship',
    title: 'Books & Publications',
    intro: 'Published books across prayer, spiritual warfare, identity, faith and personal development.',
  },
  music: {
    category: 'music',
    eyebrow: 'Music & Ministry',
    title: 'Gospel Discography',
    intro: 'Prophetic worship, revival and faith-centered music released across major platforms.',
  },
  services: {
    category: 'service',
    eyebrow: 'Work With Me',
    title: 'Engineering, AI & Knowledge Services',
    intro: 'Full-stack product development, agentic AI systems, research technology, document automation and digital product strategy.',
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
      title: 'Mabrig Korie — Full-Stack Developer, Agentic AI Builder & Product Architect',
      description:
        'Portfolio of Mabrig Korie, a full-stack developer and agentic AI builder creating production web applications across research, education, grants, developer security, agriculture and digital infrastructure.',
      url: SITE_URL(),
      keywords: 'Mabrig Korie, full-stack developer, agentic AI, AI developer, Next.js, Node.js, MongoDB, DevSecOps, AI applications, Nigeria technology',
    },
    byCategory,
    featuredProjects: FEATURED_PROJECTS,
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
          title: `Contact Mabrig Korie — Full-Stack & AI Product Development`,
          description: 'Contact Mabrig Korie for full-stack development, agentic AI systems, research technology, document automation and digital product collaboration.',
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

router.get('/sitemap.xml', async (req, res) => {
  const works = await Work.find().select('slug updatedAt');
  const urls = [
    `${SITE_URL()}/`,
    ...Object.keys(CATEGORY_PAGES).map((slug) => `${SITE_URL()}/${slug}`),
    `${SITE_URL()}/contact`,
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
