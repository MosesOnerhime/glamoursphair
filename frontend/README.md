# GLAMOURSPHAIR Luxury Storefront

A React, Vite, TypeScript, and Tailwind CSS storefront for GLAMOURSPHAIR Luxury in Abuja, Nigeria.

The site combines searchable product discovery, collection browsing, a persistent cart, location-based delivery fees, NGN Paystack checkout, live USD/GBP estimates, WhatsApp-assisted ordering, and a protected Supabase-backed inventory panel.

## Local development

```bash
npm install
npm run dev
```

Vite prints the local preview URL, normally `http://localhost:5173`.

## Validation

```bash
npm run lint
npm test
npm run build
```

The regression tests check the catalog, photograph paths, admin password verification, and invalid catalog writes without contacting Supabase. The production build performs the TypeScript project check before bundling.

## Environment variables

Copy `.env.example` to `.env.local` for local development and replace all placeholder values.

Client-side values:

```dotenv
VITE_PRODUCTS_API_URL=/api/products
VITE_PRODUCT_IMAGE_API_URL=/api/product-image
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_PAYSTACK_PUBLIC_KEY=pk_test_replace_with_your_public_key
VITE_PAYSTACK_VERIFY_API_URL=/api/verify-payment
```

Server-only Vercel values:

```dotenv
ADMIN_PASSWORD=replace-with-a-strong-password
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-private-service-role-key
SUPABASE_PRODUCT_IMAGE_BUCKET=product-images
PAYSTACK_SECRET_KEY=sk_test_replace_with-your-secret-key
```

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, or `PAYSTACK_SECRET_KEY` with a `VITE_` prefix. `VITE_LOCAL_ADMIN_PASSWORD` is only a convenience for local development and is disabled in production builds.

## Supabase setup

1. Run `supabase-products.sql` in the Supabase SQL editor.
2. Create a public Storage bucket named `product-images`, or use the bucket name configured in `SUPABASE_PRODUCT_IMAGE_BUCKET`.
3. Add the environment variables above in Vercel for both Preview and Production.
4. Redeploy after changing Vercel environment variables.

The browser may read public products with the Supabase anon key. All create, update, reorder, delete, and image upload operations go through password-protected Vercel API functions using the service role key.

## Inventory panel

Open the private inventory URL directly:

```text
https://your-domain.example/?admin=products
```

The panel supports image upload, product creation and editing, collection assignment, soft deletion, and mouse/touch drag sorting. The admin password is checked by the server and is not persisted in browser storage.

### Homepage and full shop

`/products` opens the complete shop as a responsive grid, with collections, search, filters, sorting, product previews, cart and WhatsApp support. Homepage buttons and navigation link to it. Cart contents persist between pages.

The homepage displays at most ten selected products. Admin inventory rows and the product editor have independent **Homepage** and **Products page** checkboxes. Unchecking Homepage does not unpublish a product from the full shop. New products default to the full shop only; unchecking both keeps the item in inventory without displaying it to shoppers. Drag order applies to both pages.

For an existing Supabase installation, run `supabase-product-placement.sql` **once**. It adds the visibility columns and restores existing soft-deleted records requested for this release without replacing their saved details. Do not rerun its restoration UPDATE after later intentional deletions. Placement controls remain disabled until the new columns are detected; existing editing and sorting still work. Fresh installations use `supabase-products.sql`.

Implementation, database boundaries and QA are recorded in `../docs/PRODUCTS_PAGE_HANDOFF.md`.

## Checkout notes

- NGN is the authoritative checkout currency; USD and GBP are estimates only.
- Delivery fees are shared in `src/lib/deliveryLocations.js` and must be confirmed before changing them.
- Paystack is loaded only when payment starts.
- When `VITE_PAYSTACK_VERIFY_API_URL` and `PAYSTACK_SECRET_KEY` are configured, successful popup payments are verified server-side before the receipt is shown.
- Fulfilment details are sent through the existing EmailJS templates and can also be confirmed on WhatsApp.

## Christmas Sales

`/sales` is the dedicated campaign storefront for **9-15 November 2026**, Africa/Lagos. Before opening it is a preview; checkout is enforced server-side only between 00:00 on 9 November and 00:00 on 16 November. The page shows the closed-sale state afterwards. There is no client date override in production.

