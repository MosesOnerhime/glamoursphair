import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { createSalesHandler } from '../api/sales.js'
import { NOVEMBER_SALE, salePhase, salePrices, saleProducts } from '../src/lib/novemberSale.js'
import { quoteSale, sameSignature, signOrder, verificationToken } from '../server/salesService.js'
import { countries, deliveryLocations, deliveryOptionsForCountry } from '../src/lib/deliveryLocations.js'

process.env.SUPABASE_URL = 'https://inventory.test.invalid'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-fake-supabase-key'
process.env.PAYSTACK_SECRET_KEY = 'sk_test_local_fake_key_no_real_payments'
const secret = process.env.PAYSTACK_SECRET_KEY
const rows = [
  { id: 11, name: 'Signature Straight 22"', slug: 'signature-straight-22', price: 650000, original_price: 850000, description: 'Verified catalogue description', images: ['/images/11a.jpeg', '/images/11b.jpeg'], show_in_catalog: true },
  { id: 112, name: 'SDD Luxury Bone Straight 18" 5 by 5', slug: 'sdd-luxury-bone-straight-18-13x4', price: 345000, description: 'Verified catalogue description', image: '/images/SDD luxury bone straight length 18 volume 330 fitting 13 by 4.jpeg', show_in_catalog: true },
]
const catalogue = rows.map(row => ({ ...row, originalPrice: row.original_price, images: row.images, showInCatalog: row.show_in_catalog }))
const validBody = () => ({ action: 'initialize', items: [{ id: 11, qty: 1 }], expectedAmountKobo: 65500000,
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
    if (url.endsWith('/integration/payment_session_timeout')) return Response.json({ status: true, data: { payment_session_timeout: 1800 } })
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
  assert.equal(NOVEMBER_SALE.name, 'Christmas Sales')
  assert.equal(NOVEMBER_SALE.id, 'november-2026')
  assert.equal(salePhase('2026-11-08T22:59:59.999Z'), 'upcoming')
  assert.equal(salePhase('2026-11-08T23:00:00.000Z'), 'active')
  assert.equal(salePhase('2026-11-15T22:59:59.999Z'), 'active')
  assert.equal(salePhase('2026-11-15T23:00:00.000Z'), 'ended')
  assert.equal(salePhase('2027-11-10T00:00:00Z'), 'ended')
  assert.throws(() => salePhase('not-a-date'))
})

test('admin selections override legacy IDs, retain sort order and allow sale-only publication', async () => {
  const state = harness({ inventory: [
    { ...rows[1], in_christmas_sale: false },
    { ...rows[0], id: 300, in_christmas_sale: true, show_in_catalog: false },
    { ...rows[0], in_christmas_sale: true },
    { ...rows[0], id: 301, in_christmas_sale: true, is_deleted: true },
  ] })
  const res = await state.send(undefined, 'GET')
  assert.deepEqual(res.body.products.map(product => product.id), [300, 11])
  assert.equal(res.body.campaign.name, 'Christmas Sales')
  const body = validBody(); body.items = [{ id: 300, qty: 1 }]
  assert.equal((await state.send(body)).statusCode, 200)
  body.items = [{ id: 112, qty: 1 }]
  const removed = await state.send(body)
  assert.equal(removed.statusCode, 409)
  assert.equal(state.transactions.size, 1)
})
test('sale prices are the saved admin price, with individual discounts from original prices', () => {
  assert.deepEqual(salePrices(650000, 850000), { regularKobo: 85000000, saleKobo: 65000000, savingsKobo: 20000000, discountPercent: 23.5 })
  assert.deepEqual(salePrices(300000, 400000), { regularKobo: 40000000, saleKobo: 30000000, savingsKobo: 10000000, discountPercent: 25 })
  assert.equal(salePrices(345000, 690000).discountPercent, 50)
  assert.equal(salePrices(100000, 400000).discountPercent, 75)
  assert.equal(salePrices(66.67, 100).discountPercent, 33.3)
  assert.equal(salePrices(0.01, 100).discountPercent, 99.9)
  const products = saleProducts(catalogue)
  assert.equal(products[0].price, 650000)
  assert.equal(products[0].originalPrice, 850000)
  assert.equal(products[0].discountPercent, 23.5)
  assert.equal(catalogue[0].price, 650000)
  assert.equal(catalogue[0].originalPrice, 850000)
  assert.equal(saleProducts([{ ...catalogue[0], showInCatalog: false }]).length, 0)
  for (const price of [-1, 0, NaN, Infinity, Number.MAX_SAFE_INTEGER, '650000']) assert.throws(() => salePrices(price))
})

