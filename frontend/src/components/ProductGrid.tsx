import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent, MouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { track } from '@vercel/analytics'
import { HiShoppingCart, HiCheck, HiX, HiLink, HiChevronLeft, HiChevronRight, HiLockClosed, HiPlus, HiTrash, HiUpload, HiPencil, HiCollection, HiSwitchVertical, HiEye, HiEyeOff, HiAdjustments, HiSearch } from 'react-icons/hi'
import { FaWhatsapp, FaInstagram } from 'react-icons/fa'
import type { Product } from '../types'
import {
  deleteDatabaseProduct,
  fetchDatabaseProducts,
  isProductApiConfigured,
  isProductDatabaseConfigured,
  reorderDatabaseProducts,
  saveDatabaseProduct,
  uploadProductImage,
  verifyAdminPassword,
} from '../lib/productDatabase'
import { useDialogA11y } from '../hooks/useDialogA11y'

const WHATSAPP = '2348128288948'
const PRODUCT_PARAM = 'product'
const NGN = '\u20a6'
const ADMIN_PARAM = 'admin'
const ADMIN_PARAM_VALUE = 'products'
const ADMIN_HASH = '#admin-products'
const ADMIN_PRODUCTS_KEY = 'glamoursphair_admin_products'
const ADMIN_PRODUCT_OVERRIDES_KEY = 'glamoursphair_product_overrides'
const ADMIN_HIDDEN_PRODUCTS_KEY = 'glamoursphair_hidden_products'
const ADMIN_PRODUCT_ORDER_KEY = 'glamoursphair_product_order'
const LOCAL_ADMIN_PASSWORD = import.meta.env.DEV ? import.meta.env.VITE_LOCAL_ADMIN_PASSWORD ?? '' : ''
const AWOOF_GROUP = 'Awoof Sales'
const DEFAULT_GROUP = 'Signature Collection'
const ALL_COLLECTIONS = 'All Collections'
const ALL_LENGTHS = 'All lengths'
const ALL_FITTINGS = 'All fittings'
const PRODUCTION_URL = 'https://www.glamoursphairluxury.com/'

type SortOption = 'featured' | 'price-asc' | 'price-desc'

type ProductForm = {
  name: string
  price: string
  originalPrice: string
  description: string
  source: string
  length: string
  volume: string
  fitting: string
  link: string
  tag: string
  group: string
  image: string
}

type ProductOverrides = Record<string, Product>

const adminInputClass = 'w-full border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#c9a84c]/55'

