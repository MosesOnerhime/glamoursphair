import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { HiArrowLeft, HiCheckCircle, HiLockClosed, HiPrinter, HiX } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import { useDialogA11y } from '../hooks/useDialogA11y'
import { deliveryLocations } from '../lib/deliveryLocations.js'
import { openSaleGateway } from '../lib/salePayment'
import {
  initializeSalePayment, koboMoney, money, readSalePayment, SALE_PAYMENT_KEY, verifySalePayment,
} from '../lib/salesClient'
import type { SaleBagItem, SaleCustomer, SalePaymentSession, SaleQuote, SaleShipping, SaleSnapshot, SaleVerification } from '../lib/salesClient'

interface Props {
  open: boolean
  onClose: () => void
  items: SaleBagItem[]
  snapshot: SaleSnapshot | null
  onPaid: (items: SaleQuote['items']) => void
  onRefresh: () => void
}
const emptyShipping: SaleShipping = { countryCode: 'NG', countryName: '', address: '', city: '', state: '', deliveryLocationId: '', deliveryNote: '', isGift: false, recipientName: '', recipientPhone: '' }
const countries = [...new Map(deliveryLocations.map(item => [item.countryCode, item.country])).entries()].sort(([a], [b]) => a === 'NG' ? -1 : b === 'NG' ? 1 : a.localeCompare(b))

function Field({ name, label, error, children }: { name: string; label: string; error?: string; children: ReactNode }) {
  return <div className="sale-field"><label htmlFor={`sale-${name}`}>{label}</label>{children}{error && <p id={`sale-${name}-error`} className="sale-field-error">{error}</p>}</div>
}

