# Products Page And Placement

## Request And Inspection

- User requests a full `/products` page, a homepage link, independent admin placement, and commit/push to `main`.
- Starting branch: clean `main` at `cff3c77`.
- Existing catalog contains 26 verified seed products; retain their copy, pricing, specs and photographs.
- Read-only production API inspection on 2026-10-14 returned one active database row and 21 deleted IDs. A page alone cannot restore those rows.
- No local Supabase service-role credential is available. Database changes require the project owner's SQL editor or authenticated deployment environment; never request secrets in chat.

## Database Action

Run `frontend/supabase-product-placement.sql` once in Supabase SQL Editor. It adds nullable `show_on_homepage` and default-true `show_in_catalog`, and restores existing soft-deleted records without replacing saved product details. Do not rerun its restoration UPDATE after later intentional deletions.

Fresh databases use `frontend/supabase-products.sql`. Existing installations keep working before migration; placement controls remain unavailable until the API detects the new columns.

The owner confirmed running the migration during implementation. A subsequent production GET returned **22 database records and zero deleted IDs**, verifying restoration. The database includes one custom product in addition to seed overrides; the merged live catalog should therefore contain **27 products**, not just the 26 seed items.

## Implementation And QA

### Routes And Shopping

- `/products` and `/products/` render the complete published grid, not the homepage hero. Narrow Vercel rewrites preserve API/image routing.
- Homepage hero and the selected-collection section both have `View all products` links. Navigation and mobile menu open the full shop; home/about/contact links return to the proper homepage sections.
- Full shop uses four columns on large desktop, three on intermediate widths, two on mobile. Existing typography, palette, photographs, product specifications, NGN prices, real original prices and WhatsApp links are retained.
- Collections, search, price/length/fitting/sale filters, clear/recovery and always-visible price sorting remain available. Header search on home navigates to the full shop so it can find products outside the six featured units.
- Cart storage persists across full document navigation. Existing product preview galleries, canonical product links, JSON-LD and lazy Paystack checkout are retained. `/products` has its own title/canonical and sitemap entry.

### Admin Placement

- Product editor and inventory rows expose independent Homepage / Products page checkboxes. New products default to shop-only. Both unchecked keeps the item in inventory but out of public lists and product previews.
- Homepage rendering is hard-capped at six. Client and protected API reject a seventh selection. Legacy NULL homepage values use stable seed IDs `2,101,102,103,104,105`; reordering cannot silently change the selection.
- Placement changes wait for an acknowledged atomic bulk upsert before updating UI. Persist the complete order and normalized visibility fields to prevent partially materialized seed products jumping forward after reload, and to satisfy PostgREST's identical-key requirement for bulk rows.
- Failed saves retain previous placement; form saves keep drafts. API readiness detects old schemas and empty migrated databases. Older clients without visibility fields do not erase placement columns.
- Shared inventory tombstones now take precedence over stale device-only hidden IDs after a successful fetch, so restored items cannot remain hidden by old browser cache.
- Product drag/keyboard ordering is retained. Cancelling mobile editing returns to the product list. Status counts wrap; upload remains 140px high; no public admin entry was added.

### QA

- `npm test`: 26 tests passing (existing 15 plus 11 placement/routing/API regressions).
- `npm run lint` and `npm run build`: passing; production build includes TypeScript validation. Existing Browserslist age warning remains non-blocking; no dependency churn.
- Browser QA uses a loopback-only fixture on 5175 and a fresh Vite origin on 5177, with a synthetic test password. No production write or payment was used for QA.
- Desktop 1440x1000: 26 seed cards, four columns, real photos loaded, correct `/products` canonical, no horizontal overflow.
- Mobile 390x844: two columns, readable names/specs/prices/actions, no content overflow. Admin list/editor checked at mobile size; status clipping fixed.
- Verified Awoof Sales (14), ascending price ordering, two genuine sale items, empty-search recovery, multi-image Kelly gallery, cart handoff, lazy checkout, Abuja total 298000 + 4000 = 302000, cart persistence from shop to home, homepage limit of six, and header search finding a non-homepage Bouncy unit.
- Verified cap rejection, replacing a homepage selection, independent shop unpublishing, failed placement save recovery, persisted selection after reload, and keyboard sorting preserving flags/order.
- 320x740: shop cards, admin list and status line show no horizontal overflow; mobile spacing tightened to bring photos earlier into the first viewport.
- Desktop admin: upload at the top and exactly 140px high, compact 40px Add product button, independent display checkboxes, shop-only new-product defaults. Tab remains in the inventory dialog; Escape closes it.
- QA screenshots: `docs/qa/products-desktop.png`, `products-mobile.png`, `products-admin-desktop.png`, `products-admin-mobile.png`. The fixture's example homepage selection is not a production edit.

## Release

Final build/lint/test and Git release evidence will be appended after the requested push. Existing local storefront server remains available at `http://localhost:5173/products`; QA fixture servers are temporary and will be stopped. Production inventory comes from the shared API, not the local fixture.

### Boundaries

Supabase is not versioned with Git. Restoring these records is an explicitly requested database action, not a seed-data overwrite. Do not rerun restoration after intentional future deletes. Existing stale public sitemap entries and client-rendered social/product metadata are unchanged except the shop entry; fully dynamic merchant indexing would require a server-rendering/sitemap project. Concurrent administrator writes still use last-write-wins semantics, as the existing inventory did; the renderer never shows more than six homepage products.

## Research

Vercel same-application rewrites: https://vercel.com/docs/routing/rewrites . Use specific products-path rewrites so existing API functions and image URLs are not swallowed by an SPA catch-all.
