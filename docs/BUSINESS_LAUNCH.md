# MABRIG Technologies — business and zero-budget promotion launch checklist

**Canonical site:** https://www.mabrigkorie.org  
**Source repository:** mabrig1/MabrigKorie  
**Vercel project:** mabrig-korie-2nhq  
**Production branch at time of preparation:** claude/focused-ptolemy-2s4mah

## Services sold today

Offer manually scoped work: business websites, online stores, custom applications, workflow automation and DevShield security implementation. Training is delivered through the existing DDEI platform. No instant checkout or pre-paid subscriptions are introduced by this release.

## Lead journey

1. Share the business page: https://www.mabrigkorie.org/business
2. Prospective customer selects a service, market and describes the business need.
3. The browser prepares a WhatsApp message; the customer must review and send it. **No enquiry is saved to this website or emailed automatically.**
4. After the customer sends a WhatsApp message, manually create a lead in the protected `/admin/operations` workspace. The public form does not submit or store client data itself.
5. Qualify needs, provide a written scope and quote, and agree payment terms separately.
6. Build, test, hand over and offer maintenance explicitly.

The new private operations dashboard provides a basic manual sales pipeline, manual quotation and receipt records, campaign post drafts and manually reported social metrics. It does **not** capture WhatsApp messages automatically, process money, create real invoices, sync platform analytics or publish social posts. For now, quotations and payments are confirmed independently with customers. Never record passwords, sensitive identification data or bank card details.

## Zero-cost customer lead magnet

Share `https://www.mabrigkorie.org/business/check`: a free, privacy-first seven-question digital readiness self-check. Answers remain in the customer's browser. The assessment does not save results, automatically send data, or collect contacts; customers must voluntarily initiate WhatsApp contact to discuss improvements.

## Three-day organic campaign (no ad spending)

Post one original demonstration video and one supporting short post per day. Use distinct link parameters to observe which content initiated a WhatsApp enquiry:

- Day 1, business website demo: https://www.mabrigkorie.org/business?utm_source=facebook&utm_campaign=website-demo-day1
- Day 2, online store demo: https://www.mabrigkorie.org/business?utm_source=facebook&utm_campaign=store-demo-day2
- Day 3, AI workflow demo: https://www.mabrigkorie.org/business?utm_source=facebook&utm_campaign=automation-demo-day3

The campaign marker is included in the user-reviewed WhatsApp message, **not collected by a background analytics service**. It cannot measure views, clicks or completed sales. Track those separately with real evidence.

## Quality and deployment checks

- Confirm /business returns 200 on a Vercel preview.
- Inspect mobile layouts at 360px and desktop layouts.
- Fill out the form with **fictional sample details**, check that WhatsApp opens with the correct fields and campaign source; **do not send a message as a test**.
- Check that /, /contact, /academy, /devshield and /sitemap.xml still work.
- Verify email and WhatsApp destination; check external links.
- Confirm MongoDB-backed homepage and admin login still function.
- Inspect accessibility (keyboard tab order, labels, contrast) and SEO metadata.
- Deploy to production only after reviewing the preview and verifying the deployment branch and production domain.

No invented customer testimonials, client counts, conversion rates or guaranteed project timelines. Prices are intentionally quoted case-by-case.

Read the public business-enquiry privacy notice at `/business/privacy` before collecting customer details. The notice specifically distinguishes the user's voluntary WhatsApp send from subsequent manually entered admin records.

## Private operations desk

- Open `/admin/login` using your existing administrator login, then `/admin/operations`.
- Create a lead from a *real received* customer enquiry. Log the campaign source visible in the customer's WhatsApp message when available.
- Move each lead through New → Contacted → Quoted → Won → In progress → Completed (or Lost).
- Record quote and actually confirmed receipts only, in the correct currency; no cross-currency revenue totals.
- Use **Prepare printable project quotation** for a private client-specific draft that can be printed or saved as a PDF in the browser. This draft is not a tax invoice, does not collect payment, and does not update the recorded quote automatically.
- Prepare promotional posts, copy captions manually, then log verified views and new followers from Facebook/TikTok/YouTube's own analytics.
- Compare the published posts by views, followers per 1,000 views, enquiries and paid sales. A small three-day sample indicates early traction, not sustainability.

### Security and deployment limits

The operations route requires the site's existing JWT-backed admin session, uses a same-session CSRF protection for updates, and tells crawlers not to index it. No new public write APIs or secrets were added. Existing authentication remains single-admin environment credentials; review password strength, Cloudflare rate limiting, and general data-protection responsibilities before using the dashboard with real client records. Access to the business dashboard must be tested on the preview deployment using your existing admin credentials. Avoid including secret values in screenshots, bug reports, or GitHub issues. Back up MongoDB before significant data migrations; this change introduces two new collections but no destructive migration.

This pull request is **preview-only until reviewed and merged**. It does not itself enable a paid campaign, scheduled posting, automatic subscriptions or changes to the production domain.

## Second upgrade — free readiness checker, printable quotations and safer admin handling

### Free customer-facing assessment

- Visit `/business/check` from a video caption or the homepage.
- Seven yes/no questions produce an instant local score, tailored recommendations and an optional, user-initiated WhatsApp enquiry.
- All answers stay on the visitor's device. The tool has **no account, charge, analytics beacon, background submission or database capture**.
- Use the free checker as an educational CTA, not a promise of revenue or certification.

### Private quotation workflow

- In `/admin/operations`, open a saved lead and choose **Prepare printable project quotation**.
- Adjust the client's deliverables, price, currency, terms, estimated timeline and validity date.
- Print or save as PDF using the browser, or copy the text for review and manual sharing.
- This is a *draft proposal only*. It is not a tax invoice, contract, verified receipt or payment processor.
- Draft edits in the browser are not automatically saved to MongoDB. Record any confirmed prices or receipts using the relevant lead record.

### Administrator security improvements

- `ADMIN_PASSWORD_HASH` now optionally supports bcrypt-hashed administrator passwords; when set, it **takes precedence over** `ADMIN_PASSWORD`, including failure cases. Existing plaintext environment variable remains supported for backward compatibility but should be retired after safe rotation.
- Do not enter or print your password or hash in ChatGPT, GitHub issues, source files, or public screenshots. Configure new credentials in Vercel environment settings and verify a preview session before rotating production.
- The app now sets conservative baseline security headers and no-cache/no-index headers on admin routes.
- Browser cross-site mutation requests and mismatched origins are rejected for admin login, operations and existing content/social editing APIs; operations forms additionally require a session-bound CSRF token.
- A site-wide WAF, distributed login rate limiting, content sanitisation and complete penetration testing are **not implemented** by this change. Configure edge protection and review existing rich-text content ingestion before permitting other administrators or untrusted contributors.

### Runtime verification boundary

GitHub unit/EJS tests and Vercel build success do **not** establish that the protected Vercel preview routes, database writes, existing admin session or WhatsApp links work end-to-end. The protected preview must be opened with an authorised Vercel account and tested using fabricated customer details. The current connection returned a project/team access denial when fetching preview routes. Leave production unchanged until that boundary is verified.