export default function SaleCheckout({ open, onClose, items, snapshot, onPaid, onRefresh }: Props) {
  const [step, setStep] = useState<'shipping' | 'pay'>('shipping')
  const [shipping, setShipping] = useState<SaleShipping>(emptyShipping)
  const [customer, setCustomer] = useState<SaleCustomer>({ name: '', email: '', phone: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [pending, setPending] = useState<SalePaymentSession | null>(readSalePayment)
  const [receipt, setReceipt] = useState<SaleVerification['order'] | null>(null)
  const [status, setStatus] = useState<'idle' | 'opening' | 'paying' | 'checking' | 'cancelled' | 'failed' | 'unverified'>('idle')
  const busy = useRef(false)
  const checking = useRef(false)
  const completed = useRef(new Set<string>())
  const active = snapshot?.phase === 'active'
  const gatewayOpen = status === 'opening' || status === 'paying'
  const dialogRef = useDialogA11y<HTMLDivElement>(open, close, gatewayOpen)
  const region = deliveryLocations.find(item => item.id === shipping.deliveryLocationId)
  const offers = new Map(snapshot?.products.map(product => [product.id, product]))
  const subtotal = items.reduce((sum, item) => sum + (offers.get(item.id)?.price ?? 0) * item.qty, 0)
  const savings = items.reduce((sum, item) => { const product = offers.get(item.id); return sum + (product ? product.regularPrice - product.price : 0) * item.qty }, 0)
  const totalKobo = Math.round((subtotal + (region?.fee ?? 0)) * 100)
  const canPay = active && snapshot?.paymentReady && items.length > 0 && items.every(item => offers.has(item.id))
  const isBusy = status === 'opening' || status === 'paying' || status === 'checking'

  function close() {
    if (busy.current) return
    if (receipt) {
      setReceipt(null); setStep('shipping'); setCustomer({ name: '', email: '', phone: '' }); setShipping(emptyShipping)
      setErrors({}); setError('')
    }
    onClose()
  }
  function focusCheckout() {
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])')?.focus())
  }

  function updateShipping<K extends keyof SaleShipping>(key: K, value: SaleShipping[K]) {
    setShipping(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: '' }))
  }
  function updateCustomer(key: keyof SaleCustomer, value: string) {
    setCustomer(current => ({ ...current, [key]: value }))
    setErrors(current => ({ ...current, [key]: '' }))
  }
  const inputProps = (name: string) => ({ id: `sale-${name}`, 'aria-invalid': Boolean(errors[name]), 'aria-describedby': errors[name] ? `sale-${name}-error` : undefined })

  function report(next: Record<string, string>) {
    setErrors(next)
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
  }
  function continueToPay(event: FormEvent) {
    event.preventDefault()
    const next: Record<string, string> = {}
    for (const [key, label] of [['address', 'full address'], ['city', 'city'], ['state', 'state or region']] as const) {
      if (!shipping[key].trim()) next[key] = `Enter your ${label}.`
    }
    if (!region || region.countryCode !== shipping.countryCode) next.deliveryLocationId = 'Choose a delivery region.'
    if (shipping.countryCode === 'AFRICA' && !shipping.countryName.trim()) next.countryName = 'Enter the destination country.'
    if (shipping.isGift) {
      if (!shipping.recipientName.trim()) next.recipientName = 'Enter the recipient name.'
      if (shipping.recipientPhone.replace(/\D/g, '').length < 7) next.recipientPhone = 'Enter a valid recipient phone number.'
    }
    report(next)
    if (Object.keys(next).length) return
    setStep('pay'); setError('')
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('#sale-name')?.focus())
  }

  function persist(session: SalePaymentSession | null) {
    setPending(session)
    try { if (session) sessionStorage.setItem(SALE_PAYMENT_KEY, JSON.stringify(session)); else sessionStorage.removeItem(SALE_PAYMENT_KEY) } catch { /* The current payment session remains in memory. */ }
  }

  async function checkPayment(session: SalePaymentSession) {
    if (checking.current) return
    checking.current = true
    busy.current = true; setStatus('checking'); setError('')
    try {
      const result = await verifySalePayment(session)
      if (!result.verified || !result.order) {
        setStatus('unverified')
        setError('Payment is not confirmed yet. Resume this same session or check again. Do not start another payment for this order.')
        return
      }
      setReceipt(result.order); setStatus('idle'); persist(null)
      if (!completed.current.has(result.reference)) { completed.current.add(result.reference); onPaid(result.order.quote.items) }
    } catch (failure) {
      setStatus('unverified')
      setError(failure instanceof Error ? failure.message : 'Payment could not be confirmed. Keep your reference and do not pay again.')
    } finally { busy.current = false; checking.current = false; focusCheckout() }
  }

  async function resume(session: SalePaymentSession) {
    setStatus('opening'); setError(''); busy.current = true
    try {
      await openSaleGateway(session.accessCode, {
        onLoad: () => setStatus('paying'),
        onSuccess: response => {
          busy.current = false
          if (response.reference !== session.reference) { setStatus('unverified'); setError('Payment reference needs confirmation. Do not pay again.'); focusCheckout(); return }
          void checkPayment(session)
        },
        onCancel: () => { busy.current = false; setStatus('cancelled'); setError('Payment was closed. Your bag and payment session are saved; you can resume when ready.'); focusCheckout() },
        onError: () => { busy.current = false; setStatus('failed'); setError('The Paystack window could not open. Resume this session or use the secure payment link below.'); focusCheckout() },
      })
    } catch {
      busy.current = false; setStatus('failed'); setError('Paystack could not open. Your payment session is saved; use the secure payment link or try again.')
      focusCheckout()
    }
  }

  async function pay(event: FormEvent) {
    event.preventDefault()
    if (busy.current || !canPay) return
    const next: Record<string, string> = {}
    if (!customer.name.trim()) next.name = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email.trim())) next.email = 'Enter a valid email address.'
    if (customer.phone.replace(/\D/g, '').length < 7) next.phone = 'Enter a valid phone number.'
    report(next)
    if (Object.keys(next).length) return
    busy.current = true; setStatus('opening'); setError('')
    try {
      const session = await initializeSalePayment(items, customer, shipping, totalKobo)
      persist(session)
      await resume(session)
    } catch (failure) {
      busy.current = false; setStatus('failed')
      setError(failure instanceof Error ? failure.message : 'Payment could not be opened. Please try again.')
      onRefresh()
    }
  }

  const orderSummary = (quote: SaleQuote) => <dl className="sale-totals">
    <div><dt>Items</dt><dd>{koboMoney(quote.subtotalKobo)}</dd></div>
    {quote.savingsKobo > 0 && <div className="sale-savings"><dt>Christmas savings</dt><dd>{koboMoney(quote.savingsKobo)}</dd></div>}
    <div><dt>Delivery · {quote.deliveryLabel}</dt><dd>{koboMoney(quote.deliveryFeeKobo)}</dd></div>
    <div className="sale-grand-total"><dt>Total</dt><dd>{koboMoney(quote.totalKobo)}</dd></div>
  </dl>
  const support = pending ? `https://wa.me/2348128288948?text=${encodeURIComponent(`Hello GLAMOURSPHAIR, please help confirm my Christmas sale payment. Reference: ${pending.reference}. Total: ${koboMoney(pending.quote.totalKobo)}.`)}` : ''

  if (!open) return null
  return <div className="sale-dialog-backdrop">
    <div className="sale-dialog-scrim" aria-hidden="true" onClick={close} />
    <div ref={dialogRef} className="sale-checkout sale-dialog" role="dialog" aria-modal="true" aria-labelledby="sale-checkout-title" tabIndex={-1}>
      <header className="sale-dialog-header"><div><span className="sale-eyebrow">GLAMOURSPHAIR</span><h2 id="sale-checkout-title">{receipt ? 'Payment confirmed' : 'Christmas Sales'}</h2></div><button className="sale-icon" type="button" onClick={close} disabled={isBusy} aria-label="Close sale checkout" title="Close checkout"><HiX size={23} /></button></header>
      {receipt ? <div className="sale-receipt">
        <HiCheckCircle size={44} aria-hidden="true" /><h3>Thank you, {receipt.customer.name}.</h3><p role="status">Your Paystack payment is verified.</p>
        <p className="sale-reference">{receipt.reference}</p>
        <ul className="sale-review-items">{receipt.quote.items.map(item => <li key={item.id}><span>{item.name} × {item.qty}</span><strong>{koboMoney(item.lineKobo)}</strong></li>)}</ul>
        {orderSummary(receipt.quote)}<address>{receipt.shipping.isGift ? receipt.shipping.recipientName : receipt.customer.name}<br />{receipt.shipping.address}<br />{receipt.shipping.city}, {receipt.shipping.state}<br />{receipt.shipping.country}</address>
        <div className="sale-receipt-actions"><button type="button" className="sale-button secondary" onClick={() => window.print()}><HiPrinter /> Print receipt</button><a className="sale-button" href={`https://wa.me/2348128288948?text=${encodeURIComponent(`Hello GLAMOURSPHAIR, my Christmas sale payment is verified. Reference: ${receipt.reference}. Total: ${koboMoney(receipt.quote.totalKobo)}. Please confirm delivery.`)}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> Confirm delivery</a></div>
        <button type="button" className="sale-text-button" onClick={close}>Continue shopping</button>
      </div> : pending ? <div className="sale-payment-recovery">
        <HiLockClosed size={30} aria-hidden="true" /><h3>Your payment session</h3><p className="sale-reference">{pending.reference}</p>
        <ul className="sale-review-items">{pending.quote.items.map(item => <li key={item.id}><span>{item.name} × {item.qty}</span><strong>{koboMoney(item.lineKobo)}</strong></li>)}</ul>
        {orderSummary(pending.quote)}{error && <p className="sale-notice error" role="alert">{error}</p>}
        <button type="button" className="sale-button" disabled={isBusy} onClick={() => void checkPayment(pending)}>{status === 'checking' ? 'Checking Paystack…' : 'Check payment status'}</button>
        <button type="button" className="sale-button secondary" disabled={isBusy} onClick={() => void resume(pending)}>{status === 'opening' || status === 'paying' ? 'Opening Paystack…' : 'Resume this payment'}</button>
        {(status === 'failed' || status === 'cancelled' || status === 'unverified') && <a href={pending.authorizationUrl} className="sale-text-button" rel="noreferrer">Open secure Paystack payment</a>}
        <a href={support} target="_blank" rel="noopener noreferrer" className="sale-text-button"><FaWhatsapp /> Get help with this reference</a>
      </div> : <>
        <ol className="sale-steps" aria-label="Checkout progress"><li aria-current={step === 'shipping' ? 'step' : undefined}><span>1</span> Shipping</li><li aria-current={step === 'pay' ? 'step' : undefined}><span>2</span> Pay</li></ol>
        {!active && <p className="sale-notice" role="status">{snapshot?.phase === 'ended' ? 'The Christmas sale has ended.' : 'Sale checkout opens on 9 November, Nigeria time.'}</p>}
        {active && !snapshot?.paymentReady && <p className="sale-notice error" role="alert">Secure checkout is temporarily unavailable. Contact our WhatsApp team before paying.</p>}
        {step === 'shipping' ? <form className="sale-checkout-form" noValidate onSubmit={continueToPay}>
          <label className="sale-checkbox"><input type="checkbox" checked={shipping.isGift} onChange={event => updateShipping('isGift', event.target.checked)} /> Is this a gift?</label>
          {shipping.isGift && <fieldset className="sale-gift-fields"><legend>Recipient details</legend><Field name="recipientName" label="Recipient name" error={errors.recipientName}><input {...inputProps('recipientName')} autoComplete="shipping name" maxLength={120} value={shipping.recipientName} onChange={event => updateShipping('recipientName', event.target.value)} /></Field><Field name="recipientPhone" label="Recipient phone" error={errors.recipientPhone}><input {...inputProps('recipientPhone')} type="tel" autoComplete="shipping tel" maxLength={40} value={shipping.recipientPhone} onChange={event => updateShipping('recipientPhone', event.target.value)} /></Field></fieldset>}
          <h3>Delivery address</h3>
          <Field name="address" label="Full address" error={errors.address}><input {...inputProps('address')} autoComplete="shipping street-address" maxLength={300} value={shipping.address} onChange={event => updateShipping('address', event.target.value)} /></Field>
          <div className="sale-field-row"><Field name="city" label="City" error={errors.city}><input {...inputProps('city')} autoComplete="shipping address-level2" maxLength={100} value={shipping.city} onChange={event => updateShipping('city', event.target.value)} /></Field><Field name="state" label="State / region" error={errors.state}><input {...inputProps('state')} autoComplete="shipping address-level1" maxLength={100} value={shipping.state} onChange={event => updateShipping('state', event.target.value)} /></Field></div>
          <Field name="countryCode" label="Country"><select {...inputProps('countryCode')} autoComplete="shipping country" value={shipping.countryCode} onChange={event => setShipping(current => ({ ...current, countryCode: event.target.value, deliveryLocationId: '' }))}>{countries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></Field>
          {shipping.countryCode === 'AFRICA' && <Field name="countryName" label="Destination country" error={errors.countryName}><input {...inputProps('countryName')} maxLength={100} value={shipping.countryName} onChange={event => updateShipping('countryName', event.target.value)} /></Field>}
          <Field name="deliveryNote" label="Delivery note (optional)"><textarea {...inputProps('deliveryNote')} rows={2} maxLength={500} value={shipping.deliveryNote} onChange={event => updateShipping('deliveryNote', event.target.value)} /></Field>
          <Field name="deliveryLocationId" label="Shipping region" error={errors.deliveryLocationId}><select {...inputProps('deliveryLocationId')} value={shipping.deliveryLocationId} onChange={event => updateShipping('deliveryLocationId', event.target.value)}><option value="">Select a shipping region</option>{deliveryLocations.filter(item => item.countryCode === shipping.countryCode).map(item => <option key={item.id} value={item.id}>{item.label} — {money(item.fee)}</option>)}</select></Field>
          <div className="sale-shipping-total"><span>Items {money(subtotal)}</span><strong>{region ? `Delivery ${money(region.fee)}` : 'Choose delivery region'}</strong></div>
          <button type="submit" className="sale-button">Continue to pay</button><button type="button" className="sale-text-button" onClick={onClose}><HiArrowLeft /> Back to sale</button>
        </form> : <form className="sale-checkout-form" noValidate onSubmit={event => void pay(event)}>
          <div className="sale-address-review"><p>{shipping.isGift ? shipping.recipientName : 'Deliver to'}</p><address>{shipping.address}, {shipping.city}, {shipping.state}<br />{shipping.countryCode === 'AFRICA' ? shipping.countryName : region?.country}</address><button type="button" className="sale-text-button" onClick={() => setStep('shipping')}>Edit shipping</button></div>
          <Field name="name" label="Your full name" error={errors.name}><input {...inputProps('name')} autoComplete="billing name" maxLength={120} value={customer.name} onChange={event => updateCustomer('name', event.target.value)} /></Field>
          <Field name="email" label="Email address" error={errors.email}><input {...inputProps('email')} type="email" autoComplete="email" maxLength={200} value={customer.email} onChange={event => updateCustomer('email', event.target.value)} /></Field>
          <Field name="phone" label="Phone number" error={errors.phone}><input {...inputProps('phone')} type="tel" autoComplete="tel" maxLength={40} value={customer.phone} onChange={event => updateCustomer('phone', event.target.value)} /></Field>
          <ul className="sale-review-items">{items.map(item => <li key={item.id}><span>{offers.get(item.id)?.name ?? 'Unavailable item'} × {item.qty}</span><strong>{money((offers.get(item.id)?.price ?? 0) * item.qty)}</strong></li>)}</ul>
          <dl className="sale-totals"><div><dt>Sale subtotal</dt><dd>{money(subtotal)}</dd></div>{savings > 0 && <div className="sale-savings"><dt>You save</dt><dd>{money(savings)}</dd></div>}<div><dt>Delivery · {region?.label}</dt><dd>{money(region?.fee ?? 0)}</dd></div><div className="sale-grand-total"><dt>Total payable</dt><dd>{koboMoney(totalKobo)}</dd></div></dl>
          {error && <p className="sale-notice error" role="alert">{error}</p>}
          <button type="submit" className="sale-button" disabled={!canPay || isBusy}><HiLockClosed />{isBusy ? 'Opening Paystack…' : `Pay ${koboMoney(totalKobo)}`}</button>
          <p className="sale-payment-note">Secure Paystack checkout. Your payment is charged in NGN.</p>
          <button type="button" className="sale-text-button" disabled={isBusy} onClick={() => setStep('shipping')}><HiArrowLeft /> Back to shipping</button>
        </form>}
      </>}
    </div>
  </div>
}
