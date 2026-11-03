import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createSalesHandler } from '../api/sales.js'
import { NOVEMBER_SALE, salePhase, salePrices, saleProducts } from '../src/lib/novemberSale.js'
import { quoteSale, sameSignature, signOrder, verificationToken } from '../server/salesService.js'
import { deliveryLocations } from '../src/lib/deliveryLocations.js'

process.env.SUPABASE_URL = 'https://inventory.test.invalid'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-fake-supabase-key'
process.env.PAYSTACK_SECRET_KEY = 'sk_test_local_fake_key_no_real_payments'
const secret = process.env.PAYSTACK_SECRET_KEY
const rows = [
  { id: 11, name: 'Signature Straight 22"', slug: 'signature-straight-22', price: 650000, original_price: 850000, description: 'Verified catalogue description', images: ['/images/11a.jpeg', '/images/11b.jpeg'], show_in_catalog: true },
  { id: 112, name: 'SDD Luxury Bone Straight 18" 5 by 5', slug: 'sdd-luxury-bone-straight-18-13x4', price: 345000, description: 'Verified catalogue description', image: '/images/SDD luxury bone straight length 18 volume 330 fitting 13 by 4.jpeg', show_in_catalog: true },
]
const catalogue = rows.map(row => ({ ...row, images: row.images, showInCatalog: row.show_in_catalog }))
const validBody = () => ({ action: 'initialize', items: [{ id: 11, qty: 1 }], expectedAmountKobo: 52400000,
  customer: { name: 'Local QA Buyer', email: 'buyer@example.test', phone: '+2348000000000' },
  shipping: { deliveryLocationId: 'abuja', countryCode: 'NG', address: 'Local QA address', city: 'Abuja', state: 'FCT', deliveryNote: '', isGift: false },
})
function response() { return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value }, status(value) { this.statusCode = value; return this }, json(value) { this.body = value; return this } } }
function harness({ clock = '2026-11-10T12:00:00+01:00', inventory = rows } = {}) {
  const state = { clock, inventory, calls: [], transactions: new Map(), providerError: false }
  const request = async (url, init) => {
    state.calls.push({ url, init })
    if (url.startsWith(process.env.SUPABASE_URL)) return Response.json(state.inventory)
    if (state.providerError) return Response.json({ status: false }, { status: 502 })
    if (url.endsWith('/initialize')) {
      const data = JSON.parse(init.body)
      state.transactions.set(data.reference, { ...data, status: 'success', customer: { email: data.email } })
      return Response.json({ status: true, data: { reference: data.reference, access_code: 'qa-access-code', authorization_url: 'https://checkout.paystack.com/qa-access-code' } })
    }
    const reference = decodeURIComponent(url.split('/').at(-1))
    return Response.json({ status: true, data: state.transactions.get(reference) })
  }
  const handler = createSalesHandler({ now: () => new Date(state.clock), request })
  state.send = async (body, method = 'POST', headers = {}) => { const res = response(); await handler({ method, body, headers }, res); return res }
  return state
}

