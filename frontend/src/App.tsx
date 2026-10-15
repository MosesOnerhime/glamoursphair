import { lazy, Suspense, useEffect, useLayoutEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TrustStrip from './components/TrustStrip'
import ChannelHub from './components/ChannelHub'
import ProductGrid from './components/ProductGrid'
import BuyerTrust from './components/BuyerTrust'
import BrandStory from './components/BrandStory'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import type { CartItem, Product } from './types'
import { HiX } from 'react-icons/hi'
import { useDialogA11y } from './hooks/useDialogA11y'
import { useStorefrontMotion } from './hooks/useStorefrontMotion'
import { initialHomepageSection } from './lib/homepageEntry.js'

const CheckoutModal = lazy(() => import('./components/CheckoutModal'))
const CART_STORAGE_KEY = 'glamoursphair_cart'

function CheckoutLoading({ onClose }: { onClose: () => void }) {
  const ref = useDialogA11y<HTMLDivElement>(true, onClose)
  return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-5"><div ref={ref} role="dialog" aria-modal="true" aria-label="Preparing checkout" tabIndex={-1} className="w-full max-w-sm rounded-lg border border-[#cbb07a]/40 bg-[#1c1613] p-6"><div className="flex items-center justify-between gap-4"><p role="status" className="text-sm text-[#f6efe6]">Preparing your checkout...</p><button className="round-tool" onClick={onClose} aria-label="Cancel checkout"><HiX size={20} /></button></div></div></div>
}

function readSavedCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is CartItem => (
      typeof item === 'object' && item !== null &&
      Number.isSafeInteger((item as CartItem).id) && (item as CartItem).id > 0 &&
      typeof (item as CartItem).name === 'string' &&
      Number.isFinite((item as CartItem).price) && (item as CartItem).price > 0 &&
      Number.isSafeInteger((item as CartItem).qty) &&
      (item as CartItem).qty > 0
    ))
  } catch {
    return []
  }
}

export default function App() {
  const productsPage = window.location.pathname.replace(/\/$/, '') === '/products'
  const motionRef = useStorefrontMotion()
  const [initialSection] = useState(() => initialHomepageSection(
    window.location,
    (performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type,
  ))
  const startsAtCollection = initialSection === 'collection'
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>(readSavedCart)

  useLayoutEffect(() => {
    if (!initialSection) return
    // Position once before paint; never trap scrolling or override a deep link.
    document.getElementById(initialSection)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [initialSection])

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
    } catch {
      // Checkout remains usable when storage is unavailable or full.
    }
  }, [cartItems])

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
    setCartOpen(true)
  }

  

  const removeFromCart = (id: number) => setCartItems(prev => prev.filter(i => i.id !== id))
  const updateQty = (id: number, qty: number) => {
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, qty) } : i))
  }
  const clearCart = () => setCartItems([])
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)

  const handleCheckoutSuccess = () => {
    setCartItems([])
    setCartOpen(false)
  }

  return (
    <div ref={motionRef} className="storefront min-h-screen text-white font-body">
      <a
        href="#collection"
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-[#c9a84c] px-4 py-3 text-sm font-bold text-black transition-transform focus:translate-y-0"
      >
        Skip to shopping content
      </a>
      <Navbar productsPage={productsPage} cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <main id="main-content" tabIndex={-1}>
        {!productsPage && <><Hero prioritizeImage={!startsAtCollection} /><TrustStrip /></>}
        <ProductGrid productsPage={productsPage} onAddToCart={addToCart} />
        {!productsPage && <BrandStory />}
        <BuyerTrust />
        {!productsPage && <><Contact /><ChannelHub /></>}
      </main>
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
        onUpdateQty={updateQty}
        onClear={clearCart}
      />
      <Suspense fallback={<CheckoutLoading onClose={() => setCheckoutOpen(false)} />}>
        {checkoutOpen && <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          items={cartItems}
          onSuccess={handleCheckoutSuccess}
        />}
      </Suspense>
    </div>
  )
}
