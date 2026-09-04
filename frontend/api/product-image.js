const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const PRODUCT_IMAGE_BUCKET = process.env.SUPABASE_PRODUCT_IMAGE_BUCKET || 'product-images'

module.exports.config = {
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

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Supabase server environment variables are missing.' })
    return
  }

  if (!ADMIN_PASSWORD || req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const fileBuffer = Buffer.concat(chunks)
  const productName = String(req.query.name || 'product')
  const contentType = String(req.query.type || req.headers['content-type'] || 'application/octet-stream')
  const extension = contentType.includes('/') ? contentType.split('/').pop() : 'jpg'
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
    res.status(500).json({ error: await response.text() })
    return
  }

  res.status(200).json({
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${path}`,
  })
}
