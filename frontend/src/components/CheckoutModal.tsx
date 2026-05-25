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

type CurrencyCode = 'NGN' | 'USD' | 'GBP'

interface Currency {
  code: CurrencyCode
  symbol: string
  label: string
  rate: number
}

interface DeliveryLocation {
  id: string
  label: string
  fee: number
  note: string
}

interface PaystackResponse {
  reference: string
}

interface PaystackOptions {
  key: string
  email: string
  amount: number
  currency: CurrencyCode
  ref: string
  metadata: {
    custom_fields: Array<{
      display_name: string
      variable_name: string
      value: string
    }>
  }
  callback: (response: PaystackResponse) => void
  onClose: () => void
}

interface PaystackHandler {
  openIframe: () => void
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: PaystackOptions) => PaystackHandler
    }
  }
}

const EMAILJS_SERVICE = 'service_n33g579'
const EMAILJS_TEMPLATE = 'template_qlo9mrg'
const EMAILJS_TEMPLATE2 = 'template_4l65g4a'
const EMAILJS_PUBLIC_KEY = 'picn4x_CNW2nK6hjX'
const PAYSTACK_PUBLIC_KEY = 'pk_live_5c7866617f9d4c8ce13dfbf6f6592ee4b3705b15'
const WHATSAPP = '2348128288948'

const currencies: Currency[] = [
  { code: 'NGN', symbol: '\u20a6', label: 'Nigeria (NGN)', rate: 1 },
  { code: 'USD', symbol: '$', label: 'United States (USD)', rate: 0.00063 },
  { code: 'GBP', symbol: '\u00a3', label: 'United Kingdom (GBP)', rate: 0.00050 },
]

const deliveryLocations: DeliveryLocation[] = [
  { id: 'abuja-central', label: 'Abuja central', fee: 3000, note: 'Wuse, Maitama, Garki, Asokoro and nearby areas' },
  { id: 'abuja-outskirts', label: 'Abuja outskirts', fee: 5000, note: 'Lugbe, Kubwa, Gwarinpa, Lokogoma and similar areas' },
  { id: 'other-nigeria', label: 'Other Nigerian states', fee: 10000, note: 'Nationwide dispatch within Nigeria' },
  { id: 'outside-nigeria', label: 'Outside Nigeria', fee: 50000, note: 'International dispatch' },
]

interface Receipt {
  reference: string
  name: string
  email: string
  items: CartItem[]
  subtotal: string
  deliveryFee: string
  deliveryLocation: string
  deliveryAddress: string
  total: string
  currency: CurrencyCode
  symbol: string
  currencyRate: number
  date: string
}

