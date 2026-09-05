import { timingSafeEqual } from 'node:crypto'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const PRODUCT_IMAGE_BUCKET = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET || 'product-images'
const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const IMAGE_TYPES = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
])

export const config = {
  api: {
    bodyParser: false,
  },
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'product'
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Supabase server environment variables are missing.' })
    return
  }

  const receivedPassword = req.headers['x-admin-password']
  const expected = Buffer.from(ADMIN_PASSWORD || '')
  const received = Buffer.from(typeof receivedPassword === 'string' ? receivedPassword : '')
  const passwordMatches = expected.length > 0 && expected.length === received.length && timingSafeEqual(expected, received)
  if (!passwordMatches) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const chunks = []
  let receivedBytes = 0
  for await (const chunk of req) {
    receivedBytes += chunk.length
    if (receivedBytes > MAX_IMAGE_BYTES) {
      res.status(413).json({ error: 'Product images must be 8 MB or smaller.' })
      return
    }
    chunks.push(chunk)
  }
  const fileBuffer = Buffer.concat(chunks)
  const productName = String(req.query.name || 'product')
  const contentType = String(req.query.type || req.headers['content-type'] || 'application/octet-stream')
  const extension = IMAGE_TYPES.get(contentType)
  if (!extension) {
    res.status(415).json({ error: 'Upload a JPG, PNG, or WebP image.' })
    return
  }
  const path = `${slugify(productName)}-${Date.now()}.${extension}`

  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${PRODUCT_IMAGE_BUCKET}/${path}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body: fileBuffer,
  })

  if (!response.ok) {
    console.error('Product image upload failed:', await response.text())
    res.status(500).json({ error: 'Product image upload failed.' })
    return
  }

  res.status(200).json({
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${path}`,
  })
}
