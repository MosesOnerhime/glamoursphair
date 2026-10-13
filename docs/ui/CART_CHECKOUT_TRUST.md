# Cart, Checkout, and Trust Standards

## Cart
Each item should show:
- thumbnail;
- exact name;
- selected spec/variant;
- unit price;
- quantity;
- line total;
- remove/edit.

Summary should show subtotal, delivery treatment, discounts where real, and final total.

## Currency
If NGN is authoritative and USD/GBP are estimates:
- label conversions as estimates;
- keep NGN visually authoritative;
- do not make estimated values appear payable.

## Paystack
Preserve the current integration. Only claim payment methods actually supported.

## Shipping and returns
Keep policies easy to reach. Do not write stronger promises than the real policy.

## Forms
Use visible labels, correct autocomplete/input types, inline validation, preserved values after recoverable errors, and clear error recovery.

## Payment states
Explicitly handle:
- loading;
- success;
- failure;
- cancellation;
- retry.

Prevent duplicate order/payment creation.

## Back/refresh safety
Audit provider return, refresh, back navigation, and retry for duplicate/lost order risk.

## Trust placement
Use factual signals near uncertainty:
- Paystack;
- delivery coverage;
- Abuja studio;
- WhatsApp support;
- policy links.

Avoid giant decorative trust-badge walls.
