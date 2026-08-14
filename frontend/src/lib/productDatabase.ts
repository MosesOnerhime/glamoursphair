import type { Product } from '../types'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const PRODUCT_IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_PRODUCT_IMAGE_BUCKET ?? 'product-images'
const PRODUCTS_API_URL = import.meta.env.VITE_PRODUCTS_API_URL
const PRODUCT_IMAGE_API_URL = import.meta.env.VITE_PRODUCT_IMAGE_API_URL

type DatabaseProduct = {
  id: number
  name: string
  slug: string | null
  price: number
  original_price: number | null
  tag: string | null
  description: string
  source: string | null
  length: string | null
  volume: string | null
  fitting: string | null
  collection: string | null
  whatsapp: string | null
  gradient: string | null
  image: string | null
  images: string[] | null
  instagram_link: string | null
  sort_order: number | null
  is_deleted: boolean | null
}

type DatabasePayload = Omit<DatabaseProduct, 'sort_order' | 'is_deleted'> & {
  sort_order: number
  is_deleted: boolean
}

export type ProductDatabaseSnapshot = {
  products: Product[]
  hiddenIds: number[]
  order: number[]
}

export function isProductDatabaseConfigured() {
  return Boolean(PRODUCTS_API_URL || (SUPABASE_URL && SUPABASE_ANON_KEY))
}

export function isProductApiConfigured() {
  return Boolean(PRODUCTS_API_URL)
}

function supabaseHeaders(extra?: HeadersInit) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra,
  }
}

async function databaseRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!isProductDatabaseConfigured()) throw new Error('Product database is not configured.')

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: supabaseHeaders({
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Database request failed with ${response.status}`)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

function fromDatabaseProduct(product: DatabaseProduct): Product {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug ?? undefined,
    price: product.price,
    originalPrice: product.original_price ?? undefined,
    tag: product.tag ?? undefined,
    description: product.description,
    source: product.source ?? undefined,
    length: product.length ?? undefined,
    volume: product.volume ?? undefined,
    fitting: product.fitting ?? undefined,
    group: product.collection ?? undefined,
    whatsapp: product.whatsapp ?? undefined,
    gradient: product.gradient ?? 'from-neutral-950 to-stone-900',
    image: product.image ?? undefined,
    images: product.images ?? undefined,
    instagramLink: product.instagram_link ?? undefined,
  }
}

function toDatabasePayload(product: Product, sortOrder: number): DatabasePayload {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug ?? null,
    price: product.price,
    original_price: product.originalPrice ?? null,
    tag: product.tag ?? null,
    description: product.description,
    source: product.source ?? null,
    length: product.length ?? null,
    volume: product.volume ?? null,
    fitting: product.fitting ?? null,
    collection: product.group ?? null,
    whatsapp: product.whatsapp ?? null,
    gradient: product.gradient ?? 'from-neutral-950 to-stone-900',
    image: product.image ?? null,
    images: product.images ?? null,
    instagram_link: product.instagramLink ?? null,
    sort_order: sortOrder,
    is_deleted: false,
  }
}

export async function fetchDatabaseProducts(): Promise<ProductDatabaseSnapshot | null> {
  if (!isProductDatabaseConfigured()) return null

  try {
    if (!PRODUCTS_API_URL) throw new Error('Products API is not configured.')
    const response = await fetch(PRODUCTS_API_URL)
    if (response.ok) return await response.json() as ProductDatabaseSnapshot
  } catch {
    // Fall through to direct Supabase fallback for non-Vercel local previews.
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Product database is not configured.')

  const rows = await databaseRequest<DatabaseProduct[]>('/rest/v1/products?select=*&order=sort_order.asc.nullslast,id.asc')
  const activeRows = rows.filter(row => !row.is_deleted)

  return {
    products: activeRows.map(fromDatabaseProduct),
    hiddenIds: rows.filter(row => row.is_deleted).map(row => row.id),
    order: activeRows.map(row => row.id),
  }
}

export async function verifyAdminPassword(adminPassword: string) {
  if (!PRODUCTS_API_URL) return false

  const response = await fetch(`${PRODUCTS_API_URL}?admin=verify`, {
    method: 'POST',
    headers: {
      'x-admin-password': adminPassword,
    },
  })

  return response.ok
}

export async function saveDatabaseProduct(product: Product, sortOrder: number, adminPassword: string) {
  if (!isProductDatabaseConfigured()) return

  try {
    if (!PRODUCTS_API_URL) throw new Error('Products API is not configured.')
    const response = await fetch(PRODUCTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword,
      },
      body: JSON.stringify({ product, sortOrder }),
    })
    if (response.ok) return await response.json() as Product
  } catch {
    // Fall through to direct Supabase fallback for non-Vercel local previews.
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Product database is not configured.')

  const rows = await databaseRequest<DatabaseProduct[]>('/rest/v1/products?on_conflict=id', {
    method: 'POST',
    headers: {
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(toDatabasePayload(product, sortOrder)),
  })

  return rows[0] ? fromDatabaseProduct(rows[0]) : product
}

export async function deleteDatabaseProduct(id: number, adminPassword: string) {
  if (!isProductDatabaseConfigured()) return

  try {
    if (!PRODUCTS_API_URL) throw new Error('Products API is not configured.')
    const response = await fetch(PRODUCTS_API_URL, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword,
      },
      body: JSON.stringify({ id }),
    })
    if (response.ok) return
  } catch {
    // Fall through to direct Supabase fallback for non-Vercel local previews.
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Product database is not configured.')

  await databaseRequest(`/rest/v1/products?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ is_deleted: true }),
  })
}

export async function reorderDatabaseProducts(products: Product[], adminPassword: string) {
  if (!isProductDatabaseConfigured()) return

  try {
    if (!PRODUCTS_API_URL) throw new Error('Products API is not configured.')
    const response = await fetch(PRODUCTS_API_URL, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-password': adminPassword,
      },
      body: JSON.stringify({ products }),
    })
    if (response.ok) return
  } catch {
    // Fall through to direct Supabase fallback for non-Vercel local previews.
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Product database is not configured.')

  await Promise.all(products.map((product, index) => saveDatabaseProduct(product, index, adminPassword)))
}

export async function uploadProductImage(file: File, productName: string, adminPassword: string) {
  if (!isProductDatabaseConfigured()) return null

  try {
    if (!PRODUCT_IMAGE_API_URL) throw new Error('Product image API is not configured.')
    const response = await fetch(`${PRODUCT_IMAGE_API_URL}?name=${encodeURIComponent(productName)}&type=${encodeURIComponent(file.type)}`, {
      method: 'POST',
      headers: {
        'Content-Type': file.type || 'application/octet-stream',
        'x-admin-password': adminPassword,
      },
      body: file,
    })
    if (response.ok) {
      const data = await response.json() as { publicUrl: string }
      return data.publicUrl
    }
  } catch {
    // Fall through to direct Supabase fallback for non-Vercel local previews.
  }

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) throw new Error('Product database is not configured.')

  const safeName = productName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'product'
  const extension = file.name.split('.').pop() || 'jpg'
  const path = `${safeName}-${Date.now()}.${extension}`

  const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${PRODUCT_IMAGE_BUCKET}/${path}`, {
    method: 'POST',
    headers: supabaseHeaders({
      'Content-Type': file.type || 'application/octet-stream',
      'x-upsert': 'true',
    }),
    body: file,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Product image upload failed.')
  }

  return `${SUPABASE_URL}/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/${path}`
}
