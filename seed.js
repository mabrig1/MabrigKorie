require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const Work = require('./models/Work');

const works = [
  {
    category: 'app',
    title: 'Destiny Skills Bridge',
    description: 'E-learning platform taking Nigerian learners from zero to income-earning freelance skills, including a full 15-module Affiliate Marketing Mastery course.',
    url: 'https://www.mabrigresearch.online/',
    platform: 'MERN Stack · Flagship Product',
    tags: ['MERN Stack', 'E-Learning', 'Flagship Product'],
    featured: true,
  },
  {
    category: 'app',
    title: 'Mabrig Research Institute',
    description: 'Home of the Mabrig Journal of Interdisciplinary Research (MJIR) — an open-access academic journal.',
    url: 'https://www.mabrigresearch.online/',
    platform: 'Research Platform',
    tags: ['Research', 'Publishing'],
  },
  {
    category: 'app',
    title: 'iJournal',
    description: 'Academic publishing platform for peer-reviewed, interdisciplinary research.',
    url: 'https://www.ijournal.uk/',
    platform: 'Academic Journal',
    tags: ['Academic Publishing'],
  },
  {
    category: 'app',
    title: 'Afrigrant Pipeline',
    description: 'Platform connecting researchers and organizations to grant and funding opportunities across Africa.',
    url: 'https://www.afrigrantpipeline.com/',
    platform: 'Grant & Funding Platform',
    tags: ['Grants', 'Funding'],
  },
  {
    category: 'app',
    title: 'DDEI Online',
    description: 'Digital platform built and deployed as part of the Mabrig Technologies portfolio.',
    url: 'https://ddei.online/',
    platform: 'Web Platform',
    tags: ['Web Platform'],
  },
  {
    category: 'research',
    title: 'Deus ex Machina? A Theological Framework for Imago Dei and Moral Agency in the Age of Generative AI',
    description: 'Theology / AI Ethics — published in the Mabrig Journal of Interdisciplinary Research.',
    platform: 'Theology / AI Ethics',
    tags: ['Theology', 'AI Ethics'],
  },
  {
    category: 'research',
    title: 'The IPOB Shield: Narrative Labeling, Moral Panic, and the Architecture of Impunity in Nigeria\'s South-East Security Crisis',
    description: 'Security Studies / Human Rights — published in the Mabrig Journal of Interdisciplinary Research.',
    platform: 'Security Studies',
    tags: ['Security Studies', 'Human Rights'],
  },
  {
    category: 'research',
    title: 'Manufacturing a Threat: A Critical History of the "Civilizational Jihad" Narrative',
    description: 'Religious Studies / Security Studies — published in the Mabrig Journal of Interdisciplinary Research.',
    platform: 'Religious Studies',
    tags: ['Religious Studies', 'Security Studies'],
  },
  {
    category: 'research',
    title: 'State Capture, Institutional Decay, and the Limits of Sovereignty in Nigeria',
    description: 'Governance / Security Studies — published in the Mabrig Journal of Interdisciplinary Research.',
    platform: 'Governance',
    tags: ['Governance', 'Security Studies'],
  },
  {
    category: 'research',
    title: '"Na Statistics We Go Chop?" Macroeconomic Gaslighting and Nigeria\'s Trillion-Dollar Delusion',
    description: 'Political Economy — published in the Mabrig Journal of Interdisciplinary Research.',
    platform: 'Political Economy',
    tags: ['Political Economy'],
  },
  {
    category: 'research',
    title: 'Network Pharmacology Synthesis of Anacardiaceae and Poaceae Leaf Combinations',
    description: 'Computational Pharmacology — published in the Mabrig Journal of Interdisciplinary Research.',
    platform: 'Computational Pharmacology',
    tags: ['Pharmacology'],
  },
  {
    category: 'research',
    title: 'Inflation, Food Insecurity, and Household Resilience in Nigeria',
    description: 'Development Economics — published in the Mabrig Journal of Interdisciplinary Research.',
    platform: 'Development Economics',
    tags: ['Economics'],
  },
  {
    category: 'research',
    title: 'The \'Japa\' Phenomenon and Human Capital Flight in Nigeria',
    description: 'Public Health / Migration Studies — published in the Mabrig Journal of Interdisciplinary Research.',
    platform: 'Public Health / Migration',
    tags: ['Public Health', 'Migration'],
  },
  {
    category: 'book',
    title: 'Decrees That Govern the Heavens',
    description: 'Spiritual warfare and declaration prayers.',
    url: 'https://www.goodreads.com/author/list/18160841.Mabrig_Korie',
    platform: 'Goodreads',
    tags: ['Spiritual Warfare'],
  },
  {
    category: 'book',
    title: 'Pleading the Blood of Jesus',
    description: 'Warfare prayers & decrees — his most popular title on Goodreads.',
    url: 'https://www.goodreads.com/author/list/18160841.Mabrig_Korie',
    platform: 'Goodreads',
    tags: ['Warfare Prayers'],
    featured: true,
  },
  {
    category: 'book',
    title: 'Warfare Prayer Against Poverty & Financial Attacks',
    description: 'Deliverance-focused prayer guide.',
    url: 'https://mabrig.gumroad.com',
    platform: 'Gumroad',
    tags: ['Deliverance'],
  },
  {
    category: 'book',
    title: '30-Day Faith Activation Blueprint',
    description: 'Structured devotional and faith-building program.',
    url: 'https://store.mabrigkorie.org/',
    platform: 'Official Store',
    tags: ['Devotional'],
  },
  {
    category: 'book',
    title: 'Night Prayers: Breakthrough Prayer Series',
    description: 'Prophetic prayer series for breakthrough.',
    url: 'https://www.goodreads.com/author/list/18160841.Mabrig_Korie',
    platform: 'Goodreads',
    tags: ['Prophetic Prayer'],
  },
  {
    category: 'book',
    title: 'The Perception Pressure Theory',
    description: 'Full-length book on identity and mindset.',
    url: 'https://mabrig.gumroad.com',
    platform: 'Gumroad',
    tags: ['Identity', 'Mindset'],
  },
  {
    category: 'music',
    title: 'There Is Power in the Blood of the Lamb',
    description: 'Prophetic worship track.',
    url: 'https://soundcloud.com/mabrigkorie',
    platform: 'SoundCloud',
    tags: ['Worship'],
  },
  {
    category: 'music',
    title: 'Justice Before Unity',
    description: 'Gospel album — 7 songs, 29 minutes.',
    url: 'https://music.apple.com/album/justice-before-unity',
    platform: 'Apple Music',
    tags: ['Album'],
    featured: true,
  },
  {
    category: 'music',
    title: 'Igbo Truth (Glory Hallelujah)',
    description: 'Gospel single.',
    url: 'https://music.apple.com/album/igbo-truth-glory-hallelujah',
    platform: 'Apple Music',
    tags: ['Single'],
  },
  {
    category: 'music',
    title: 'Believer',
    description: 'A powerful testament to unwavering belief in Jesus Christ.',
    url: 'https://audiomack.com/mabrig/song/believer',
    platform: 'Audiomack',
    tags: ['Single'],
  },
  {
    category: 'music',
    title: 'Mabrig Korie on Spotify',
    description: 'Albums including Where is the Love?, Miracle Worker, The Remnant Cry (Arise).',
    url: 'https://open.spotify.com/artist/',
    platform: 'Spotify',
    tags: ['Discography'],
  },
  {
    category: 'service',
    title: 'Full-Stack Web & App Development',
    description: 'Node.js/Express APIs, MongoDB data modeling, REST API design, admin dashboards, auth/payment systems, Vercel/Railway deployment.',
    tags: ['Node.js', 'MongoDB', 'REST API'],
  },
  {
    category: 'service',
    title: 'Online Course Creation & Instructional Design',
    description: 'Curriculum architecture, module/lesson breakdowns, quiz and assessment design, capstone projects, LMS data structuring.',
    tags: ['Curriculum Design'],
  },
  {
    category: 'service',
    title: 'Book Authorship & Ghostwriting',
    description: 'Long-form nonfiction writing, manuscript structuring, chapter development, identity/mindset and self-help content.',
    tags: ['Ghostwriting'],
  },
  {
    category: 'service',
    title: 'Academic & Research Writing',
    description: 'Literature reviews, policy briefs, qualitative/quantitative analysis, thesis structuring and editing.',
    tags: ['Academic Writing'],
  },
  {
    category: 'service',
    title: 'Digital Publishing & Launch Setup',
    description: 'eBook formatting, multi-platform distribution (Selar, Gumroad, Paystack), course/product launch architecture.',
    tags: ['Digital Publishing'],
  },
  {
    category: 'service',
    title: 'AI Multimedia & Cinematic Production',
    description: 'Cinematic AI video generation, sound design, viral short-form scriptwriting for faith-based and motivational content.',
    tags: ['AI Multimedia'],
  },
];

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Work.deleteMany({});

  for (let i = 0; i < works.length; i++) {
    const w = works[i];
    const slug = slugify(w.title, { lower: true, strict: true });
    await Work.create({ ...w, slug, order: i });
  }

  console.log(`Seeded ${works.length} works.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
