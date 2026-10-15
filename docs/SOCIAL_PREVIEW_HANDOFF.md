# Social Preview And Studio Address

## Owner Instructions (2026-10-15)

- Use the previously approved black-silk hair-bundle campaign image when sharing the website URL.
- The owner explicitly approved publishing the website change to GitHub main. Flyer options remain local and unpublished pending selection.
- Replace the physical studio address with: 3rd Floor, Cappador Galaxy Mall, 81 Aminu Kano Crescent, Wuse 2, Abuja, Nigeria.
- Revised flyers use the generated hair bundles, not a human model, and the supplied burgundy/cream/gold direction. Their PNGs, prompts, research and provenance are under the local `marketing/glamoursphair-flyers/` directory; they are excluded from this website release.

## Implementation

- `frontend/public/images/glamoursphair-social-hair-v1.jpg`: 1200x630 JPEG, 160645 bytes, cropped/encoded from `docs/hero-options/option-1-black-silk.png`. Source artwork is unchanged. This is generated campaign artwork, not an exact inventory-item photograph.
- Initial HTML exposes an absolute HTTPS image URL, image type/dimensions/alt and matching Twitter image/alt, so general website sharing does not depend on JavaScript execution.
- ProductGrid's default home/shop metadata matches the initial HTML. Opening a product retains its actual product photo and name as alt text; campaign dimensions/type are removed. Closing restores the campaign metadata.
- Contact displays the owner-confirmed new floor/street address. Its map action now searches the complete new address instead of retaining an unverified old short-link pin.
- No product data, inventory, prices, checkout, payment or database changes. Later owner-requested visual/entry changes are documented separately in `docs/COLLECTION_ENTRY_HANDOFF.md` and included in the same website release.

## QA

- Three social-preview regressions exercise static crawler HTML and the actual TypeScript metadata effect, including product open/close behavior.
- Two studio-address regressions cover displayed copy and the matching map query.
- Browser checks before release confirmed campaign metadata on home, real Kelly image/alt without campaign dimensions on product preview, and campaign restoration on close. The local JPEG is served successfully at 1200x630.
- Final website release: all 41 frontend tests, lint and build/TypeScript pass, including social-preview, studio-address and later collection-entry regressions. The existing Browserslist age warning remains non-blocking.
- Social apps can keep cached previews of previously shared URLs. A fresh versioned image URL is provided, but instantaneous refresh of existing messages is not guaranteed.
- Client-rendered product metadata is not server-rendered product social previews. That broader architecture remains outside this change.

## Release

- Implementation `241d624` pushed to main and verified on the production domain on 2026-10-15.
- Initial HTML and browser metadata both use the new absolute campaign image URL. Its public response is HTTP 200, `image/jpeg`, 160645 bytes.
- Product-photo open/close behavior was regression-tested and browser-checked locally. No claim of a refreshed WhatsApp/other platform cache or server-rendered product social cards.

## Reference Links

- Open Graph protocol: https://ogp.me/ . Image URL, alt text, type and dimensions.
- Address is supplied directly by the owner, not inferred from external listings. The Google Maps action is an address search, not a claim of a verified exact entrance pin.
