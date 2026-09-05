import { useEffect, useState } from 'react'
import { HiX, HiCheckCircle, HiDownload } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import emailjs from '@emailjs/browser'
import type { CartItem } from '../types'
import { useDialogA11y } from '../hooks/useDialogA11y'

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

interface ExchangeRatesResponse {
  result: 'success' | 'error'
  base_code?: CurrencyCode
  conversion_rates?: Partial<Record<CurrencyCode, number>>
  time_last_update_utc?: string
}

interface CachedExchangeRates {
  rates: Partial<Record<CurrencyCode, number>>
  updatedAt: string
}

const EMAILJS_SERVICE = 'service_n33g579'
const EMAILJS_TEMPLATE = 'template_qlo9mrg'
const EMAILJS_TEMPLATE2 = 'template_4l65g4a'
const EMAILJS_PUBLIC_KEY = 'picn4x_CNW2nK6hjX'
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ?? 'pk_live_5c7866617f9d4c8ce13dfbf6f6592ee4b3705b15'
const PAYSTACK_VERIFY_API_URL = import.meta.env.VITE_PAYSTACK_VERIFY_API_URL ?? ''
const WHATSAPP = '2348128288948'
const EXCHANGE_RATE_API_URL = 'https://open.er-api.com/v6/latest/NGN'
const EXCHANGE_RATE_CACHE_KEY = 'glamoursphairExchangeRates'

const fallbackCurrencies: Currency[] = [
  { code: 'NGN', symbol: '\u20a6', label: 'Nigeria (NGN)', rate: 1 },
  { code: 'USD', symbol: '$', label: 'United States (USD)', rate: 0.00063 },
  { code: 'GBP', symbol: '\u00a3', label: 'United Kingdom (GBP)', rate: 0.00050 },
]