test('missing, invalid or lower original prices never invent a discount or comparison', () => {
  for (const original of [undefined, null, 0, -1, 300000, 345000, NaN, Infinity, Number.MAX_SAFE_INTEGER, '690000']) {
    assert.deepEqual(salePrices(345000, original), { regularKobo: 34500000, saleKobo: 34500000, savingsKobo: 0, discountPercent: 0 })
  }
  const product = saleProducts([catalogue[1]])[0]
  assert.equal(product.price, 345000)
  assert.equal(product.regularPrice, 345000)
  assert.equal(product.originalPrice, undefined)
  assert.equal(product.discountPercent, 0)
})
test('quantity, mixed-product discount and delivery are calculated in kobo', () => {
  const quote = quoteSale([{ id: 11, qty: 1 }, { id: 112, qty: 1 }], catalogue, 'abuja')
  assert.equal(quote.subtotalKobo, 99500000)
  assert.equal(quote.savingsKobo, 20000000)
  assert.equal(quote.deliveryFeeKobo, 500000)
  assert.equal(quote.totalKobo, 100000000)
  assert.equal(quoteSale([{ id: 112, qty: 2 }], catalogue, 'uk').totalKobo, 77900000)
  const mixed = quoteSale([{ id: 11, qty: 2 }, { id: 112, qty: 3 }], [catalogue[0], { ...catalogue[1], originalPrice: 690000 }], 'abuja')
  assert.equal(mixed.subtotalKobo, 233500000)
  assert.equal(mixed.savingsKobo, 143500000)
  assert.equal(mixed.totalKobo, 234000000)
})
test('approved delivery options and fee bands match across countries', () => {
  assert.deepEqual(Object.fromEntries(deliveryLocations.map(item => [item.id, item.fee])), { abuja: 5000, 'within-nigeria': 10000, uk: 89000, 'usa-canada': 98000, 'other-countries': 169000, pickup: 0 })
  assert.deepEqual(deliveryLocations.map(item => item.id), ['abuja', 'within-nigeria', 'uk', 'usa-canada', 'other-countries', 'pickup'])
  for (const code of ['FR', 'JP', 'AU', 'BR']) assert.deepEqual(deliveryOptionsForCountry(code).map(item => item.id), ['other-countries'])
  assert.deepEqual(deliveryOptionsForCountry('GB').map(item => item.id), ['uk'])
  assert.deepEqual(deliveryOptionsForCountry('CA').map(item => item.id), ['usa-canada'])
  assert.deepEqual(deliveryOptionsForCountry('NG').map(item => item.id), ['abuja', 'within-nigeria', 'pickup'])
  assert.ok(countries.some(country => country.code === 'JP' && country.name === 'Japan'))
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
  assert.equal(res.body.products[0].price, 345000)
  assert.equal(res.body.products[0].discountPercent, 0)
  assert.equal(res.body.paymentReady, true)
  assert.equal(res.headers['Cache-Control'], 'no-store')
  assert.equal(JSON.stringify(res.body).includes(secret), false)
})
test('API maps saved original prices and reflects admin price changes without a second discount', async () => {
  const state = harness({ inventory: structuredClone(rows) })
  const first = await state.send(undefined, 'GET')
  assert.equal(first.body.products[0].price, 650000)
  assert.equal(first.body.products[0].regularPrice, 850000)
  assert.equal(first.body.products[0].discountPercent, 23.5)
  Object.assign(state.inventory[0], { price: 300000, original_price: 600000 })
  const updated = await state.send(undefined, 'GET')
  assert.equal(updated.body.products[0].price, 300000)
  assert.equal(updated.body.products[0].discountPercent, 50)
  const staleQuote = await state.send(validBody())
  assert.equal(staleQuote.statusCode, 409)
  assert.equal(staleQuote.body.quote.totalKobo, 30500000)
  assert.equal(state.transactions.size, 0)
  const initialized = await state.send({ ...validBody(), expectedAmountKobo: 30500000 })
  assert.equal(initialized.statusCode, 200)
  assert.equal(state.transactions.get(initialized.body.reference).amount, 30500000)
})

