import { createServer } from 'node:http'

// Loopback-only manual QA fixture. It never connects to Supabase or Paystack.
const products = new Map()
const hidden = new Set()
let failNext = ''
const password = 'inventory-qa-local-only'
const server = createServer(async (req, res) => {
  const origin = req.headers.origin
  if (['http://127.0.0.1:5176', 'http://127.0.0.1:5177'].includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-admin-password')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return }
  const url = new URL(req.url, 'http://127.0.0.1:5175')
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  let body = {}
  try { if (chunks.length) body = JSON.parse(Buffer.concat(chunks).toString()) } catch { res.writeHead(400).end(); return }
  const json = (status, data) => { res.writeHead(status, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)) }
  if (url.pathname === '/control' && req.method === 'POST') {
    failNext = body.failNext ?? ''
    if (body.reset) { products.clear(); hidden.clear() }
    json(200, { ready: true }); return
  }
  if (url.pathname !== '/api/products') { res.writeHead(404).end(); return }
  if (req.method === 'GET') {
    json(200, { products: [...products.values()], hiddenIds: [...hidden], order: [...products.keys()], placementSupported: true }); return
  }
  if (req.headers['x-admin-password'] !== password) { json(401, { error: 'Unauthorized' }); return }
  if (url.searchParams.get('admin') === 'verify') { res.writeHead(204).end(); return }
  if (req.method === failNext) { failNext = ''; json(500, { error: 'Simulated QA write failure' }); return }
  if (req.method === 'POST') { products.set(body.product.id, body.product); json(200, body.product); return }
  if (req.method === 'PATCH') { products.clear(); for (const product of body.products) products.set(product.id, product); res.writeHead(204).end(); return }
  if (req.method === 'DELETE') { products.delete(body.id); hidden.add(body.id); res.writeHead(204).end(); return }
  res.writeHead(405).end()
})
server.listen(5175, '127.0.0.1', () => console.log('Inventory QA API: http://127.0.0.1:5175'))
