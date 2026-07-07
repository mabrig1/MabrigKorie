require('dotenv').config();
const mongoose = require('mongoose');
const slugify = require('slugify');
const Work = require('./models/Work');
const SocialLink = require('./models/SocialLink');
const { works, socialLinks } = require('./data/seedData');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Work.deleteMany({});
  await SocialLink.deleteMany({});

  for (let i = 0; i < works.length; i++) {
    const w = works[i];
    const slug = slugify(w.title, { lower: true, strict: true });
    await Work.create({ ...w, slug, order: i });
  }
  await SocialLink.insertMany(socialLinks);

  console.log(`Seeded ${works.length} works and ${socialLinks.length} social links.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