function AdminField({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return (
    <label className={`grid gap-1.5 text-xs font-medium text-neutral-400 ${wide ? 'md:col-span-2' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  )
}

const emptyProductForm: ProductForm = {
  name: '',
  price: '',
  originalPrice: '',
  description: '',
  source: '',
  length: '',
  volume: '',
  fitting: '',
  link: '',
  tag: 'New',
  group: '',
  image: '',
}

const products: Product[] = [
  {
    id: 2,
    name: 'Wig Kelly in HD Lace',
    slug: 'wig-kelly-hd-lace',
    price: 298000,
    instagramLink: 'https://www.instagram.com/p/DLHdnLfgYS3/?igsh=MnA3MzJlb2s0YWF0',
    tag: 'Best Seller',
    description: "Our famous wig Kelly in HD lace. It is glueless, easy to wear and designed with a natural hairline that keeps people wondering if it is your real hair.",
    gradient: 'from-stone-900 to-neutral-800',
    images: [
      '/images/Wig Kellyin HDlace 2.jpeg',
      '/images/Wig Kellyin HDlace 1.jpeg',
      '/images/Wig Kellyin HDlace 3.jpeg',
    ],
  },
  {
    id: 101,
    name: 'SDD Luxury Bone Straight 18"',
    slug: 'sdd-luxury-bone-straight-18-13x4-swiss-lace',
    price: 240000,
    tag: 'New',
    group: AWOOF_GROUP,
    source: 'Vietnamese',
    length: '18"',
    volume: '373g',
    fitting: '13 by 4 Swiss lace',
    description: 'SDD luxury bone straight wig sourced from Vietnamese hair, finished with 13 by 4 Swiss lace, 18 inch length and 373g volume.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD Luxury bone straight.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 102,
    name: 'SDD Luxury Bone Straight 28"',
    slug: 'sdd-luxury-bone-straight-28-5x5',
    price: 480000,
    tag: 'New',
    group: AWOOF_GROUP,
    length: '28"',
    volume: '350g',
    fitting: '5 by 5',
    description: 'A long SDD luxury bone straight unit with 28 inch length, 350g volume and a secure 5 by 5 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/Wig Length 28.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 103,
    name: 'SDD Luxury Bone Straight 16"',
    slug: 'sdd-luxury-bone-straight-16-5x5-373g',
    price: 230000,
    tag: 'New',
    group: AWOOF_GROUP,
    length: '16"',
    volume: '373g',
    fitting: '5 by 5',
    description: 'SDD luxury bone straight wig in a polished 16 inch length with 373g volume and a 5 by 5 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight length 16.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 104,
    name: 'SDD Luxury Bone Straight 26"',
    slug: 'sdd-luxury-bone-straight-26-5x5-650k',
    price: 650000,
    tag: 'Premium',
    group: AWOOF_GROUP,
    length: '26"',
    volume: '330g',
    fitting: '5 by 5',
    description: 'Premium SDD luxury bone straight unit with sleek 26 inch styling, 330g volume and a 5 by 5 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight Length 26.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 105,
    name: 'SDD Luxury Bone Straight 16" Frontal',
    slug: 'sdd-luxury-bone-straight-16-13x4-250g',
    price: 190000,
    tag: 'New',
    group: AWOOF_GROUP,
    length: '16"',
    volume: '250g',
    fitting: '13 by 4',
    description: 'A 16 inch SDD luxury bone straight frontal unit with 250g volume and a 13 by 4 fitting for a natural finish.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/Wig Length 16.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 106,
    name: 'SDD Luxury Bone Straight 26"',
    slug: 'sdd-luxury-bone-straight-26-5x5-385k',
    price: 385000,
    tag: 'New',
    group: AWOOF_GROUP,
    length: '26"',
    volume: '330g',
    fitting: '5 by 5',
    description: 'Sleek 26 inch SDD luxury bone straight wig with 330g volume and a comfortable 5 by 5 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight length 26 volume 330.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 107,
    name: 'SDD Luxury Bone Straight 28"',
    slug: 'sdd-luxury-bone-straight-28-5x5-395k',
    price: 395000,
    tag: 'New',
    group: AWOOF_GROUP,
    length: '28"',
    volume: '330g',
    fitting: '5 by 5',
    description: 'Long 28 inch SDD luxury bone straight unit with 330g volume and a secure 5 by 5 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight length 28 volume 330.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 108,
    name: 'SDD Luxury Bone Straight 16"',
    slug: 'sdd-luxury-bone-straight-16-5x5-350g',
    price: 175000,
    tag: 'New',
    group: AWOOF_GROUP,
    length: '16"',
    volume: '350g',
    fitting: '5 by 5',
    description: 'Compact 16 inch SDD luxury bone straight wig with generous 350g volume and a neat 5 by 5 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight lenght 16 volume 350.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 109,
    name: 'SDD Luxury Bone Straight 20" Frontal',
    slug: 'sdd-luxury-bone-straight-20-13x4',
    price: 320000,
    tag: 'New',
    group: AWOOF_GROUP,
    length: '20"',
    volume: '330g',
    fitting: '13 by 4',
    description: 'SDD luxury bone straight frontal unit in 20 inch length with 330g volume and 13 by 4 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight length 20 volume 330.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 110,
    name: 'SDD Luxury Bone Straight 18"',
    slug: 'sdd-luxury-bone-straight-18-5x5',
    price: 180000,
    tag: 'New',
    group: AWOOF_GROUP,
    length: '18"',
    volume: '330g',
    fitting: '5 by 5',
    description: 'Everyday 18 inch SDD luxury bone straight wig with 330g volume and a clean 5 by 5 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight length 18 volume 330.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 111,
    name: 'SDD Luxury Bone Straight 22" HD',
    slug: 'sdd-luxury-bone-straight-22-hd-13x6',
    price: 480000,
    tag: 'Premium',
    group: AWOOF_GROUP,
    length: '22"',
    volume: '330g',
    fitting: 'HD 13 by 6',
    description: 'A 22 inch SDD luxury bone straight HD lace unit with 330g volume and a 13 by 6 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight length 22 volume 330.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 112,
    name: 'SDD Luxury Bone Straight 18" Frontal',
    slug: 'sdd-luxury-bone-straight-18-13x4',
    price: 370000,
    tag: 'Premium',
    group: AWOOF_GROUP,
    length: '18"',
    volume: '330g',
    fitting: '13 by 4',
    description: 'SDD luxury bone straight 18 inch frontal unit with 330g volume and a 13 by 4 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight length 18 volume 330 fitting 13 by 4.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 113,
    name: 'SDD Luxury Bone Straight 24"',
    slug: 'sdd-luxury-bone-straight-24-5x5',
    price: 380000,
    tag: 'New',
    group: AWOOF_GROUP,
    length: '24"',
    volume: '330g',
    fitting: '5 by 5',
    description: 'A sleek 24 inch SDD luxury bone straight unit with 330g volume and a secure 5 by 5 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight length 24 volume 330.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 114,
    name: 'SDD Luxury Bone Straight 28" Closure',
    slug: 'sdd-luxury-bone-straight-28-2x4',
    price: 390000,
    tag: 'New',
    group: AWOOF_GROUP,
    length: '28"',
    volume: '330g',
    fitting: '2 by 4',
    description: 'A 28 inch SDD luxury bone straight closure unit with 330g volume and a 2 by 4 fitting.',
    gradient: 'from-neutral-950 to-stone-900',
    image: '/images/SDD luxury bone straight length 28 volume 330 fitting 2 by 4.jpeg',
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 11,
    name: 'Signature Straight 22"',
    slug: 'signature-straight-22',
    price: 650000,
    originalPrice: 850000,
    tag: 'New',
    description: 'A polished straight unit designed for a soft natural finish, secure fit and effortless luxury styling.',
    gradient: 'from-neutral-900 to-stone-800',
    images: ['/images/11a.jpeg', '/images/11b.jpeg', '/images/11c.jpeg'],
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 12,
    name: '400g Donor Bouncy 28"',
    slug: '400g-donor-bouncy-28',
    price: 850000,
    originalPrice: 1200000,
    tag: 'New',
    description: 'Full-bodied donor hair with a soft bouncy finish for statement luxury looks.',
    gradient: 'from-neutral-900 to-stone-800',
    images: ['/images/12a.jpeg', '/images/12b.jpeg'],
    instagramLink: 'https://instagram.com/glamoursphair',
  },
  {
    id: 1,
    name: 'Wig Kelly Regular',
    slug: 'wig-kelly-regular',
    price: 135000,
    instagramLink: 'https://instagram.com/glamoursphair',
    tag: 'Trending',
    description: 'An everyday ready-to-wear Kelly unit with a clean finish and easy styling.',
    gradient: 'from-neutral-900 to-neutral-800',
    image: '/images/1.webp',
  },
  {
    id: 3,
    name: 'Wig Tasha',
    slug: 'wig-tasha',
    price: 265000,
    instagramLink: 'https://instagram.com/glamoursphair',
    tag: 'Premium',
    description: 'A premium unit made for soft glam, clean parting and confident wear.',
    gradient: 'from-zinc-900 to-stone-900',
    image: '/images/3.jpeg',
  },
  {
    id: 4,
    name: 'Wig Idah',
    slug: 'wig-idah',
    price: 185000,
    instagramLink: 'https://instagram.com/glamoursphair',
    description: 'A neat ready-to-style unit for polished everyday looks.',
    gradient: 'from-neutral-800 to-zinc-900',
    image: '/images/4.webp',
  },
  {
    id: 5,
    name: 'Wig Rossette',
    slug: 'wig-rossette-1',
    price: 235000,
    instagramLink: 'https://instagram.com/glamoursphair',
    tag: 'Trending',
    description: 'Soft, feminine and easy to style for elegant day-to-night wear.',
    gradient: 'from-stone-800 to-neutral-900',
    image: '/images/5.webp',
  },
  {
    id: 6,
    name: 'Wig Rossette',
    slug: 'wig-rossette-2',
    price: 235000,
    instagramLink: 'https://instagram.com/glamoursphair',
    description: 'A refined Rossette unit with a flattering shape and premium finish.',
    gradient: 'from-zinc-800 to-neutral-900',
    image: '/images/6.webp',
  },
  {
    id: 7,
    name: 'Wig Rossette Honey Blonde',
    slug: 'wig-rossette-honey-blonde',
    price: 235000,
    instagramLink: 'https://instagram.com/glamoursphair',
    description: 'A warm honey blonde finish for soft glam and standout styling.',
    gradient: 'from-neutral-900 to-stone-800',
    image: '/images/7.webp',
  },
  {
    id: 8,
    name: 'Signature Afro',
    slug: 'signature-afro',
    price: 110000,
    instagramLink: 'https://instagram.com/glamoursphair',
    tag: 'Limited',
    description: 'A bold signature afro unit made for volume, texture and confident wear.',
    gradient: 'from-stone-900 to-zinc-800',
    image: '/images/8.webp',
  },
  {
    id: 9,
    name: 'Signature Straight 28"',
    slug: 'signature-straight-28',
    price: 850000,
    instagramLink: 'https://instagram.com/glamoursphair',
    tag: 'Exclusive',
    description: 'Long, sleek and premium with a high-shine finish for luxury styling.',
    gradient: 'from-stone-900 to-zinc-800',
    image: '/images/9.webp',
  },
  {
    id: 10,
    name: 'Wig Kelly 14"',
    slug: 'wig-kelly-14',
    price: 345000,
    instagramLink: 'https://instagram.com/glamoursphair',
    description: 'A shorter Kelly unit with a natural finish and easy daily styling.',
    gradient: 'from-stone-900 to-zinc-800',
    image: '/images/10.webp',
  },
]

const tagColors: Record<string, string> = {
  'Best Seller': 'bg-[#c9a84c] text-black',
  New: 'bg-emerald-500 text-white',
  Premium: 'bg-purple-600 text-white',
  Trending: 'bg-rose-500 text-white',
  Exclusive: 'bg-[#c9a84c] text-black',
  Limited: 'bg-red-600 text-white',
}

interface ProductGridProps {
  onAddToCart: (product: Product) => void
}

function formatNgn(amount: number) {
  return `${NGN}${amount.toLocaleString()}`
}

function imageForProduct(product: Product) {
  return product.images?.[0] ?? product.image
}

function trackBuyerEvent(name: string, properties?: Record<string, string | number | boolean>) {
  track(name, properties)
}

function inferTexture(product: Product) {
  const text = `${product.name} ${product.description}`.toLowerCase()
  if (text.includes('bouncy')) return 'Bouncy'
  if (text.includes('afro')) return 'Afro'
  if (text.includes('straight')) return 'Straight'
  if (text.includes('serum')) return 'Hair care'
  if (text.includes('blonde')) return 'Honey blonde'
  return undefined
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function discoveryParam(name: string, fallback = '') {
  return new URLSearchParams(window.location.search).get(name) ?? fallback
}

function sortProducts(productList: Product[], sort: SortOption) {
  if (sort === 'price-asc') return [...productList].sort((a, b) => a.price - b.price)
  if (sort === 'price-desc') return [...productList].sort((a, b) => b.price - a.price)
  return productList
}

function absoluteImageUrl(path?: string) {
  if (!path) return undefined
  return new URL(path, PRODUCTION_URL).toString()
}

function parsePrice(value: string) {
  const clean = value.replace(/[^\d]/g, '')
  return Number(clean)
}

function readStorageValue<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    if (!stored) return fallback
    const parsed = JSON.parse(stored)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

function readAdminProducts(): Product[] {
  const parsed = readStorageValue<unknown>(ADMIN_PRODUCTS_KEY, [])
  return Array.isArray(parsed) ? parsed : []
}

function readProductOverrides(): ProductOverrides {
  const parsed = readStorageValue<unknown>(ADMIN_PRODUCT_OVERRIDES_KEY, {})
  return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as ProductOverrides : {}
}

function readHiddenProductIds(): number[] {
  const parsed = readStorageValue<unknown>(ADMIN_HIDDEN_PRODUCTS_KEY, [])
  return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []
}

function readProductOrder(): number[] {
  const parsed = readStorageValue<unknown>(ADMIN_PRODUCT_ORDER_KEY, [])
  return Array.isArray(parsed) ? parsed.filter((id): id is number => typeof id === 'number') : []
}

function productSpecs(product: Product) {
  return [
    product.group ? { label: 'Collection', value: product.group } : null,
    product.length ? { label: 'Length', value: product.length } : null,
    product.volume ? { label: 'Volume', value: product.volume } : null,
    product.fitting ? { label: 'Fitting', value: product.fitting } : null,
    product.source ? { label: 'Source', value: product.source } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>
}

function groupNameForProduct(product: Product) {
  return product.group?.trim() || DEFAULT_GROUP
}

function groupProducts(productList: Product[]) {
  const grouped = new Map<string, Product[]>()

  productList.forEach(product => {
    const groupName = groupNameForProduct(product)
    grouped.set(groupName, [...(grouped.get(groupName) ?? []), product])
  })

  return Array.from(grouped, ([name, groupedProducts]) => ({ name, products: groupedProducts }))
}

function orderProducts(productList: Product[], productOrder: number[]) {
  if (productOrder.length === 0) return productList

  const orderLookup = new Map(productOrder.map((id, index) => [id, index]))

  return productList
    .map((product, index) => ({ product, index }))
    .sort((a, b) => {
      const aOrder = orderLookup.get(a.product.id) ?? Number.MAX_SAFE_INTEGER
      const bOrder = orderLookup.get(b.product.id) ?? Number.MAX_SAFE_INTEGER
      if (aOrder !== bOrder) return aOrder - bOrder
      return a.index - b.index
    })
    .map(item => item.product)
}

function mergeProductsById(productList: Product[]) {
  const productsById = new Map<number, Product>()
  productList.forEach(product => productsById.set(product.id, product))
  return Array.from(productsById.values())
}

function productToForm(product: Product): ProductForm {
  return {
    name: product.name,
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    description: product.description,
    source: product.source ?? '',
    length: product.length ?? '',
    volume: product.volume ?? '',
    fitting: product.fitting ?? '',
    link: product.instagramLink ?? '',
    tag: product.tag ?? 'New',
    group: product.group ?? '',
    image: imageForProduct(product) ?? '',
  }
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [added, setAdded] = useState<number | null>(null)
  const [search, setSearch] = useState(() => discoveryParam('q'))
  const [activeCollection, setActiveCollection] = useState(() => discoveryParam('collection', ALL_COLLECTIONS))
  const [lengthFilter, setLengthFilter] = useState(() => discoveryParam('length', ALL_LENGTHS))
  const [fittingFilter, setFittingFilter] = useState(() => discoveryParam('fitting', ALL_FITTINGS))
  const [saleOnly, setSaleOnly] = useState(() => discoveryParam('sale') === '1')
  const [sort, setSort] = useState<SortOption>(() => {
    const value = discoveryParam('sort')
    return value === 'price-asc' || value === 'price-desc' ? value : 'featured'
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [selected, setSelected] = useState<Product | null>(null)
  const [slideIndexes, setSlideIndexes] = useState<Record<number, number>>({})
  const [copiedProductId, setCopiedProductId] = useState<number | null>(null)
  const [adminProducts, setAdminProducts] = useState<Product[]>(() => readAdminProducts())
  const [adminOpen, setAdminOpen] = useState(false)
  const [adminAccessCode, setAdminAccessCode] = useState('')
  const [adminUnlocked, setAdminUnlocked] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [showAdminPassword, setShowAdminPassword] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [adminSaving, setAdminSaving] = useState(false)
  const adminErrorTimer = useRef<number | null>(null)
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm)
  const [productOverrides, setProductOverrides] = useState<ProductOverrides>(() => readProductOverrides())
  const [hiddenProductIds, setHiddenProductIds] = useState<number[]>(() => readHiddenProductIds())
  const [productOrder, setProductOrder] = useState<number[]>(() => readProductOrder())
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [databaseProducts, setDatabaseProducts] = useState<Product[]>([])
  const [databaseHiddenIds, setDatabaseHiddenIds] = useState<number[]>([])
  const [databaseOrder, setDatabaseOrder] = useState<number[]>([])
  const [databaseStatus, setDatabaseStatus] = useState(isProductDatabaseConfigured() ? 'Connecting to database...' : 'Local mode: add Supabase env values to enable database sync.')
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [draggedProductId, setDraggedProductId] = useState<number | null>(null)
  const [dragOverProductId, setDragOverProductId] = useState<number | null>(null)
  const [pointerSortProductId, setPointerSortProductId] = useState<number | null>(null)

  const allProducts = useMemo(() => {
    const seedIds = new Set(products.map(product => product.id))
    const databaseProductsById = new Map(databaseProducts.map(product => [product.id, product]))
    const hiddenIds = Array.from(new Set([...hiddenProductIds, ...databaseHiddenIds]))
    const visibleSeedProducts = products
      .map(product => databaseProductsById.get(product.id) ?? productOverrides[String(product.id)] ?? product)
      .filter(product => !hiddenIds.includes(product.id))
    const persistedAdminProducts = databaseProducts.filter(product => !seedIds.has(product.id) && !hiddenIds.includes(product.id))
    const localAdminProducts = adminProducts.filter(product => !databaseProductsById.has(product.id) && !hiddenIds.includes(product.id))
    const order = productOrder.length > 0 ? productOrder : databaseOrder

    return orderProducts(mergeProductsById([...visibleSeedProducts, ...persistedAdminProducts, ...localAdminProducts]), order)
  }, [adminProducts, databaseHiddenIds, databaseOrder, databaseProducts, hiddenProductIds, productOrder, productOverrides])

  const featuredProducts = useMemo(
    () => allProducts.filter(product => ['Best Seller', 'New', 'Exclusive'].includes(product.tag ?? '')).slice(0, 4),
    [allProducts]
  )

  const lengthOptions = useMemo(() => Array.from(new Set(allProducts.map(product => product.length).filter(Boolean) as string[]))
    .sort((a, b) => Number.parseInt(a) - Number.parseInt(b)), [allProducts])
  const fittingOptions = useMemo(() => Array.from(new Set(allProducts.map(product => product.fitting).filter(Boolean) as string[]))
    .sort((a, b) => a.localeCompare(b)), [allProducts])

  const filtered = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase()
    const matches = allProducts.filter(product => {
      const searchable = [
        product.name,
        product.description,
        product.length,
        product.volume,
        product.fitting,
        product.source,
        groupNameForProduct(product),
        product.tag,
        inferTexture(product),
      ].filter(Boolean).join(' ').toLowerCase()

      return (!cleanSearch || searchable.includes(cleanSearch)) &&
        (lengthFilter === ALL_LENGTHS || product.length === lengthFilter) &&
        (fittingFilter === ALL_FITTINGS || product.fitting === fittingFilter) &&
        (!saleOnly || Boolean(product.originalPrice && product.originalPrice > product.price))
    })

    return sortProducts(matches, sort)
  }, [allProducts, fittingFilter, lengthFilter, saleOnly, search, sort])

  const groupedFiltered = useMemo(() => groupProducts(filtered), [filtered])
  const visibleCollectionGroups = useMemo(
    () => activeCollection === ALL_COLLECTIONS
      ? groupedFiltered
      : groupedFiltered.filter(collection => collection.name === activeCollection),
    [activeCollection, groupedFiltered]
  )
  const visibleProductCount = visibleCollectionGroups.reduce((sum, collection) => sum + collection.products.length, 0)
  const activeFilterCount = [
    lengthFilter !== ALL_LENGTHS,
    fittingFilter !== ALL_FITTINGS,
    saleOnly,
  ].filter(Boolean).length
  const relatedProducts = selected
    ? allProducts.filter(product => product.id !== selected.id && groupNameForProduct(product) === groupNameForProduct(selected)).slice(0, 3)
    : []

  const findProductFromUrl = useCallback(() => {
    const productParam = new URLSearchParams(window.location.search).get(PRODUCT_PARAM)
    if (!productParam) return null

    return allProducts.find(product => product.slug === productParam || String(product.id) === productParam) ?? null
  }, [allProducts])

  const productUrl = (product: Product) => {
    const url = new URL(PRODUCTION_URL)
    url.searchParams.set(PRODUCT_PARAM, product.slug ?? String(product.id))
    return url.toString()
  }

  const openProduct = (product: Product) => {
    const replacingOpenProduct = Boolean(selected)
    setSelected(product)
    trackBuyerEvent('Product View', { product: product.name, price: product.price })

    const url = new URL(window.location.href)
    url.searchParams.set(PRODUCT_PARAM, product.slug ?? String(product.id))
    window.history[replacingOpenProduct ? 'replaceState' : 'pushState']({}, '', url)
  }

  const closeProduct = () => {
    setSelected(null)

    const url = new URL(window.location.href)
    url.searchParams.delete(PRODUCT_PARAM)
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }

  const copyProductLink = async (e: MouseEvent, product: Product) => {
    e.stopPropagation()
    const link = productUrl(product)

    try {
      await navigator.clipboard.writeText(link)
      trackBuyerEvent('Copy Product Link', { product: product.name })
      setCopiedProductId(product.id)
      setTimeout(() => setCopiedProductId(null), 1800)
    } catch {
      window.prompt('Copy this product link:', link)
    }
  }

  const closeAdmin = () => {
    setAdminOpen(false)

    const url = new URL(window.location.href)
    let changed = false

    if (url.searchParams.get(ADMIN_PARAM) === ADMIN_PARAM_VALUE) {
      url.searchParams.delete(ADMIN_PARAM)
      changed = true
    }

    if (url.hash === ADMIN_HASH) {
      url.hash = ''
      changed = true
    }

    if (changed) window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }

  const productDialogRef = useDialogA11y<HTMLDivElement>(Boolean(selected), closeProduct)
  const adminDialogRef = useDialogA11y<HTMLDivElement>(adminOpen, closeAdmin)

  const resetDiscovery = () => {
    setSearch('')
    setActiveCollection(ALL_COLLECTIONS)
    setLengthFilter(ALL_LENGTHS)
    setFittingFilter(ALL_FITTINGS)
    setSaleOnly(false)
    setSort('featured')
  }

  useEffect(() => {
    const handleExternalSearch = (event: Event) => {
      const term = (event as CustomEvent<string>).detail ?? ''
      setSearch(term)
      setActiveCollection(ALL_COLLECTIONS)
      setLengthFilter(ALL_LENGTHS)
      setFittingFilter(ALL_FITTINGS)
      setSaleOnly(false)
      setSort('featured')
    }

    const syncProductFromUrl = () => {
      const product = findProductFromUrl()
      setSelected(product)
      if (product) {
        trackBuyerEvent('Product View', { product: product.name, source: 'direct-link' })
        document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    syncProductFromUrl()
    window.addEventListener('popstate', syncProductFromUrl)
    window.addEventListener('glamoursphair:search', handleExternalSearch)

    return () => {
      window.removeEventListener('popstate', syncProductFromUrl)
      window.removeEventListener('glamoursphair:search', handleExternalSearch)
    }
  }, [findProductFromUrl])

  useEffect(() => {
    const syncDiscoveryFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const nextSort = params.get('sort')
      setSearch(params.get('q') ?? '')
      setActiveCollection(params.get('collection') ?? ALL_COLLECTIONS)
      setLengthFilter(params.get('length') ?? ALL_LENGTHS)
      setFittingFilter(params.get('fitting') ?? ALL_FITTINGS)
      setSaleOnly(params.get('sale') === '1')
      setSort(nextSort === 'price-asc' || nextSort === 'price-desc' ? nextSort : 'featured')
    }

    window.addEventListener('popstate', syncDiscoveryFromUrl)
    return () => window.removeEventListener('popstate', syncDiscoveryFromUrl)
  }, [])

  useEffect(() => {
    const url = new URL(window.location.href)
    const setOptionalParam = (name: string, value: string, fallback: string) => {
      if (value && value !== fallback) url.searchParams.set(name, value)
      else url.searchParams.delete(name)
    }

    setOptionalParam('q', search.trim(), '')
    setOptionalParam('collection', activeCollection, ALL_COLLECTIONS)
    setOptionalParam('length', lengthFilter, ALL_LENGTHS)
    setOptionalParam('fitting', fittingFilter, ALL_FITTINGS)
    setOptionalParam('sort', sort, 'featured')
    if (saleOnly) url.searchParams.set('sale', '1')
    else url.searchParams.delete('sale')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [activeCollection, fittingFilter, lengthFilter, saleOnly, search, sort])

  useEffect(() => {
    const defaultTitle = 'GLAMOURSPHAIR | Luxury Hair & Wigs - Abuja'
    const defaultDescription = 'Shop premium luxury wigs and hair extensions from GLAMOURSPHAIR in Abuja, Nigeria, with secure Paystack checkout and local or international delivery.'
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    const structuredDataId = 'product-structured-data'
    const upsertMeta = (selector: string, attribute: 'name' | 'property', key: string, content: string) => {
      let element = document.querySelector<HTMLMetaElement>(selector)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attribute, key)
        document.head.appendChild(element)
      }
      element.content = content
    }

    document.getElementById(structuredDataId)?.remove()

    if (!selected) {
      document.title = defaultTitle
      canonical?.setAttribute('href', PRODUCTION_URL)
      upsertMeta('meta[name="description"]', 'name', 'description', defaultDescription)
      upsertMeta('meta[property="og:title"]', 'property', 'og:title', defaultTitle)
      upsertMeta('meta[property="og:description"]', 'property', 'og:description', defaultDescription)
      upsertMeta('meta[property="og:url"]', 'property', 'og:url', PRODUCTION_URL)
      upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website')
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', `${PRODUCTION_URL}images/Wig%20Kellyin%20HDlace%202.jpeg`)
      upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', defaultTitle)
      upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', defaultDescription)
      upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', `${PRODUCTION_URL}images/Wig%20Kellyin%20HDlace%202.jpeg`)
      return
    }

    const url = new URL(PRODUCTION_URL)
    url.searchParams.set(PRODUCT_PARAM, selected.slug ?? String(selected.id))
    const title = `${selected.name} | GLAMOURSPHAIR Luxury`
    const imageUrls = (selected.images ?? [selected.image]).map(absoluteImageUrl).filter(Boolean) as string[]
    document.title = title
    canonical?.setAttribute('href', url.toString())
    upsertMeta('meta[name="description"]', 'name', 'description', selected.description)
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title)
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', selected.description)
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url.toString())
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'product')
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title)
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', selected.description)
    if (imageUrls[0]) {
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', imageUrls[0])
      upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrls[0])
    }

    const script = document.createElement('script')
    script.id = structuredDataId
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: selected.name,
      description: selected.description,
      image: imageUrls,
      brand: { '@type': 'Brand', name: 'GLAMOURSPHAIR Luxury' },
      offers: {
        '@type': 'Offer',
        url: url.toString(),
        priceCurrency: 'NGN',
        price: selected.price,
      },
    })
    document.head.appendChild(script)

    return () => script.remove()
  }, [selected])

  useEffect(() => {
    const syncAdminFromUrl = () => {
      const url = new URL(window.location.href)
      setAdminOpen(url.searchParams.get(ADMIN_PARAM) === ADMIN_PARAM_VALUE || url.hash === ADMIN_HASH)
    }

    syncAdminFromUrl()
    window.addEventListener('popstate', syncAdminFromUrl)
    window.addEventListener('hashchange', syncAdminFromUrl)

    return () => {
      window.removeEventListener('popstate', syncAdminFromUrl)
      window.removeEventListener('hashchange', syncAdminFromUrl)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const loadDatabaseProducts = async () => {
      if (!isProductDatabaseConfigured()) return

      try {
        const snapshot = await fetchDatabaseProducts()
        if (!mounted || !snapshot) return

        setDatabaseProducts(snapshot.products)
        setDatabaseHiddenIds(snapshot.hiddenIds)
        setDatabaseOrder(snapshot.order)
        setDatabaseStatus('Database connected.')
      } catch {
        if (mounted) setDatabaseStatus('Database unavailable. Using local fallback for now.')
      }
    }

    void loadDatabaseProducts()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (activeCollection === ALL_COLLECTIONS) return
    if (!groupedFiltered.some(collection => collection.name === activeCollection)) {
      setActiveCollection(ALL_COLLECTIONS)
    }
  }, [activeCollection, groupedFiltered])

  const getSlideIndex = (id: number) => slideIndexes[id] ?? 0

  const nextSlide = (e: MouseEvent, id: number, total: number) => {
    e.stopPropagation()
    setSlideIndexes(prev => ({ ...prev, [id]: ((prev[id] ?? 0) + 1) % total }))
  }

  const prevSlide = (e: MouseEvent, id: number, total: number) => {
    e.stopPropagation()
    setSlideIndexes(prev => ({ ...prev, [id]: ((prev[id] ?? 0) - 1 + total) % total }))
  }

  const handleAdd = (product: Product) => {
    onAddToCart(product)
    trackBuyerEvent('Add To Cart', { product: product.name, price: product.price })
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1800)
  }

  const whatsappLink = (product: Product) => {
    const specs = [
      product.length ? `Length: ${product.length}` : '',
      product.fitting ? `Fitting: ${product.fitting}` : '',
      product.source ? `Source: ${product.source}` : '',
    ].filter(Boolean).join('\n')
    const msg = encodeURIComponent(
      `Hello GLAMOURSPHAIR! I'm interested in the *${product.name}* (${formatNgn(product.price)}).${specs ? `\n${specs}` : ''}\n${productUrl(product)}\n\nPlease help me confirm the details for this unit.`
    )
    return `https://wa.me/${WHATSAPP}?text=${msg}`
  }

  const updateAdminProducts = (nextProducts: Product[]) => {
    setAdminProducts(nextProducts)
    localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(nextProducts))
  }

  const updateProductOverrides = (nextOverrides: ProductOverrides) => {
    setProductOverrides(nextOverrides)
    localStorage.setItem(ADMIN_PRODUCT_OVERRIDES_KEY, JSON.stringify(nextOverrides))
  }

  const updateHiddenProductIds = (nextIds: number[]) => {
    setHiddenProductIds(nextIds)
    localStorage.setItem(ADMIN_HIDDEN_PRODUCTS_KEY, JSON.stringify(nextIds))
  }

  const updateProductOrder = useCallback((nextOrder: number[]) => {
    setProductOrder(nextOrder)
    localStorage.setItem(ADMIN_PRODUCT_ORDER_KEY, JSON.stringify(nextOrder))
  }, [])

  const showTemporaryAdminError = useCallback((message: string) => {
    if (adminErrorTimer.current) window.clearTimeout(adminErrorTimer.current)

    setAdminError(message)
    adminErrorTimer.current = window.setTimeout(() => {
      setAdminError(currentMessage => currentMessage === message ? '' : currentMessage)
      adminErrorTimer.current = null
    }, 3500)
  }, [])

  useEffect(() => () => {
    if (adminErrorTimer.current) window.clearTimeout(adminErrorTimer.current)
  }, [])

  const unlockAdmin = async (event: FormEvent) => {
    event.preventDefault()
    const cleanPassword = adminPassword.trim()

    if (!cleanPassword) {
      setAdminError('Enter the admin password.')
      return
    }

    if (!isProductApiConfigured() && !LOCAL_ADMIN_PASSWORD) {
      setAdminError('Local admin access is not configured. Add VITE_LOCAL_ADMIN_PASSWORD for local development.')
      return
    }

    try {
      const passwordIsValid = isProductApiConfigured()
        ? await verifyAdminPassword(cleanPassword)
        : cleanPassword === LOCAL_ADMIN_PASSWORD

      if (!passwordIsValid) {
        showTemporaryAdminError('Incorrect password.')
        return
      }
    } catch {
      setAdminError('Could not verify admin password. Check the deployed environment variables and try again.')
      return
    }

    setAdminAccessCode(cleanPassword)
    setAdminUnlocked(true)
    setAdminError('')
    setAdminPassword('')
    trackBuyerEvent('Admin Login', { surface: 'product-grid' })
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setSelectedImageFile(null)
      setAdminError('Upload a JPG, PNG, or WebP image.')
      event.target.value = ''
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setSelectedImageFile(null)
      setAdminError('Product images must be 8 MB or smaller.')
      event.target.value = ''
      return
    }

    setSelectedImageFile(file)
    setAdminError('')
    const reader = new FileReader()
    reader.onload = () => {
      setProductForm(prev => ({ ...prev, image: String(reader.result) }))
    }
    reader.readAsDataURL(file)
  }

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault()
    if (adminSaving) return

    const price = parsePrice(productForm.price)
    const originalPrice = productForm.originalPrice ? parsePrice(productForm.originalPrice) : 0

    if (!productForm.name.trim() || !price || !productForm.description.trim()) {
      setAdminError('Add a product name, price and description.')
      return
    }

    if (originalPrice && originalPrice <= price) {
      setAdminError('The original price must be higher than the current sale price.')
      return
    }

    setAdminSaving(true)

    try {
      const existingProduct = editingProductId ? allProducts.find(product => product.id === editingProductId) : null
      const imageUrl = selectedImageFile && isProductApiConfigured()
        ? await uploadProductImage(selectedImageFile, productForm.name.trim(), adminAccessCode)
        : productForm.image
      const imageChanged = existingProduct ? imageUrl !== imageForProduct(existingProduct) : true
      const product: Product = {
        ...(existingProduct ?? { id: Date.now(), gradient: 'from-neutral-950 to-stone-900' }),
        name: productForm.name.trim(),
        slug: slugify(productForm.name),
        price,
        originalPrice: originalPrice || undefined,
        tag: productForm.tag || undefined,
        description: productForm.description.trim(),
        source: productForm.source.trim() || undefined,
        length: productForm.length.trim() || undefined,
        volume: productForm.volume.trim() || undefined,
        fitting: productForm.fitting.trim() || undefined,
        group: productForm.group.trim() || undefined,
        instagramLink: productForm.link.trim() || 'https://instagram.com/glamoursphair',
        image: imageUrl || '/images/bone-straight.jpeg',
      }

      if (imageChanged) product.images = undefined

      if (editingProductId) {
        const isSeedProduct = products.some(seedProduct => seedProduct.id === editingProductId)
        if (isSeedProduct) {
          updateProductOverrides({ ...productOverrides, [String(editingProductId)]: product })
        } else {
          updateAdminProducts(adminProducts.map(adminProduct => adminProduct.id === editingProductId ? product : adminProduct))
        }
        if (isProductApiConfigured()) {
          await saveDatabaseProduct(product, allProducts.findIndex(item => item.id === product.id), adminAccessCode)
          setDatabaseProducts(prev => mergeProductsById([...prev.filter(item => item.id !== product.id), product]))
          setDatabaseHiddenIds(prev => prev.filter(id => id !== product.id))
          setDatabaseStatus('Database saved.')
        }
        trackBuyerEvent('Admin Product Edited', { product: product.name, price: product.price })
      } else {
        updateAdminProducts([product, ...adminProducts])
        updateProductOrder([product.id, ...allProducts.map(item => item.id)])
        if (isProductApiConfigured()) {
          await saveDatabaseProduct(product, 0, adminAccessCode)
          setDatabaseProducts(prev => mergeProductsById([product, ...prev]))
          setDatabaseOrder([product.id, ...allProducts.map(item => item.id)])
          setDatabaseStatus('Database saved.')
        }
        trackBuyerEvent('Admin Product Added', { product: product.name, price: product.price })
      }

      setProductForm(emptyProductForm)
      setEditingProductId(null)
      setSelectedImageFile(null)
      setAdminError('')
    } catch {
      setAdminError('Could not save to the database. Check Supabase settings and try again.')
      setDatabaseStatus('Database save failed.')
    } finally {
      setAdminSaving(false)
    }
  }

  const startEditingProduct = (product: Product) => {
    setEditingProductId(product.id)
    setProductForm(productToForm(product))
    setAdminError('')
  }

  const cancelEditingProduct = () => {
    setEditingProductId(null)
    setProductForm(emptyProductForm)
    setSelectedImageFile(null)
    setAdminError('')
  }

  const deleteProduct = async (id: number) => {
    const productToDelete = allProducts.find(product => product.id === id)
    if (!window.confirm(`Delete ${productToDelete?.name ?? 'this product'} from the storefront?`)) return

    const isSeedProduct = products.some(product => product.id === id)

    if (isSeedProduct) {
      updateHiddenProductIds(Array.from(new Set([...hiddenProductIds, id])))
    } else {
      updateAdminProducts(adminProducts.filter(product => product.id !== id))
    }

    updateProductOrder(productOrder.filter(productId => productId !== id))
    if (isProductApiConfigured()) {
      try {
        await deleteDatabaseProduct(id, adminAccessCode)
        setDatabaseProducts(prev => prev.filter(product => product.id !== id))
        setDatabaseHiddenIds(prev => Array.from(new Set([...prev, id])))
        setDatabaseOrder(prev => prev.filter(productId => productId !== id))
        setDatabaseStatus('Database saved.')
      } catch {
        setAdminError('Could not delete from the database. It was removed locally for now.')
        setDatabaseStatus('Database delete failed.')
      }
    }
    if (editingProductId === id) cancelEditingProduct()
    if (selected?.id === id) closeProduct()
  }

  const reorderProduct = useCallback((fromId: number, toId: number) => {
    if (fromId === toId) return

    const currentOrder = allProducts.map(product => product.id)
    const fromIndex = currentOrder.indexOf(fromId)
    const toIndex = currentOrder.indexOf(toId)
    if (fromIndex < 0 || toIndex < 0) return

    const nextOrder = [...currentOrder]
    const [moved] = nextOrder.splice(fromIndex, 1)
    nextOrder.splice(toIndex, 0, moved)
    updateProductOrder(nextOrder)

    const reorderedProducts = orderProducts(allProducts, nextOrder)
    if (isProductApiConfigured()) {
      void reorderDatabaseProducts(reorderedProducts, adminAccessCode).then(() => {
        setDatabaseOrder(nextOrder)
        setDatabaseStatus('Database saved.')
      }).catch(() => {
        setDatabaseStatus('Database unavailable. Sort saved locally only.')
      })
    }
  }, [adminAccessCode, allProducts, updateProductOrder])

  const handleProductDragStart = (event: DragEvent<HTMLDivElement>, id: number) => {
    setDraggedProductId(id)
    setDragOverProductId(null)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(id))
  }

  const handleProductDragOver = (event: DragEvent<HTMLDivElement>, id: number) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    if (draggedProductId && draggedProductId !== id) setDragOverProductId(id)
  }

  const handleProductDrop = (event: DragEvent<HTMLDivElement>, id: number) => {
    event.preventDefault()
    const droppedId = Number(event.dataTransfer.getData('text/plain')) || draggedProductId
    if (droppedId) reorderProduct(droppedId, id)
    setDraggedProductId(null)
    setDragOverProductId(null)
  }

  const endProductDrag = () => {
    setDraggedProductId(null)
    setDragOverProductId(null)
    setPointerSortProductId(null)
  }

  const dragHoverClass = (id: number) => {
    if (!draggedProductId || dragOverProductId !== id || draggedProductId === id) return ''

    const draggedIndex = allProducts.findIndex(product => product.id === draggedProductId)
    const hoveredIndex = allProducts.findIndex(product => product.id === id)
    if (draggedIndex < 0 || hoveredIndex < 0) return ''

    return draggedIndex < hoveredIndex ? '-translate-y-2' : 'translate-y-2'
  }

  const startProductPointerSort = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    if (event.button !== 0) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setPointerSortProductId(id)
    setDraggedProductId(id)
    setDragOverProductId(null)
  }

  useEffect(() => {
    if (!pointerSortProductId) return

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault()
      const hoveredElement = document.elementFromPoint(event.clientX, event.clientY)
      const hoveredCard = hoveredElement?.closest<HTMLElement>('[data-admin-product-id]')
      const hoveredId = Number(hoveredCard?.dataset.adminProductId)

      if (hoveredId && hoveredId !== pointerSortProductId) {
        setDragOverProductId(hoveredId)
      }
    }

    const handlePointerEnd = () => {
      if (dragOverProductId && dragOverProductId !== pointerSortProductId) {
        reorderProduct(pointerSortProductId, dragOverProductId)
      }

      endProductDrag()
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerEnd)
    window.addEventListener('pointercancel', handlePointerEnd)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
    }
  }, [dragOverProductId, pointerSortProductId, reorderProduct])

  const renderProductImage = (product: Product, compact = false) => (
    <div className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${product.gradient} ${compact ? 'max-h-72' : ''}`}>
      {product.images && product.images.length > 1 ? (
        <>
          <button type="button" onClick={() => openProduct(product)} className="absolute inset-0 h-full w-full text-left" aria-label={`View details for ${product.name}`}>
            <img
              src={product.images[getSlideIndex(product.id)]}
              alt={product.name}
              width="750"
              height="1000"
              loading="lazy"
              decoding="async"
              sizes={compact ? '(max-width: 767px) 50vw, 25vw' : '(max-width: 479px) 100vw, (max-width: 1023px) 50vw, 25vw'}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
            />
          </button>
          <button
            onClick={(e) => prevSlide(e, product.id, product.images!.length)}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/55 text-white transition-colors hover:bg-black/85"
            aria-label={`Previous ${product.name} image`}
          >
            <HiChevronLeft size={17} />
          </button>
          <button
            onClick={(e) => nextSlide(e, product.id, product.images!.length)}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/55 text-white transition-colors hover:bg-black/85"
            aria-label={`Next ${product.name} image`}
          >
            <HiChevronRight size={17} />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {product.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation()
                  setSlideIndexes(prev => ({ ...prev, [product.id]: i }))
                }}
                className="flex h-8 w-8 items-center justify-center"
                aria-label={`Show ${product.name} image ${i + 1}`}
                aria-current={i === getSlideIndex(product.id) ? 'true' : undefined}
              >
                <span className={`block h-1.5 rounded-full transition-[width,background-color] duration-200 ${i === getSlideIndex(product.id) ? 'w-4 bg-[#c9a84c]' : 'w-2 bg-white/50'}`} />
              </button>
            ))}
          </div>
        </>
      ) : imageForProduct(product) ? (
        <button type="button" onClick={() => openProduct(product)} className="absolute inset-0 h-full w-full text-left" aria-label={`View details for ${product.name}`}>
          <img
            src={imageForProduct(product)}
            alt={product.name}
            width="750"
            height="1000"
            loading="lazy"
            decoding="async"
            sizes={compact ? '(max-width: 767px) 50vw, 25vw' : '(max-width: 479px) 100vw, (max-width: 1023px) 50vw, 25vw'}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]"
          />
        </button>
      ) : (
        <button type="button" onClick={() => openProduct(product)} className="absolute inset-0 flex items-center justify-center text-[#c9a84c]/30" aria-label={`View details for ${product.name}`}>
          <HiShoppingCart size={44} />
        </button>
      )}

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111]/88 via-transparent to-black/15" />
      {product.tag && (
        <span className={`absolute left-3 top-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tagColors[product.tag]}`}>
          {product.tag}
        </span>
      )}
      <div className="absolute bottom-3 right-3 bg-black/80 px-3 py-1.5 backdrop-blur">
        {product.originalPrice && (
          <p className="text-[11px] text-neutral-300 line-through">Original {formatNgn(product.originalPrice)}</p>
        )}
        <p className="text-base font-bold leading-tight text-[#c9a84c] sm:text-lg"><span className="sr-only">Current price </span>{formatNgn(product.price)}</p>
      </div>
    </div>
  )

  const renderProductCard = (product: Product, compact = false) => (
    <article
      key={`${compact ? 'featured' : 'grid'}-${product.id}`}
      className="group relative flex flex-col overflow-hidden border border-white/8 bg-[#111] transition-[border-color,background-color] duration-300 hover:border-[#c9a84c]/45 hover:bg-[#15130f]"
    >
      {renderProductImage(product, compact)}

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-5">
        <h3 className="min-h-[2.6rem] text-base font-semibold leading-tight sm:text-lg">
          <button type="button" onClick={() => openProduct(product)} className="text-left text-white transition-colors duration-300 group-hover:text-[#c9a84c]">
            {product.name}
          </button>
        </h3>
        <p className="h-5 overflow-hidden whitespace-nowrap text-sm leading-5 text-neutral-500 [mask-image:linear-gradient(90deg,#000_78%,transparent)]">
          {product.description}
        </p>
        {productSpecs(product).length > 0 && (
          <div className="flex h-7 flex-wrap gap-1 overflow-hidden">
            {productSpecs(product).slice(0, 3).map(spec => (
              <span key={`${product.id}-${spec.label}`} className="border border-white/10 px-2 py-1 text-[10px] uppercase tracking-[0.08em] text-neutral-400">
                {spec.value}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={() => openProduct(product)}
            className="min-h-10 w-full border border-white/10 px-3 text-xs font-semibold text-neutral-300 transition-colors hover:border-[#c9a84c]/45 hover:text-[#c9a84c]"
          >
            View details
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAdd(product)
            }}
            aria-live="polite"
            className={`flex min-h-11 w-full items-center justify-center gap-2 px-3 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors sm:text-sm ${
              added === product.id ? 'bg-emerald-500 text-white' : 'bg-[#c9a84c] text-black hover:bg-white'
            }`}
          >
            {added === product.id ? (
              <><HiCheck size={16} /> Added</>
            ) : (
              <><HiShoppingCart size={16} /> Add to Cart</>
            )}
          </button>

          <a
            href={whatsappLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.stopPropagation()
              trackBuyerEvent('WhatsApp Click', { product: product.name, surface: compact ? 'featured-card' : 'product-card' })
            }}
            className="flex min-h-10 w-full items-center justify-center gap-2 border border-[#25D366]/30 px-3 text-[11px] font-semibold tracking-wide text-[#25D366] transition-colors hover:bg-[#25D366]/10 sm:text-sm"
          >
            <FaWhatsapp size={15} />
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  )

  return (
    <section id="shop" className="bg-[#0d0d0d] px-4 py-14 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#c9a84c]">Featured pieces</p>
              <h2 className="mt-2 font-display text-4xl leading-tight text-white md:text-6xl">
                Discover the latest Glamoursphair edit.
              </h2>
            </div>
            <button
              onClick={() => {
                resetDiscovery()
                document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="w-fit border border-[#c9a84c]/40 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#c9a84c] transition-colors hover:bg-[#c9a84c] hover:text-black"
            >
              View All Products
            </button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {featuredProducts.map(product => renderProductCard(product, true))}
          </div>
        </div>

        <div id="collection" className="border-t border-white/8 pt-12">
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#c9a84c]">Full collection</p>
              <h2 className="mt-2 font-display text-4xl text-white md:text-6xl">
                Find your next <span className="text-[#c9a84c]">signature look</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
                Premium ready-to-wear units, soft glam favorites and care essentials. Tap any product for full details.
              </p>
            </div>

            <div className="relative w-full md:max-w-sm">
              <label htmlFor="product-search" className="sr-only">Search products</label>
              <HiSearch aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input
                id="product-search"
                name="q"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search wigs, serum, blonde..."
                className="w-full border border-white/10 bg-[#111] py-3 pl-11 pr-11 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#c9a84c]/55"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center text-lg text-neutral-500 transition-colors hover:text-white"
                  aria-label="Clear product search"
                >
                  <HiX size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="mb-5 mt-6 flex flex-wrap items-center justify-between gap-3 border-y border-white/8 py-4">
            <p role="status" aria-live="polite" className="text-sm text-neutral-400">
              <span className="font-semibold text-white">{visibleProductCount}</span> product{visibleProductCount === 1 ? '' : 's'} shown
            </p>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(open => !open)}
              aria-expanded={mobileFiltersOpen}
              aria-controls="product-filters"
              className="flex min-h-11 items-center gap-2 border border-white/10 px-4 text-sm font-semibold text-neutral-300 md:hidden"
            >
              <HiAdjustments size={18} />
              Filter and sort{activeFilterCount ? ` (${activeFilterCount})` : ''}
            </button>
          </div>

          <div
            id="product-filters"
            className={`${mobileFiltersOpen ? 'grid' : 'hidden'} mb-8 gap-3 border-b border-white/8 pb-6 md:grid md:grid-cols-4 md:items-end`}
          >
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Length
              <select value={lengthFilter} onChange={event => setLengthFilter(event.target.value)} className="min-h-11 border border-white/10 bg-[#111] px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#c9a84c]/55">
                <option>{ALL_LENGTHS}</option>
                {lengthOptions.map(length => <option key={length}>{length}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Lace / fitting
              <select value={fittingFilter} onChange={event => setFittingFilter(event.target.value)} className="min-h-11 border border-white/10 bg-[#111] px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#c9a84c]/55">
                <option>{ALL_FITTINGS}</option>
                {fittingOptions.map(fitting => <option key={fitting}>{fitting}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-500">
              Sort by
              <select value={sort} onChange={event => setSort(event.target.value as SortOption)} className="min-h-11 border border-white/10 bg-[#111] px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#c9a84c]/55">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
            <div className="flex min-h-11 items-center justify-between gap-3">
              <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-neutral-300">
                <input type="checkbox" checked={saleOnly} onChange={event => setSaleOnly(event.target.checked)} className="h-5 w-5 accent-[#c9a84c]" />
                On sale only
              </label>
              {(activeFilterCount > 0 || sort !== 'featured') && (
                <button type="button" onClick={() => {
                  setLengthFilter(ALL_LENGTHS)
                  setFittingFilter(ALL_FITTINGS)
                  setSaleOnly(false)
                  setSort('featured')
                }} className="min-h-11 text-xs font-semibold text-[#c9a84c] underline underline-offset-4">
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            <button
              onClick={() => setActiveCollection(ALL_COLLECTIONS)}
              className={`min-h-24 border p-4 text-left transition-colors ${
                activeCollection === ALL_COLLECTIONS
                  ? 'border-[#c9a84c] bg-[#c9a84c] text-black'
                  : 'border-white/10 bg-[#111] text-white hover:border-[#c9a84c]/50'
              }`}
            >
              <HiCollection size={20} />
              <span className="mt-3 block text-xs font-bold uppercase tracking-[0.18em]">All collections</span>
              <span className={`mt-1 block text-xs ${activeCollection === ALL_COLLECTIONS ? 'text-black/60' : 'text-neutral-500'}`}>
                {filtered.length} item{filtered.length === 1 ? '' : 's'}
              </span>
            </button>
            {groupedFiltered.map(collection => (
              <button
                key={collection.name}
                onClick={() => setActiveCollection(collection.name)}
                className={`min-h-24 border p-4 text-left transition-colors ${
                  activeCollection === collection.name
                    ? 'border-[#c9a84c] bg-[#c9a84c] text-black'
                    : 'border-white/10 bg-[#111] text-white hover:border-[#c9a84c]/50'
                }`}
              >
                <HiCollection size={20} />
                <span className="mt-3 block text-xs font-bold uppercase tracking-[0.18em]">{collection.name}</span>
                <span className={`mt-1 block text-xs ${activeCollection === collection.name ? 'text-black/60' : 'text-neutral-500'}`}>
                  {collection.products.length} item{collection.products.length === 1 ? '' : 's'}
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-12">
            {visibleCollectionGroups.map(collection => (
              <div key={collection.name}>
                <div className="mb-4 flex items-end justify-between gap-4 border-b border-white/8 pb-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c9a84c]">Collection</p>
                    <h3 className="mt-1 font-display text-3xl text-white">{collection.name}</h3>
                  </div>
                  <span className="shrink-0 text-xs uppercase tracking-[0.18em] text-neutral-600">
                    {collection.products.length} item{collection.products.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                  {collection.products.map(product => renderProductCard(product))}
                </div>
              </div>
            ))}
          </div>

          {visibleProductCount === 0 && (
            <div className="py-20 text-center">
              <p className="mb-2 text-lg text-neutral-300">We could not find a matching product.</p>
              <p className="text-sm text-neutral-500">Try a different name, length or fitting, or clear the current choices.</p>
              <button
                onClick={resetDiscovery}
                className="mt-6 border border-[#c9a84c]/30 px-6 py-2.5 text-sm uppercase tracking-widest text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/10"
              >
                Clear search and filters
              </button>
              <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hello GLAMOURSPHAIR! I need help finding a product${search ? ` like ${search}` : ''}.`)}`} target="_blank" rel="noopener noreferrer" className="mx-auto mt-3 flex w-fit min-h-11 items-center gap-2 px-4 text-sm text-[#25D366]">
                <FaWhatsapp size={16} /> Ask on WhatsApp
              </a>
            </div>
          )}
        </div>

        <div className="mt-14 border border-[#25D366]/20 bg-[#25D366]/5 p-5 text-center md:flex md:items-center md:justify-between md:text-left">
          <div>
            <p className="text-sm font-semibold text-white">Need a custom unit or quick recommendation?</p>
            <p className="mt-1 text-sm text-neutral-500">Send us a message and we will help you choose the right piece.</p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hello GLAMOURSPHAIR! I need a custom hair piece. Can you help?')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackBuyerEvent('WhatsApp Click', { surface: 'custom-order-cta' })}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 bg-[#25D366] px-6 text-sm font-bold text-white transition-colors hover:bg-[#20b85a] md:mt-0"
          >
            <FaWhatsapp size={16} />
            Request Custom Order
          </a>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
          <div aria-hidden="true" className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={closeProduct} />
          <div
            ref={productDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-dialog-title"
            tabIndex={-1}
            className="relative z-10 grid max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/70 outline-none md:grid-cols-[1.05fr_0.95fr]"
          >
            <button
              onClick={closeProduct}
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-neutral-300 transition-colors hover:text-white"
              aria-label="Close product preview"
            >
              <HiX size={20} />
            </button>

            <div className={`relative aspect-[4/5] bg-gradient-to-br ${selected.gradient} md:min-h-[620px] md:aspect-auto`}>
              {selected.images && selected.images.length > 1 ? (
                <>
                  <img
                    src={selected.images[slideIndexes[selected.id] ?? 0]}
                    alt={`${selected.name}, view ${(slideIndexes[selected.id] ?? 0) + 1} of ${selected.images.length}`}
                    width="750"
                    height="1000"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <button onClick={(e) => prevSlide(e, selected.id, selected.images!.length)} className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-black/60 text-white transition-colors hover:bg-black/90" aria-label={`Previous ${selected.name} image`}>
                    <HiChevronLeft size={22} />
                  </button>
                  <button onClick={(e) => nextSlide(e, selected.id, selected.images!.length)} className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-black/60 text-white transition-colors hover:bg-black/90" aria-label={`Next ${selected.name} image`}>
                    <HiChevronRight size={22} />
                  </button>
                  <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1">
                    {selected.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSlideIndexes(prev => ({ ...prev, [selected.id]: i }))
                        }}
                        className="flex h-10 w-10 items-center justify-center"
                        aria-label={`Show ${selected.name} image ${i + 1}`}
                        aria-current={i === (slideIndexes[selected.id] ?? 0) ? 'true' : undefined}
                      >
                        <span className={`block h-1.5 rounded-full transition-[width,background-color] duration-200 ${i === (slideIndexes[selected.id] ?? 0) ? 'w-6 bg-[#c9a84c]' : 'w-2 bg-white/50'}`} />
                      </button>
                    ))}
                  </div>
                </>
              ) : imageForProduct(selected) ? (
                <img src={imageForProduct(selected)} alt={selected.name} width="750" height="1000" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-[#c9a84c]/30">
                  <HiShoppingCart size={56} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-black/20 md:bg-gradient-to-r md:from-transparent md:to-[#0d0d0d]/20" />
              {selected.tag && (
                <span className={`absolute left-4 top-4 px-2.5 py-1 text-xs font-bold uppercase tracking-widest ${tagColors[selected.tag]}`}>
                  {selected.tag}
                </span>
              )}
            </div>

            <div className="p-5 md:flex md:flex-col md:justify-center md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a84c]">Product details</p>
              <div className="mt-3 flex items-start justify-between gap-4">
                <h3 id="product-dialog-title" className="font-display text-3xl leading-tight text-white md:text-5xl">{selected.name}</h3>
                <div className="text-right">
                  {selected.originalPrice && (
                    <p className="text-xs text-neutral-400 line-through">Original {formatNgn(selected.originalPrice)}</p>
                  )}
                  <p className="whitespace-nowrap text-xl font-bold text-[#c9a84c]"><span className="sr-only">Current price </span>{formatNgn(selected.price)}</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-neutral-400 md:text-base">{selected.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
                {inferTexture(selected) && (
                  <div className="border border-white/8 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">Texture</p>
                    <p className="mt-1 text-white">{inferTexture(selected)}</p>
                  </div>
                )}
                {productSpecs(selected).map(spec => (
                  <div key={`${selected.id}-${spec.label}-modal`} className="border border-white/8 p-3">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">{spec.label}</p>
                    <p className="mt-1 text-white">{spec.value}</p>
                  </div>
                ))}
                <div className="border border-white/8 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">Support</p>
                  <p className="mt-1 text-white">WhatsApp styling help</p>
                </div>
              </div>

              <div className="mt-5 divide-y divide-white/8 border-y border-white/8">
                <details className="group py-4" open>
                  <summary className="cursor-pointer list-none text-sm font-semibold text-white">Details</summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                    Tap through the gallery for available product views. For lace, length or styling questions, use WhatsApp before checkout.
                  </p>
                </details>
                <details className="group py-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-white">Care guidance</summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                    Ask our WhatsApp team for care guidance specific to this unit before or after ordering.
                  </p>
                </details>
                <details className="group py-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-white">Delivery</summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                    Delivery fees are calculated in checkout after location selection. Abuja pickup and WhatsApp confirmation are available.
                  </p>
                </details>
                <details className="group py-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-white">Returns</summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                    Return terms are not published on this site yet. Confirm eligibility for this unit with our WhatsApp team before payment.
                  </p>
                </details>
              </div>

              <div className="my-6 h-px bg-white/8" />

              <div className="grid gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAdd(selected)
                    closeProduct()
                  }}
                  className="flex min-h-12 w-full items-center justify-center gap-2 bg-[#c9a84c] px-4 text-sm font-bold uppercase tracking-[0.12em] text-black transition-colors hover:bg-white"
                >
                  <HiShoppingCart size={16} />
                  Add to Cart
                </button>

                <button
                  onClick={(e) => copyProductLink(e, selected)}
                  className="flex min-h-12 w-full items-center justify-center gap-2 border border-[#c9a84c]/30 px-4 text-sm font-semibold text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/10"
                >
                  <HiLink size={16} />
                  {copiedProductId === selected.id ? 'Product Link Copied' : 'Copy Product Link'}
                </button>

                <a
                  href={whatsappLink(selected)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => {
                    e.stopPropagation()
                    trackBuyerEvent('WhatsApp Click', { product: selected.name, surface: 'product-modal' })
                  }}
                  className="flex min-h-12 w-full items-center justify-center gap-2 border border-[#25D366]/30 px-4 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/10"
                >
                  <FaWhatsapp size={16} />
                  Ask about this unit
                </a>

                {selected.instagramLink && (
                  <a
                    href={selected.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="flex min-h-12 w-full items-center justify-center gap-2 border border-[#E1306C]/30 px-4 text-sm font-semibold text-[#E1306C] transition-colors hover:bg-[#E1306C]/10"
                  >
                    <FaInstagram size={16} />
                    View on Instagram
                  </a>
                )}
              </div>

              <p className="mt-4 text-center text-xs leading-relaxed text-neutral-500">
                Secure Paystack checkout in NGN. Delivery fee is added after you select your location.
              </p>

              {relatedProducts.length > 0 && (
                <div className="mt-7 border-t border-white/8 pt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">More from {groupNameForProduct(selected)}</p>
                  <div className="mt-3 grid gap-2">
                    {relatedProducts.map(product => (
                      <button key={product.id} type="button" onClick={() => openProduct(product)} className="flex min-h-14 items-center gap-3 border border-white/8 p-2 text-left transition-colors hover:border-[#c9a84c]/40">
                        <img src={imageForProduct(product)} alt="" width="44" height="44" loading="lazy" className="h-11 w-11 shrink-0 object-cover" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-white">{product.name}</span>
                          <span className="block text-xs text-[#c9a84c]">{formatNgn(product.price)}</span>
                        </span>
                        <HiChevronRight className="shrink-0 text-neutral-500" size={18} />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {adminOpen && (
        <div className="fixed inset-0 z-[55] flex items-center justify-center p-3 md:p-6">
          <div aria-hidden="true" className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeAdmin} />
          <div
            ref={adminDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-dialog-title"
            tabIndex={-1}
            className="relative z-10 flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/70 outline-none"
          >
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#0d0d0d]/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a84c]">Admin inventory</p>
                <h3 id="admin-dialog-title" className="mt-1 font-display text-2xl text-white">Upload products</h3>
              </div>
              <button
                onClick={closeAdmin}
                className="flex h-10 w-10 items-center justify-center text-neutral-400 transition-colors hover:text-white"
                aria-label="Close admin products"
              >
                <HiX size={22} />
              </button>
            </div>

            {!adminUnlocked ? (
              <form onSubmit={unlockAdmin} className="mx-auto grid max-w-md gap-5 p-5 py-12 text-center md:py-16">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a84c]/30 bg-[#c9a84c]/10 text-[#c9a84c]">
                  <HiLockClosed size={24} />
                </div>
                <div>
                  <h4 className="font-display text-3xl text-white">Admin access</h4>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                    Enter the product admin password to upload new images and product details.
                  </p>
                </div>
                <label htmlFor="admin-password" className="grid gap-2 text-left text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">
                  Password
                  <span className="relative block">
                   <input
                      id="admin-password"
                      name="admin-password"
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={event => setAdminPassword(event.target.value)}
                      placeholder="Admin password"
                      autoComplete="current-password"
                      aria-invalid={Boolean(adminError)}
                      aria-describedby={adminError ? 'admin-access-error' : undefined}
                      required
                      className="w-full border border-white/10 bg-[#111] px-4 py-3 pr-12 text-center text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#c9a84c]/55"
                    />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(value => !value)}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-neutral-500 transition-colors hover:text-[#c9a84c]"
                    aria-label={showAdminPassword ? 'Hide admin password' : 'Show admin password'}
                    title={showAdminPassword ? 'Hide password' : 'Show password'}
                  >
                      {showAdminPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                    </button>
                  </span>
                </label>
                {adminError && <p id="admin-access-error" role="alert" className="text-sm text-red-400">{adminError}</p>}
                <button className="min-h-12 bg-[#c9a84c] px-5 text-sm font-bold uppercase tracking-[0.16em] text-black transition-colors hover:bg-white">
                  Unlock
                </button>
              </form>
            ) : (
              <div className="grid min-h-0 flex-1 overflow-hidden lg:grid-cols-[0.92fr_1.08fr]">
                <form onSubmit={saveProduct} className="grid content-start gap-3 overflow-y-auto p-5 lg:p-6">
                  <div>
                    <h4 className="font-display text-3xl text-white">{editingProductId ? 'Edit product' : 'New product'}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                      Upload an image, add product details, choose a collection, then save it to the storefront.
                    </p>
                  </div>

                  <label className="grid min-h-36 cursor-pointer place-items-center border border-dashed border-white/15 bg-[#111] p-4 text-center transition-colors hover:border-[#c9a84c]/50">
                    {productForm.image ? (
                      <img src={productForm.image} alt="Product upload preview" width="750" height="1000" className="max-h-44 w-full object-contain" />
                    ) : (
                      <span className="grid gap-3 text-neutral-500">
                        <HiUpload size={32} className="mx-auto text-[#c9a84c]" />
                        <span className="text-sm">Upload product image</span>
                      </span>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
                  </label>

                  <div className="grid gap-3 md:grid-cols-2">
                    <AdminField label="Product name">
                      <input
                        value={productForm.name}
                        onChange={event => setProductForm(prev => ({ ...prev, name: event.target.value }))}
                        placeholder="Wig Kelly in HD Lace"
                        required
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Price (NGN)">
                      <input
                        value={productForm.price}
                        onChange={event => setProductForm(prev => ({ ...prev, price: event.target.value }))}
                        placeholder="240000"
                        inputMode="numeric"
                        required
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Original price (NGN, optional)">
                      <input
                        value={productForm.originalPrice}
                        onChange={event => setProductForm(prev => ({ ...prev, originalPrice: event.target.value }))}
                        placeholder="280000"
                        inputMode="numeric"
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Source (optional)">
                      <input
                        value={productForm.source}
                        onChange={event => setProductForm(prev => ({ ...prev, source: event.target.value }))}
                        placeholder="Vietnamese"
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Wig length (optional)">
                      <input
                        value={productForm.length}
                        onChange={event => setProductForm(prev => ({ ...prev, length: event.target.value }))}
                        placeholder="18 inches"
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Volume (optional)">
                      <input
                        value={productForm.volume}
                        onChange={event => setProductForm(prev => ({ ...prev, volume: event.target.value }))}
                        placeholder="373g"
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Fitting (optional)">
                      <input
                        value={productForm.fitting}
                        onChange={event => setProductForm(prev => ({ ...prev, fitting: event.target.value }))}
                        placeholder="13 by 4 Swiss lace"
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Product or Instagram link (optional)" wide>
                      <input
                        type="url"
                        value={productForm.link}
                        onChange={event => setProductForm(prev => ({ ...prev, link: event.target.value }))}
                        placeholder="https://..."
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Collection" wide>
                      <input
                        value={productForm.group}
                        onChange={event => setProductForm(prev => ({ ...prev, group: event.target.value }))}
                        placeholder="Awoof Sales"
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Storefront tag" wide>
                      <select
                        value={productForm.tag}
                        onChange={event => setProductForm(prev => ({ ...prev, tag: event.target.value }))}
                        className={adminInputClass}
                      >
                        <option>New</option>
                        <option>Premium</option>
                        <option>Best Seller</option>
                        <option>Trending</option>
                        <option>Exclusive</option>
                        <option>Limited</option>
                      </select>
                    </AdminField>
                  </div>

                  <AdminField label="Product description">
                    <textarea
                      value={productForm.description}
                      onChange={event => setProductForm(prev => ({ ...prev, description: event.target.value }))}
                      placeholder="Describe this unit using verified details only."
                      rows={4}
                      required
                      className={`${adminInputClass} resize-none`}
                    />
                  </AdminField>

                  {adminError && <p role="alert" className="text-sm text-red-400">{adminError}</p>}

                  <div className="flex flex-wrap items-center gap-3">
                    <button disabled={adminSaving} className="flex min-h-10 w-fit items-center justify-center gap-2 bg-[#c9a84c] px-4 text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-60">
                      {editingProductId ? <HiCheck size={17} /> : <HiPlus size={17} />}
                      {adminSaving ? 'Saving...' : editingProductId ? 'Save changes' : 'Add product'}
                    </button>
                    {editingProductId && (
                      <button
                        type="button"
                        onClick={cancelEditingProduct}
                        className="min-h-10 border border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-300 transition-colors hover:border-white/25 hover:text-white"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                <div className="min-h-0 overflow-y-auto border-t border-white/10 p-5 lg:border-l lg:border-t-0 lg:p-6">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-display text-3xl text-white">Products</h4>
                      <p className="mt-1 text-sm text-neutral-500">{allProducts.length} visible product{allProducts.length === 1 ? '' : 's'}</p>
                      <p role="status" aria-live="polite" className="mt-1 text-xs text-neutral-600">{databaseStatus}</p>
                    </div>
                    <button
                      onClick={() => {
                        setAdminAccessCode('')
                        setAdminUnlocked(false)
                      }}
                      className="text-xs uppercase tracking-[0.16em] text-neutral-500 transition-colors hover:text-white"
                    >
                      Lock
                    </button>
                  </div>

                  <div className="grid gap-3">
                    {allProducts.length === 0 ? (
                      <div className="border border-white/10 bg-[#111] p-5 text-sm leading-relaxed text-neutral-500">
                        No visible products. Add a product from the form and it will show up here.
                      </div>
                    ) : (
                      allProducts.map((product, index) => (
                        <div
                          key={product.id}
                          data-admin-product-id={product.id}
                          draggable
                          onDragStart={event => handleProductDragStart(event, product.id)}
                          onDragEnter={() => {
                            if (draggedProductId && draggedProductId !== product.id) setDragOverProductId(product.id)
                          }}
                          onDragOver={event => handleProductDragOver(event, product.id)}
                          onDrop={event => handleProductDrop(event, product.id)}
                          onDragEnd={endProductDrag}
                          className={`grid cursor-grab grid-cols-[72px_1fr] gap-3 border bg-[#111] p-3 transition-[transform,border-color,background-color,opacity,box-shadow] duration-200 ease-out active:cursor-grabbing ${dragHoverClass(product.id)} ${
                            draggedProductId === product.id || pointerSortProductId === product.id
                              ? 'scale-[0.985] border-[#c9a84c]/70 opacity-55 shadow-lg shadow-[#c9a84c]/10'
                              : dragOverProductId === product.id
                                ? 'border-[#c9a84c]/55 bg-[#15130f] shadow-md shadow-black/40'
                                : 'border-white/10 hover:border-[#c9a84c]/35'
                          }`}
                        >
                          <img src={imageForProduct(product)} alt={product.name} width="72" height="80" loading="lazy" className="h-20 w-[72px] object-cover" />
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                                <p className="mt-1 text-sm text-[#c9a84c]">{formatNgn(product.price)}</p>
                                <p className="mt-1 truncate text-xs text-neutral-500">{groupNameForProduct(product)}</p>
                              </div>
                              <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-neutral-600">
                                {index + 1}
                              </span>
                            </div>
                            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-neutral-500">{product.description}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onPointerDown={event => startProductPointerSort(event, product.id)}
                                className="flex h-9 touch-none select-none items-center justify-center gap-2 border border-white/10 px-3 text-xs font-semibold text-neutral-400 transition-colors hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                                aria-label={`Drag ${product.name} to sort`}
                                title="Drag to sort"
                              >
                                <HiSwitchVertical size={15} />
                                Drag
                              </button>
                              <button
                                onClick={() => startEditingProduct(product)}
                                className="flex h-9 items-center justify-center gap-2 border border-white/10 px-3 text-xs font-semibold text-neutral-300 transition-colors hover:border-[#c9a84c]/40 hover:text-[#c9a84c]"
                              >
                                <HiPencil size={15} />
                                Edit
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="flex h-9 items-center justify-center gap-2 border border-white/10 px-3 text-xs font-semibold text-neutral-400 transition-colors hover:border-red-400/40 hover:text-red-400"
                              >
                                <HiTrash size={15} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
