# Hero Image And Motion Follow-up

## Request And Approval (2026-10-14)

- Create several luxury hair-focused hero options inspired by the T-Luxe
  reference. User approval is required before replacing the live hero.
- Add a physically attached GLAMOURSPHAIR tag to each image concept.
- First generated round was rejected as too synthetic. Research real photos
  that are usable under license or can guide realism.
- User chose another generated round using real-photo references, rather than
  supplying their own bundle photograph or purchasing stock.
- Add smooth text/icon animation. Implement locally while hero approval is
  pending. Commit/push the completed work after the image is approved.
- User explicitly approved revised Option 1 (Black silk waves). The approved
  image is now being implemented; the initial rejected round is not used.
- Starting branch: main, clean at bc8d755. No branch changes are needed.

## Image Research

The reference uses three hair bundles on black/gold satin with a hangtag:
https://tluxehairs.vercel.app/images/hero-poster.jpeg
It is inspiration only, not a GLAMOURSPHAIR website asset.

Real-photo references inspected:

- iStock loose-wave bundles, image 1085838000:
  https://www.istockphoto.com/de/foto/menschliches-haar-locker-gewellt-spirale-schwarz-webt-erweiterungen-bundles-gm1085838000-291342609
- iStock curly texture, image 905433110:
  https://www.istockphoto.com/de/foto/brasilianische-lockige-weben-haarstruktur-gm905433110-249657424
- iStock deep-wave bundles, image 1086349762:
  https://www.istockphoto.com/de/foto/tiefe-welle-lockigen-nassen-schwarzen-echthaar-webt-erweiterungen-bundles-gm1086349762-291479229

These stock previews are reference-only and require licensing for direct
website use. They are kept outside the repository and never shipped as assets.
Commercial hair-brand photos from Hairmisses/Native Strands were not treated
as freely reusable. Several search results used AI-like imagery, including
prompt-shaped filenames, so a stock-search result alone is not proof of realism.

A genuine portrait candidate was also identified on Pexels, with photographer
and camera metadata, but it does not meet the desired bundle/attached-tag scene:
https://www.pexels.com/photo/elegant-portrait-of-a-woman-with-long-black-hair-36723989/
Pexels allows website use/modification under its license, subject to restrictions
such as not implying endorsement: https://www.pexels.com/license/

## Generated Concepts

Built-in image generation, not the API/CLI fallback, was used. The initial
options were black silk waves, wine velvet curls, and sleek straight hair.
One black-silk version received a GLAMOURSPHAIR hangtag before the user requested
the realism revision. That earlier round is not approved.

Revision direction: use real photographs only to guide strand variation, weft
roots, irregular curl spacing, natural ends and softer highlights. Do not copy
stock compositions/pixels, claim a specific SKU, add specifications, or imply
these are photographs of actual inventory. Preserve a central hair/tag focal
point for mobile crops, exact brand spelling, and restrained black/gold/wine
art direction. The original /images/bone-straight.jpeg remains available and
untouched, but is no longer the hero after revised Option 1 approval.

The three revised candidates are preserved in `hero-options/`:
`option-1-black-silk.png`, `option-2-wine-velvet.png`, and
`option-3-sleek-studio.png`. Full revision prompts are in `hero-options/PROMPTS.md`.
They remain AI-generated campaign artwork, not actual product/stock photographs.

Approved source dimensions: 1672x941. Noncreative encoding/downsampling through
the existing FFmpeg/libwebp installation produced 640w, 1024w, and 1672w WebP
variants in frontend/public/images/hero-black-silk-*.webp. No new dependencies.
Hero uses reserved dimensions, responsive source selection, high fetch priority,
and a 64% horizontal mobile focal position to keep the attached tag in view.
Branding, heading, copy, shopping links, and the rest of the layout are retained.
The former portrait overlay was eased slightly to show the dark hair detail.
Encoded asset sizes: 640w 51,972 bytes; 1024w 113,286 bytes; 1672w 283,332 bytes.

## Motion Implementation

- Native IntersectionObserver reveals for editorial headings/copy, factual
  support sections, studio details and footer, with 45ms capped stagger.
- Below-fold staging only; visible content is never initially hidden.
- Purchase prices, filters, product controls, forms and admin inventory rows
  are not scroll-reveal targets. No autoplay, scroll hijacking or moving hero.
- Short eased icon hover/focus feedback, button press feedback, navigation
  underlines, dialog entrances, cart count/Add feedback and carousel settling.
- Focus immediately reveals a staged section. Reduced motion and missing
  IntersectionObserver leave content visible; preference changes stop reveals.
- No new dependencies. Existing brand/layout/catalog/payment behavior retained.

## QA

- Build/TypeScript and lint pass. All 15 tests pass, including 6 new motion
  regressions for reduced motion, missing IntersectionObserver, staging only
  below-fold content, immediate keyboard reveal, runtime preference changes,
  queued-intersection safety and cleanup.
- Browser: actual hero loaded, high priority and not lazy-loaded; title/copy
  readable; whole GLAMOURSPHAIR hangtag visible in the mobile crop.
- Bounds checked at 360x800, 390x844, 430x932, 768x1024, 1024x768, 1280x800,
  1440x900 and 1920x1080. No horizontal overflow or hero-text clipping.
- Mobile menu/About navigation reveals editorial copy. Search returned three
  Kelly products; Add to Cart preserved Kelly/NGN298,000; checkout retained
  item/total/delivery controls, and no form field became a reveal target.
- Test cart was cleared and search reset to all 26 seed products. No payment,
  email, stock-image purchase, admin login or database mutation was submitted.
- Keyboard focus triggers the expected 2px icon nudge; dialog Escape works.
  Reduced-motion CSS was inspected in-browser; the OS preference was not
  changed. Preference/fallback behavior is covered by the automated tests.
- Existing exchange-rate fallback copy appeared during local checkout; this
  task did not change the currency provider or payment code.
- Browser automation briefly timed out during animated cart cleanup and
  reported an unrelated extension error. Fresh state checks verified the cart
  was closed/empty; direct controls completed cleanup without app changes.
- Proof: `qa/hero-motion-desktop.png` and `qa/hero-motion-mobile.png`.
- No dependency or lockfile changes; original product initializer untouched.
- Local preview started hidden on http://localhost:5173. Responsive overrides
  were reset after QA. Publication targets main with commit subject
  `feat: add approved branded hair hero and refined storefront motion`.
