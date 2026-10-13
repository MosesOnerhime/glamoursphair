# Reference Redesign Handoff

## Request (2026-10-13)

Transfer all work from preview to main, preserve the pre-redesign website on
backup, redesign using https://tluxehairs.vercel.app/ as the visual reference,
retain GLAMOURSPHAIR identity/catalog/business flows, and push to GitHub.
This latest request explicitly authorizes commits and pushes and supersedes
the previous refinement-only layout constraint.

## Preservation

- Initial preview HEAD: 35a4aca (revamped ui/ux to industry standards).
- Initial local main: 3671d62; remote main: 02587b2.
- Existing remote backup: 56a9ab4. Preserve its history, do not force-push it.
- Untracked instruction pack is included in the pre-redesign snapshot.
- No tracked source modifications existed at the initial inspection.
- Instruction snapshot commit: 359e670 on preview.
- Main merge/snapshot: 820c7e0; tree matched preview exactly after merging
  remote main and preview.
- Backup commit: 3fe0c47, pushed to origin/backup. Its tree matches 820c7e0.
  An ours-strategy merge preserves the former remote backup commit as an
  ancestor without replacing the current snapshot with that older website.

## Reference Findings

- Compact black header, gold navigation, large full-bleed photographic hero.
- Centered supporting copy with filled/outline pill-shaped shopping links.
- Dark collection band, large italic serif heading, filter/view tools.
- Five-position carousel: large central product, smaller adjacent products.
- Full-width editorial imagery, lighter trust/support band, compact footer.
- Reference contains placeholder testimonials and delivery text. These are
  not evidence about GLAMOURSPHAIR and will not be copied.

## Implementation And QA

- Rebuilt header, hero, collection presentation, editorial band, factual
  shopping benefits, studio contact, channel invitation, and footer.
- Added a five-position product carousel and a grid toggle; no autoplay.
- Kept all catalog records, product links/gallery/specifications, protected
  admin operations, Paystack, location fees, and currency estimates.
- Kept original GLAMOURSPHAIR logo, photography/video, Cormorant/DM Sans type,
  gold, and brand copy. Reference wine accents and a light support band echo
  the existing shield logo and reference composition.
- The enlarged old hero video was visibly soft during QA. Replaced it with an
  existing higher-resolution studio photograph; no autoplay is needed.
- Checkout code now loads only when checkout is opened, with a cancellable
  preparation state. Product preview closes before opening cart to avoid
  stacked dialogs. Saved cart quantities/prices are validated as finite values.
- Added price brackets alongside length, fitting, sort, and sale filters.

## QA Evidence

- Catalog initializer matches backup exactly after normalizing line endings:
  all 26 original records, prices, descriptions, specifications, and images.
- Nine automated regression tests pass: catalog IDs/slugs/prices/collections,
  image paths, incorrect password rejection, correct password acceptance,
  and invalid product write rejection. These tests use no live credentials.
- Browser checks: carousel next/previous, grid view, Awoof Sales count (14),
  search/no results/reset, price-ascending sort, real sale items (2), gallery,
  product preview, cart item/quantity/persistence/removal, checkout validation,
  Abuja delivery fee, USD estimate versus NGN payment total, mobile navigation,
  menu Tab trap, Escape close and focus restoration.
- Temporary test cart was cleared. No live payment or EmailJS email was sent.
- Layout bounds checked at 360x800, 390x844, 430x932, 768x1024, 1024x768,
  1280x800, 1440x900, and 1920x1080: no document horizontal overflow or broken
  loaded images. Hero leaves a 24-32px hint of the next section.
- Five visible carousel images all completed loading in the viewport. Full
  page captures can show pending lazy images before the section is scrolled
  into view; that is not a missing asset.
- Browser responsive automation intermittently returned stale transition
  geometry or detached. Verified cart removal using its fresh native-view
  visual target, and resumed viewport inspection in a new connected QA tab.
- Final build, TypeScript build check, ESLint, nine regression tests, and
  git diff whitespace check passed. The existing Browserslist data-age warning
  remains non-fatal; no dependency update was needed for this redesign.
- Final visual proof: `qa/redesign-desktop.png` (1440x1080 collection view) and
  `qa/redesign-mobile.png` (390x844 homepage). Both use real GLAMOURSPHAIR assets.
- Rechecked preview-to-cart: only the cart dialog remained after Add to Cart.
  Keyboard Clear Cart worked. Under-NGN-300,000 price filter returned 13 units.

## Publication

- Redesign commit: e4126e4, successfully pushed to origin/main.
- Preview preservation snapshot: 359e670, successfully pushed to origin/preview.
- Pre-redesign backup: 3fe0c47, successfully pushed to origin/backup.
- Remote hashes were checked with git ls-remote. Main contains preview as an
  ancestor; backup contains the former backup commit 56a9ab4 as an ancestor.
- Backup and pre-redesign main (820c7e0) share tree hash
  9650e1874f80034507d2e9db86aca1c9fe897090.
