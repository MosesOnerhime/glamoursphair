# Responsive and Accessibility Standards

Target WCAG 2.2 AA.

Test at minimum:
- 360×800
- 390×844
- 430×932
- 768×1024
- 1024×768
- 1280×800
- 1440×900
- wide desktop

## Mobile
Keep header compact, search reachable, collections/filters usable, images large enough to judge, prices prominent, Add to Cart obvious, and WhatsApp from covering purchase UI.

## Product grid
Use 2 columns on mobile only if text/actions remain readable; 1 column is acceptable for information-rich luxury products.

## Touch
WCAG 2.2 AA includes a 24×24 CSS px minimum target-size criterion with exceptions. Aim closer to 44×44 for primary mobile controls.

## Keyboard
Keyboard-only users must be able to use navigation, search, filters, product links, gallery, Add to Cart, cart editing, policy links, contact, and forms.

## Focus
Use visible `:focus-visible`. Sticky headers/actions must not obscure focused elements.

## Forms
Visible labels, accessible names, autocomplete, associated validation.

## Images
Use useful alt text for informative product images. Avoid keyword stuffing.

## Sale/status
Do not rely on color alone.

## Motion
Respect `prefers-reduced-motion`; reduce parallax, long reveals, marquees, and smooth scrolling where appropriate.

## Dialogs/drawers
Cart/filter/lightbox should manage focus, Escape, background interaction, and focus restoration correctly.

Do not disable browser zoom.
