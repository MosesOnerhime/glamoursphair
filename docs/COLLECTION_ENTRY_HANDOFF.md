# Collection-First Homepage Refinement

## Owner Request (2026-10-15)

- Remove the lettering attached to logo images to avoid repeating GLAMOURSPHAIR alongside the separate brand heading.
- Increase the maximum homepage product selection from six to ten.
- Make "See the collection" open the homepage collection, not the full products page.
- Replace the About/editorial model backdrop with one of the generated hair pictures.
- Open ordinary homepage visits at the collection, allowing free scrolling up or down afterward.
- Rename "Discover the Collection" to "Explore the Luxury".
- After website work, revise the local burgundy flyer options: remove "You deserve Luxury", use the logo only, change the first service to "Luxury human hair wigs", and display WhatsApp +234 812 828 8948 / Call +234 806 346 0805. The new call number is explicitly flyer-only; do not silently change website telephone contacts.

## Implementation

- New transparent `logo-mark.png` (392x336 RGBA) is a symbol-only derivative of the existing logo, generated with the built-in image tool and resized for web use. Crest, red/black/silver identity and foliage are retained; the horizontal brand lettering is omitted. Original logo files are untouched.
- All active website logo uses (header, mobile navigation, hero, admin, favicon and Organization schema) point to the new asset. Separate text headings remain. Campaign hang tags retain their physical GLAMOURSPHAIR labels; they are not the repeated logo wordmark.
- The shared `HOME_PRODUCT_LIMIT` is 10. Existing client/editor/status labels and protected API validation consume that setting. The existing six legacy defaults and the owner's database selections are preserved, not silently expanded. The admin may select four more; no migration or production inventory write is needed.
- Hero CTA uses `#collection`; the separate "View all products" and navigation continue to use `/products`.
- Ordinary root visits/reloads are positioned once at `#collection` in a layout effect, without animation, focus movement or scroll trapping. Explicit anchors, product/admin query links, full shop routes and browser back/forward restoration are not overridden.
- The root entry does not rewrite the URL or move the hero in document order. Visitors can scroll up to the existing hero, and Home links explicitly use `#home`.
- Explicit homepage section hashes are also positioned after React mounts; native hash lookup can precede SPA rendering. The skip-shopping link now targets the focusable collection container rather than the main element above the hero.
- The initial center carousel image loads eagerly with high priority. The hero keeps high priority only when it is the entry surface; its assets are otherwise lazy. Existing reduced-motion handling remains intact.
- About uses the existing generated wine-velvet bundles from `docs/hero-options/option-2-wine-velvet.png`, encoded as responsive 640/1024/1672 WebP siblings. Alt text accurately calls it campaign artwork. Real SKU photographs and product specifications are unchanged.

## Logo Prompt And Provenance

Built-in image tool, precise-object-edit/background-extraction. Input: original `frontend/public/images/logo.png`.

Prompt: remove only the horizontal GLAMOURSPHAIR wordmark and tiny flourishes below it; keep the original red-edged black shield, silver G monogram, silver outline and foliage directly below the shield. No new mark, text, background, glow or mockup; transparent background and balanced tight framing. Generated source: `exec-5d157a6c-9d37-4f71-9cb8-51d2d2e4bec9.png` under `C:/Users/moses/.codex/generated_images/019e5f6f-381c-7801-b81e-2151341c1e07/`. This is an AI-assisted raster derivative, not a claim of a vector or pixel-identical reconstruction. Source remains available; final web asset is in the repository.

## Validation And Release

- Regression tests cover entry rules and actual layout-effect callback, CTA destinations, headings, active logo references/transparency, responsive About assets, ten-item rendering, accepting a tenth selection, and rejecting an eleventh or over-limit bulk placement before database writes.
- Run the full frontend test suite, lint, production build/TypeScript and diff checks, then browser-check desktop/mobile, direct links, hero CTA, collection browsing and admin cap labels.
- Keep final flyer PNGs local and unpublished until the owner selects them. Website publication to main is explicitly approved in the active task.

### Verified Locally

- All 41 frontend tests, ESLint and production build/TypeScript pass for the release, including explicit-anchor coverage. Final build entry asset is `index-Bv5RB9rG.js`.
- Desktop 1536px: ordinary entry positions the collection at approximately 112px below the viewport top, logo-only crest loads correctly, Home returns to the hero and its CTA returns to the in-page collection.
- Mobile 390x844 and 320x740: collection-first entry, heading wrapping and no document horizontal overflow verified. The primary carousel photograph loads.
- Direct Kelly product URL opens the three-image preview, with actual product image metadata. Closing restores campaign metadata. Admin query URL opens the locked inventory dialog with the symbol-only crest; no credentials or production writes used.
- `/products` remains a separate full grid (26 local catalog items, two mobile columns), at the top of its own page, without the homepage scroll behavior.
- Direct `#about` positions correctly after mount. Responsive wine hair background loads at desktop and mobile sizes; no model backdrop remains in this section.
- Keyboard activation of the skip-shopping link moves focus to the collection container. Browser viewport overrides were reset after mobile checks.
- Proof: `docs/qa/collection-entry-desktop.png`, `collection-entry-mobile.png`, `symbol-logo-hero.png`, `wine-hair-editorial-desktop.png`, `wine-hair-editorial-mobile.png`.
- Existing Browserslist age warning is non-blocking. No dependency or database migration changes.
