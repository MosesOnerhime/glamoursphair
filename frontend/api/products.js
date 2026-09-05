import { timingSafeEqual } from 'node:crypto'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

function validText(value, maxLength, required = false) {
  if (value == null || value === '') return !required
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

function validateProduct(product) {
  if (!product || typeof product !== 'object') return 'Product data is required.'
  if (!Number.isSafeInteger(product.id) || product.id <= 0) return 'Product id is invalid.'
  if (!validText(product.name, 160, true)) return 'Product name is invalid.'
  if (!Number.isInteger(product.price) || product.price <= 0) return 'Product price is invalid.'
  if (product.originalPrice != null && (!Number.isInteger(product.originalPrice) || product.originalPrice <= product.price)) return 'Original price must be higher than the current price.'
  if (!validText(product.description, 2000, true)) return 'Product description is invalid.'

  const optionalFields = ['slug', 'tag', 'source', 'length', 'volume', 'fitting', 'group', 'whatsapp', 'gradient', 'image', 'instagramLink']
  if (optionalFields.some(field => !validText(product[field], 500))) return 'One or more product fields are invalid.'
  if (product.images != null && (!Array.isArray(product.images) || product.images.length > 12 || product.images.some(image => !validText(image, 1000, true)))) return 'Product images are invalid.'
  return null
}

function assertConfig(res) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Supabase server environment variables are missing.' })
    return false
  }
  return true
}

function requireAdmin(req, res) {
  const receivedPassword = req.headers['x-admin-password']
  const expected = Buffer.from(ADMIN_PASSWORD || '')
  const received = Buffer.from(typeof receivedPassword === 'string' ? receivedPassword : '')
  const passwordMatches = expected.length > 0 && expected.length === received.length && timingSafeEqual(expected, received)

  if (!passwordMatches) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

function productFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug || undefined,
    price: row.price,
    originalPrice: row.original_price || undefined,
    tag: row.tag || undefined,
    description: row.description,
    source: row.source || undefined,
    length: row.length || undefined,
    volume: row.volume || undefined,
    fitting: row.fitting || undefined,
    group: row.collection || undefined,
    whatsapp: row.whatsapp || undefined,
    gradient: row.gradient || 'from-neutral-950 to-stone-900',
    image: row.image || undefined,
    images: row.images || undefined,
    instagramLink: row.instagram_link || undefined,
  }
}

function rowFromProduct(product, sortOrder) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug || null,
    price: product.price,
    original_price: product.originalPrice || null,
    tag: product.tag || null,
    description: product.description,
    source: product.source || null,
    length: product.length || null,
    volume: product.volume || null,
    fitting: product.fitting || null,
    collection: product.group || null,
    whatsapp: product.whatsapp || null,
    gradient: product.gradient || 'from-neutral-950 to-stone-900',
    image: product.image || null,
    images: product.images || null,
    instagram_link: product.instagramLink || null,
    sort_order: sortOrder,
    is_deleted: false,
  }
}

async function supabase(path, init = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  if (response.status === 204) return null
  return response.json()
}

export default async function handler(req, res) {
  if (!assertConfig(res)) return

  try {
    if (req.method === 'POST' && req.query.admin === 'verify') {
      res.setHeader('Cache-Control', 'no-store')
      if (!requireAdmin(req, res)) return
      res.status(204).end()
      return
    }

    if (req.method === 'GET') {
      const rows = await supabase('/rest/v1/products?select=*&order=sort_order.asc.nullslast,id.asc')
      const activeRows = rows.filter(row => !row.is_deleted)
      res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
      res.status(200).json({
        products: activeRows.map(productFromRow),
        hiddenIds: rows.filter(row => row.is_deleted).map(row => row.id),
        order: activeRows.map(row => row.id),
      })
      return
    }

    res.setHeader('Cache-Control', 'no-store')
    if (!requireAdmin(req, res)) return

    if (req.method === 'POST') {
      const { product, sortOrder = 0 } = req.body || {}
      if (!Number.isSafeInteger(sortOrder) || sortOrder < 0) {
        res.status(400).json({ error: 'Product sort order is invalid.' })
        return
      }
      const validationError = validateProduct(product)
      if (validationError) {
        res.status(400).json({ error: validationError })
        return
      }
      const rows = await supabase('/rest/v1/products?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(rowFromProduct(product, sortOrder)),
      })
      res.status(200).json(rows[0] ? productFromRow(rows[0]) : product)
      return
    }

    if (req.method === 'PATCH') {
      const { products = [] } = req.body || {}
      if (!Array.isArray(products) || products.length > 500) {
        res.status(400).json({ error: 'Product order is invalid.' })
        return
      }
      const validationError = products.map(validateProduct).find(Boolean)
      if (validationError) {
        res.status(400).json({ error: validationError })
        return
      }
      await Promise.all(products.map((product, index) => supabase('/rest/v1/products?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(rowFromProduct(product, index)),
      })))
      res.status(204).end()
      return
    }

    if (req.method === 'DELETE') {
      const { id } = req.body || {}
      if (!Number.isSafeInteger(id) || id <= 0) {
        res.status(400).json({ error: 'Product id is invalid.' })
        return
      }
      await supabase(`/rest/v1/products?id=eq.${id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ is_deleted: true }),
      })
      res.status(204).end()
      return
    }

    res.setHeader('Allow', 'GET,POST,PATCH,DELETE')
    res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Product API failed:', error)
    res.status(500).json({ error: 'Product API failed.' })
  }
}
