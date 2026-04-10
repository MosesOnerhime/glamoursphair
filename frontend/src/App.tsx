import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import PromoBanner from './components/PromoBanner'
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

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...product, qty: 1 }]
    })
    setCartOpen(true)
  }

  const removeFromCart = (id: number) => setCartItems(prev => prev.filter(i => i.id !== id))
  const cartCount = cartItems.reduce((sum, i) => sum + i.qty, 0)

  const handleCheckoutSuccess = () => {
    setCartItems([])
    setCartOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-body overflow-x-hidden">
      <Navbar cartCount={cartCount} onCartClick={() => setCartOpen(true)} />
      <PromoBanner />
      <Hero />
      <ProductGrid onAddToCart={addToCart} />
      <Contact />
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onRemove={removeFromCart}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
      />
      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cartItems}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  )
}