test('campaign runs exactly 9-15 November in Nigeria time', () => {
  assert.equal(salePhase('2026-11-08T22:59:59.999Z'), 'upcoming')
  assert.equal(salePhase('2026-11-08T23:00:00.000Z'), 'active')
  assert.equal(salePhase('2026-11-15T22:59:59.999Z'), 'active')
  assert.equal(salePhase('2026-11-15T23:00:00.000Z'), 'ended')
  assert.equal(salePhase('2027-11-10T00:00:00Z'), 'ended')
  assert.throws(() => salePhase('not-a-date'))
})
test('sale prices use 20% off the current price, not an inflated older comparison price', () => {
  assert.deepEqual(salePrices(650000), { regularKobo: 65000000, saleKobo: 52000000, savingsKobo: 13000000 })
  assert.equal(salePrices(345000).saleKobo, 27600000)
  const products = saleProducts(catalogue)
  assert.equal(products[0].price, 520000)
  assert.equal(products[0].originalPrice, 650000)
  assert.equal(catalogue[0].price, 650000)
  assert.equal(saleProducts([{ ...catalogue[0], showInCatalog: false }]).length, 0)
  assert.throws(() => salePrices(-1))
})
test('quantity, mixed-product discount and delivery are calculated in kobo', () => {
  const quote = quoteSale([{ id: 11, qty: 1 }, { id: 112, qty: 1 }], catalogue, 'abuja')
  assert.equal(quote.subtotalKobo, 79600000)
  assert.equal(quote.savingsKobo, 19900000)
  assert.equal(quote.deliveryFeeKobo, 400000)
  assert.equal(quote.totalKobo, 80000000)
  assert.equal(quoteSale([{ id: 112, qty: 2 }], catalogue, 'uk').totalKobo, 63200000)
})
test('existing delivery fee amounts remain unchanged', () => {
  assert.deepEqual(Object.fromEntries(deliveryLocations.map(item => [item.id, item.fee])), { uk: 80000, usa: 98000, uae: 125000, 'african-countries': 90000, 'within-nigeria': 10000, abuja: 4000, canada: 88000, italy: 115000 })
})
test('invalid bags, quantities and removed products are rejected before payment', () => {
  for (const items of [[], [{ id: 11, qty: 0 }], [{ id: 11, qty: 21 }], [{ id: 11, qty: 1.5 }], [{ id: '11', qty: 1 }], [{ id: 11, qty: 1 }, { id: 11, qty: 1 }], [{ id: 999, qty: 1 }]]) assert.throws(() => quoteSale(items, catalogue, 'abuja'))
  assert.throws(() => quoteSale([{ id: 11, qty: 1 }], catalogue, 'free-pickup'))
})
test('GET returns only selected published inventory, never tombstones or unselected products', async () => {
  const state = harness({ inventory: [{ ...rows[0], is_deleted: true }, rows[1], { ...rows[0], id: 3 }] })
  const res = await state.send(undefined, 'GET')
  assert.equal(res.statusCode, 200)
  assert.deepEqual(res.body.products.map(product => product.id), [112])
  assert.equal(res.body.products[0].price, 276000)
  assert.equal(res.body.paymentReady, true)
  assert.equal(res.headers['Cache-Control'], 'no-store')
  assert.equal(JSON.stringify(res.body).includes(secret), false)
})
test('initialization ignores browser-supplied prices and sends the server quote to Paystack', async () => {
  const state = harness()
  const body = validBody(); body.items[0].price = 1; body.deliveryFee = 0
  const res = await state.send(body)
  assert.equal(res.statusCode, 200)
  const transaction = state.transactions.get(res.body.reference)
  assert.equal(transaction.amount, 52400000)
  assert.equal(transaction.currency, 'NGN')
  assert.equal(transaction.metadata.glamoursphairSale.order.quote.totalKobo, 52400000)
  assert.equal(transaction.metadata.glamoursphairSale.signature, signOrder(transaction.metadata.glamoursphairSale.order, secret))
  assert.match(res.body.reference, /^GLAM-NOV-[a-f0-9-]{36}$/)
  assert.equal(res.body.verificationToken, verificationToken(res.body.reference, secret))
})
test('changed totals are shown for review and never silently charged', async () => {
  const state = harness(); const body = validBody(); body.expectedAmountKobo = 1
  const res = await state.send(body)
  assert.equal(res.statusCode, 409)
  assert.equal(res.body.quote.totalKobo, 52400000)
  assert.equal(state.transactions.size, 0)
})
test('sale cannot be paid before opening or after closing', async () => {
  for (const clock of ['2026-11-08T22:59:59Z', '2026-11-15T23:00:00Z']) {
    const state = harness({ clock }); const res = await state.send(validBody())
    assert.equal(res.statusCode, 409); assert.equal(state.transactions.size, 0)
  }
})
test('customer, shipping, region and gift recipient are validated', async () => {
  const mutations = [body => { body.customer.email = 'invalid' }, body => { body.customer.phone = '1' }, body => { body.shipping.address = '' }, body => { body.shipping.countryCode = 'GB' }, body => { body.shipping.isGift = true }, body => { body.shipping.recipientPhone = '1'; body.shipping.isGift = true; body.shipping.recipientName = 'Recipient' }]
  for (const mutate of mutations) {
    const state = harness(); const body = validBody(); mutate(body); const res = await state.send(body)
    assert.equal(res.statusCode, 400); assert.equal(state.transactions.size, 0)
  }
  const state = harness(); const body = validBody(); Object.assign(body.shipping, { isGift: true, recipientName: 'QA Recipient', recipientPhone: '+2348000000001' })
  const res = await state.send(body); assert.equal(res.statusCode, 200)
  assert.equal(state.transactions.get(res.body.reference).metadata.glamoursphairSale.order.shipping.recipientName, 'QA Recipient')
})
test('verification requires the session token and signed server-created order', async () => {
  const state = harness(); const initialized = await state.send(validBody())
  const payload = { action: 'verify', reference: initialized.body.reference, verificationToken: initialized.body.verificationToken }
  const wrong = await state.send({ ...payload, verificationToken: '0'.repeat(64) })
  assert.equal(wrong.statusCode, 403)
  const verified = await state.send(payload)
  assert.equal(verified.statusCode, 200); assert.equal(verified.body.verified, true)
  assert.equal(verified.body.order.quote.totalKobo, 52400000)
  const transaction = state.transactions.get(payload.reference)
  transaction.metadata.glamoursphairSale.order.quote.totalKobo = 1
  assert.equal((await state.send(payload)).statusCode, 409)
})
test('amount, currency, reference and payer mismatch cannot produce success', async () => {
  for (const mutate of [value => { value.amount = 1 }, value => { value.currency = 'USD' }, value => { value.reference = 'wrong' }, value => { value.customer.email = 'someone-else@example.test' }]) {
    const state = harness(); const initialized = await state.send(validBody())
    mutate(state.transactions.get(initialized.body.reference))
    const verified = await state.send({ action: 'verify', reference: initialized.body.reference, verificationToken: initialized.body.verificationToken })
    assert.equal(verified.statusCode, 409)
  }
})
test('pending, failed and cancelled provider statuses never claim paid', async () => {
  for (const status of ['pending', 'failed', 'abandoned', 'ongoing']) {
    const state = harness(); const initialized = await state.send(validBody())
    state.transactions.get(initialized.body.reference).status = status
    const verified = await state.send({ action: 'verify', reference: initialized.body.reference, verificationToken: initialized.body.verificationToken })
    assert.equal(verified.body.verified, false); assert.equal(verified.body.status, status)
  }
})
test('a genuine signed payment can still be verified after the campaign closes', async () => {
  const state = harness(); const initialized = await state.send(validBody())
  state.clock = '2026-11-17T12:00:00Z'; state.inventory = []
  const verified = await state.send({ action: 'verify', reference: initialized.body.reference, verificationToken: initialized.body.verificationToken })
  assert.equal(verified.body.verified, true)
})
test('provider failure never returns a fake success or leaks secrets', async () => {
  const state = harness(); state.providerError = true
  const res = await state.send(validBody())
  assert.equal(res.statusCode, 502)
  assert.equal(JSON.stringify(res.body).includes(secret), false)
})

