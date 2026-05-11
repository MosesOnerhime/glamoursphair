import { useState } from 'react'
import { HiX, HiCheckCircle, HiDownload } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import emailjs from '@emailjs/browser'
import type { CartItem } from '../types'

interface CheckoutModalProps {
  open: boolean
  onClose: () => void
  items: CartItem[]
  onSuccess: () => void
}

const EMAILJS_SERVICE = 'service_n33g579'
const EMAILJS_TEMPLATE = 'template_qlo9mrg'
const EMAILJS_TEMPLATE2 = 'template_4l65g4a'
const EMAILJS_PUBLIC_KEY = 'picn4x_CNW2nK6hjX'
const PAYSTACK_PUBLIC_KEY = 'pk_live_5c7866617f9d4c8ce13dfbf6f6592ee4b3705b15'
const WHATSAPP = '2348128288948'

const currencies = [
  { code: 'NGN', symbol: '₦', label: 'Nigeria (NGN)', rate: 1 },
  { code: 'USD', symbol: '$', label: 'United States (USD)', rate: 0.00063 },
  { code: 'GBP', symbol: '£', label: 'United Kingdom (GBP)', rate: 0.00050 },
]

interface Receipt {
  reference: string
  name: string
  email: string
  items: CartItem[]
  total: string
  currency: string
  symbol: string
  date: string
}

