const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

function assertConfig(res) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Supabase server environment variables are missing.' })
    return false
  }
  return true
}

function requireAdmin(req, res) {
  if (!ADMIN_PASSWORD || req.headers['x-admin-password'] !== ADMIN_PASSWORD) {
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

module.exports = async function handler(req, res) {
  if (!assertConfig(res)) return

  try {
    if (req.method === 'GET') {
      const rows = await supabase('/rest/v1/products?select=*&order=sort_order.asc.nullslast,id.asc')
      const activeRows = rows.filter(row => !row.is_deleted)
      res.status(200).json({
        products: activeRows.map(productFromRow),
        hiddenIds: rows.filter(row => row.is_deleted).map(row => row.id),
        order: activeRows.map(row => row.id),
      })
      return
    }

    if (!requireAdmin(req, res)) return

    if (req.method === 'POST') {
      const { product, sortOrder = 0 } = req.body || {}
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
    res.status(500).json({ error: error instanceof Error ? error.message : 'Product API failed.' })
  }
}