test('initialization ignores browser-supplied prices and sends the server quote to Paystack', async () => {
  const state = harness()
  const body = validBody(); Object.assign(body.items[0], { price: 1, originalPrice: 2, discountPercent: 99 }); body.deliveryFee = 0
  const res = await state.send(body)
  assert.equal(res.statusCode, 200)
  const transaction = state.transactions.get(res.body.reference)
  assert.equal(transaction.amount, 65500000)
  assert.equal(transaction.currency, 'NGN')
  assert.equal(transaction.metadata.glamoursphairSale.order.quote.totalKobo, 65500000)
  assert.equal(transaction.metadata.glamoursphairSale.order.quote.items[0].regularKobo, 85000000)
  assert.equal(transaction.metadata.glamoursphairSale.signature, signOrder(transaction.metadata.glamoursphairSale.order, secret))
  assert.match(res.body.reference, /^GLAM-NOV-[a-f0-9-]{36}$/)
  assert.equal(res.body.verificationToken, verificationToken(res.body.reference, secret))
})
test('changed totals are shown for review and never silently charged', async () => {
  const state = harness(); const body = validBody(); body.expectedAmountKobo = 1
  const res = await state.send(body)
  assert.equal(res.statusCode, 409)
  assert.equal(res.body.quote.totalKobo, 65500000)
  assert.equal(state.transactions.size, 0)
})
test('sale cannot be paid before opening or after closing', async () => {
  for (const clock of ['2026-11-08T22:59:59Z', '2026-11-15T23:00:00Z']) {
    const state = harness({ clock }); const res = await state.send(validBody())
    assert.equal(res.statusCode, 409); assert.equal(state.transactions.size, 0)
  }
})
test('customer, shipping, region and gift recipient are validated', async () => {
  const mutations = [body => { body.customer.email = 'invalid' }, body => { body.customer.phone = '1' }, body => { body.shipping.address = '' }, body => { body.shipping.countryCode = 'GB' }, body => { body.shipping.countryCode = 'JP' }, body => { body.shipping.deliveryLocationId = 'unknown' }, body => { body.shipping.isGift = true }, body => { body.shipping.recipientPhone = '1'; body.shipping.isGift = true; body.shipping.recipientName = 'Recipient' }]
  for (const mutate of mutations) {
    const state = harness(); const body = validBody(); mutate(body); const res = await state.send(body)
    assert.equal(res.statusCode, 400); assert.equal(state.transactions.size, 0)
  }
  const state = harness(); const body = validBody(); Object.assign(body.shipping, { isGift: true, recipientName: 'QA Recipient', recipientPhone: '+2348000000001' })
  const res = await state.send(body); assert.equal(res.statusCode, 200)
  assert.equal(state.transactions.get(res.body.reference).metadata.glamoursphairSale.order.shipping.recipientName, 'QA Recipient')
})