export default function CheckoutModal({ open, onClose, items, onSuccess }: CheckoutModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [currency, setCurrency] = useState(currencies[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  const ngnTotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const convertedTotal = (ngnTotal * currency.rate).toFixed(2)
  const displayTotal = `${currency.symbol}${Number(convertedTotal).toLocaleString()}`

  const orderSummary = items
    .map(i => `${i.name} x${i.qty} — ${currency.symbol}${(i.price * i.qty * currency.rate).toFixed(2)}`)
    .join('\n')

  const handlePayment = () => {
    if (!name || !email || !phone) {
      setError('Please fill in all fields.')
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    setError('')
    setLoading(true)

    const amount = Math.round(ngnTotal * 100)

    const handler = (window as any).PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount,
      currency: 'NGN',
      ref: `GLAM-${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Customer Name', variable_name: 'customer_name', value: name },
          { display_name: 'Phone', variable_name: 'phone', value: phone },
        ],
      },
      callback: (response: any) => {
        setLoading(false)
        handleSuccess(response.reference)
      },
      onClose: () => {
        setLoading(false)
      },
    })

    handler.openIframe()
  }

  const handleSuccess = async (reference: string) => {
    const date = new Date().toLocaleString('en-GB', {
      dateStyle: 'long',
      timeStyle: 'short',
    })

    const receiptData: Receipt = {
      reference,
      name,
      email,
      items,
      total: displayTotal,
      currency: currency.code,
      symbol: currency.symbol,
      date,
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          customer_name: name,
          customer_email: email,
          order_summary: orderSummary,
          total: displayTotal,
          reference,
          date,
        },
        EMAILJS_PUBLIC_KEY
      )

      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE2,
        {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          order_summary: orderSummary,
          total: displayTotal,
          reference,
          date,
        },
        EMAILJS_PUBLIC_KEY
      )
    } catch (err) {
      console.error('Email receipt failed:', err)
    }

    setReceipt(receiptData)
    onSuccess()
  }

  const printReceipt = () => window.print()

  const whatsappConfirm = () => {
    if (!receipt) return
    const msg = encodeURIComponent(
      `Hello GLAMOURSPHAIR! I just completed payment.\n\n*Name:* ${receipt.name}\n*Reference:* ${receipt.reference}\n*Total:* ${receipt.total}\n\nPlease confirm my order. Thank you!`
    )
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
  }

  const handleClose = () => {
    if (receipt) {
      setReceipt(null)
      setName('')
      setEmail('')
      setPhone('')
      setCurrency(currencies[0])
    }
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!receipt ? handleClose : undefined} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 max-h-[90vh] overflow-y-auto z-10">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-[#0d0d0d] z-10">
          <h2 className="font-display text-2xl text-white tracking-wide">
            {receipt ? 'Payment Successful ✨' : 'Checkout'}
          </h2>
          {!receipt && (
            <button onClick={handleClose} className="text-neutral-500 hover:text-white transition-colors">
              <HiX size={22} />
            </button>
          )}
        </div>

        {receipt ? (
          /* ── RECEIPT VIEW ── */
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center text-center gap-3">
              <HiCheckCircle className="text-emerald-400" size={52} />
              <p className="text-white font-semibold text-lg">Thank you, {receipt.name}!</p>
              <p className="text-neutral-400 text-sm">
                A receipt has been sent to{' '}
                <span className="text-[#c9a84c]">{receipt.email}</span>
              </p>
            </div>

            {/* Receipt box */}
            <div className="border border-[#c9a84c]/20 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-display text-xl text-[#c9a84c] tracking-wide">GLAMOURSPHAIR</span>
                <span className="text-neutral-500 text-xs">{receipt.date}</span>
              </div>
              <div className="h-px bg-[#c9a84c]/20" />

              <div className="space-y-2">
                {receipt.items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-300">{item.name} × {item.qty}</span>
                    <span className="text-white">
                      {receipt.symbol}{(item.price * item.qty * currency.rate).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/5" />
              <div className="flex justify-between">
                <span className="text-neutral-400 uppercase tracking-widest text-xs">Total Paid</span>
                <span className="text-[#c9a84c] font-bold text-lg">{receipt.total}</span>
              </div>

              <div className="h-px bg-white/5" />
              <div className="space-y-1 text-xs text-neutral-500">
                <p>Ref: <span className="text-neutral-300">{receipt.reference}</span></p>
                <p>Suite FB-53, New Banex Plaza, Wuse 2, Abuja</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={whatsappConfirm}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white font-bold tracking-wide text-sm hover:bg-[#20b85a] transition-colors"
              >
                <FaWhatsapp size={18} />
                Confirm Order on WhatsApp
              </button>
              <button
                onClick={printReceipt}
                className="w-full flex items-center justify-center gap-2 py-3 border border-[#c9a84c]/30 text-[#c9a84c] text-sm tracking-wide hover:bg-[#c9a84c]/10 transition-colors"
              >
                <HiDownload size={16} />
                Print / Save Receipt
              </button>
              <button
                onClick={handleClose}
                className="w-full py-3 border border-white/10 text-neutral-400 text-sm hover:text-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* ── CHECKOUT FORM ── */
          <div className="p-6 space-y-6">

            {/* Order summary */}
            <div>
              <h3 className="text-neutral-400 text-xs uppercase tracking-widest mb-3">Order Summary</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-neutral-300">{item.name} × {item.qty}</span>
                    <span className="text-white">₦{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-white/5 my-3" />
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 text-xs uppercase tracking-widest">Total</span>
                <span className="text-[#c9a84c] font-bold text-xl">{displayTotal}</span>
              </div>
            </div>

            {/* Currency selector */}
            <div>
              <label className="text-neutral-400 text-xs uppercase tracking-widest block mb-2">
                Select Currency
              </label>
              <div className="grid grid-cols-3 gap-2">
                {currencies.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c)}
                    className={`py-2.5 text-sm font-semibold border transition-all duration-200 ${
                      currency.code === c.code
                        ? 'border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]'
                        : 'border-white/10 text-neutral-400 hover:border-white/30'
                    }`}
                  >
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
              {currency.code !== 'NGN' && (
                <p className="text-neutral-600 text-xs mt-2">
                  ≈ {displayTotal} (converted from ₦{ngnTotal.toLocaleString()})
                </p>
              )}
            </div>

            {/* Customer details */}
            <div className="space-y-3">
              <h3 className="text-neutral-400 text-xs uppercase tracking-widest">Your Details</h3>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#111] border border-white/10 focus:border-[#c9a84c]/50 outline-none px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors"
              />
              <input
                type="email"
                placeholder="Email Address (receipt will be sent here)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#111] border border-white/10 focus:border-[#c9a84c]/50 outline-none px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors"
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-[#111] border border-white/10 focus:border-[#c9a84c]/50 outline-none px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              onClick={handlePayment}
              disabled={loading || items.length === 0}
              className="w-full py-4 bg-[#c9a84c] text-black font-bold tracking-[0.2em] text-sm uppercase hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Opening Payment...' : `Pay ${displayTotal}`}
            </button>

            <p className="text-center text-neutral-600 text-xs">
              🔒 Secured by Paystack · Accepts cards worldwide
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
