const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

function validReference(value) {
  return typeof value === 'string' && /^[A-Za-z0-9._=-]{1,100}$/.test(value)
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!PAYSTACK_SECRET_KEY) {
    res.status(503).json({ error: 'Payment verification is not configured.' })
    return
  }

  const { reference, expectedAmount, expectedCurrency = 'NGN' } = req.body || {}
  if (!validReference(reference) || !Number.isSafeInteger(expectedAmount) || expectedAmount <= 0 || expectedCurrency !== 'NGN') {
    res.status(400).json({ error: 'Payment verification request is invalid.' })
    return
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      signal: controller.signal,
    })
    const payload = await response.json().catch(() => null)
    const transaction = payload?.data

    if (!response.ok || !payload?.status || transaction?.status !== 'success') {
      res.status(402).json({ error: 'Payment has not been verified as successful.' })
      return
    }

    if (transaction.reference !== reference || transaction.amount !== expectedAmount || transaction.currency !== expectedCurrency) {
      res.status(409).json({ error: 'Verified payment details do not match this order.' })
      return
    }

    res.status(200).json({
      verified: true,
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency,
    })
  } catch (error) {
    console.error('Payment verification failed:', error)
    res.status(502).json({ error: 'Payment could not be verified at this time.' })
  } finally {
    clearTimeout(timeout)
  }
}
