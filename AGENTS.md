# GLAMOURSPHAIR UI/UX Agent Addendum

## Objective
Refine the current GLAMOURSPHAIR Luxury website to modern ecommerce standards while preserving its existing brand identity and visual direction.

A shopper should quickly understand:
1. What kind of hair GLAMOURSPHAIR sells.
2. Why the quality is trustworthy.
3. Which unit suits them.
4. Price and availability.
5. Delivery.
6. How to get help.
7. How to pay securely.

## Source-of-truth order
1. Verified product/catalog data in the repository.
2. Existing GLAMOURSPHAIR brand assets/styles.
3. Approved product copy and policies.
4. `DESIGN.md`.
5. `docs/ui/*`.
6. Current ecommerce/accessibility/performance/SEO best practices.

## Before substantial UI work
Inspect:
- git status/diff;
- framework/router;
- product-data source;
- collections;
- search/filter/sort;
- product-detail flow;
- cart;
- Paystack checkout;
- shipping/location logic;
- currency estimates;
- WhatsApp actions;
- consultation/custom order;
- newsletter;
- policies;
- metadata/schema;
- image performance;
- mobile behavior.

Do not start by changing the logo, palette, typography, or overall visual direction.

## Preserve current strengths
Preserve where accurate:
- luxury/feminine brand identity;
- editorial feel;
- premium product imagery;
- Signature Collection;
- Awoof Sales;
- HD Lace / Bouncy positioning;
- secure Paystack checkout;
- Nigeria and international delivery messaging;
- live currency estimates;
- WhatsApp support;
- Abuja studio support;
- consultation/custom order.

## Data integrity
Never invent product specs, lace type, origin, weight, length, fitting dimensions, price, sale price, availability, stock count, delivery ETA, care instructions, returns eligibility, reviews, or ratings.

## No fake urgency
Never add fake countdowns, fake low stock, fake viewer counts, fake “just purchased” messages, or fake sale timers.

## Interaction rules
- links for navigation;
- buttons for actions;
- visible `:focus-visible`;
- semantic forms;
- errors associated with fields;
- reduced motion;
- generous mobile targets;
- no accidental horizontal scrolling.

## Completion
Run build/lint/typecheck/tests where available. Test search, collections, product details, cart, checkout handoff, WhatsApp, custom order, mobile, keyboard, and final diff.

Do not commit or push unless explicitly requested.
