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
4. You record incoming enquiries in your own protected business system (do not put customer data in a public repository).
5. Qualify needs, provide a written scope and quote, and agree payment terms separately.
6. Build, test, hand over and offer maintenance explicitly.

This change does not implement a CRM, payment collection, order fulfilment or automatic lead follow-up. Those require their own authenticated backend and consent/privacy review.

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
