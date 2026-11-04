import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import ts from 'typescript'

// Exercise the actual catalogue resolver, including its initial render before effects run.
const text = readFileSync(new URL('../src/components/ProductGrid.tsx', import.meta.url), 'utf8')
const source = ts.createSourceFile('ProductGrid.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const printer = ts.createPrinter()
const print = node => printer.printNode(ts.EmitHint.Unspecified, node, source)
const declarations = new Map()
function visit(node) {
  if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) declarations.set(node.name.text, node)
  ts.forEachChild(node, visit)
}
visit(source)
const helpers = source.statements.filter(node => ts.isFunctionDeclaration(node) && ['orderProducts', 'mergeProductsById'].includes(node.name?.text)).map(print).join('\n')
const resolver = print(declarations.get('allProducts').initializer.arguments[0])
const moduleText = ts.transpileModule(`${helpers}
export function resolve(state) {
  const { configured, databaseLoaded, databaseProducts = [], databaseHiddenIds = [], databaseOrder = [],
    products = [], hiddenProductIds = [], productOverrides = {}, adminProducts = [], productOrder = [] } = state;
  const isProductDatabaseConfigured = () => configured;
  return (${resolver})();
}`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
const { resolve } = await import(`data:text/javascript;base64,${Buffer.from(moduleText).toString('base64')}`)
const seed = { id: 2, name: 'Deleted legacy Kelly' }
const local = { id: 900, name: 'Stale local-only upload' }
const current = { id: 11, name: 'Current shared product', inChristmasSale: false }
const defaults = { configured: true, products: [seed], adminProducts: [local], productOrder: [900, 2] }

test('initial shared catalogue renders no bundled or local products before response', () => {
  assert.deepEqual(resolve({ ...defaults, databaseLoaded: false }), [])
})
test('a successful snapshot is authoritative, even when empty or seeds are missing', () => {
  assert.deepEqual(resolve({ ...defaults, databaseLoaded: true, databaseProducts: [current] }), [current])
  assert.deepEqual(resolve({ ...defaults, databaseLoaded: true }), [])
})
test('deleted rows remain excluded and only shared sort order wins over local caches', () => {
  assert.deepEqual(resolve({ ...defaults, databaseLoaded: true, databaseProducts: [seed, current, local], databaseHiddenIds: [2], databaseOrder: [11, 900] }), [current, local])
})
test('offline demos retain explicit local overrides and hiding when no database is configured', () => {
  assert.deepEqual(resolve({ ...defaults, configured: false, hiddenProductIds: [2] }), [local])
})

const databaseText = readFileSync(new URL('../src/lib/productDatabase.ts', import.meta.url), 'utf8')
const compiled = ts.transpileModule(databaseText.replaceAll('import.meta.env', JSON.stringify({ VITE_PRODUCTS_API_URL: '/api/products' })), {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
const { fetchDatabaseProducts } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`)
test('shared fetch remains pending until the response and requests uncached inventory', async context => {
  let complete
  let options
  context.mock.method(globalThis, 'fetch', (url, init) => { options = init; return new Promise(resolve => { complete = resolve }) })
  let settled = false
  const pending = fetchDatabaseProducts().then(value => { settled = true; return value })
  await Promise.resolve()
  assert.equal(settled, false)
  assert.equal(options.cache, 'no-store')
  assert.ok(options.signal instanceof AbortSignal)
  complete(Response.json({ products: [current], hiddenIds: [2], order: [11], placementSupported: true, salePlacementSupported: true }))
  assert.equal((await pending).products[0].inChristmasSale, false)
})
test('failed and malformed snapshots reject instead of returning legacy products; retry can succeed', async context => {
  for (const reply of [() => { throw new Error('Offline') }, () => new Response('', { status: 503 }), () => Response.json({ products: null })]) {
    context.mock.method(globalThis, 'fetch', reply)
    await assert.rejects(fetchDatabaseProducts())
    context.mock.restoreAll()
  }
  context.mock.method(globalThis, 'fetch', () => Response.json({ products: [], hiddenIds: [2], order: [], placementSupported: true, salePlacementSupported: true }))
  assert.deepEqual((await fetchDatabaseProducts()).products, [])
})
test('request cleanup cancels the active inventory fetch', async context => {
  context.mock.method(globalThis, 'fetch', (url, init) => new Promise((resolve, reject) => init.signal.addEventListener('abort', () => reject(init.signal.reason))))
  const controller = new AbortController()
  const pending = fetchDatabaseProducts(controller.signal)
  controller.abort()
  await assert.rejects(pending, { name: 'AbortError' })
})
