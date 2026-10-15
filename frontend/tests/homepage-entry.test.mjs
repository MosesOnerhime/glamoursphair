import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { test } from 'node:test'
import ts from 'typescript'
import { initialHomepageSection } from '../src/lib/homepageEntry.js'

const location = (path = '/') => new URL(path, 'https://www.glamoursphairluxury.com')
const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')

test('ordinary homepage visits and reloads start at the collection', () => {
  assert.equal(initialHomepageSection(location()), 'collection')
  assert.equal(initialHomepageSection(location(), 'navigate'), 'collection')
  assert.equal(initialHomepageSection(location(), 'reload'), 'collection')
  assert.equal(initialHomepageSection(location('/?collection=Awoof%20Sales')), 'collection')
})

test('explicit section anchors retain their own target after React mounts', () => {
  for (const section of ['home', 'about', 'contact', 'collection', 'shopping-support', 'main-content']) {
    assert.equal(initialHomepageSection(location(`/#${section}`)), section)
  }
})

test('product/admin links and unknown anchors are never overridden', () => {
  for (const path of ['/#admin-products', '/#unknown', '/?product=wig-kelly-hd-lace', '/?admin=products', '/?product=', '/?product=wig-kelly-hd-lace#about']) {
    assert.equal(initialHomepageSection(location(path)), null, path)
  }
})

test('full shop routes and back/forward history retain their own position', () => {
  for (const path of ['/products', '/products/', '/products?q=HD']) assert.equal(initialHomepageSection(location(path)), null)
  assert.equal(initialHomepageSection(location(), 'back_forward'), null)
})

test('the real entry effect positions instantly once without stealing focus', () => {
  const text = read('../src/App.tsx')
  const source = ts.createSourceFile('App.tsx', text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let effect
  function visit(node) {
    if (ts.isCallExpression(node) && node.expression.getText(source) === 'useLayoutEffect') effect = node.arguments[0]
    ts.forEachChild(node, visit)
  }
  visit(source)
  assert.ok(effect)
  const callback = ts.createPrinter().printNode(ts.EmitHint.Expression, effect, source)
  const compiled = ts.transpileModule(`const apply = ${callback}; return apply();`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText
  const apply = new Function('document', 'initialSection', compiled)
  const calls = []
  const targets = []
  const document = { getElementById(id) { targets.push(id); return { scrollIntoView(options) { calls.push(options) } } } }
  apply(document, null)
  assert.equal(calls.length, 0)
  apply(document, 'collection')
  assert.deepEqual(calls, [{ behavior: 'instant', block: 'start' }])
  apply(document, 'about')
  assert.deepEqual(targets, ['collection', 'about'])
  assert.doesNotThrow(() => apply({ getElementById() { return null } }, 'collection'))
  assert.ok(!callback.includes('.focus('))
  assert.ok(text.includes('<Hero prioritizeImage={!startsAtCollection} />'))
})

test('hero collection link stays on home while the separate full shop link is retained', () => {
  assert.match(read('../src/components/Hero.tsx'), /href="#collection"[^>]*>See the collection<\/a>/)
  const catalog = read('../src/components/ProductCatalog.tsx')
  assert.ok(catalog.includes('<h2>Explore the Luxury</h2>'))
  assert.match(catalog, /href="\/products"[^>]*>View all products/)
  assert.ok(catalog.includes('id="collection" tabIndex={-1}'))
  assert.ok(read('../src/App.tsx').includes('href="#collection"'))
})

test('all active logo placements use the transparent symbol-only asset', () => {
  for (const path of ['../index.html', '../src/components/Hero.tsx', '../src/components/Navbar.tsx', '../src/components/ProductGrid.tsx']) {
    assert.ok(read(path).includes('/images/logo-mark.png'), path)
    assert.ok(!read(path).includes('/images/logo.png'), path)
  }
  const png = readFileSync(new URL('../public/images/logo-mark.png', import.meta.url))
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
  assert.equal(png.readUInt32BE(16), 392)
  assert.equal(png.readUInt32BE(20), 336)
  assert.equal(png[25], 6, 'RGBA logo retains transparency')
})

test('About uses responsive generated wine hair imagery, not the old model portrait', () => {
  const story = read('../src/components/BrandStory.tsx')
  assert.ok(!story.includes('/images/12a.jpeg'))
  assert.ok(story.includes('campaign artwork'))
  assert.ok(story.includes('loading="lazy"'))
  for (const size of [640, 1024, 1672]) {
    const path = `editorial-wine-hair-${size}.webp`
    assert.ok(story.includes(path))
    assert.ok(existsSync(new URL(`../public/images/${path}`, import.meta.url)))
  }
})