- Current branch is main. No force push or destructive history rewrite was used.
- Admin refinement commit: c8f3a8b, successfully pushed to origin/main.
- Final remote verification confirmed main at c8f3a8b, preview at 359e670,
  and backup at 3fe0c47 before this documentation-only close-out.

## Admin Follow-up

User requested an admin revamp before completion. Implemented on main: a compact
inventory workspace, search/collection controls, a mobile products/editor mode,
clear save states, safer mutation handling, and pointer/keyboard sorting.
No public admin navigation link is being added. The existing backup stays intact.

Inspection found admin risks beyond styling: local changes were published before
the database acknowledged them, replacing an image could reuse another edit's
selected file, renaming broke shared slugs, and reorder/delete responses with
empty HTTP 201 bodies were parsed as JSON. These were corrected alongside
the UI. Seed deletions now carry a full tombstone so unseeded database rows stay
deleted on other devices. Reorder uses one bulk upsert, not many partial writes.

Image uploads are capped at 4 MB to stay below Vercel's 4.5 MB request limit:
https://vercel.com/docs/functions/limitations

### Admin QA

- Desktop editor and list scroll independently. Upload is 140px high and visible
  at the top; Add/Save is a compact sticky control rather than a full-width block.
- Mobile Products/New or Edit modes keep the product list and form separate.
- Inventory search, empty recovery, Awoof Sales filtering (14), keyboard moves,
  and real pointer dragging passed. Hovered rows shift opposite the drag.
- Local image upload, create, rename, price edits, collection assignment, and
  deletion passed using a temporary QA product. It was removed afterwards;
  the original 26 source products are unchanged. Renaming retained its URL slug.
- Duplicate slugs and invalid original prices are blocked. Unsaved-draft Cancel
  retains the draft; Discard opens the requested new/edit state. Delete Cancel
  and Escape preserve the product, with focus returning to inventory controls.
- Incorrect passwords were rejected and the message subsequently cleared.
  Show/hide password and correct-password verification passed.
- Simulated API failures kept the edit draft and existing catalog unchanged,
  rolled ordering back, and left failed deletions visible. Save/delete retries
  succeeded in the mock fixture. No production credentials or writes were used.
- Admin layout bounds passed at 360x800, 390x844, 430x932, 768x1024, 1024x768,
  1280x800, 1440x900, and 1920x1080. Loaded visible photos rendered correctly.
- Narrow-viewport pointer dragging and keyboard fallback passed. Touch uses
  Pointer Events with touch-action:none on the handle; physical-phone touch
  behavior still merits a device check, not a claim of hardware testing.
- Final proof: `qa/admin-desktop.png` and `qa/admin-mobile.png`.
- API tests cover password protection on every mutation, one bulk order write,
  seed-product tombstones, empty 201 responses, and invalid/duplicate IDs.

### Repeatable Failure Fixture

`frontend/tests/mock-inventory-server.mjs` is loopback-only, in-memory QA code.
Start it from frontend with `node tests/mock-inventory-server.mjs`. For a separate
Vite process on 127.0.0.1:5176, set VITE_PRODUCTS_API_URL to
http://127.0.0.1:5175/api/products and leave image API/Supabase variables blank.
The fixture password is `inventory-qa-local-only`, never a production secret.
POST `{"failNext":"POST"}`, `PATCH`, or `DELETE` to /control to fail one write;
POST `{"reset":true}` resets server memory only, not that browser origin's local
cache. Use an isolated browser origin/profile for disposable QA state.
Stop both fixture and QA Vite processes after testing. They are not deployment
services and do not connect to Supabase or Paystack.

### Deployment Check

The public domain was rechecked after the storefront push and served
`/assets/index-Dy78DVdu.css` containing the new luxury-catalog styles. After the
admin push, the domain served `/assets/index-DSmNU4Py.css` with both storefront
and inventory-row styles. Browser verification showed the new production
inventory login locked, and the redesigned homepage using actual brand assets.
No production password, mutation, or payment was submitted. The live catalog
also reflected existing database edits (including Thank you sales); repository
seed records were not used to overwrite them. Live proof: `qa/redesign-live-home.png`.

Temporary QA servers on 5174, 5175, and 5176 were stopped. The existing preview
server remains on http://localhost:5173. The public entry is
https://www.glamoursphairluxury.com/ and the private inventory entry is
https://www.glamoursphairluxury.com/?admin=products.

## Boundaries

- Git backup is a code/asset snapshot, not a Supabase data or Vercel-env backup.
- Reference branding, photographs, placeholder reviews, and unverified claims
  are intentionally not copied. GLAMOURSPHAIR keeps its own business content.
- Existing payment APIs are preserved; inventory APIs were hardened as above.
  End-to-end live payments,
  production admin writes, and database recovery have not been exercised.
- No field Core Web Vitals claim is made; production monitoring is still needed.
- Return eligibility and shipping ETAs remain unpromised, as before.
