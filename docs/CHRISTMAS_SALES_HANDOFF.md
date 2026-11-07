# Christmas Sales And Shared Inventory Loading

## November 7 Pricing Refinement

The owner has replaced the original blanket 20% placeholder with **Up to 50% off** campaign messaging and admin-defined product prices. This section supersedes the older pricing descriptions and November 4 production examples below; those remain historical release evidence.

- `Product.price` / database `price` is the actual payable sale price. `originalPrice` / `original_price` is the admin's higher pre-sale comparison. No new column, migration, automatic database edit or additional percentage reduction is needed.
- The shared pricing helper computes `(originalPrice - price) / originalPrice * 100` per item. Displayed percentages round down to one decimal place, avoiding overstated savings (for example, 650,000 versus 850,000 displays 23.5% off). Whole-number results have no trailing decimal. The marketing maximum does not multiply or cap individual product prices/discounts.
- Missing, invalid, equal or lower original prices produce no discount badge, comparison strikethrough or savings claim. The saved payable price remains available. Existing admin validation still rejects a supplied original price that is not higher than the payable price.
- Admin labels the existing price field **Sale price (NGN)** when Christmas Sales is selected. Removing sale membership does not rewrite either price or the primary collection.
- Cards, detail dialogs, bag, WhatsApp product messages, active Product/Offer schema and checkout use the saved price. Checkout sums exact item savings rather than claiming a blanket percentage. The server independently reads both prices, quotes integer kobo, and rejects stale browser totals before initializing payment.
- Headline, crawlable page description, Open Graph/Twitter descriptions and collection schema use **Up to 50% off**. Dates remain the owner's confirmed 9-15 November 2026, Africa/Lagos.
- Campaign identity, bag/payment storage keys, signed payment format, delivery fees and Paystack verification remain unchanged. Previously initialized signed sessions still verify at their authorized amount, even if inventory/pricing changes later.

Validation completed locally: **84/84 unit/API tests** and **24/24 desktop/mobile browser tests** pass, as do ESLint, TypeScript/Vite production build and `git diff --check`. Browser coverage includes admin editing both prices, different discounts on the same page, missing-original handling, modal/WhatsApp prices, bag subtotal, mixed-discount checkout savings/delivery and active Offer schema. Responsive overflow checks include 360, 390, 430, 768, 1024, 1280, 1440 and 1920 CSS pixels. The price-edit browser test also passed a focused desktop/mobile rerun with explicit image-load readiness.

Reviewed local fixture evidence is saved in `qa/christmas-pricing-desktop.png`, `qa/christmas-pricing-mobile.png`, `qa/christmas-pricing-mobile-product.png` and `qa/christmas-pricing-checkout-mobile.png`. These example admin prices are test-only, not live inventory edits. Initial offscreen full-page mobile capture did not paint the second photo; scrolling that card into view and awaiting image decoding confirmed the photo renders normally. The final mobile evidence uses actual viewport captures. This is desktop-browser mobile emulation, not a physical device test.

The loopback-only fixture supports an explicit active campaign for testing shipping/checkout summaries, but rejects payment POST requests and never calls real Supabase or Paystack. The preview is running at `http://127.0.0.1:5184/sales` with test inventory; its active date override is not part of production. No live inventory writes or real charges have been made for this refinement. Private `marketing/` remains untouched. The existing Browserslist age notice remains a non-blocking build warning.

The owner explicitly authorized committing and publishing this refinement to GitHub `main` on November 7. Pre-publication checks repeated successfully: 84/84 unit/API tests, ESLint, TypeScript/Vite build and whitespace validation. The previously completed 24/24 desktop/mobile browser checks cover the same application code. GitHub main matched local HEAD before staging. Only pricing source/tests, documentation and reviewed QA screenshots are included; private flyer work is excluded.

Application commit **`2b78b1974b14f392c4bb0fc8491f5da34509e31e`** (`fix: calculate Christmas sale discounts from admin prices`) was pushed to `main`. Vercel reported **success / Deployment has completed** at `https://vercel.com/moses-onerhimes-projects/glamoursphair/5EZXnKJfucbxrYCbyGvfm6nd5GY9`. The production `/sales` HTML returned HTTP 200 with the new up-to-50% metadata and no old 20% copy.

