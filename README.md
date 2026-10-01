# Mabrig Korie — Portfolio with Admin Content Hub

A Node.js/Express + MongoDB portfolio site with an admin dashboard for managing
all of Mabrig Korie's works (apps, research, books, music, services), per-item
SEO fields, and one-click social sharing.

## MABRIG Tech+ Academy

The portfolio now includes a connected academy gateway at `/academy`.

**Learning journey:** Learn → Build → Verify → Research → Fund → Earn.

The academy interlinks existing specialist platforms rather than duplicating them:
- Destiny Skills Bridge — digital skills and career entry
- BuildRx + Full Stack Master Class — software, AI and project-based development
- FINTIGEN Academy — AI, data and technology education
- AfriGrant Pipeline — grants, scholarships, fellowships and funding readiness
- Scholar + KnowledgeForge — academic and research technology
- MABRIG DevShield AI — secure development and capstone verification

## Features

- **Public site** — dynamic homepage pulling all works from the database, plus
  a dedicated SEO-optimized page per work (`/work/:slug`).
- **Admin dashboard** (`/admin`) — add/edit/delete works, with SEO title,
  description, keywords, live Google-style preview, and an on-page SEO checklist.
- **Social sharing** — every work has one-click share buttons for X (Twitter),
  Facebook, LinkedIn, WhatsApp, Telegram, and Email. These work immediately,
  no API keys required.
- **SEO tooling** — per-item meta tags, Open Graph / Twitter Card tags, an
  auto-generated `sitemap.xml`, and `robots.txt`.

## Setup

```bash
npm install
cp .env.example .env
# edit .env: set MONGODB_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD, SITE_URL
npm run seed   # populates the database with all existing works
npm start
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin`
to log in and manage content (credentials come from `.env`).

## Note on "auto-posting" to social platforms

Real automatic posting to TikTok, Instagram, Spotify, etc. requires that
platform's own developer API keys/OAuth app, which only the account owner can
create (most require business verification and app review). This build ships
working **share-intent buttons** (X, Facebook, LinkedIn, WhatsApp, Telegram,
Email) that need no setup. If you later obtain API credentials for a platform,
the admin dashboard's "Post" actions can be extended to call that platform's
API directly — ask and it can be wired in.