- Use **Christmas Sales** in the admin inventory rows or product editor to select sale members. The selection is independent of Homepage, Products page and the primary collection. Inventory drag order also controls sale order. Do not restore deletion tombstones to populate the sale.
- Existing installations need `supabase-christmas-sales.sql` once. It adds `in_christmas_sale` and initializes the existing two selections without altering prices, collections or deletions. Sale controls remain disabled until the column is detected. This migration was applied and verified for the live project; see `../docs/CHRISTMAS_SALES_HANDOFF.md`.
- The owner confirmed the Christmas Sales name with the existing **9-15 November** dates. Internal campaign IDs, reference formats and saved payment/bag keys intentionally retain their old November identifiers for compatibility.
- The campaign headline is **Up to 50% off**, not a blanket markdown. In the admin editor, **Sale price (NGN)** is the actual payable `price`; **Original price (NGN, optional)** is its pre-sale comparison. Each product's discount is `(originalPrice - price) / originalPrice * 100`, rounded down to one decimal place so the badge never overstates savings. Without a valid higher original price, show the saved price with no discount badge or struck-through price. Checkout charges the saved price plus delivery, with no extra percentage reduction. No database migration or automatic price edits are involved.
- `/api/sales` uses the existing server-only Supabase environment variables and **`PAYSTACK_SECRET_KEY`**. The new sale flow initializes Paystack on the server, so it does not use a browser public key. Production requires the correct live secret in Vercel Production followed by redeployment; never prefix it with `VITE_` or commit it.
- The server rechecks dates, inventory, quantity, discount, delivery and expected payable total. Payment is confirmed only after server verification of the reference, signed order, amount, NGN currency and payer. Missing configuration fails closed, with WhatsApp recovery.
- Payment readiness uses Paystack's authenticated, read-only payment-session-timeout endpoint, cached for 30 seconds per function instance. It never creates a transaction or reads account balances. Invalid credentials/provider outages do not prevent browsing. Vercel Production requires a live secret key; test/public keys cannot enable real checkout.
- Sale bag IDs/quantities persist separately in local storage. An initialized payment session is saved in session storage without customer/address fields. Cancelled or uncertain payments resume the same reference. Hosted fallback payment uses the same tab so its return retains that session.
- Customer, gift recipient, delivery note and item details are included in the Paystack transaction metadata for fulfilment. The sale does not claim an email was sent or use the normal checkout's EmailJS receipt path. Customers can print the verified receipt and confirm delivery through WhatsApp.

For local visual QA without real charges, use two terminals from `frontend`:

```bash
node tests/sale-qa-server.mjs
node node_modules/vite/bin/vite.js --config tests/vite-sale-qa.config.ts
```

Open `http://127.0.0.1:5180/sales`. This explicitly opt-in fixture uses the real sale handler with a fake date and fake provider, binds only to loopback and never calls Paystack or writes to production. Its clearly labelled simulator is excluded from production builds. Do not deploy the QA config or expose its loopback API. For the normal Vite dev server, an optional `SALES_DEV_API_PROXY` can point to a local Vercel function server. Full implementation/release evidence is in `../docs/NOVEMBER_SALES_HANDOFF.md`.

For repeatable inventory UI regression checks, run `npm run test:ui`. These tests use a separate headless browser and a loopback-only inventory simulator, never live Supabase or Paystack. Windows defaults to installed Microsoft Edge; elsewhere run `npx playwright install chromium` first. `PLAYWRIGHT_CHANNEL` can override the browser channel. The tests cover desktop/mobile sale selection, edit/sort, save failures, loading/retry, deleted products, catalogue search, galleries and cart. Generated traces and test screenshots are ignored by Git.

When shared inventory is configured, home and `/products` wait for the uncached database snapshot. A failure shows retry instead of falling back to bundled or locally cached products. An empty shared inventory stays empty. Local seed products are used only in unconfigured demo environments.

## Business facts

Contact details displayed to shoppers live in `src/components/Contact.tsx`. Confirm the official studio address, phone numbers, business hours, delivery fees, promotions, and return terms before each production release.

## Brand system

- Gold accent: `#c9a84c`
- Main background: black, with an editorial `#1c1613` collection band
- Support band: `#f6efe6`, with `#6b1e2e` accents
- Display font: Cormorant Garamond
- Body font: DM Sans
- WhatsApp accent: `#25D366`

Preserve the existing GLAMOURSPHAIR logo, black/gold palette, product photography, collection naming, and luxury editorial direction when extending the site.

## Reference redesign

The October 2026 redesign follows the composition of `https://tluxehairs.vercel.app/`, adapted to GLAMOURSPHAIR's real identity and catalog. The limited homepage selection retains the five-position carousel; `/products` defaults to the full grid. Search, collections, price/length/fitting filters, sale filtering, and price sorting remain available.

The `backup` branch preserves the full pre-redesign website. Branch evidence and QA results are documented in `../docs/REDESIGN_HANDOFF.md`. The Supabase database is shared independently of Git, so reverting a branch does not undo catalog changes made through the admin panel.
