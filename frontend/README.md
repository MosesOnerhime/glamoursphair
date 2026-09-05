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
npm run build
```

There is currently no automated test script. The production build performs the TypeScript project check before bundling.

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

## Checkout notes

- NGN is the authoritative checkout currency; USD and GBP are estimates only.
- Delivery fees are configured in `src/components/CheckoutModal.tsx` and must be confirmed before changing them.
- Paystack is loaded only when payment starts.
- When `VITE_PAYSTACK_VERIFY_API_URL` and `PAYSTACK_SECRET_KEY` are configured, successful popup payments are verified server-side before the receipt is shown.
- Fulfilment details are sent through the existing EmailJS templates and can also be confirmed on WhatsApp.

## Business facts

Contact details displayed to shoppers live in `src/components/Contact.tsx`. Confirm the official studio address, phone numbers, business hours, delivery fees, promotions, and return terms before each production release.

## Brand system

- Gold accent: `#c9a84c`
- Main background: `#0a0a0a`
- Display font: Cormorant Garamond
- Body font: DM Sans
- WhatsApp accent: `#25D366`

Preserve the existing GLAMOURSPHAIR logo, black/gold palette, product photography, collection naming, and luxury editorial direction when extending the site.