Live read-only verification confirmed `/api/sales` exposes `maxDiscountPercent: 50` and uses the same prices as `/api/products`. The current owner-managed inventory differs from the earlier QA fixture: Deal 002 (1794085314372) is NGN 295,000 versus NGN 365,000, displayed as **19.1% off**; Deal 001 (1794084433032) is NGN 265,000 versus NGN 380,000, displayed as **30.2% off**. Both are selected for Christmas Sales. The inventory currently reports 27 tombstones; no products, prices or deletion records were changed during publication. The campaign is correctly `upcoming`, with authenticated payment readiness true; no payment initialization or charge was attempted.

Separate headless production browser checks at **1440x900** and **390x844** verified the up-to-50% intro, each current product's saved payable price and individual discount badge, no horizontal overflow and no JavaScript page errors. This release verification is a documentation-only follow-up to the application commit; private `marketing/` remains uncommitted and unpublished.

## Owner Request

- Rename the campaign to Christmas Sales, keeping **9-15 November 2026**, Africa/Lagos, as explicitly confirmed by the owner.
- Let admin select sale products. Use an independent sale-membership flag so existing Signature/Awoof/custom collections are not overwritten. Sale members may be published on the sale page independently of home/full-shop placement.
- Stop deleted/old bundled products flashing before the shared inventory arrives on home and `/products`.
- Preserve the `/sales` URL, 20% discount, existing photography/brand, server-authoritative pricing/dates and authenticated Paystack integration.

## Database Upgrade

`frontend/supabase-christmas-sales.sql` was applied to the production Glamoursphair project (`xucgambipmegbhikqumc`) with the owner's explicit authorization during the November 3-4 session. Do not rerun it for this release. It adds `in_christmas_sale` and keeps the current two campaign selections (11/112) only on first installation. It does not restore deleted products, alter collections or prices, and rerunning it does not overwrite later admin choices. Existing unupgraded databases remain readable, but sale-membership writes fail clearly until this column is available.

Before and after the migration, read-only SQL verified **27 total records**, **25 deletion tombstones**, and the identical inventory fingerprint `60d576498b2a3025979aaa2db996a14d`. The fingerprint covers id, name, price, original price, description, primary collection, deletion state, homepage/catalogue flags and sort order. The final sale-member IDs were `[11,112]`. Evidence: `qa/christmas-migration-2026-11-03.png`.

No direct database credentials or authenticated Supabase CLI were available locally, so the migration used the signed-in Supabase SQL Editor. Initial browser/session interruptions were recovered; a read-only column check confirmed the migration had not applied before the one successful execution. Supabase reported `Success. No rows returned`, followed by the integrity verification above. No customer data, credentials, real transactions or payment settings were accessed or changed.

## Compatibility And Loading Rules

Keep the existing `november-2026` internal campaign identity, `GLAM-NOV-` payment reference prefix and persisted bag/payment keys: this is a rename of the same dated offer, not a new campaign that should invalidate existing signed payment sessions. Public names, metadata, support messages and analytics should use Christmas Sales; November remains in the actual date copy.

Shared inventory is authoritative when configured. Render no bundled or locally cached products before a successful shared snapshot. Network errors show retry, not deleted seed products. A successful shared snapshot must not merge stale local-only products back into the published catalogue. Offline local demo mode may still use seed products when no database is configured.

## Implementation

- Product types, API row mapping, direct Supabase read mapping and save/reorder validation preserve `inChristmasSale` / `in_christmas_sale`, including explicit false values. Mixed bulk writes preserve existing database membership for omitted flags rather than reselecting legacy IDs.
- Admin editor and inventory rows expose independent sale membership; the inventory collection filter includes Christmas Sales. The editor shows the actual 20% discount and November dates. Save errors retain the prior selection, and missing schema disables only sale controls.
- Shopper collection navigation links to `/sales`, keeping discounted sale purchases separate from the regular cart. Public titles, schema, navigation, copy, support messages and analytics use Christmas Sales.
- Sale membership follows saved inventory order. Explicitly selected sale-only items are eligible even when hidden from the regular shop; deleted items never are. Existing fixed IDs are only a temporary compatibility fallback for unupgraded databases.
- Shared inventory no longer merges missing seed products or local-only uploads into a successful database snapshot. Initial loading and errors render no products. Retry, cancellation, timeouts and uncached reads are implemented. Collection/product URL state is preserved during loading, and writes are blocked before the first inventory snapshot.
- Homepage limit remains 10 and server validation now counts actual shared inventory, not nonexistent seed records.

## QA And Release Status

Validation completed November 4, 2026. The final unit/API run passed **81 tests**, including date boundaries, dynamic membership, prices/delivery in kobo, authenticated server verification, signed pending-session compatibility, deletion/loading/empty/retry, abort cleanup and protected writes. Final ESLint and TypeScript/Vite production build passed. `git diff --check` passed.

