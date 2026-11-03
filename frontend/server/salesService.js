import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto'
import { NOVEMBER_SALE, salePhase, salePrices, saleProducts } from '../src/lib/novemberSale.js'
import { deliveryLocations } from '../src/lib/deliveryLocations.js'

export class SaleError extends Error {
  constructor(message, status = 400, details = {}) { super(message); this.status = status; this.details = details }
}

export function salePaymentKeyAllowed() {
  const key = process.env.PAYSTACK_SECRET_KEY || ''
  return /^sk_(live|test)_\S+$/.test(key) && (process.env.VERCEL_ENV !== 'production' || key.startsWith('sk_live_'))
}

export async function checkSalePaymentReady(request) {
  if (!salePaymentKeyAllowed()) return false
  try {
    // Authenticated read only: no transaction, customer or charge is created.
    const response = await request('https://api.paystack.co/integration/payment_session_timeout', {
      method: 'GET', headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      signal: AbortSignal.timeout(4000),
    })
    const payload = await response.json().catch(() => null)
    return response.ok && payload?.status === true && Number.isFinite(payload.data?.payment_session_timeout)
  } catch { return false }
}

function text(value, label, limit = 200, required = true) {
  if (typeof value !== 'string' || value.trim().length > limit || (required && !value.trim())) {
    throw new SaleError(`${label} is invalid.`)
  }
  return value.trim()
}

export function validateDetails(body) {
  const customer = {
    name: text(body.customer?.name, 'Customer name', 120),
    email: text(body.customer?.email, 'Email', 200),
    phone: text(body.customer?.phone, 'Phone', 40),
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw new SaleError('Enter a valid email address.')
  if (customer.phone.replace(/\D/g, '').length < 7) throw new SaleError('Enter a valid phone number.')
  const location = deliveryLocations.find(item => item.id === body.shipping?.deliveryLocationId)
  if (!location || body.shipping?.countryCode !== location.countryCode) throw new SaleError('Choose a matching country and delivery region.')
  const shipping = {
    deliveryLocationId: location.id, countryCode: location.countryCode, country: location.country,
    address: text(body.shipping?.address, 'Delivery address', 300),
    city: text(body.shipping?.city, 'City', 100),
    state: text(body.shipping?.state, 'State or region', 100),
    deliveryNote: text(body.shipping?.deliveryNote ?? '', 'Delivery note', 500, false),
    isGift: body.shipping?.isGift === true,
  }
  if (location.countryCode === 'AFRICA') shipping.country = text(body.shipping?.countryName, 'Country name', 100)
  if (shipping.isGift) {
    shipping.recipientName = text(body.shipping?.recipientName, 'Recipient name', 120)
    shipping.recipientPhone = text(body.shipping?.recipientPhone, 'Recipient phone', 40)
    if (shipping.recipientPhone.replace(/\D/g, '').length < 7) throw new SaleError('Enter a valid recipient phone number.')
  }
  return { customer, shipping, location }
}

export function quoteSale(items, products, locationId) {
  if (!Array.isArray(items) || !items.length || items.length > 20 || new Set(items.map(item => item?.id)).size !== items.length) {
    throw new SaleError('Your sale bag is invalid. Review it before continuing.')
  }
  const location = deliveryLocations.find(item => item.id === locationId)
  if (!location) throw new SaleError('Choose a delivery region.')
  const offers = new Map(saleProducts(products).map(product => [product.id, product]))
  const lines = items.map(item => {
    if (!Number.isSafeInteger(item?.id) || !Number.isInteger(item?.qty) || item.qty < 1 || item.qty > 20) throw new SaleError('Product quantities must be between 1 and 20.')
    const product = offers.get(item.id)
    if (!product) throw new SaleError('An item is no longer in this sale. Refresh your bag.', 409)
    const prices = salePrices(product.regularPrice)
    return { id: product.id, name: product.name, slug: product.slug, image: product.images?.[0] || product.image,
      qty: item.qty, regularKobo: prices.regularKobo, unitKobo: prices.saleKobo, lineKobo: prices.saleKobo * item.qty }
  })
  const subtotalKobo = lines.reduce((sum, item) => sum + item.lineKobo, 0)
  const savingsKobo = lines.reduce((sum, item) => sum + (item.regularKobo - item.unitKobo) * item.qty, 0)
  const deliveryFeeKobo = Math.round(location.fee * 100)
  const totalKobo = subtotalKobo + deliveryFeeKobo
  if (!Number.isSafeInteger(totalKobo) || totalKobo <= 0) throw new SaleError('The order total is invalid.')
  return { currency: 'NGN', items: lines, subtotalKobo, savingsKobo, deliveryFeeKobo, totalKobo, deliveryLabel: location.label }
}

export async function readSaleInventory(request) {
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new SaleError('Shared inventory is temporarily unavailable.', 503)
  const response = await request(`${SUPABASE_URL}/rest/v1/products?select=*&order=sort_order.asc.nullslast,id.asc`, {
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new SaleError('Shared inventory is temporarily unavailable. Please try again.', 503)
  const rows = await response.json()
  if (!Array.isArray(rows)) throw new SaleError('Shared inventory is temporarily unavailable.', 503)
  return rows.filter(row => !row.is_deleted && row.show_in_catalog !== false).map(row => ({
    id: row.id, name: row.name, slug: row.slug || String(row.id), price: row.price,
    description: row.description, image: row.image || undefined, images: row.images || undefined,
    source: row.source || undefined, length: row.length || undefined, fitting: row.fitting || undefined,
    volume: row.volume || undefined, group: row.collection || undefined,
    gradient: row.gradient || 'from-neutral-950 to-stone-900',
  }))
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]))
  return value
}
export const signOrder = (order, secret) => createHmac('sha256', secret).update(JSON.stringify(canonical(order))).digest('hex')
export const verificationToken = (reference, secret) => createHmac('sha256', secret).update(`sale-verification:${reference}`).digest('hex')
export function sameSignature(received, expected) {
  if (typeof received !== 'string' || received.length !== expected.length) return false
  const actual = Buffer.from(received)
  const wanted = Buffer.from(expected)
  return actual.length === wanted.length && timingSafeEqual(actual, wanted)
}

