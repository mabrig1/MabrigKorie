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

## Latest applications (November 2026)

The homepage has a dedicated **Latest Applications** section and `/projects` also
shows these apps immediately, even if the MongoDB catalogue has not been updated.
Descriptions are curated from each project's source repository; public URLs are
user-supplied and need independent runtime checks after release.

| Product | Website | Source repository |
| --- | --- | --- |
| AI University (non-accredited learning playground) | https://aiuniversityhq.uk/ | https://github.com/mabrig1/AI-University |
| OpenForge Africa | https://openforge.mabrigkorie.org/ | https://github.com/mabrig1/openforge-africa |
| CampusVerse | https://www.campusverse.store/ | https://github.com/mabrig1/campusverse |
| SupplyHQ Online | https://supplyhq.online/ | https://github.com/mabrig1/SupplyHQonline |
| MABRIG StatLab | https://statlab.mabrigkorie.org/ | https://github.com/mabrig1/StatLab |

The display data is maintained in `data/latest-apps.js`. To **add missing entries**
to the admin-managed MongoDB works catalogue, configure `MONGODB_URI` and run:

```bash
npm run sync:latest-apps
```

This command is idempotent and never removes existing works or overwrites items
already managed through the admin dashboard. The old `npm run seed` command
**deletes and recreates** all works and social links; do not use it to synchronize
these apps on a populated database. Run `npm test` for catalogue integration checks.

## App Performance Agent

A private, cross-site performance dashboard is now available at
**`/admin/performance`**. It shows authenticated founder-only charts for
recorded page views, anonymous visitor sessions, five-minute recent activity,
app comparison and cached public-site reachability checks. The insight agent
summarizes *actual recorded metrics* with deterministic explanations, and
never invents visitor figures.

The main MABRIG portfolio automatically includes a privacy-aware page-view
tracker. Other apps require the public tracker snippet provided in each app
card before their visitors can be counted; until then they are marked
**Awaiting data**. The dashboard refreshes every 30 seconds, and metrics expire
after approximately 60 days.

See [installation, security, privacy and measurement details](docs/APP_PERFORMANCE_AGENT.md).

## Administrator email password recovery

The admin login at `/admin/login` now links to
`/admin/login/forgot-password`. Recovery uses the existing MongoDB
connection and Resend; **adding `RESEND_API_KEY` alone is not enough**.

Configure these **Production** environment variables in Vercel:

- `ADMIN_RECOVERY_EMAIL`: the exact, verified mailbox you personally control;
  it is **not** automatically derived from the login username.
- `RESEND_API_KEY`: secret Resend API key.
- `RESEND_FROM_EMAIL`: a sender verified within your Resend account,
  e.g. `MABRIG Support <no-reply@your-verified-domain>`.
- `SITE_URL`: `https://www.mabrigkorie.org` (or the actual canonical HTTPS domain).
- Keep `MONGODB_URI`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` and `JWT_SECRET`
  available to the deployment.

Verify the sending domain/DNS in Resend first. Then **redeploy Production**
so Vercel functions load the new environment variables. Do not commit secrets.
Request recovery on the public form by entering the same configured address.
The link expires after 15 minutes, is usable once, and is sent *only* to the
configured recovery mailbox. Requests are globally throttled to one per five
minutes. The public response is identical for invalid or unconfigured emails.

After the first successful recovery, a bcrypt password hash is
saved in MongoDB and becomes the **sole password source**. The former
`ADMIN_PASSWORD` environment variable no longer grants access while the
MongoDB record exists. Previously issued login tokens are revoked by comparing
their password change version with MongoDB. Do not delete the `AdminAuth`
document: this would restore the legacy environment password and undermine
the recovery. If MongoDB becomes unavailable, login fails closed.

**Deployment checks:** visit the login page and its recovery link; request
a link for the configured inbox; use the link once; confirm the new password
works, the old password fails, a second use of the same link fails, and
existing admin sessions require a new login. Use Vercel runtime logs to
investigate missing Resend domain verification or missing environment variables;
never paste tokens or secrets into issues or support messages.
