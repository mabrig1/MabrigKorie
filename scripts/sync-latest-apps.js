// Add new showcase products to the admin-managed catalogue without resetting existing data.
// Usage: npm run sync:latest-apps (requires MONGODB_URI)
require('dotenv').config();
const mongoose = require('mongoose');
const Work = require('../models/Work');
const latestApps = require('../data/latest-apps');

async function run() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI must be configured before synchronizing applications.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  let added = 0;
  let alreadyPresent = 0;
  try {
    for (const [index, app] of latestApps.entries()) {
      const urlWithoutSlash = app.live.replace(/[/]+$/, '');
      const existing = await Work.findOne({
        $or: [
          { slug: app.slug },
          { category: 'app', title: app.title },
          { category: 'app', url: { $in: [app.live, urlWithoutSlash] } },
        ],
      });
      if (existing) {
        alreadyPresent += 1;
        console.log('Already present:', app.title);
        continue; // Preserve any edits made through the admin dashboard.
      }
      await Work.create({
        category: 'app',
        slug: app.slug,
        title: app.title,
        description: app.description,
        url: app.live,
        platform: app.category,
        tags: app.stack,
        featured: true,
        order: index - latestApps.length,
        seoTitle: app.title + ' — MABRIG Technologies',
        seoDescription: app.description,
        seoKeywords: [app.title, 'MABRIG Technologies', ...app.stack],
      });
      added += 1;
      console.log('Added:', app.title);
    }
    console.log('Latest-app sync complete:', { added, alreadyPresent });
  } finally {
    await mongoose.disconnect();
  }
}
run().catch((error) => {
  console.error('Latest-app sync failed:', error.message);
  process.exitCode = 1;
});
