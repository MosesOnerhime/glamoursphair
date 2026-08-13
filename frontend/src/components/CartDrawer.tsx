import { HiX, HiTrash, HiShoppingBag } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import { track } from '@vercel/analytics'
import type { CartItem } from '../types'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  onRemove: (id: number) => void
  onCheckout: () => void
  onUpdateQty: (id: number, qty: number) => void
  onClear: () => void
}

const WHATSAPP = '2348128288948'
const NGN = '\u20a6'

const formatNgn = (amount: number) => `${NGN}${amount.toLocaleString()}`
const itemImage = (item: CartItem) => item.images?.[0] ?? item.image

export default function CartDrawer({ open, onClose, items, onRemove, onCheckout, onUpdateQty, onClear }: CartDrawerProps) {
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  const orderViaWhatsApp = () => {
    if (items.length === 0) return
    track('WhatsApp Click', { surface: 'cart-drawer', value: total })
    const itemList = items.map(i => `- ${i.name} x${i.qty} - ${formatNgn(i.price * i.qty)}`).join('\n')
    const msg = encodeURIComponent(`Hello GLAMOURSPHAIR! I'd like to order:\n\n${itemList}\n\n*Total: ${formatNgn(total)}*\n\nPlease confirm availability.`)
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
  }

  const openCheckout = () => {
    track('Checkout Opened', { value: total })
    onCheckout()
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-black/65 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />

      <aside className={`fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/70 transition-transform duration-500 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-5">
          <div>
            <h2 className="font-display text-2xl text-white">Your Cart</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Delivery is calculated at checkout.</p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center text-neutral-400 transition-colors hover:text-white" aria-label="Close cart">
            <HiX size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#c9a84c]/20 bg-[#c9a84c]/8">
                <HiShoppingBag className="text-[#c9a84c]" size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Your cart is empty.</p>
                <p className="mt-1 text-sm text-neutral-500">Add a luxury unit to begin checkout.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 border border-white/8 bg-[#111] p-3">
                  <div className={`flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br ${item.gradient}`}>
                    {itemImage(item)
                      ? <img src={itemImage(item)} alt={item.name} className="h-full w-full object-cover" />
                      : <span className="text-sm font-semibold text-[#c9a84c]/50">GH</span>
                    }
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-white">{item.name}</h4>
                    <p className="mt-0.5 text-sm text-[#c9a84c]">{formatNgn(item.price)}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">Item total: {formatNgn(item.price * item.qty)}</p>

                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => item.qty === 1 ? onRemove(item.id) : onUpdateQty(item.id, item.qty - 1)}
                        className="flex h-7 w-7 items-center justify-center border border-white/10 text-white transition-colors hover:border-[#c9a84c]/50 hover:text-[#c9a84c]"
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        -
                      </button>
                      <span className="w-5 text-center text-sm text-white">{item.qty}</span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                        className="flex h-7 w-7 items-center justify-center border border-white/10 text-white transition-colors hover:border-[#c9a84c]/50 hover:text-[#c9a84c]"
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => onRemove(item.id)}
                    className="self-start text-neutral-600 transition-colors hover:text-red-400"
                    aria-label={`Remove ${item.name}`}
                  >
                    <HiTrash size={17} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-3 border-t border-white/8 px-5 py-5">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.22em] text-neutral-400">Cart subtotal</span>
              <span className="font-display text-3xl text-[#c9a84c]">{formatNgn(total)}</span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-600">
              Delivery fees and live currency estimates appear in checkout before payment.
            </p>

            <button
              onClick={openCheckout}
              className="w-full bg-[#c9a84c] py-4 text-sm font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-white"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={orderViaWhatsApp}
              className="flex w-full items-center justify-center gap-2 border border-[#25D366]/30 py-3 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/10"
            >
              <FaWhatsapp size={16} />
              Order via WhatsApp Instead
            </button>

            <button
              onClick={onClear}
              className="w-full py-2 text-xs uppercase tracking-[0.2em] text-neutral-600 transition-colors hover:text-red-400"
            >
              Clear Cart
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
