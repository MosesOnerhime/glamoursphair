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
- Homepage hero uses `See the collection`, restored at the owner's request on 2026-10-15; the selected-collection section retains `View all products`. Both link to `/products`. Navigation and mobile menu open the full shop; home/about/contact links return to the proper homepage sections.
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

- Feature commit `32ae1bc` was pushed to `origin/main` on 2026-10-14. Final validation before that push: build, lint, all 26 tests and `git diff --check` passed.
- The owner paused after the push, then resumed on 2026-10-15. The deployed page now returns the full grid with **27 products**. Its JS asset is `/assets/index-BSnjBoEV.js` for the feature release.
- Live API returns HTTP 200, `Cache-Control: no-store`, 22 active database records, zero deleted IDs, and `placementSupported: true`; all 22 database rows have catalog visibility enabled. The remaining original products are supplied by the preserved seed catalog.
- Live 1440x1000 browser check: four columns, correct products title and canonical, no horizontal overflow, first eight photographs loaded. Awoof Sales currently contains 13 items; the owner's saved `Thank you sales` collection contains one. Existing database names, prices and collection overrides are preserved.
- Live collection filtering, ascending price sorting, empty-search recovery and the three-image Kelly preview verified. No live inventory write or payment was performed for QA.
- The restored custom record `1790280400575` was named `test`, priced NGN 1000, and initially published. After it was flagged, a later read-only API check showed it soft-deleted externally: **21 active database rows, one deleted ID**, and **26 products** in the merged public shop. No production mutation was performed by the agent; that deletion was preserved.
- Temporary QA servers on 5175/5176/5177 were stopped before the pause. The existing local storefront server on 5173 remains available at `http://localhost:5173/products`. Production inventory comes from the shared API, not the local fixture.
- Follow-up on 2026-10-15: restored only the hero text to `See the collection`; destination remains `/products`. The separate `View all products` link below the homepage collection is unchanged.
- Verified the label and destination locally at desktop and 390px mobile width; mobile link is 280px by 46.6px with no text overflow. Live homepage rendering remains limited to six products. Live 390px shop check shows two columns and no document/card overflow.
- Re-ran build, lint, all 26 tests, and diff whitespace checks successfully after the label change. The build retains the existing non-blocking Browserslist age warning.
- Proof: `docs/qa/products-live-desktop.png`, `products-live-mobile.png`, `hero-collection-label-desktop.png`, `hero-collection-label-mobile.png`. The desktop shop capture predates the external test-item deletion; mobile captures the later 26-product state.
- The follow-up commit on `main` contains the label restoration, release documentation and QA screenshots. No product data, styling, navigation destination or checkout logic changed in that follow-up.

### Boundaries

Supabase is not versioned with Git. Restoring these records is an explicitly requested database action, not a seed-data overwrite. Do not rerun restoration after intentional future deletes. Existing stale public sitemap entries and client-rendered social/product metadata are unchanged except the shop entry; fully dynamic merchant indexing would require a server-rendering/sitemap project. Concurrent administrator writes still use last-write-wins semantics, as the existing inventory did; the renderer never shows more than six homepage products.

## Research

Vercel same-application rewrites: https://vercel.com/docs/routing/rewrites . Use specific products-path rewrites so existing API functions and image URLs are not swallowed by an SPA catch-all.