test('other African destinations require their actual country and preserve it for fulfilment', async () => {
  const state = harness(); const body = validBody()
  Object.assign(body.shipping, { deliveryLocationId: 'african-countries', countryCode: 'AFRICA' })
  body.expectedAmountKobo = 61000000
  assert.equal((await state.send(body)).statusCode, 400)
  body.shipping.countryName = 'Ghana'
  const initialized = await state.send(body)
  assert.equal(initialized.statusCode, 200)
  assert.equal(state.transactions.get(initialized.body.reference).metadata.glamoursphairSale.order.shipping.country, 'Ghana')
})

test('unavailable shared inventory never substitutes seed products or opens a payment', async () => {
  const handler = createSalesHandler({ request: async () => new Response('', { status: 503 }) })
  const res = response(); await handler({ method: 'GET' }, res)
  assert.equal(res.statusCode, 503)
  assert.equal(res.body.products, undefined)
})

test('malformed signature bytes are rejected without throwing', () => {
  assert.equal(sameSignature('\u00e9'.repeat(64), 'a'.repeat(64)), false)
  assert.equal(sameSignature(null, 'a'.repeat(64)), false)
  assert.equal(sameSignature('a'.repeat(64), 'a'.repeat(64)), true)
})
test('missing Paystack credential fails closed but preview remains readable', async () => {
  delete process.env.PAYSTACK_SECRET_KEY
  try {
    const state = harness()
    assert.equal((await state.send(undefined, 'GET')).body.paymentReady, false)
    assert.equal((await state.send(validBody())).statusCode, 503)
    assert.equal(state.transactions.size, 0)
  } finally { process.env.PAYSTACK_SECRET_KEY = secret }
})
test('unsupported methods and cross-origin initialization are rejected', async () => {
  const state = harness()
  assert.equal((await state.send(undefined, 'DELETE')).statusCode, 405)
  assert.equal((await state.send(validBody(), 'POST', { origin: 'https://other.invalid', host: 'store.invalid' })).statusCode, 403)
})
test('sales entry has crawler metadata, narrow routes and a sitemap entry', () => {
  const html = readFileSync(new URL('../sales.html', import.meta.url), 'utf8')
  assert.ok(html.includes('<title>November Sales: 9-15 November | GLAMOURSPHAIR</title>'))
  assert.ok(html.includes('href="https://www.glamoursphairluxury.com/sales"'))
  assert.ok(html.includes('property="og:image"'))
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)))
  assert.deepEqual(config.rewrites.filter(item => item.source.startsWith('/sales')), [{ source: '/sales', destination: '/sales.html' }, { source: '/sales/', destination: '/sales.html' }])
  assert.ok(!config.rewrites.some(item => item.source.includes('api')))
  assert.ok(readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8').includes('<loc>https://www.glamoursphairluxury.com/sales</loc>'))
  assert.equal(NOVEMBER_SALE.discountPercent, 20)
})