export default function CheckoutModal({ open, onClose, items, onSuccess }: CheckoutModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [deliveryLocationId, setDeliveryLocationId] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [currency, setCurrency] = useState<Currency>(currencies[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [receipt, setReceipt] = useState<Receipt | null>(null)

  const selectedDelivery = deliveryLocations.find(location => location.id === deliveryLocationId)
  const subtotalNgn = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const deliveryFeeNgn = selectedDelivery?.fee ?? 0
  const orderTotalNgn = subtotalNgn + deliveryFeeNgn

  const formatMoney = (amountNgn: number, targetCurrency = currency) => {
    const converted = amountNgn * targetCurrency.rate
    const fractionDigits = targetCurrency.code === 'NGN' ? 0 : 2

    return `${targetCurrency.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })}`
  }

  const subtotalDisplay = formatMoney(subtotalNgn)
  const deliveryFeeDisplay = selectedDelivery ? formatMoney(deliveryFeeNgn) : 'Select location'
  const displayTotal = formatMoney(orderTotalNgn)
  const paystackTotal = formatMoney(orderTotalNgn, currencies[0])

  const orderSummary = [
    ...items.map(i => `${i.name} x${i.qty} - ${formatMoney(i.price * i.qty)}`),
    `Subtotal: ${subtotalDisplay}`,
    selectedDelivery ? `Delivery (${selectedDelivery.label}): ${deliveryFeeDisplay}` : 'Delivery: Not selected',
    `Total: ${displayTotal}`,
  ].join('\n')

  const handlePayment = () => {
    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const trimmedAddress = deliveryAddress.trim()

    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    if (!trimmedName || !trimmedEmail || !trimmedPhone || !selectedDelivery || !trimmedAddress) {
      setError('Please fill in your contact and delivery details.')
      return
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (!window.PaystackPop) {
      setError('Payment service is still loading. Please try again in a moment.')
      return
    }

    setError('')
    setLoading(true)

    const amount = Math.round(orderTotalNgn * 100)

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: trimmedEmail,
      amount,
      currency: 'NGN',
      ref: `GLAM-${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Customer Name', variable_name: 'customer_name', value: trimmedName },
          { display_name: 'Phone', variable_name: 'phone', value: trimmedPhone },
          { display_name: 'Delivery Location', variable_name: 'delivery_location', value: selectedDelivery.label },
          { display_name: 'Delivery Address', variable_name: 'delivery_address', value: trimmedAddress },
          { display_name: 'Delivery Fee', variable_name: 'delivery_fee', value: formatMoney(deliveryFeeNgn, currencies[0]) },
        ],
      },
      callback: (response) => {
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
      name: name.trim(),
      email: email.trim(),
      items,
      subtotal: subtotalDisplay,
      deliveryFee: selectedDelivery ? deliveryFeeDisplay : formatMoney(0),
      deliveryLocation: selectedDelivery?.label ?? 'Not selected',
      deliveryAddress: deliveryAddress.trim(),
      total: displayTotal,
      currency: currency.code,
      symbol: currency.symbol,
      currencyRate: currency.rate,
      date,
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        {
          customer_name: receiptData.name,
          customer_email: receiptData.email,
          order_summary: orderSummary,
          delivery_location: receiptData.deliveryLocation,
          delivery_address: receiptData.deliveryAddress,
          delivery_fee: receiptData.deliveryFee,
          subtotal: receiptData.subtotal,
          total: receiptData.total,
          reference,
          date,
        },
        EMAILJS_PUBLIC_KEY
      )

      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE2,
        {
          customer_name: receiptData.name,
          customer_email: receiptData.email,
          customer_phone: phone.trim(),
          order_summary: orderSummary,
          delivery_location: receiptData.deliveryLocation,
          delivery_address: receiptData.deliveryAddress,
          delivery_fee: receiptData.deliveryFee,
          subtotal: receiptData.subtotal,
          total: receiptData.total,
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
      `Hello GLAMOURSPHAIR! I just completed payment.\n\n*Name:* ${receipt.name}\n*Reference:* ${receipt.reference}\n*Delivery:* ${receipt.deliveryLocation}\n*Address:* ${receipt.deliveryAddress}\n*Total:* ${receipt.total}\n\nPlease confirm my order. Thank you!`
    )
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
  }

  const handleClose = () => {
    if (receipt) {
      setReceipt(null)
      setName('')
      setEmail('')
      setPhone('')
      setDeliveryLocationId('')
      setDeliveryAddress('')
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
            {receipt ? 'Payment Successful' : 'Checkout'}
          </h2>
          {!receipt && (
            <button onClick={handleClose} className="text-neutral-500 hover:text-white transition-colors" aria-label="Close checkout">
              <HiX size={22} />
            </button>
          )}
        </div>

        {receipt ? (
          /* Receipt view */
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
              <div className="flex items-center justify-between gap-4">
                <span className="font-display text-xl text-[#c9a84c] tracking-wide">GLAMOURSPHAIR</span>
                <span className="text-neutral-500 text-xs text-right">{receipt.date}</span>
              </div>
              <div className="h-px bg-[#c9a84c]/20" />

              <div className="space-y-2">
                {receipt.items.map(item => (
                  <div key={item.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-neutral-300">{item.name} x {item.qty}</span>
                    <span className="text-white whitespace-nowrap">
                      {formatMoney(item.price * item.qty, {
                        code: receipt.currency,
                        symbol: receipt.symbol,
                        label: receipt.currency,
                        rate: receipt.currencyRate,
                      })}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-white/5" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">{receipt.subtotal}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-400">Delivery</span>
                  <span className="text-white">{receipt.deliveryFee}</span>
                </div>
              </div>

              <div className="h-px bg-white/5" />
              <div className="flex justify-between gap-3">
                <span className="text-neutral-400 uppercase tracking-widest text-xs">Total Paid</span>
                <span className="text-[#c9a84c] font-bold text-lg">{receipt.total}</span>
              </div>

              <div className="h-px bg-white/5" />
              <div className="space-y-1 text-xs text-neutral-500">
                <p>Delivery: <span className="text-neutral-300">{receipt.deliveryLocation}</span></p>
                <p>Address: <span className="text-neutral-300">{receipt.deliveryAddress}</span></p>
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
          /* Checkout form */
          <div className="p-6 space-y-6">

            {/* Order summary */}
            <div>
              <h3 className="text-neutral-400 text-xs uppercase tracking-widest mb-3">Order Summary</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-neutral-300">{item.name} x {item.qty}</span>
                    <span className="text-white whitespace-nowrap">{formatMoney(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-white/5 my-3" />
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-400">Subtotal</span>
                  <span className="text-white">{subtotalDisplay}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-neutral-400">Delivery</span>
                  <span className="text-white">{deliveryFeeDisplay}</span>
                </div>
              </div>
              <div className="h-px bg-white/5 my-3" />
              <div className="flex justify-between items-center gap-3">
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
              <p className="text-neutral-600 text-xs mt-2">
                Card payments are processed in NGN. Other currencies are estimates for comparison.
              </p>
            </div>

            {/* Delivery details */}
            <div className="space-y-3">
              <h3 className="text-neutral-400 text-xs uppercase tracking-widest">Delivery Location</h3>
              <select
                value={deliveryLocationId}
                onChange={e => setDeliveryLocationId(e.target.value)}
                className="w-full bg-[#111] border border-white/10 focus:border-[#c9a84c]/50 outline-none px-4 py-3 text-sm text-white transition-colors"
              >
                <option value="">Choose delivery area</option>
                {deliveryLocations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.label} - {formatMoney(location.fee, currencies[0])}
                  </option>
                ))}
              </select>
              {selectedDelivery && (
                <p className="text-neutral-600 text-xs">{selectedDelivery.note}</p>
              )}
              <textarea
                placeholder="Full delivery address"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
                rows={3}
                className="w-full bg-[#111] border border-white/10 focus:border-[#c9a84c]/50 outline-none px-4 py-3 text-sm text-white placeholder-neutral-600 transition-colors resize-none"
              />
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
              {loading ? 'Opening Payment...' : `Pay ${paystackTotal}`}
            </button>

            <p className="text-center text-neutral-600 text-xs">
              Secured by Paystack - Accepts cards worldwide
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
