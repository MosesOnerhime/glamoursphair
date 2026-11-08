# Delivery Locations Handoff

## Approved options

Checkout offers only the owner-approved delivery and collection options. Prices are in NGN:

| Destination | Fee |
| --- | ---: |
| Abuja | NGN 5,000 |
| Within Nigeria (outside Abuja) | NGN 10,000 |
| United Kingdom | NGN 89,000 |
| USA / Canada | NGN 98,000 |
| Other countries | NGN 169,000 |
| Pick up at Abuja studio | Free |

The country selector lists all two-letter region entries supported by the browser's English `Intl.DisplayNames` data. Nigeria, the United Kingdom, the United States and Canada are excluded from the Other countries option. Countries are selected first; the delivery option list then shows only options valid for that country. Nigeria offers Abuja, Within Nigeria and studio pickup.

## Checkout behavior

- The regular cart checkout and Christmas Sales checkout share the same rates and country mapping from `frontend/src/lib/deliveryLocations.js`.
- The sale API independently validates the submitted country and delivery option, and computes the delivery amount in kobo before initializing Paystack. A customer's browser cannot choose a different fee by changing the submitted amount.
- Pickup is zero-cost, skips street/city/state entry, and records the confirmed studio address: 3rd Floor, Cappador Galaxy Mall, 81 Aminu Kano Crescent, Wuse 2, Abuja, Nigeria.
- The country and selected delivery method/fee are included in checkout details and the order receipt/payment metadata.
- The reference recording and screenshots were used only to guide the mobile form sequence and country dropdown. Fees and destinations come from the owner's request, not the reference shop.

No Supabase schema change or production data update is required for these delivery options.

## Verification

Run from `frontend/`:

```powershell
npm test
npm run lint
npm run build
npm run test:ui
```

Unit/API tests cover all fee mappings, international countries, checkout amount calculation and free pickup validation. Browser tests exercise the sale checkout and responsive layout. No real Paystack payment should be initiated during QA.

QA completed November 8, 2026: 85 unit/API tests passed; ESLint and the TypeScript/Vite production build passed; all 24 desktop/mobile Playwright tests passed. The responsive sweep covers 360, 430, 768, 1024, 1280 and 1920 CSS pixels. The sweep has a 120-second test budget because it repeatedly loads the catalogue, admin and sales page at each width. No real payment was created.
