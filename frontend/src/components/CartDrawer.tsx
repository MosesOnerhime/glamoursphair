import { HiX, HiTrash } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import type { CartItem } from '../types'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  onRemove: (id: number) => void
  // onCheckout: () => void
  onUpdateQty: (id: number, qty: number) => void
  onClear: () => void
}

const WHATSAPP = '2348128288948'

// export default function CartDrawer({ open, onClose, items, onRemove, onCheckout, onUpdateQty, onClear }: CartDrawerProps) {

export default function CartDrawer({ open, onClose, items, onRemove, onUpdateQty, onClear }: CartDrawerProps) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  const orderViaWhatsApp = () => {
    if (items.length === 0) return
    const itemList = items.map(i => `• ${i.name} x${i.qty} — ₦${(i.price * i.qty).toLocaleString()}`).join('\n')
    const msg = encodeURIComponent(`Hello GLAMOURSPHAIR! I'd like to order:\n\n${itemList}\n\n*Total: ₦${total.toLocaleString()}*\n\nPlease confirm availability.`)
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[#0d0d0d] border-l border-white/5 z-50 flex flex-col transition-transform duration-500 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl text-white tracking-wide">Your Cart</h2>
            {items.length > 0 && (
              <button
                onClick={onClear}
                className="text-xs text-neutral-500 hover:text-red-400 transition-colors tracking-wide uppercase border border-white/10 hover:border-red-400/30 px-2 py-1"
              >
                Clear All
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
            <HiX size={22} />
          </button>
        </div>
        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-16 h-16 border border-[#c9a84c]/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">🛍️</span>
              </div>
              <p className="text-neutral-500 text-sm">Your cart is empty.<br />Add some luxury to your life!</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-3 border border-white/5 p-3">
                <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} flex-shrink-0 flex items-center justify-center overflow-hidden`}>
                  {item.image
                    ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    : <span className="text-[#c9a84c]/40 text-2xl">👸</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white text-sm font-medium truncate">{item.name}</h4>
                  <p className="text-[#c9a84c] text-sm mt-0.5">₦{item.price.toLocaleString()}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">= ₦{(item.price * item.qty).toLocaleString()}</p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => item.qty === 1 ? onRemove(item.id) : onUpdateQty(item.id, item.qty - 1)}
                      className="w-6 h-6 border border-white/10 text-white hover:border-[#c9a84c]/50 hover:text-[#c9a84c] transition-colors flex items-center justify-center text-sm"
                    >
                      −
                    </button>
                    <span className="text-white text-sm w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      className="w-6 h-6 border border-white/10 text-white hover:border-[#c9a84c]/50 hover:text-[#c9a84c] transition-colors flex items-center justify-center text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-neutral-600 hover:text-red-400 transition-colors flex-shrink-0 self-start"
                >
                  <HiTrash size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-6 py-6 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-neutral-400 text-sm uppercase tracking-widest">Total</span>
              <span className="text-[#c9a84c] font-display text-2xl">₦{total.toLocaleString()}</span>
            </div>

            {/* Primary: Pay with card */}
            {/* <button
              onClick={onCheckout}
              className="w-full py-4 bg-[#c9a84c] text-black font-bold tracking-[0.2em] text-sm uppercase hover:bg-white transition-colors duration-300"
            >
              Proceed to Checkout
            </button> */}

            {/* Secondary: WhatsApp */}
            <button
              onClick={orderViaWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 border border-[#25D366]/30 text-[#25D366] font-semibold text-sm hover:bg-[#25D366]/10 transition-all duration-300"
            >
              <FaWhatsapp size={16} />
              Order via WhatsApp Instead
            </button>

            <p className="text-center text-neutral-600 text-xs">
              Pay in installments available · 20% down
            </p>
          </div>
        )}
      </div>
    </>
  )
}
