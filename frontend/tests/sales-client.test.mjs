import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

function loadTypescript(path) {
  const code = ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    transformers: { before: [context => {
      const visit = node => ts.isPropertyAccessExpression(node) && node.getText() === 'import.meta.env'
        ? ts.factory.createObjectLiteralExpression([]) : ts.visitEachChild(node, visit, context)
      return source => ts.visitNode(source, visit)
    }] },
  }).outputText
  return import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`)
}
const gateway = await loadTypescript('../src/lib/salePayment.ts')
const client = await loadTypescript('../src/lib/salesClient.ts')
const storage = () => { const values = new Map(); return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) } }
function mockStorage(context, name) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, name)
  const local = storage()
  Object.defineProperty(globalThis, name, { configurable: true, value: local })
  context.after(() => { if (previous) Object.defineProperty(globalThis, name, previous); else delete globalThis[name] })
  return local
}
const session = () => ({ reference: 'GLAM-NOV-00000000-0000-0000-0000-000000000001', accessCode: 'local-test-access', authorizationUrl: 'https://checkout.paystack.com/local-test-access', verificationToken: 'a'.repeat(64), quote: {
  currency: 'NGN', totalKobo: 52400000, subtotalKobo: 52000000, savingsKobo: 13000000, deliveryFeeKobo: 400000, deliveryLabel: 'Abuja',
  items: [{ id: 11, name: 'Signature Straight 22"', qty: 1, regularKobo: 65000000, unitKobo: 52000000, lineKobo: 52000000 }],
} })

test('gateway resumes the server access code and preserves every provider callback', async () => {
  let opened
  const callbacks = { onSuccess() {}, onLoad() {}, onCancel() {}, onError() {} }
  class MockGateway { resumeTransaction(code, handlers) { opened = { code, handlers }; return 'provider-opened' } }
  assert.equal(await gateway.openSaleGateway('server-access-code', callbacks, async () => ({ default: MockGateway })), 'provider-opened')
  assert.equal(opened.code, 'server-access-code')
  assert.equal(opened.handlers, callbacks)
})
test('gateway load failure remains a failure for the checkout recovery UI', async () => {
  await assert.rejects(gateway.openSaleGateway('code', {}, async () => { throw new Error('Provider unavailable') }), /Provider unavailable/)
})
test('sale bag storage retains only valid IDs and quantities, never browser prices', context => {
  const local = mockStorage(context, 'localStorage')
  local.setItem(client.SALE_BAG_KEY, JSON.stringify([{ id: 11, qty: 2, price: 1 }, { id: 112, qty: 1 }, { id: 9, qty: 21 }, { id: '3', qty: 1 }, { id: 11, qty: 3 }]))
  assert.deepEqual(client.readSaleBag(), [{ id: 11, qty: 3 }, { id: 112, qty: 1 }])
  local.setItem(client.SALE_BAG_KEY, '{broken')
  assert.deepEqual(client.readSaleBag(), [])
})
test('pending payment survives a refresh and rejects unsafe links or broken quote lines', context => {
  const local = mockStorage(context, 'sessionStorage')
  const current = session(); local.setItem(client.SALE_PAYMENT_KEY, JSON.stringify(current))
  assert.deepEqual(client.readSalePayment(), current)
  for (const change of [value => { value.authorizationUrl = 'https://checkout.paystack.com.evil.invalid/payment' }, value => { value.quote.items = [null] }, value => { value.quote.items[0].lineKobo = 1 }, value => { value.quote.currency = 'USD' }, value => { value.accessCode = '' }]) {
    const value = session(); change(value); local.setItem(client.SALE_PAYMENT_KEY, JSON.stringify(value))
    assert.equal(client.readSalePayment(), null)
  }
})
test('client initializes and verifies only through the server API', async context => {
  const calls = []
  context.mock.method(globalThis, 'fetch', async (url, options) => { calls.push({ url, options }); return Response.json(session()) })
  await client.initializeSalePayment([{ id: 11, qty: 1 }], { name: 'Local QA Buyer' }, { deliveryLocationId: 'abuja' }, 52400000)
  await client.verifySalePayment(session())
  assert.equal(calls[0].url, '/api/sales')
  assert.equal(calls[0].options.cache, 'no-store')
  assert.ok(calls[0].options.signal instanceof AbortSignal)
  assert.equal(JSON.parse(calls[0].options.body).expectedAmountKobo, 52400000)
  assert.deepEqual(JSON.parse(calls[1].options.body), { action: 'verify', reference: session().reference, verificationToken: session().verificationToken })
})
test('server errors remain visible to the buyer rather than inventing payment success', async context => {
  context.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'Prices changed. Review the total.' }, { status: 409 }))
  await assert.rejects(client.initializeSalePayment([], {}, {}, 1), /Prices changed/)
})
