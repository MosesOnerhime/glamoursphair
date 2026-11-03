import { createServer } from 'node:http'
import { randomUUID } from 'node:crypto'
import { createSalesHandler } from '../api/sales.js'

// Loopback-only real sale handler with an explicit simulated clock/provider.
// There is never a request to Paystack or a production write.
process.env.SUPABASE_URL = 'https://local-qa.invalid'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-qa-not-a-real-key'
process.env.PAYSTACK_SECRET_KEY = 'sk_test_local_qa_not_a_real_key'
const source = await fetch('https://www.glamoursphairluxury.com/api/products').then(response => response.json())
const rows = source.products.map(product => ({ ...product, original_price: product.originalPrice, collection: product.group, show_in_catalog: product.showInCatalog }))
rows.push(...source.hiddenIds.map(id => ({ id, is_deleted: true })))
const transactions = new Map()
const codes = new Map()
let clock = '2026-11-10T12:00:00+01:00'
let brokenInventory = false
const request = async (url, init) => {
  if (url.startsWith(process.env.SUPABASE_URL)) return brokenInventory ? new Response('', { status: 503 }) : Response.json(rows)
  if (!url.startsWith('https://api.paystack.co/transaction/')) throw new Error('Unexpected QA provider request')
  if (url.endsWith('/initialize')) {
    const transaction = JSON.parse(init.body)
    const code = `local-${randomUUID()}`
    transactions.set(transaction.reference, { ...transaction, status: 'pending', customer: { email: transaction.email } })
    codes.set(code, transaction.reference)
    return Response.json({ status: true, data: { reference: transaction.reference, access_code: code, authorization_url: `https://checkout.paystack.com/${code}` } })
  }
  return Response.json({ status: true, data: transactions.get(url.split('/').at(-1)) })
}
const handler = createSalesHandler({ now: () => new Date(clock), request })
function gateway(code) {
  const reference = codes.get(code)
  const transaction = transactions.get(reference)
  if (!transaction) return '<h1>Unknown local payment session</h1>'
  return `<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Local QA Gateway</title><style>body{font:15px system-ui;padding:22px;color:#191919;background:#fff}h1{font-size:20px}p{line-height:1.6}button{display:block;width:100%;margin-top:12px;min-height:45px;padding:10px;border:1px solid #777;background:#f5f5f5;font-size:14px}code{font-size:10px;overflow-wrap:anywhere}</style><h1>LOCAL QA PAYMENT SIMULATOR</h1><p>No real charge. This is not the Paystack website.</p><p>NGN ${transaction.amount / 100}</p><code>${reference}</code><button id="success">Simulate successful payment</button><button id="cancel">Cancel simulated payment</button><button id="error">Simulate gateway error</button><script>
const reference=${JSON.stringify(reference)};for(const action of ['success','cancel','error'])document.getElementById(action).onclick=async()=>{if(action==='success')await fetch('/api/sales-qa',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'complete',reference})});parent.postMessage({type:'sale-qa',action,reference},location.origin)};
</script></html>`
}
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1:5182')
  const chunks = []; for await (const chunk of req) chunks.push(chunk)
  try { req.body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : undefined } catch { res.writeHead(400).end(); return }
  res.status = code => { res.statusCode = code; return res }
  res.json = value => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)) }
  if (url.pathname === '/api/sales-qa') {
    if (req.method === 'GET' && url.searchParams.has('gateway')) { res.setHeader('Content-Type', 'text/html'); res.end(gateway(url.searchParams.get('gateway'))); return }
    if (req.body?.action === 'complete') { const transaction = transactions.get(req.body.reference); if (transaction) transaction.status = 'success' }
    if (req.body?.clock) clock = req.body.clock
    if (typeof req.body?.brokenInventory === 'boolean') brokenInventory = req.body.brokenInventory
    if (req.body?.paymentReady === false) delete process.env.PAYSTACK_SECRET_KEY
    if (req.body?.paymentReady === true) process.env.PAYSTACK_SECRET_KEY = 'sk_test_local_qa_not_a_real_key'
    if (req.body?.reset) { transactions.clear(); codes.clear() }
    res.json({ clock, brokenInventory, transactions: transactions.size }); return
  }
  if (url.pathname !== '/api/sales') { res.writeHead(404).end(); return }
  await handler(req, res)
})
server.listen(5182, '127.0.0.1', () => console.log('Local sale QA API ready on 127.0.0.1:5182; no real Paystack requests'))