const deliveryLocations: DeliveryLocation[] = [
  { id: 'uk', label: 'UK', fee: 80000, note: 'Within the United Kingdom' },
  { id: 'usa', label: 'USA', fee: 98000, note: 'Within the United States of America' },
  { id: 'uae', label: 'UAE', fee: 125000, note: 'Anywhere in the United Arab Emirates' },
  { id: 'african-countries', label: 'Other African Countries', fee: 90000, note: 'Any country within Africa asides Nigeria' },
  { id: 'within-nigeria', label: 'Within Nigeria', fee: 10000, note: 'Any state within Nigeria' },
  { id: 'abuja', label: 'Abuja', fee: 4000, note: 'Within Abuja' },
  { id: 'canada', label: 'Canada', fee: 88000, note: 'Within Canada' },
  { id: 'italy', label: 'Italy', fee: 115000, note: 'Within Italy' },
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
  const [currencies, setCurrencies] = useState<Currency[]>(fallbackCurrencies)
  const [currency, setCurrency] = useState<Currency>(fallbackCurrencies[0])
  const [rateStatus, setRateStatus] = useState<'idle' | 'loading' | 'live' | 'cached' | 'fallback'>('idle')
  const [rateUpdatedAt, setRateUpdatedAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'loading' | 'cancelled' | 'failed' | 'unverified'>('idle')
  const [unverifiedReference, setUnverifiedReference] = useState('')
  const [receiptDeliveryStatus, setReceiptDeliveryStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle')
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const dialogRef = useDialogA11y<HTMLDivElement>(open, () => {
    if (!loading) handleClose()
  })

  useEffect(() => {
    if (!open) return

    const applyRates = (rates: Partial<Record<CurrencyCode, number>>, updatedAt: string) => {
      const nextCurrencies = fallbackCurrencies.map(item => ({
        ...item,
        rate: item.code === 'NGN' ? 1 : rates[item.code] ?? item.rate,
      }))

      setCurrencies(nextCurrencies)
      setCurrency(current => nextCurrencies.find(item => item.code === current.code) ?? nextCurrencies[0])
      setRateUpdatedAt(updatedAt)
    }

    const readCachedRates = () => {
      try {
        const cached = localStorage.getItem(EXCHANGE_RATE_CACHE_KEY)
        return cached ? JSON.parse(cached) as CachedExchangeRates : null
      } catch {
        return null
      }
    }

    const controller = new AbortController()

    const loadRates = async () => {
      setRateStatus('loading')

      try {
        const response = await fetch(EXCHANGE_RATE_API_URL, { signal: controller.signal })
        if (!response.ok) throw new Error('Exchange rate request failed')

        const data = await response.json() as ExchangeRatesResponse
        const rates = data.conversion_rates

        if (data.result !== 'success' || !rates?.USD || !rates?.GBP) {
          throw new Error('Exchange rate response was incomplete')
        }

        const updatedAt = data.time_last_update_utc ?? new Date().toUTCString()
        applyRates(rates, updatedAt)
        localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify({ rates, updatedAt }))
        setRateStatus('live')
      } catch {
        if (controller.signal.aborted) return

        const cached = readCachedRates()
        if (cached) {
          applyRates(cached.rates, cached.updatedAt)
          setRateStatus('cached')
          return
        }

        setCurrencies(fallbackCurrencies)
        setCurrency(current => fallbackCurrencies.find(item => item.code === current.code) ?? fallbackCurrencies[0])
        setRateUpdatedAt('')
        setRateStatus('fallback')
      }
    }

    loadRates()
    return () => controller.abort()
  }, [open])

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

  const subtotalDisplay = formatMoney(subtotalNgn, fallbackCurrencies[0])
  const deliveryFeeDisplay = selectedDelivery ? formatMoney(deliveryFeeNgn, fallbackCurrencies[0]) : 'Select location'
  const displayTotal = formatMoney(orderTotalNgn, fallbackCurrencies[0])
  const paystackTotal = formatMoney(orderTotalNgn, currencies[0])
  const estimateTotal = currency.code === 'NGN' ? '' : formatMoney(orderTotalNgn, currency)

  const orderSummary = [
    ...items.map(i => `${i.name} x${i.qty} - ${formatMoney(i.price * i.qty, fallbackCurrencies[0])}`),
    `Subtotal: ${subtotalDisplay}`,
    selectedDelivery ? `Delivery (${selectedDelivery.label}): ${deliveryFeeDisplay}` : 'Delivery: Not selected',
    `Total: ${displayTotal}`,
  ].join('\n')

  const rateMessage = {
    idle: 'Exchange rates will load when checkout opens.',
    loading: 'Loading live exchange rates...',
    live: rateUpdatedAt ? `Live exchange rates loaded. Updated: ${rateUpdatedAt}` : 'Live exchange rates loaded.',
    cached: rateUpdatedAt ? `Using saved exchange rates. Last updated: ${rateUpdatedAt}` : 'Using saved exchange rates.',
    fallback: 'Using backup exchange rates. Card payments still process in NGN.',
  }[rateStatus]

  const handlePayment = async () => {
    if (loading) return

    const trimmedName = name.trim()
    const trimmedEmail = email.trim()
    const trimmedPhone = phone.trim()
    const trimmedAddress = deliveryAddress.trim()

    const nextFieldErrors: Record<string, string> = {}
    if (!trimmedName) nextFieldErrors.name = 'Enter your full name.'
    if (!trimmedEmail) nextFieldErrors.email = 'Enter your email address.'
    else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) nextFieldErrors.email = 'Enter a valid email address.'
    if (!trimmedPhone) nextFieldErrors.phone = 'Enter your phone number.'
    if (!selectedDelivery) nextFieldErrors.deliveryLocation = 'Choose a delivery location.'
    if (!trimmedAddress) nextFieldErrors.deliveryAddress = 'Enter the full delivery address.'

    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors)
      setError('Check the highlighted details before continuing.')
      return
    }

    setFieldErrors({})
    setError('')
    setUnverifiedReference('')
    setLoading(true)
    setPaymentStatus('loading')

    const amount = Math.round(orderTotalNgn * 100)

    try {
      const { default: PaystackPop } = await import('@paystack/inline-js')
      const paystack = new PaystackPop()
      paystack.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: trimmedEmail,
        amount,
        currency: 'NGN',
        reference: `GLAM-${Date.now()}`,
        firstName: trimmedName,
        phone: trimmedPhone,
        metadata: {
          custom_fields: [
            { display_name: 'Customer Name', variable_name: 'customer_name', value: trimmedName },
            { display_name: 'Phone', variable_name: 'phone', value: trimmedPhone },
            { display_name: 'Delivery Location', variable_name: 'delivery_location', value: selectedDelivery!.label },
            { display_name: 'Delivery Address', variable_name: 'delivery_address', value: trimmedAddress },
            { display_name: 'Delivery Fee', variable_name: 'delivery_fee', value: formatMoney(deliveryFeeNgn, fallbackCurrencies[0]) },
            { display_name: 'Order Summary', variable_name: 'order_summary', value: orderSummary },
          ],
        },
        onSuccess: (response) => {
          void (async () => {
            try {
              if (PAYSTACK_VERIFY_API_URL) {
                const verification = await fetch(PAYSTACK_VERIFY_API_URL, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ reference: response.reference, expectedAmount: amount, expectedCurrency: 'NGN' }),
                })
                if (!verification.ok) throw new Error('Payment verification failed')
              }

              setPaymentStatus('idle')
              await handleSuccess(response.reference)
            } catch {
              setPaymentStatus('unverified')
              setUnverifiedReference(response.reference)
              setError(`Payment was completed, but automatic verification is unavailable. Do not pay again. Confirm reference ${response.reference} on WhatsApp.`)
            } finally {
              setLoading(false)
            }
          })()
        },
        onCancel: () => {
          setLoading(false)
          setPaymentStatus('cancelled')
          setError('Payment was cancelled. Your details are still here when you are ready to try again.')
        },
        onError: (paystackError) => {
          setLoading(false)
          setPaymentStatus('failed')
          setError(paystackError.message || 'Payment could not be opened. Please try again or use WhatsApp support.')
        },
      })
    } catch {
      setLoading(false)
      setPaymentStatus('failed')
      setError('Payment could not be opened. Check your connection and try again.')
    }
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
      currency: 'NGN',
      symbol: fallbackCurrencies[0].symbol,
      currencyRate: 1,
      date,
    }

    setReceipt(receiptData)
    setReceiptDeliveryStatus('sending')
    onSuccess()

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
      setReceiptDeliveryStatus('sent')
    } catch (err) {
      console.error('Email receipt failed:', err)
      setReceiptDeliveryStatus('failed')
    }
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
      setReceiptDeliveryStatus('idle')
    }
    setError('')
    setFieldErrors({})
    setPaymentStatus('idle')
    setUnverifiedReference('')
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div aria-hidden="true" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={!receipt && !loading ? handleClose : undefined} />

      {/* Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        tabIndex={-1}
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto border border-white/10 bg-[#0d0d0d] outline-none"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 sticky top-0 bg-[#0d0d0d] z-10">
          <h2 id="checkout-title" className="font-display text-2xl text-white tracking-wide">
            {receipt ? 'Payment Successful' : 'Checkout'}
          </h2>
          {!receipt && (
            <button disabled={loading} onClick={handleClose} className="flex h-10 w-10 items-center justify-center text-neutral-500 transition-colors hover:text-white disabled:opacity-50" aria-label="Close checkout">
              <HiX size={22} />
            </button>
          )}
        </div>

        {receipt ? (
          /* Receipt view */
          <div className="p-6 space-y-6">
            <div aria-live="polite" className="flex flex-col items-center text-center gap-3">
              <HiCheckCircle className="text-emerald-400" size={52} />
              <p className="text-white font-semibold text-lg">Thank you, {receipt.name}!</p>
              {receiptDeliveryStatus === 'sending' && <p className="text-sm text-neutral-400">Preparing your email receipt...</p>}
              {receiptDeliveryStatus === 'sent' && (
                <p className="text-sm text-neutral-400">
                  A receipt has been sent to <span className="text-[#c9a84c]">{receipt.email}</span>
                </p>
              )}
              {receiptDeliveryStatus === 'failed' && (
                <p className="text-sm leading-relaxed text-amber-300">
                  Payment was received, but the email receipt could not be sent. Keep your reference below and confirm on WhatsApp.
                </p>
              )}
            </div>

            {/* Receipt box */}
            <div data-receipt className="border border-[#c9a84c]/20 p-5 space-y-4">
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
                <p>GLAMOURSPHAIR Abuja studio</p>
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
          <form
            noValidate
            onSubmit={event => {
              event.preventDefault()
              void handlePayment()
            }}
            className="space-y-6 p-6"
          >

            {/* Order summary */}
            <div>
              <h3 className="text-neutral-400 text-xs uppercase tracking-widest mb-3">Order Summary</h3>
              <div className="space-y-2">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between gap-3 text-sm">
                    <span className="min-w-0 text-neutral-300">
                      <span className="block">{item.name} x {item.qty}</span>
                      {(item.length || item.fitting) && <span className="block text-xs text-neutral-600">{[item.length, item.fitting].filter(Boolean).join(' / ')}</span>}
                    </span>
                    <span className="whitespace-nowrap text-white">{formatMoney(item.price * item.qty, fallbackCurrencies[0])}</span>
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
                <span className="text-xs uppercase tracking-widest text-neutral-400">Total payable in NGN</span>
                <span className="text-xl font-bold text-[#c9a84c]">{displayTotal}</span>
              </div>
              {estimateTotal && <p className="mt-2 text-right text-xs text-neutral-500">Estimated total: {estimateTotal}</p>}
            </div>

            {/* Currency selector */}
            <fieldset>
              <legend className="mb-2 block text-xs uppercase tracking-widest text-neutral-400">
                View an estimated total
              </legend>
              <div className="grid grid-cols-3 gap-2">
                {currencies.map(c => (
                  <button
                    type="button"
                    key={c.code}
                    onClick={() => setCurrency(c)}
                    aria-pressed={currency.code === c.code}
                    className={`min-h-11 border py-2.5 text-sm font-semibold transition-colors ${
                      currency.code === c.code
                        ? 'border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]'
                        : 'border-white/10 text-neutral-400 hover:border-white/30'
                    }`}
                  >
                    {c.symbol} {c.code}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500">
                You will always pay the NGN total shown above. USD and GBP are estimates for comparison only.
              </p>
              <p role="status" aria-live="polite" className="text-neutral-600 text-xs mt-1">{rateMessage}</p>
              <a
                href="https://www.exchangerate-api.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-[11px] text-neutral-700 hover:text-[#c9a84c] transition-colors"
              >
                Rates by Exchange Rate API
              </a>
            </fieldset>

            {/* Delivery details */}
            <div className="space-y-3">
              <h3 className="text-neutral-400 text-xs uppercase tracking-widest">Delivery Location</h3>
              <label htmlFor="delivery-location" className="block text-sm font-medium text-neutral-300">Delivery area</label>
              <select
                id="delivery-location"
                name="delivery-location"
                value={deliveryLocationId}
                onChange={e => {
                  setDeliveryLocationId(e.target.value)
                  setFieldErrors(current => ({ ...current, deliveryLocation: '' }))
                }}
                aria-invalid={Boolean(fieldErrors.deliveryLocation)}
                aria-describedby={fieldErrors.deliveryLocation ? 'delivery-location-error' : undefined}
                className="w-full border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition-colors focus:border-[#c9a84c]/50 aria-[invalid=true]:border-red-400"
              >
                <option value="">Choose delivery area</option>
                {deliveryLocations.map(location => (
                  <option key={location.id} value={location.id}>
                    {location.label} - {formatMoney(location.fee, fallbackCurrencies[0])}
                  </option>
                ))}
              </select>
              {fieldErrors.deliveryLocation && <p id="delivery-location-error" className="text-xs text-red-400">{fieldErrors.deliveryLocation}</p>}
              {selectedDelivery && (
                <p className="text-neutral-600 text-xs">{selectedDelivery.note}</p>
              )}
              <label htmlFor="delivery-address" className="block text-sm font-medium text-neutral-300">Full delivery address</label>
              <textarea
                id="delivery-address"
                name="street-address"
                placeholder="Full delivery address"
                value={deliveryAddress}
                onChange={e => {
                  setDeliveryAddress(e.target.value)
                  setFieldErrors(current => ({ ...current, deliveryAddress: '' }))
                }}
                autoComplete="street-address"
                aria-invalid={Boolean(fieldErrors.deliveryAddress)}
                aria-describedby={fieldErrors.deliveryAddress ? 'delivery-address-error' : undefined}
                rows={3}
                className="w-full resize-none border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#c9a84c]/50 aria-[invalid=true]:border-red-400"
              />
              {fieldErrors.deliveryAddress && <p id="delivery-address-error" className="text-xs text-red-400">{fieldErrors.deliveryAddress}</p>}
            </div>

            {/* Customer details */}
            <div className="space-y-3">
              <h3 className="text-neutral-400 text-xs uppercase tracking-widest">Your Details</h3>
              <label htmlFor="checkout-name" className="block text-sm font-medium text-neutral-300">Full name</label>
              <input
                id="checkout-name"
                name="name"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  setFieldErrors(current => ({ ...current, name: '' }))
                }}
                autoComplete="name"
                aria-invalid={Boolean(fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'checkout-name-error' : undefined}
                className="w-full border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#c9a84c]/50 aria-[invalid=true]:border-red-400"
              />
              {fieldErrors.name && <p id="checkout-name-error" className="text-xs text-red-400">{fieldErrors.name}</p>}
              <label htmlFor="checkout-email" className="block text-sm font-medium text-neutral-300">Email address</label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                placeholder="Email Address (receipt will be sent here)"
                value={email}
                onChange={e => {
                  setEmail(e.target.value)
                  setFieldErrors(current => ({ ...current, email: '' }))
                }}
                autoComplete="email"
                inputMode="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? 'checkout-email-error' : undefined}
                className="w-full border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#c9a84c]/50 aria-[invalid=true]:border-red-400"
              />
              {fieldErrors.email && <p id="checkout-email-error" className="text-xs text-red-400">{fieldErrors.email}</p>}
              <label htmlFor="checkout-phone" className="block text-sm font-medium text-neutral-300">Phone number</label>
              <input
                id="checkout-phone"
                name="tel"
                type="tel"
                placeholder="Phone Number"
                value={phone}
                onChange={e => {
                  setPhone(e.target.value)
                  setFieldErrors(current => ({ ...current, phone: '' }))
                }}
                autoComplete="tel"
                inputMode="tel"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? 'checkout-phone-error' : undefined}
                className="w-full border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#c9a84c]/50 aria-[invalid=true]:border-red-400"
              />
              {fieldErrors.phone && <p id="checkout-phone-error" className="text-xs text-red-400">{fieldErrors.phone}</p>}
            </div>

            {error && <p role="alert" className="border border-red-400/20 bg-red-400/5 p-3 text-sm leading-relaxed text-red-300">{error}</p>}

            {unverifiedReference && (
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hello GLAMOURSPHAIR! I completed a payment that needs confirmation. Reference: ${unverifiedReference}. Total: ${displayTotal}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-12 w-full items-center justify-center gap-2 border border-[#25D366]/35 px-4 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/10"
              >
                <FaWhatsapp size={18} /> Confirm payment reference
              </a>
            )}

            <button
              type="submit"
              disabled={loading || items.length === 0 || paymentStatus === 'unverified'}
              className="w-full py-4 bg-[#c9a84c] text-black font-bold tracking-[0.2em] text-sm uppercase hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? 'Opening secure payment...'
                : paymentStatus === 'unverified'
                  ? 'Payment confirmation needed'
                  : paymentStatus === 'failed' || paymentStatus === 'cancelled'
                    ? `Retry ${paystackTotal}`
                    : `Pay ${paystackTotal}`}
            </button>

            <p className="text-center text-neutral-600 text-xs">
              Secured by Paystack - Accepts cards worldwide
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