Earlier browser QA confirmed delayed inventory initially rendered zero products, collection deep links survived loading, failed reads showed no legacy fallback, retry recovered, and desktop admin selection preserved group/price. Headless Playwright coverage finished mobile QA without using the user's open browser or desktop inputs. The first run passed 16/18; the loading tests needed a deterministic response gate because normal page navigation outlasted the simulated delay. The final run passed **20/20 browser tests** in separate desktop and mobile contexts.

Browser coverage: initial loading with a DOM mutation log proving no legacy/local product ever painted; collection deep links; deleting a seed product followed by full navigation and reload; network failure/retry; membership selection/removal; editing/sorting with preserved membership, group and price; failed-save rollback; missing migration capability; actual `/sales` navigation, Christmas naming, November dates and upcoming checkout guard; regular search/no-results recovery, product dialog Escape and cart addition. Responsive overflow/visible-control checks ran at 360, 390, 430, 768, 1024, 1280, 1440 and 1920 CSS pixels. No real purchase was made.

Visually inspected screenshots: `qa/christmas-admin-desktop.png`, `qa/christmas-admin-mobile.png`, `qa/christmas-sales-mobile.png`. They use explicitly local test inventory, not production mutations. The mobile sale controls wrap cleanly, both admin columns fit desktop, and sale copy/images fit mobile without overlapping. This is desktop-browser mobile emulation, not testing on a physical iPhone/Android device.

Reproduce with `cd frontend` then `npm run test:ui`. The test-only Vite config binds to loopback; its APIs never call Supabase or Paystack. A review preview can run with `node node_modules/vite/bin/vite.js --config tests/vite-inventory-qa.config.ts` at `http://127.0.0.1:5184`. Local admin URL: `/?admin=products`, test password `local-qa-only`. This is simulated data and must not be deployed. Test outputs/traces are ignored; reviewed evidence is saved above.

`npm audit --omit=dev` reports zero production vulnerabilities. The install audit reports 23 development-toolchain advisories; no broad or breaking dependency upgrades were attempted for this scoped release. The existing Browserslist age warning is non-blocking.

## Publication

The owner explicitly authorized committing and publishing to `main` on November 4, 2026. Application commit **`d04def805acbbbe47a22c63b50bfb5602e5337ec`** (`feat: manage Christmas sales and prevent stale product flashes`) was pushed to GitHub main. Vercel reported `success / Deployment has completed` at `https://vercel.com/moses-onerhimes-projects/glamoursphair/Drgh6zk5sN5mWmNX56jfutneQdvB`.

Pre-push unit/API tests passed 81/81 again; ESLint, TypeScript/Vite build and staged diff checks passed. The previously completed desktop/mobile browser suite passed 20/20 against the same application code. The private `marketing/` directory remains excluded.

Live checks: `/`, `/products`, `/sales` and `/sales/` returned HTTP 200. The sales HTML has the Christmas Sales title. `/api/products` reports both placement capabilities ready, two active products and 25 deletion tombstones. `/api/sales` reports Christmas Sales, the confirmed November 9 opening / November 16 exclusive closing timestamps, `upcoming`, `paymentReady: true`, `paymentMode: live`, and the correct 20% offer prices: product 11 NGN 520,000 from NGN 650,000; product 112 NGN 276,000 from NGN 345,000. No transaction or charge was created.

Read-only production browser smoke checks ran at desktop 1440x900 and mobile 390x844. `/products` and `/sales` rendered exactly IDs `[11,112]`, with no deleted IDs ever observed in the catalogue DOM mutation log, no horizontal overflow and no JavaScript page errors. Live screenshots: `qa/christmas-live-products-mobile.png`, `qa/christmas-live-sales-desktop.png`.

Initial live verification revealed neither remaining product had an explicit homepage selection and neither belonged to the old legacy featured-ID set. The owner explicitly approved **featuring both on the homepage**. One scoped SQL update set `show_on_homepage = true` for non-deleted IDs 11 and 112 only. Returned rows and the live products API confirmed prices (650,000 / 345,000), primary collections, full-shop visibility and sale membership were unchanged; the deletion count stayed 25. Supabase's normal updated-at trigger may change metadata. The actual live homepage then visibly rendered both products. Evidence: `qa/christmas-homepage-placement.png` and `qa/christmas-live-homepage.png`.

The original sale-membership migration was not rerun. This final publication record and live screenshots are a documentation-only follow-up to the application release.
