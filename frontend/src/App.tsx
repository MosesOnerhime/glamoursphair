import { lazy, Suspense, useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PromoBanner from './components/PromoBanner'
import TrustStrip from './components/TrustStrip'
import EditorialCollections from './components/EditorialCollections'
import ChannelHub from './components/ChannelHub'
import ProductGrid from './components/ProductGrid'
import BuyerTrust from './components/BuyerTrust'
import BrandStory from './components/BrandStory'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import type { CartItem, Product } from './types'

const CheckoutModal = lazy(() => import('./components/CheckoutModal'))
const CART_STORAGE_KEY = 'glamoursphair_cart'

function readSavedCart(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    const parsed: unknown = stored ? JSON.parse(stored) : []
    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is CartItem => (
      typeof item === 'object' && item !== null &&
      typeof (item as CartItem).id === 'number' &&
      typeof (item as CartItem).name === 'string' &&
      typeof (item as CartItem).price === 'number' &&
      typeof (item as CartItem).qty === 'number' &&
      (item as CartItem).qty > 0
    ))
  } catch {
    return []
  }
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>(readSavedCart)

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
    <div className="min-h-screen bg-[#0a0a0a] text-white font-body overflow-x-hidden">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 bg-[#c9a84c] px-4 py-3 text-sm font-bold text-black transition-transform focus:translate-y-0"
      >
        Skip to shopping content
      </a>
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <PromoBanner />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <TrustStrip />
        <EditorialCollections />
        <ProductGrid onAddToCart={addToCart} />
        <ChannelHub />
        <BuyerTrust />
        <BrandStory />
        <Contact />
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
      <Suspense fallback={null}>
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          items={cartItems}
          onSuccess={handleCheckoutSuccess}
        />
      </Suspense>
    </div>
  )
}
