import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'
import ts from 'typescript'

const gridUrl = new URL('../src/components/ProductGrid.tsx', import.meta.url)
const source = ts.createSourceFile('ProductGrid.tsx', readFileSync(gridUrl, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const printer = ts.createPrinter()
const declarations = new Map()
for (const statement of source.statements) {
  if (!ts.isVariableStatement(statement)) continue
  for (const declaration of statement.declarationList.declarations) {
    if (ts.isIdentifier(declaration.name)) declarations.set(declaration.name.text, declaration)
  }
}
const dataSource = ['AWOOF_GROUP', 'products'].map(name => `const ${name} = ${printer.printNode(ts.EmitHint.Expression, declarations.get(name).initializer, source)};`).join('\n')
const catalogModule = ts.transpileModule(`${dataSource}\nexport default products`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText
const { default: products } = await import(`data:text/javascript;base64,${Buffer.from(catalogModule).toString('base64')}`)

test('all existing catalog items retain unique IDs, shareable slugs and valid prices', () => {
  assert.equal(products.length, 26)
  assert.equal(new Set(products.map(product => product.id)).size, products.length)
  assert.equal(new Set(products.map(product => product.slug)).size, products.length)
  for (const product of products) {
    assert.ok(product.name && product.description && product.slug)
    assert.ok(Number.isSafeInteger(product.price) && product.price > 0)
    if (product.originalPrice) assert.ok(product.originalPrice > product.price)
  }
  assert.equal(products.find(product => product.slug === 'wig-kelly-hd-lace').price, 298000)
  assert.equal(products.filter(product => product.group === 'Awoof Sales').length, 14)
})

test('every catalog photograph resolves to an existing public asset', () => {
  const publicUrl = new URL('../public/', import.meta.url)
  for (const product of products) {
    const images = product.images ?? [product.image]
    assert.ok(images.length > 0)
    for (const image of images) {
      assert.ok(typeof image === 'string' && image.startsWith('/images/'))
      assert.ok(existsSync(fileURLToPath(new URL(image.slice(1), publicUrl))), image)
    }
  }
})

process.env.SUPABASE_URL = 'https://test.invalid'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-key'
process.env.ADMIN_PASSWORD = 'test-only-password'
const { default: productsApi } = await import('../api/products.js')
function response() {
  return { statusCode: 200, headers: {}, body: undefined, ended: false,
    setHeader(key, value) { this.headers[key] = value },
    status(code) { this.statusCode = code; return this },
    json(value) { this.body = value; return this },
    end() { this.ended = true; return this },
  }
}

test('admin verification rejects missing, wrong and same-length wrong passwords', async () => {
  for (const password of ['', 'anything', 'test-only-passwore']) {
    const res = response()
    await productsApi({ method: 'POST', query: { admin: 'verify' }, headers: { 'x-admin-password': password } }, res)
    assert.equal(res.statusCode, 401)
    assert.equal(res.headers['Cache-Control'], 'no-store')
  }
})

test('admin verification accepts only the configured password', async () => {
  const res = response()
  await productsApi({ method: 'POST', query: { admin: 'verify' }, headers: { 'x-admin-password': 'test-only-password' } }, res)
  assert.equal(res.statusCode, 204)
  assert.equal(res.ended, true)
})

test('catalog mutations reject invalid product data without contacting Supabase', async () => {
  const res = response()
  await productsApi({ method: 'POST', query: {}, headers: { 'x-admin-password': 'test-only-password' }, body: { product: { id: 1, name: 'Test', price: -1, description: 'Test' } } }, res)
  assert.equal(res.statusCode, 400)
  assert.match(res.body.error, /price/)
})
