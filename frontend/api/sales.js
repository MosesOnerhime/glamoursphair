import { NOVEMBER_SALE, salePhase, saleProducts } from '../src/lib/novemberSale.js'
import { initializeSale, readSaleInventory, SaleError, verifySale } from '../server/salesService.js'

export function createSalesHandler({ now = () => new Date(), request = (...args) => fetch(...args) } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    try {
      if (req.method === 'GET') {
        const products = saleProducts(await readSaleInventory(request))
        res.status(200).json({ campaign: NOVEMBER_SALE, phase: salePhase(now()), serverTime: new Date(now()).toISOString(),
          products, paymentReady: Boolean(process.env.PAYSTACK_SECRET_KEY) })
        return
      }
      if (req.method !== 'POST') { res.setHeader('Allow', 'GET,POST'); res.status(405).json({ error: 'Method not allowed' }); return }
      const origin = req.headers?.origin
      if (origin && new URL(origin).host !== req.headers.host) throw new SaleError('Request origin is not allowed.', 403)
      if (!process.env.PAYSTACK_SECRET_KEY) throw new SaleError('Secure payment is temporarily unavailable. Please contact our WhatsApp team.', 503)
      const body = req.body
      if (!body || typeof body !== 'object' || Array.isArray(body)) throw new SaleError('Request data is invalid.')
      if (body.action === 'initialize') {
        const products = await readSaleInventory(request)
        res.status(200).json(await initializeSale(body, products, now(), request))
      } else if (body.action === 'verify') res.status(200).json(await verifySale(body, request))
      else throw new SaleError('Payment action is invalid.')
    } catch (error) {
      if (error instanceof SaleError) { res.status(error.status).json({ error: error.message, ...error.details }); return }
      console.error('Sale request failed:', error instanceof Error ? error.name : 'unknown')
      res.status(502).json({ error: 'The sale service could not be reached. Please try again.' })
    }
  }
}

export default createSalesHandler()