async function paystack(path, init, request) {
  const response = await request(`https://api.paystack.co/transaction/${path}`, {
    ...init, headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok || payload?.status !== true || !payload.data) throw new SaleError('Paystack could not complete this request. Please try again.', 502)
  return payload.data
}

export async function initializeSale(body, products, now, request) {
  if (salePhase(now) !== 'active') throw new SaleError('November sale checkout is available only from 9 to 15 November, Nigeria time.', 409)
  const { customer, shipping, location } = validateDetails(body)
  const quote = quoteSale(body.items, products, location.id)
  if (!Number.isSafeInteger(body.expectedAmountKobo) || body.expectedAmountKobo !== quote.totalKobo) {
    throw new SaleError('Prices or delivery fees changed. Review the updated total before payment.', 409, { quote })
  }
  const reference = `GLAM-NOV-${randomUUID()}`
  const order = { campaignId: NOVEMBER_SALE.id, reference, createdAt: new Date(now).toISOString(), customer, shipping, quote }
  const signature = signOrder(order, process.env.PAYSTACK_SECRET_KEY)
  const data = await paystack('initialize', { method: 'POST', body: JSON.stringify({
    email: customer.email, amount: quote.totalKobo, currency: 'NGN', reference,
    callback_url: 'https://www.glamoursphairluxury.com/sales?payment=return',
    metadata: { glamoursphairSale: { order, signature }, custom_fields: [
      { display_name: 'Campaign', variable_name: 'campaign', value: 'November Sales: 9-15 November 2026' },
      { display_name: 'Customer', variable_name: 'customer', value: `${customer.name} / ${customer.phone}` },
      { display_name: 'Delivery', variable_name: 'delivery', value: `${shipping.address}, ${shipping.city}, ${shipping.state}, ${shipping.country}` },
      { display_name: 'Gift recipient', variable_name: 'gift_recipient', value: shipping.isGift ? `${shipping.recipientName} / ${shipping.recipientPhone}` : 'Not a gift' },
      { display_name: 'Delivery note', variable_name: 'delivery_note', value: shipping.deliveryNote || '-' },
      { display_name: 'Items', variable_name: 'order_items', value: quote.items.map(item => `${item.name} x${item.qty} (NGN ${item.unitKobo / 100})`).join('; ') },
    ] },
  }) }, request)
  if (data.reference !== reference || typeof data.access_code !== 'string' || !/^https:\/\/checkout\.paystack\.com\//.test(data.authorization_url || '')) {
    throw new SaleError('Paystack returned an invalid payment session. Please try again.', 502)
  }
  return { reference, accessCode: data.access_code, authorizationUrl: data.authorization_url,
    verificationToken: verificationToken(reference, process.env.PAYSTACK_SECRET_KEY), quote }
}

export async function verifySale(body, request) {
  if (typeof body.reference !== 'string' || !/^GLAM-NOV-[a-f0-9-]{36}$/.test(body.reference)) throw new SaleError('Payment reference is invalid.')
  if (!sameSignature(body.verificationToken, verificationToken(body.reference, process.env.PAYSTACK_SECRET_KEY))) throw new SaleError('Payment confirmation could not be authenticated.', 403)
  const transaction = await paystack(`verify/${encodeURIComponent(body.reference)}`, { method: 'GET' }, request)
  if (transaction.status !== 'success') return { verified: false, status: transaction.status || 'pending', reference: body.reference }
  let metadata = transaction.metadata
  if (typeof metadata === 'string') { try { metadata = JSON.parse(metadata) } catch { metadata = null } }
  const { order, signature } = metadata?.glamoursphairSale || {}
  if (!order || !sameSignature(signature, signOrder(order, process.env.PAYSTACK_SECRET_KEY)) ||
    order.campaignId !== NOVEMBER_SALE.id || order.reference !== body.reference || salePhase(order.createdAt) !== 'active' ||
    transaction.reference !== body.reference || transaction.currency !== 'NGN' || transaction.amount !== order.quote?.totalKobo ||
    transaction.customer?.email?.toLowerCase() !== order.customer?.email?.toLowerCase()) {
    throw new SaleError('Paid transaction details do not match this sale order. Contact WhatsApp support with the reference; do not pay again.', 409)
  }
  // Valid payments remain verifiable after the campaign closes or product prices change.
  return { verified: true, status: 'success', reference: body.reference, order }
}
