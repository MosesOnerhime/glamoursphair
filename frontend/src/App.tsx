import { useState } from 'react'
import { HiX } from 'react-icons/hi'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PromoBanner from './components/PromoBanner'
import ChannelHub from './components/ChannelHub'
import ProductGrid from './components/ProductGrid'
import Contact from './components/Contact'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import CheckoutModal from './components/CheckoutModal'
import type { CartItem, Product } from './types'

export default function App() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showPaystackPopup, setShowPaystackPopup] = useState(() => {
  return !localStorage.getItem('paystackPopupSeen')
  })

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
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty } : i))
  }
  const clearCart = () => setCartItems([])
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)

  const handleCheckoutSuccess = () => {
    setCartItems([])
    setCartOpen(false)
  }

  const dismissPaystackPopup = () => {
  localStorage.setItem('paystackPopupSeen', 'true')
  setShowPaystackPopup(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-body overflow-x-hidden">
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <PromoBanner />
      <Hero />
      <ChannelHub />
      <ProductGrid onAddToCart={addToCart} />
      <Contact />
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
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onSuccess={handleCheckoutSuccess}
      />

      {/* Paystack One-Time Popup */}
      {showPaystackPopup && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={dismissPaystackPopup}
          />
          <div className="relative w-full max-w-sm bg-[#0a1628] border border-white/10 z-10 animate-dropdown overflow-hidden">
            {/* Close button */}
            <button
              onClick={dismissPaystackPopup}
              className="absolute top-3 right-3 z-20 text-neutral-400 hover:text-white transition-colors"
            >
              <HiX size={20} />
            </button>

            {/* Banner image */}
            <img
              src="/images/paystack-banner.png"
              alt="Pay with Paystack"
              className="w-full object-contain"
            />

            {/* Bottom actions */}
            <div className="p-5 space-y-3">
              <button
                onClick={() => {
                  dismissPaystackPopup()
                  document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="w-full flex items-center justify-center py-3.5 bg-[#0ba4db] text-white font-bold tracking-[0.15em] uppercase text-sm hover:bg-[#0993c5] transition-colors"
              >
                Shop Now
              </button>
              <button
                onClick={dismissPaystackPopup}
                className="w-full py-2.5 border border-white/10 text-neutral-400 text-sm hover:text-white transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