test('pickup is free, uses the studio address and does not require a street address', async () => {
  const state = harness()
  const body = validBody()
  body.shipping.deliveryLocationId = 'pickup'
  body.shipping.address = ''
  body.shipping.city = ''
  body.shipping.state = ''
  body.expectedAmountKobo = 65000000
  const initialized = await state.send(body)
  assert.equal(initialized.statusCode, 200)
  const order = state.transactions.get(initialized.body.reference).metadata.glamoursphairSale.order
  assert.equal(order.quote.deliveryFeeKobo, 0)
  assert.equal(order.quote.totalKobo, 65000000)
  assert.equal(order.shipping.country, 'Nigeria')
  assert.match(order.shipping.address, /Cappador Galaxy Mall.*Abuja, Nigeria/)
})
test('verification requires the session token and signed server-created order', async () => {
  const state = harness(); const initialized = await state.send(validBody())
  const payload = { action: 'verify', reference: initialized.body.reference, verificationToken: initialized.body.verificationToken }
  const wrong = await state.send({ ...payload, verificationToken: '0'.repeat(64) })
  assert.equal(wrong.statusCode, 403)
  const verified = await state.send(payload)
  assert.equal(verified.statusCode, 200); assert.equal(verified.body.verified, true)
  assert.equal(verified.body.order.quote.totalKobo, 65500000)
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
test('previously signed placeholder-price sessions still verify at their authorized amount', async () => {
  const state = harness(); const initialized = await state.send(validBody())
  const transaction = state.transactions.get(initialized.body.reference)
  const record = transaction.metadata.glamoursphairSale
  Object.assign(record.order.quote.items[0], { regularKobo: 65000000, unitKobo: 52000000, lineKobo: 52000000 })
  Object.assign(record.order.quote, { subtotalKobo: 52000000, savingsKobo: 13000000, totalKobo: 52400000 })
  record.signature = signOrder(record.order, secret)
  transaction.amount = 52400000
  state.inventory = []
  const verified = await state.send({ action: 'verify', reference: initialized.body.reference, verificationToken: initialized.body.verificationToken })
  assert.equal(verified.body.verified, true)
  assert.equal(verified.body.order.quote.totalKobo, 52400000)
})

test('provider failure never returns a fake success or leaks secrets', async () => {
  const state = harness(); state.providerError = true
  const res = await state.send(validBody())
  assert.equal(res.statusCode, 502)
  assert.equal(JSON.stringify(res.body).includes(secret), false)
})

test('other African destinations require their actual country and preserve it for fulfilment', async () => {
  const state = harness(); const body = validBody()
  Object.assign(body.shipping, { deliveryLocationId: 'other-countries', countryCode: 'GH' })
  body.expectedAmountKobo = 81900000
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

test('payment readiness authenticates with Paystack without creating a transaction and caches briefly', async () => {
  const state = harness()
  assert.equal((await state.send(undefined, 'GET')).body.paymentReady, true)
  assert.equal((await state.send(undefined, 'GET')).body.paymentReady, true)
  const probes = state.calls.filter(call => call.url.endsWith('/integration/payment_session_timeout'))
  assert.equal(probes.length, 1)
  assert.equal(probes[0].init.method, 'GET')
  assert.equal(probes[0].init.headers.Authorization, `Bearer ${secret}`)
  assert.equal(state.transactions.size, 0)
})

test('invalid credentials and provider outages keep the catalogue browsable but payments unready', async () => {
  for (const failure of ['invalid', 'offline']) {
    const handler = createSalesHandler({ request: async url => {
      if (url.startsWith(process.env.SUPABASE_URL)) return Response.json(rows)
      if (failure === 'offline') throw new Error('Local QA network failure')
      return Response.json({ status: false, message: 'Invalid key' }, { status: 401 })
    } })
    const res = response(); await handler({ method: 'GET' }, res)
    assert.equal(res.statusCode, 200)
    assert.equal(res.body.products.length, 2)
    assert.equal(res.body.paymentReady, false)
    assert.equal(JSON.stringify(res.body).includes(secret), false)
  }
})

test('production cannot accept test-mode or public API keys as real payments', async () => {
  const environment = process.env.VERCEL_ENV
  process.env.VERCEL_ENV = 'production'
  try {
    for (const key of ['sk_test_local_fake_key', 'pk_live_local_fake_key']) {
      process.env.PAYSTACK_SECRET_KEY = key
      const state = harness()
      assert.equal((await state.send(undefined, 'GET')).body.paymentReady, false)
      assert.equal((await state.send(validBody())).statusCode, 503)
      assert.equal(state.transactions.size, 0)
    }
    process.env.PAYSTACK_SECRET_KEY = 'sk_live_local_fake_key'
    const state = harness()
    const res = await state.send(undefined, 'GET')
    assert.equal(res.body.paymentReady, true)
    assert.equal(res.body.paymentMode, 'live')
  } finally {
    process.env.PAYSTACK_SECRET_KEY = secret
    if (environment === undefined) delete process.env.VERCEL_ENV
    else process.env.VERCEL_ENV = environment
  }
})
test('sales entry has crawler metadata, narrow routes and a sitemap entry', () => {
  const html = readFileSync(new URL('../sales.html', import.meta.url), 'utf8')
  assert.ok(html.includes('<title>Christmas Sales: 9-15 November | GLAMOURSPHAIR</title>'))
  assert.ok(html.includes('href="https://www.glamoursphairluxury.com/sales"'))
  assert.ok(html.includes('property="og:image"'))
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)))
  assert.deepEqual(config.rewrites.filter(item => item.source.startsWith('/sales')), [{ source: '/sales', destination: '/sales.html' }, { source: '/sales/', destination: '/sales.html' }])
  assert.ok(!config.rewrites.some(item => item.source.includes('api')))
  assert.ok(readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8').includes('<loc>https://www.glamoursphairluxury.com/sales</loc>'))
  assert.equal(NOVEMBER_SALE.maxDiscountPercent, 50)
  assert.equal(NOVEMBER_SALE.discountPercent, undefined)
  assert.ok(html.includes('up to 50% off selected luxury hair pieces'))
  assert.ok(!html.includes('20% off'))
})
