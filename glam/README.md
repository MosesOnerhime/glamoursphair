# GLAMOURSPHAIR — Luxury Hair & Wigs E-Commerce

A premium React + Vite + TypeScript + Tailwind CSS website for GLAMOURSPHAIR, a luxury hair and wig brand based in Abuja, Nigeria.

---

## 🚀 Quick Setup

### 1. Create the Vite project (already done if you ran `npm create vite@latest glam`)

```bash
cd glam
```

### 2. Copy all project files into your `glam/` folder

Replace or merge the following:
- `src/` folder (all components)
- `index.html`
- `tailwind.config.js`
- `postcss.config.js`
- `package.json`

### 3. Install dependencies

```bash
npm install
```

This installs:
- **react-icons** (for all icons including WhatsApp, Instagram, TikTok)
- **tailwindcss**, **postcss**, **autoprefixer** (for styling)

### 4. Run the dev server

```bash
npm run dev
```

Visit: **http://localhost:5173**

### 5. Build for production

```bash
npm run build
npm run preview
```

---

## 📁 Project Structure

```
glam/
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Root component (state, cart logic)
│   ├── index.css           # Tailwind + Google Fonts
│   ├── types.ts            # TypeScript interfaces
│   └── components/
│       ├── Navbar.tsx      # Fixed header with mobile menu
│       ├── PromoBanner.tsx # Scrolling marquee promo strip
│       ├── Hero.tsx        # Full-screen landing section
│       ├── ProductGrid.tsx # 8-product catalog grid
│       ├── Contact.tsx     # Contact info & WhatsApp CTA
│       ├── CartDrawer.tsx  # Slide-in cart with WhatsApp checkout
│       └── Footer.tsx      # Brand footer with links & info
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Gold accent | `#c9a84c` |
| Background | `#0a0a0a` |
| Surface | `#0d0d0d / #111` |
| Display font | Cormorant Garamond (serif) |
| Body font | DM Sans (sans-serif) |
| WhatsApp green | `#25D366` |

---

## 📞 Business Info Embedded

- **Address:** Suite FB-53, New Banex Plaza, Wuse 2, Abuja
- **Phone 1:** 0818 803 0965
- **Phone 2:** 0812 828 8948
- **Phone 3:** +234 707 206 6544

---

## ✨ Features

- ✅ Responsive mobile-first design
- ✅ Animated marquee promo banner
- ✅ Product grid with Add to Cart + WhatsApp order
- ✅ Sliding cart drawer with WhatsApp checkout
- ✅ Smooth scroll navigation
- ✅ Gold/black luxury aesthetic
- ✅ Google Fonts (Cormorant Garamond + DM Sans)
- ✅ SEO meta tags

---

## 📦 To Add Real Product Images

In `ProductGrid.tsx`, replace the SVG placeholder inside each card's image div with:

```tsx
<img src="/images/product-name.jpg" alt={product.name} className="w-full h-full object-cover" />
```

Place images in `public/images/` — Vite serves them automatically.
