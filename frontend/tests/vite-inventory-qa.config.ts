import { mergeConfig } from 'vite'
import type { Plugin } from 'vite'
import baseConfig from '../vite.config'
import { NOVEMBER_SALE, saleProducts } from '../src/lib/novemberSale.js'
import type { Product } from '../src/types'

// Explicit, loopback-only QA fixture. Never imported by the production build.
const inventoryQa: Plugin = {
  name: 'inventory-qa',
  configureServer(server) {
    const initialProducts: Product[] = [
      { id: 11, name: 'Signature Straight 22"', slug: 'signature-straight-22', price: 650000,
        originalPrice: 850000, description: 'Local QA fixture for the saved Signature Straight unit.',
        images: ['/images/11a.jpeg', '/images/11b.jpeg', '/images/11c.jpeg'], gradient: '',
        group: 'Signature Collection', showOnHomepage: true, showInCatalog: true, inChristmasSale: true },
      { id: 112, name: 'SDD Luxury Bone Straight 18" 5 by 5', slug: 'sdd-luxury-bone-straight-18-13x4', price: 345000,
        description: 'Local QA fixture for the saved 18 inch unit.', length: '18"', volume: '330g', fitting: '5 by 5',
        image: '/images/SDD luxury bone straight length 18 volume 330 fitting 13 by 4.jpeg', gradient: '',
        group: 'Thank you sales', showOnHomepage: false, showInCatalog: true, inChristmasSale: false },
    ]
    let products = structuredClone(initialProducts)
    let delay = 0, failures = 0, migrated = true, failWrite = false
    server.middlewares.use(async (req, res, next) => {
      const url = new URL(req.url || '/', 'http://127.0.0.1')
      if (!['/api/products', '/api/sales', '/__qa/inventory'].includes(url.pathname)) return next()
      if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress || '')) { res.writeHead(403).end(); return }
      const json = (body: unknown, status = 200) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)) }
      const readBody = async () => {
        let body = ''
        for await (const chunk of req) body += chunk
        return JSON.parse(body || '{}')
      }
      if (url.pathname === '/__qa/inventory') {
        const body = await readBody()
        if (body.reset) { products = structuredClone(initialProducts); delay = 0; failures = 0; migrated = true; failWrite = false }
        delay = body.delay ?? delay; failures = body.failures ?? failures; migrated = body.migrated ?? migrated
        failWrite = body.failWrite ?? failWrite
        if (body.products) products = body.products
        json({ delay, failures, migrated, products }); return
      }
      if (url.pathname === '/api/sales') {
        json({ campaign: NOVEMBER_SALE, phase: 'upcoming', serverTime: '2026-11-03T12:00:00+01:00', products: saleProducts(products), paymentReady: false }); return
      }
      if (req.method === 'GET') {
        await new Promise(resolve => setTimeout(resolve, delay))
        if (failures > 0) { failures -= 1; json({ error: 'Simulated network outage' }, 503); return }
        json({ products: products.map(product => { const copy = { ...product }; if (!migrated) delete copy.inChristmasSale; return copy }), hiddenIds: [2, 101, 102], order: products.map(product => product.id), placementSupported: true, salePlacementSupported: migrated }); return
      }
      if (req.headers['x-admin-password'] !== 'local-qa-only') { json({ error: 'Unauthorized' }, 401); return }
      if (url.searchParams.get('admin') === 'verify') { res.writeHead(204).end(); return }
      const body = await readBody()
      if (failWrite) { failWrite = false; json({ error: 'Simulated save failure' }, 503); return }
      if (req.method === 'PATCH') products = body.products
      else if (req.method === 'POST') products = products.map(product => product.id === body.product.id ? body.product : product)
      else if (req.method === 'DELETE') products = products.filter(product => product.id !== body.id)
      if (req.method === 'POST') json(body.product)
      else res.writeHead(204).end()
    })
  },
}

export default mergeConfig(baseConfig, {
  define: { 'import.meta.env.VITE_PRODUCTS_API_URL': JSON.stringify('/api/products') },
  plugins: [inventoryQa],
  server: { host: '127.0.0.1', port: 5184, strictPort: true },
})
