# Codex Prompt — GLAMOURSPHAIR Luxury Ecommerce Refinement

We are doing a **complete professional refinement of the GLAMOURSPHAIR Luxury website**, but this is **NOT a rebrand**.

Live site:
`https://www.glamoursphairluxury.com/`

I already like the current design and brand identity.

Preserve the existing:
- GLAMOURSPHAIR visual identity;
- luxury/feminine positioning;
- logo;
- color direction;
- typography where it works;
- editorial feel;
- product photography;
- collection naming;
- premium tone;
- WhatsApp-assisted buying model;
- Abuja studio identity.

Your job is to inspect the entire repository and improve anything I may not notice that falls below current ecommerce industry standards or could reduce:
- visitor retention;
- trust;
- product discovery;
- product comparison;
- add-to-cart;
- checkout completion;
- mobile usability;
- accessibility;
- performance/Core Web Vitals;
- SEO/social sharing;
- maintainability;
- perceived luxury.

The finished site must still look recognizably GLAMOURSPHAIR.

## Before changing code
1. Read `AGENTS.md`.
2. Read `DESIGN.md`.
3. Read every file under `docs/ui/`.
4. Use `.agents/skills/glamoursphair-ui/SKILL.md`.
5. Inspect git status/diff.
6. Inspect the entire repository and determine framework, router, styling, product data, collections, search, filters/sorting, PDP, cart, Paystack checkout, shipping, currency estimates, WhatsApp, custom order/consultation, newsletter, policies, metadata, sitemap/robots, and validation commands.
7. Compare current live behavior with repository implementation where useful.
8. Identify the strongest current UI patterns and preserve them.

Do not start by changing logo, palette, font family, or overall visual language.

## Principle
**Preserve luxury identity; remove purchase friction.**

Industry standard does not mean making the site look like another ecommerce template.

## Phase 1 — audit
Use `CURRENT_SITE_BASELINE.md` and `DESIGN_QA.md`.
Classify findings internally:
- P0 broken/accessibility/payment;
- P1 conversion/trust/findability/mobile/performance/SEO;
- P2 polish/consistency.

Then implement. Do not stop after the audit.

## Phase 2 — homepage
Preserve current positioning around:
- “You deserve Luxury”;
- HD Lace;
- Bouncy Collection;
- Signature Collection;
- Awoof Sales;
- Paystack;
- delivery;
- WhatsApp;
- Abuja studio;
- consultation/custom order.

Improve hero hierarchy, CTA clarity, promo hierarchy, collection hierarchy, product scanning, spacing, trust placement, mobile layout, and image loading only where needed.

## Phase 3 — product discovery
Read `PRODUCT_DISCOVERY.md`.

Audit search, collections, product counts, filtering, sorting, no-results, mobile filtering, and back-navigation state.

Only create filters from real data.

Never add Best Selling unless real sales ranking exists.

## Phase 4 — product cards
Keep them premium and comparison-friendly.

Prioritize:
1. image;
2. name;
3. price;
4. old price if real sale;
5. meaningful status;
6. a few comparison-critical specs;
7. detail;
8. Add to Cart;
9. WhatsApp.

Move excessive detail into PDP rather than deleting useful data.

## Phase 5 — PDP
Read `PRODUCT_DETAIL_STANDARDS.md`.

If proper product routes exist, refine them. If not, assess whether premium/high-consideration buying needs a proper product-detail flow.

Only show verified name, gallery, price, sale price, specs, availability, Add to Cart, WhatsApp, delivery, returns, and care.

Do not invent specifications.

## Phase 6 — imagery
Audit card crops, consistency, gallery, mobile image size, alt text, loading, zoom, and responsive delivery.

Preserve real product photography.

## Phase 7 — cart/checkout
Read `CART_CHECKOUT_TRUST.md`.

Audit exact item/spec, quantities, prices, subtotal, delivery, empty cart, checkout CTA, Paystack loading/success/failure/cancel/retry, duplicate submission, and provider-return behavior.

Preserve payment logic unless an actual bug exists.

## Phase 8 — trust
Preserve truthful signals:
- secure Paystack checkout;
- local/international delivery;
- location-based delivery fee;
- currency estimates;
- WhatsApp support;
- Abuja studio.

Do not invent delivery times, free shipping, return guarantees, certificates, or payment methods.

## Phase 9 — WhatsApp
Preserve product support, custom order, consultation, order support, and channel updates.

Where possible, prefill product name/URL/selected spec.

Do not let floating WhatsApp UI cover Add to Cart or cart/checkout on mobile.

## Phase 10 — brand content
Read `LUXURY_BRAND_CONTENT.md`.

Preserve the voice and distinctive collection naming. Improve repetition only where it hurts credibility/scanning.

## Phase 11 — promotions
Audit Mega Sales, free-installation offer, new collection, restocks/offers. Make promotions easy to update and remove expired ones. No fake urgency.

## Phase 12 — responsive/accessibility
Read `RESPONSIVE_ACCESSIBILITY.md`.

Test:
360, 390, 430, 768, 1024, 1280, 1440, wide desktop.

Fix header, promo, hero, collections, search, filters, grid, cards, PDP, cart, checkout, contact, newsletter, focus, labels, alt text, reduced motion, target sizes, and overflow.

Target WCAG 2.2 AA.

## Phase 13 — performance
Read `PERFORMANCE_SEO.md`.

Target:
- LCP <= 2.5 s
- INP <= 200 ms
- CLS <= 0.1

Audit LCP, hero image, grid images, responsive sizes, gallery loading, fonts, third-party scripts, Paystack script, currency API, search/filter/cart responsiveness, and CLS.

Do not add heavy dependencies for polish.

## Phase 14 — SEO / merchant discoverability
Audit titles, descriptions, product URLs, collection URLs, canonicals, Open Graph, sitemap, robots, and structured data.

Where accurate, implement/repair Product + Offer merchant structured data.

Only include verified price, currency, availability, shipping, and returns.

Never fabricate ratings/reviews.

Use the real production domain, not preview URLs.

## Phase 15 — retention
Audit newsletter and WhatsApp channel around restocks, drops, offers, and shopping updates. No aggressive popup or prechecked consent.

## Final QA
Apply `docs/ui/DESIGN_QA.md`.

Run production build, lint, typecheck, tests, and existing payment/ecommerce tests where available.

Fix issues introduced by the work. Review git diff.

Do not commit or push unless I explicitly ask.

## Final report
Tell me:
1. major issues found;
2. what changed;
3. what was preserved because it was already strong;
4. discovery improvements;
5. PDP improvements;
6. cart/checkout improvements;
7. trust/conversion improvements;
8. WhatsApp improvements;
9. mobile/accessibility improvements;
10. performance/Core Web Vitals improvements;
11. SEO/merchant-listing improvements;
12. validation results;
13. product/policy/business facts needing my confirmation;
14. changes deliberately not made because they would harm the brand.

This is an implementation task. Do not stop after planning unless genuinely blocked.
