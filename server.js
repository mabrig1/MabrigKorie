require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
const slugify = require('slugify');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const worksRoutes = require('./routes/works');
const socialLinksRoutes = require('./routes/socialLinks');
const publicRoutes = require('./routes/public');
const Work = require('./models/Work');
const SocialLink = require('./models/SocialLink');
const { works, socialLinks } = require('./data/seedData');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/admin/login', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/works', worksRoutes);
app.use('/api/social-links', socialLinksRoutes);
app.use('/', publicRoutes);

const PORT = process.env.PORT || 3000;

async function seedIfEmpty() {
  const [workCount, socialCount] = await Promise.all([
    Work.countDocuments(),
    SocialLink.countDocuments(),
  ]);

  if (workCount === 0) {
    await Work.insertMany(
      works.map((w, i) => ({ ...w, slug: slugify(w.title, { lower: true, strict: true }), order: i }))
    );
    console.log(`Auto-seeded ${works.length} works (database was empty).`);
  }

  if (socialCount === 0) {
    await SocialLink.insertMany(socialLinks);
    console.log(`Auto-seeded ${socialLinks.length} social links (database was empty).`);
  }
}

async function start() {
  await mongoose.connect(process.env.MONGODB_URI);
  await seedIfEmpty();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
