import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { DEFAULT_HOME_PRODUCT_IDS, HOME_PRODUCT_LIMIT, catalogProducts, homepageProducts, isHomepageProduct } from '../src/lib/productPlacement.js'

const product = (id, fields = {}) => ({ id, name: `Unit ${id}`, price: 200000, description: 'Verified product description', ...fields })

test('legacy catalog remains fully published with six stable homepage selections', () => {
  const inventory = [...DEFAULT_HOME_PRODUCT_IDS, 106, 107, 108].map(id => product(id))
  assert.equal(catalogProducts(inventory).length, inventory.length)
  assert.equal(homepageProducts(inventory).length, HOME_PRODUCT_LIMIT)
  assert.deepEqual(new Set(homepageProducts([...inventory].reverse()).map(item => item.id)), new Set(DEFAULT_HOME_PRODUCT_IDS))
  assert.equal(isHomepageProduct(product(999)), false)
})

test('homepage and full shop visibility are independent, including unpublishing both', () => {
  const homeOnly = product(101, { showOnHomepage: true, showInCatalog: false })
  const shopOnly = product(102, { showOnHomepage: false, showInCatalog: true })
  const unpublished = product(103, { showOnHomepage: false, showInCatalog: false })
  assert.deepEqual(homepageProducts([homeOnly, shopOnly, unpublished]), [homeOnly])
  assert.deepEqual(catalogProducts([homeOnly, shopOnly, unpublished]), [shopOnly])
})

test('homepage never renders more than six and retains the inventory order', () => {
  const inventory = Array.from({ length: 12 }, (_, index) => product(index + 1, { showOnHomepage: true }))
  assert.deepEqual(homepageProducts(inventory).map(item => item.id), [1, 2, 3, 4, 5, 6])
  assert.equal(catalogProducts(inventory).length, 12)
})

test('products routes are narrow rewrites and are included in the sitemap', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)))
  assert.deepEqual(config.rewrites.map(rewrite => rewrite.source), ['/products', '/products/'])
  assert.ok(config.rewrites.every(rewrite => rewrite.destination === '/index.html'))
  assert.match(readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8'), /<loc>https:\/\/www.glamoursphairluxury.com\/products<\/loc>/)
})

process.env.SUPABASE_URL = 'https://test.invalid'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-key'
process.env.ADMIN_PASSWORD = 'test-only-password'
const { default: handler } = await import('../api/products.js')
const request = (method, body) => ({ method, body, query: {}, headers: { 'x-admin-password': 'test-only-password' } })
function response() {
  return { statusCode: 200, headers: {}, setHeader(key, value) { this.headers[key] = value }, status(code) { this.statusCode = code; return this }, json(body) { this.body = body }, end() {} }
}
const row = (id, home = null, catalog = true, deleted = false) => ({ id, name: `Unit ${id}`, price: 200000, description: 'Verified product description', show_on_homepage: home, show_in_catalog: catalog, is_deleted: deleted })

test('GET maps explicit false flags, deletion tombstones and migration readiness without caching', async context => {
  context.mock.method(globalThis, 'fetch', async () => Response.json([row(101, false, false), row(102, true), row(103, false, true, true)]))
  const res = response()
  await handler(request('GET'), res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.headers['Cache-Control'], 'no-store')
  assert.equal(res.body.placementSupported, true)
  assert.equal(res.body.products[0].showOnHomepage, false)
  assert.equal(res.body.products[0].showInCatalog, false)
  assert.deepEqual(res.body.hiddenIds, [103])
})

test('empty migrated database is detected using a zero-row columns probe', async context => {
  const calls = []
  context.mock.method(globalThis, 'fetch', async url => { calls.push(url); return Response.json([]) })
  const res = response()
  await handler(request('GET'), res)
  assert.equal(res.body.placementSupported, true)
  assert.equal(calls.length, 2)
  assert.match(calls[1], /select=show_on_homepage,show_in_catalog&limit=0/)
})

test('legacy schema is readable but refuses placement writes with a useful migration error', async context => {
  const calls = []
  context.mock.method(globalThis, 'fetch', async (url, init) => { calls.push({ url, init }); return Response.json([product(101)]) })
  const read = response()
  await handler(request('GET'), read)
  assert.equal(read.body.placementSupported, false)
  const save = response()
  await handler(request('POST', { product: product(101, { showOnHomepage: false }) }), save)
  assert.equal(save.statusCode, 409)
  assert.match(save.body.error, /supabase-product-placement.sql/)
  assert.ok(calls.every(call => !call.init.method))
})

test('visibility must be boolean and is validated before any database request', async context => {
  const fetch = context.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected database request') })
  for (const fields of [{ showOnHomepage: 'true' }, { showInCatalog: null }, { showOnHomepage: 1 }]) {
    const res = response()
    await handler(request('POST', { product: product(101, fields) }), res)
    assert.equal(res.statusCode, 400)
  }
  assert.equal(fetch.mock.callCount(), 0)
})

test('server rejects a seventh home product even when the six legacy seeds are not persisted', async context => {
  const calls = []
  context.mock.method(globalThis, 'fetch', async (url, init) => { calls.push({ url, init }); return Response.json([row(112)]) })
  const res = response()
  await handler(request('POST', { product: product(112, { showOnHomepage: true }) }), res)
  assert.equal(res.statusCode, 409)
  assert.match(res.body.error, /limited to 6/)
  assert.equal(calls.length, 1)
})

test('placement save preserves false flags and existing product data in the database row', async context => {
  const calls = []
  context.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, init })
    return init.method ? Response.json([row(101, false, false)]) : Response.json([row(101)])
  })
  const res = response()
  await handler(request('POST', { product: product(101, { showOnHomepage: false, showInCatalog: false }), sortOrder: 3 }), res)
  assert.equal(res.statusCode, 200)
  const saved = JSON.parse(calls[1].init.body)
  assert.equal(saved.show_on_homepage, false)
  assert.equal(saved.show_in_catalog, false)
  assert.equal(saved.price, 200000)
  assert.equal(saved.sort_order, 3)
})

test('bulk sorting normalizes mixed legacy and explicit placement rows to identical keys', async context => {
  const calls = []
  context.mock.method(globalThis, 'fetch', async (url, init) => {
    calls.push({ url, init })
    return init.method ? new Response('', { status: 201 }) : Response.json([row(101)])
  })
  const res = response()
  await handler(request('PATCH', { products: [product(101, { showOnHomepage: false, showInCatalog: false }), product(102)] }), res)
  assert.equal(res.statusCode, 204)
  const saved = JSON.parse(calls[1].init.body)
  assert.deepEqual(Object.keys(saved[0]), Object.keys(saved[1]))
  assert.equal(saved[0].show_in_catalog, false)
  assert.equal(saved[1].show_on_homepage, true)
  assert.equal(saved[1].show_in_catalog, true)
})
