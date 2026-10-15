import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import ts from 'typescript'

const origin = 'https://www.glamoursphairluxury.com/'
const campaignImage = `${origin}images/glamoursphair-social-hair-v1.jpg`
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const gridText = readFileSync(new URL('../src/components/ProductGrid.tsx', import.meta.url), 'utf8')
const source = ts.createSourceFile('ProductGrid.tsx', gridText, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
let effect
function findMetadataEffect(node) {
  if (ts.isCallExpression(node) && node.expression.getText(source) === 'useEffect' && node.arguments[0]?.getText(source).includes("const structuredDataId = 'product-structured-data'")) effect = node.arguments[0]
  ts.forEachChild(node, findMetadataEffect)
}
findMetadataEffect(source)
assert.ok(effect, 'The actual product metadata effect must be tested')
const callback = ts.createPrinter().printNode(ts.EmitHint.Expression, effect, source)
const executable = ts.transpileModule(`const apply = ${callback}; return apply();`, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText
const applyMetadata = new Function('document', 'selected', 'productsPage', 'PRODUCTION_URL', 'PRODUCT_PARAM', 'absoluteImageUrl', executable)

function metadataDocument() {
  const elements = []
  const document = {
    title: '',
    head: { appendChild(element) { elements.push(element) } },
    createElement(tag) {
      return { tag, attributes: {}, content: '', id: '', textContent: '',
        setAttribute(name, value) { this.attributes[name] = value },
        remove() { const index = elements.indexOf(this); if (index >= 0) elements.splice(index, 1) },
      }
    },
    querySelector(selector) {
      if (selector === 'link[rel="canonical"]') return elements.find(element => element.tag === 'link')
      const match = /^meta\[(name|property)="([^"]+)"\]$/.exec(selector)
      return match ? elements.find(element => element.tag === 'meta' && element.attributes[match[1]] === match[2]) : null
    },
    getElementById(id) { return elements.find(element => element.id === id) },
  }
  document.head.appendChild(document.createElement('link'))
  return document
}
const apply = (document, selected = null, shop = false) => applyMetadata(document, selected, shop, origin, 'product', path => path ? new URL(path, origin).href : undefined)
const value = (document, key, attribute = 'property') => document.querySelector(`meta[${attribute}="${key}"]`)?.content

test('initial HTML exposes the approved campaign JPEG to crawlers without JavaScript', () => {
  assert.ok(html.includes(`<meta property="og:image" content="${campaignImage}" />`))
  assert.ok(html.includes(`<meta name="twitter:image" content="${campaignImage}" />`))
  for (const [key, expected] of [['og:image:width', '1200'], ['og:image:height', '630'], ['og:image:type', 'image/jpeg']]) {
    assert.ok(html.includes(`<meta property="${key}" content="${expected}" />`))
  }
  assert.ok(!html.includes('Wig%20Kellyin%20HDlace%202.jpeg'))
  const jpeg = readFileSync(new URL('../public/images/glamoursphair-social-hair-v1.jpg', import.meta.url))
  assert.deepEqual([...jpeg.subarray(0, 2)], [0xff, 0xd8])
  assert.ok(jpeg.length > 10000 && jpeg.length < 400000)
})

test('homepage and full shop metadata use the campaign image and correct canonical', () => {
  for (const shop of [false, true]) {
    const document = metadataDocument()
    apply(document, null, shop)
    assert.equal(value(document, 'og:image'), campaignImage)
    assert.equal(value(document, 'twitter:image', 'name'), campaignImage)
    assert.equal(value(document, 'og:image:width'), '1200')
    assert.equal(value(document, 'og:image:height'), '630')
    assert.equal(value(document, 'og:image:secure_url'), campaignImage)
    assert.match(value(document, 'og:image:alt'), /campaign artwork/)
    assert.equal(document.querySelector('link[rel="canonical"]').attributes.href, shop ? `${origin}products` : origin)
  }
})

test('product photos keep their own metadata and closing restores campaign metadata', () => {
  const document = metadataDocument()
  apply(document)
  const product = { id: 2, slug: 'wig-kelly-hd-lace', name: 'Wig Kelly in HD Lace', description: 'Verified product copy', price: 298000, image: '/images/Wig Kellyin HDlace 2.jpeg' }
  const cleanup = apply(document, product)
  assert.equal(value(document, 'og:image'), new URL(product.image, origin).href)
  assert.equal(value(document, 'og:image:alt'), product.name)
  assert.equal(value(document, 'twitter:image:alt', 'name'), product.name)
  for (const key of ['og:image:width', 'og:image:height', 'og:image:type', 'og:image:secure_url']) assert.equal(value(document, key), undefined)
  const data = JSON.parse(document.getElementById('product-structured-data').textContent)
  assert.equal(data.offers.priceCurrency, 'NGN')
  assert.equal(data.offers.price, 298000)
  cleanup()
  apply(document)
  assert.equal(value(document, 'og:image'), campaignImage)
  assert.equal(value(document, 'og:image:width'), '1200')
  assert.equal(document.getElementById('product-structured-data'), undefined)
})
