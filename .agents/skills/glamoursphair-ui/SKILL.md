---
name: glamoursphair-ui
description: Audit and refine the GLAMOURSPHAIR Luxury ecommerce UI while preserving the existing brand identity. Use for product discovery, PDP, cart/checkout, WhatsApp support, conversion, accessibility, mobile, performance, SEO, and QA.
---

# GLAMOURSPHAIR UI Skill

Before substantial work read:
- `/DESIGN.md`
- every file under `/docs/ui/`

Then inspect the actual repository.

## Workflow
1. Inventory routes, data, collections, search, filters, PDP, cart, checkout, Paystack, shipping, currency, WhatsApp, custom orders, newsletter, policies, metadata.
2. Preserve strongest existing brand/UI patterns.
3. Classify issues:
   - P0 broken/accessibility/payment;
   - P1 discovery/trust/conversion/mobile/performance/SEO;
   - P2 polish/consistency.
4. Implement in that order.
5. Validate with `docs/ui/DESIGN_QA.md` and real build/lint/typecheck/tests.

## Non-negotiables
- no rebrand;
- no invented product data;
- no fake reviews;
- no fake urgency;
- no invented shipping/returns;
- no breaking Paystack;
- no replacing WhatsApp without instruction;
- no large UI framework for polish;
- no commit/push without permission.

Desired result: the same GLAMOURSPHAIR store after a senior ecommerce designer, conversion specialist, accessibility reviewer, and frontend engineer refined it.
