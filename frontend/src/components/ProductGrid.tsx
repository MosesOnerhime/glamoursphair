import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent, MouseEvent, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { track } from '@vercel/analytics'
import { HiShoppingCart, HiCheck, HiX, HiLink, HiChevronLeft, HiChevronRight, HiLockClosed, HiPlus, HiUpload, HiEye, HiEyeOff } from 'react-icons/hi'
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
import ProductCatalog from './ProductCatalog'
import InventoryList from './InventoryList'

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
  slug: string
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
type InventoryConfirmation = { action: 'delete' | 'edit'; product: Product } | { action: 'new' }

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
  slug: '',
  price: '',
  originalPrice: '',
  description: '',
  source: '',
  length: '',
  volume: '',
  fitting: '',
  link: '',
  tag: '',
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
  const clean = value.replace(/[,\s]/g, '')
  const number = Number(clean)
  return /^\d+$/.test(clean) && Number.isSafeInteger(number) && number > 0 ? number : NaN
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
    slug: product.slug ?? '',
    price: String(product.price),
    originalPrice: product.originalPrice ? String(product.originalPrice) : '',
    description: product.description,
    source: product.source ?? '',
    length: product.length ?? '',
    volume: product.volume ?? '',
    fitting: product.fitting ?? '',
    link: product.instagramLink ?? '',
    tag: product.tag ?? '',
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
  const [priceFilter, setPriceFilter] = useState(() => discoveryParam('price', 'any'))
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
  const [adminVerifying, setAdminVerifying] = useState(false)
  const [adminPane, setAdminPane] = useState<'products' | 'editor'>('products')
  const [inventoryConfirmation, setInventoryConfirmation] = useState<InventoryConfirmation | null>(null)
  const confirmationCancelRef = useRef<HTMLButtonElement>(null)
  const [dragPoint, setDragPoint] = useState<{ x: number; y: number } | null>(null)
  const adminMutationRef = useRef(false)
  const adminErrorTimer = useRef<number | null>(null)
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm)
  const [productOverrides, setProductOverrides] = useState<ProductOverrides>(() => readProductOverrides())
  const [hiddenProductIds, setHiddenProductIds] = useState<number[]>(() => readHiddenProductIds())
  const [productOrder, setProductOrder] = useState<number[]>(() => readProductOrder())
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [databaseProducts, setDatabaseProducts] = useState<Product[]>([])
  const [databaseHiddenIds, setDatabaseHiddenIds] = useState<number[]>([])
  const [databaseOrder, setDatabaseOrder] = useState<number[]>([])
  const [databaseStatus, setDatabaseStatus] = useState(isProductDatabaseConfigured() ? 'Connecting to shared inventory...' : 'Local inventory - this device')
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const imageSelectionToken = useRef(0)
  const draftProductId = useRef<number | null>(null)
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
    const order = isProductApiConfigured() && databaseOrder.length > 0 && !adminSaving
      ? databaseOrder
      : productOrder.length > 0 ? productOrder : databaseOrder

    return orderProducts(mergeProductsById([...visibleSeedProducts, ...persistedAdminProducts, ...localAdminProducts]), order)
  }, [adminProducts, adminSaving, databaseHiddenIds, databaseOrder, databaseProducts, hiddenProductIds, productOrder, productOverrides])

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
        (priceFilter === 'any' || (priceFilter === 'under-300' && product.price < 300000) ||
          (priceFilter === '300-600' && product.price >= 300000 && product.price <= 600000) ||
          (priceFilter === 'above-600' && product.price > 600000)) &&
        (!saleOnly || Boolean(product.originalPrice && product.originalPrice > product.price))
    })

    return sortProducts(matches, sort)
  }, [allProducts, fittingFilter, lengthFilter, priceFilter, saleOnly, search, sort])

  const collectionGroups = useMemo(() => groupProducts(allProducts), [allProducts])
  const visibleProducts = useMemo(
    () => activeCollection === ALL_COLLECTIONS ? filtered : filtered.filter(product => groupNameForProduct(product) === activeCollection),
    [activeCollection, filtered]
  )
  const activeFilterCount = [
    lengthFilter !== ALL_LENGTHS,
    fittingFilter !== ALL_FITTINGS,
    saleOnly,
    priceFilter !== 'any',
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
    if (inventoryConfirmation) {
      if (!adminMutationRef.current) setInventoryConfirmation(null)
      return
    }
    setAdminOpen(false)
    setAdminAccessCode('')
    setAdminUnlocked(false)
    setAdminPassword('')
    setShowAdminPassword(false)

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
    setPriceFilter('any')
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
      setPriceFilter('any')
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
      setPriceFilter(params.get('price') ?? 'any')
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
    setOptionalParam('price', priceFilter, 'any')
    if (saleOnly) url.searchParams.set('sale', '1')
    else url.searchParams.delete('sale')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [activeCollection, fittingFilter, lengthFilter, priceFilter, saleOnly, search, sort])

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
    if (!collectionGroups.some(collection => collection.name === activeCollection)) {
      setActiveCollection(ALL_COLLECTIONS)
    }
  }, [activeCollection, collectionGroups])


  const nextSlide = (e: MouseEvent, id: number, total: number) => {
    e.stopPropagation()
    setSlideIndexes(prev => ({ ...prev, [id]: ((prev[id] ?? 0) + 1) % total }))
  }

  const prevSlide = (e: MouseEvent, id: number, total: number) => {
    e.stopPropagation()
    setSlideIndexes(prev => ({ ...prev, [id]: ((prev[id] ?? 0) - 1 + total) % total }))
  }

  const handleAdd = (product: Product) => {
    if (selected) closeProduct()
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

const writeAdminCache = (key: string, value: unknown) => {
    try { localStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
  }

  const updateAdminProducts = (nextProducts: Product[]) => {
    setAdminProducts(nextProducts)
    return writeAdminCache(ADMIN_PRODUCTS_KEY, nextProducts)
  }
  const updateProductOverrides = (nextOverrides: ProductOverrides) => {
    setProductOverrides(nextOverrides)
    return writeAdminCache(ADMIN_PRODUCT_OVERRIDES_KEY, nextOverrides)
  }
  const updateHiddenProductIds = (nextIds: number[]) => {
    setHiddenProductIds(nextIds)
    return writeAdminCache(ADMIN_HIDDEN_PRODUCTS_KEY, nextIds)
  }
  const updateProductOrder = useCallback((nextOrder: number[]) => {
    setProductOrder(nextOrder)
    try { localStorage.setItem(ADMIN_PRODUCT_ORDER_KEY, JSON.stringify(nextOrder)); return true } catch { return false }
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
    if (adminVerifying) return
    if (!adminPassword) { setAdminError('Enter the admin password.'); return }
    if (!isProductApiConfigured() && !LOCAL_ADMIN_PASSWORD) {
      setAdminError('Admin access is not configured in this environment.')
      return
    }
    setAdminVerifying(true)
    try {
      const valid = isProductApiConfigured() ? await verifyAdminPassword(adminPassword) : adminPassword === LOCAL_ADMIN_PASSWORD
      if (!valid) { showTemporaryAdminError('Incorrect password.'); return }
      setAdminAccessCode(adminPassword)
      setAdminUnlocked(true)
      setAdminError('')
      setAdminPassword('')
      setShowAdminPassword(false)
      trackBuyerEvent('Admin Login', { surface: 'product-grid' })
    } catch {
      setAdminError('Could not verify access. Please try again.')
    } finally { setAdminVerifying(false) }
  }

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAdminError('Upload a JPG, PNG, or WebP image.')
      event.target.value = ''
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      setAdminError('Product images must be 4 MB or smaller.')
      event.target.value = ''
      return
    }

    setSelectedImageFile(file)
    const selectionToken = ++imageSelectionToken.current
    setAdminError('')
    const reader = new FileReader()
    reader.onload = () => {
      if (selectionToken !== imageSelectionToken.current) return
      setProductForm(prev => ({ ...prev, image: String(reader.result) }))
    }
    reader.onerror = () => {
      if (selectionToken !== imageSelectionToken.current) return
      setSelectedImageFile(null)
      setAdminError('Could not read this photograph. Please select it again.')
    }
    reader.readAsDataURL(file)
  }

  const saveProduct = async (event: FormEvent) => {
    event.preventDefault()
    if (adminMutationRef.current) return
    const price = parsePrice(productForm.price)
    const originalPrice = productForm.originalPrice ? parsePrice(productForm.originalPrice) : 0
    if (!productForm.name.trim() || !Number.isSafeInteger(price) || !productForm.description.trim()) {
      setAdminError('A name, positive whole-number NGN price and description are required.')
      return
    }
    if (productForm.originalPrice && (!Number.isSafeInteger(originalPrice) || originalPrice <= price)) {
      setAdminError('Original price must be a whole NGN amount above the current price.')
      return
    }
    if (!productForm.image) { setAdminError('Choose a product photograph before saving.'); return }
    const existing = editingProductId ? allProducts.find(product => product.id === editingProductId) : null
    const id = existing?.id ?? (draftProductId.current ??= Date.now())
    const slug = productForm.slug.trim() || existing?.slug || `${slugify(productForm.name)}-${id}`
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || allProducts.some(product => product.id !== id && product.slug === slug)) {
      setAdminError('Use a unique product URL slug with lowercase letters, numbers and hyphens.')
      return
    }
    adminMutationRef.current = true
    setAdminSaving(true)
    setAdminError('')
    setDatabaseStatus('Saving product...')
    try {
      const imageUrl = selectedImageFile && isProductApiConfigured()
        ? await uploadProductImage(selectedImageFile, productForm.name.trim(), adminAccessCode)
        : productForm.image
      const product: Product = {
        ...(existing ?? { id, gradient: 'from-neutral-950 to-stone-900' }),
        name: productForm.name.trim(), slug, price, originalPrice: originalPrice || undefined,
        tag: productForm.tag || undefined, description: productForm.description.trim(),
        source: productForm.source.trim() || undefined, length: productForm.length.trim() || undefined,
        volume: productForm.volume.trim() || undefined, fitting: productForm.fitting.trim() || undefined,
        group: productForm.group.trim() || undefined, instagramLink: productForm.link.trim() || undefined,
        image: imageUrl,
      }
      if (!existing || imageUrl !== imageForProduct(existing)) product.images = undefined
      const nextOrder = existing ? allProducts.map(item => item.id) : [id, ...allProducts.filter(item => item.id !== id).map(item => item.id)]
      if (isProductApiConfigured()) {
        if (existing) await saveDatabaseProduct(product, allProducts.findIndex(item => item.id === id), adminAccessCode)
        else await reorderDatabaseProducts([product, ...allProducts.filter(item => item.id !== id)], adminAccessCode)
        setDatabaseProducts(prev => mergeProductsById([product, ...prev.filter(item => item.id !== id)]))
        setDatabaseHiddenIds(prev => prev.filter(hiddenId => hiddenId !== id))
        setDatabaseOrder(nextOrder)
      }
      let cached = true
      if (existing && products.some(seed => seed.id === id)) cached = updateProductOverrides({ ...productOverrides, [String(id)]: product })
      else cached = updateAdminProducts([product, ...adminProducts.filter(item => item.id !== id)])
      cached = updateProductOrder(nextOrder) && cached
      setDatabaseStatus(isProductApiConfigured() ? 'Saved to shared inventory.' : cached ? 'Saved on this device.' : 'Saved in this session only. Device storage is unavailable.')
      trackBuyerEvent(existing ? 'Admin Product Edited' : 'Admin Product Added', { product: product.name, price: product.price })
      setProductForm(emptyProductForm)
      draftProductId.current = null
      imageSelectionToken.current += 1
      setEditingProductId(null)
      setSelectedImageFile(null)
      setAdminPane('products')
    } catch {
      setAdminError('Could not confirm the save. Your draft is kept; refresh inventory before retrying if your connection dropped.')
      setDatabaseStatus('Save failed. Please retry.')
    } finally { adminMutationRef.current = false; setAdminSaving(false) }
  }

  const draftIsDirty = () => {
    const baseline = editingProductId ? productToForm(allProducts.find(product => product.id === editingProductId) ?? { id: 0, name: '', price: 0, description: '', gradient: '' }) : emptyProductForm
    return (Object.keys(emptyProductForm) as (keyof ProductForm)[]).some(key => productForm[key] !== baseline[key])
  }

  const requestNewProduct = () => {
    if (draftIsDirty()) { setInventoryConfirmation({ action: 'new' }); return }
    cancelEditingProduct()
    setAdminPane('editor')
  }

  const startEditingProduct = (product: Product, confirmed = false) => {
    if (editingProductId === product.id) { setAdminPane('editor'); return }
    if (!confirmed && draftIsDirty()) { setInventoryConfirmation({ action: 'edit', product }); return }
    if (adminSaving) return
    setAdminPane('editor')
    imageSelectionToken.current += 1
    setSelectedImageFile(null)
    setEditingProductId(product.id)
    setProductForm(productToForm(product))
    setAdminError('')
  }

  const cancelEditingProduct = () => {
    imageSelectionToken.current += 1
    draftProductId.current = null
    setEditingProductId(null)
    setProductForm(emptyProductForm)
    setSelectedImageFile(null)
    setAdminError('')
  }

  const deleteProduct = async (id: number) => {
    if (adminMutationRef.current) return
    const product = allProducts.find(item => item.id === id)
    if (!product) return
    adminMutationRef.current = true
    setAdminSaving(true)
    setAdminError('')
    setDatabaseStatus('Deleting product...')
    try {
      if (isProductApiConfigured()) await deleteDatabaseProduct(product, adminAccessCode)
      const cached = updateHiddenProductIds(Array.from(new Set([...hiddenProductIds, id])))
      updateAdminProducts(adminProducts.filter(item => item.id !== id))
      updateProductOrder(allProducts.filter(item => item.id !== id).map(item => item.id))
      setDatabaseProducts(prev => prev.filter(item => item.id !== id))
      setDatabaseHiddenIds(prev => [...new Set([...prev, id])])
      setDatabaseOrder(prev => prev.filter(productId => productId !== id))
      setDatabaseStatus(isProductApiConfigured() ? 'Product removed from shared inventory.' : cached ? 'Product removed on this device.' : 'Removed in this session only.')
      if (editingProductId === id) cancelEditingProduct()
      if (selected?.id === id) closeProduct()
      setInventoryConfirmation(null)
    } catch {
      setAdminError('Delete failed. The product has not been removed; please retry.')
      setDatabaseStatus('Delete failed.')
    } finally { adminMutationRef.current = false; setAdminSaving(false) }
  }

  const reorderProduct = useCallback(async (fromId: number, toId: number) => {
    if (fromId === toId || adminMutationRef.current) return
    const current = allProducts.map(product => product.id)
    const from = current.indexOf(fromId), to = current.indexOf(toId)
    if (from < 0 || to < 0) return
    const next = [...current]
    next.splice(to, 0, ...next.splice(from, 1))
    adminMutationRef.current = true
    setAdminSaving(true)
    setAdminError('')
    setDatabaseStatus('Saving product order...')
    const cached = updateProductOrder(next)
    try {
      if (isProductApiConfigured()) await reorderDatabaseProducts(orderProducts(allProducts, next), adminAccessCode)
      setDatabaseOrder(next)
      setDatabaseStatus(isProductApiConfigured() ? 'Product order saved to shared inventory.' : cached ? 'Product order saved on this device.' : 'Order saved in this session only.')
    } catch {
      updateProductOrder(current)
      setAdminError('Order could not be saved. The previous order has been restored.')
      setDatabaseStatus('Order save failed.')
    } finally { adminMutationRef.current = false; setAdminSaving(false) }
  }, [adminAccessCode, allProducts, updateProductOrder])

  useEffect(() => {
    if (!inventoryConfirmation) return
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    confirmationCancelRef.current?.focus()
    return () => {
      if (previous?.isConnected) previous.focus()
      else document.querySelector<HTMLInputElement>('#inventory-search')?.focus()
    }
  }, [inventoryConfirmation])

  const confirmInventoryAction = () => {
    if (!inventoryConfirmation) return
    if (inventoryConfirmation.action === 'delete') { void deleteProduct(inventoryConfirmation.product.id); return }
    cancelEditingProduct()
    if (inventoryConfirmation.action === 'edit') startEditingProduct(inventoryConfirmation.product, true)
    else setAdminPane('editor')
    setInventoryConfirmation(null)
  }

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
    if (droppedId) void reorderProduct(droppedId, id)
    setDraggedProductId(null)
    setDragOverProductId(null)
  }

  const endProductDrag = () => {
    setDraggedProductId(null)
    setDragOverProductId(null)
    setPointerSortProductId(null)
    setDragPoint(null)
  }

  const dragHoverClass = (id: number) => {
    if (!draggedProductId || dragOverProductId !== id || draggedProductId === id) return ''

    const draggedIndex = allProducts.findIndex(product => product.id === draggedProductId)
    const hoveredIndex = allProducts.findIndex(product => product.id === id)
    if (draggedIndex < 0 || hoveredIndex < 0) return ''

    return draggedIndex < hoveredIndex ? '-translate-y-2' : 'translate-y-2'
  }

  const startProductPointerSort = (event: ReactPointerEvent<HTMLButtonElement>, id: number) => {
    if (event.button !== 0 || adminMutationRef.current) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragPoint({ x: event.clientX, y: event.clientY })
    setPointerSortProductId(id)
    setDraggedProductId(id)
    setDragOverProductId(null)
  }

  useEffect(() => {
    if (!pointerSortProductId) return

    const handlePointerMove = (event: PointerEvent) => {
      event.preventDefault()
      setDragPoint({ x: event.clientX, y: event.clientY })
      const scroller = document.querySelector<HTMLElement>('.inventory-scroll')
      if (scroller) {
        const bounds = scroller.getBoundingClientRect()
        if (event.clientY < bounds.top + 48) scroller.scrollBy(0, -18)
        else if (event.clientY > bounds.bottom - 48) scroller.scrollBy(0, 18)
      }
      const hoveredElement = document.elementFromPoint(event.clientX, event.clientY)
      const hoveredCard = hoveredElement?.closest<HTMLElement>('[data-admin-product-id]')
      const hoveredId = Number(hoveredCard?.dataset.adminProductId)

      if (hoveredId && hoveredId !== pointerSortProductId) {
        setDragOverProductId(hoveredId)
      }
    }

    const handlePointerEnd = () => {
      if (dragOverProductId && dragOverProductId !== pointerSortProductId) {
        void reorderProduct(pointerSortProductId, dragOverProductId)
      }

      endProductDrag()
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: false })
    window.addEventListener('pointerup', handlePointerEnd)
    window.addEventListener('pointercancel', endProductDrag)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', endProductDrag)
    }
  }, [dragOverProductId, pointerSortProductId, reorderProduct])

  return (
    <section id="shop" className="luxury-catalog">
      <ProductCatalog
        products={visibleProducts}
        collections={collectionGroups}
        collection={activeCollection}
        onCollection={setActiveCollection}
        search={search}
        onSearch={setSearch}
        filtersOpen={mobileFiltersOpen}
        onToggleFilters={() => setMobileFiltersOpen(value => !value)}
        filterCount={activeFilterCount}
        onReset={resetDiscovery}
        onProduct={openProduct}
        onAdd={handleAdd}
        added={added}
        productLink={productUrl}
        whatsappLink={whatsappLink}
        filters={<>
          <label>Price<select value={priceFilter} onChange={event => setPriceFilter(event.target.value)}><option value="any">Any price</option><option value="under-300">Under NGN 300,000</option><option value="300-600">NGN 300,000 - 600,000</option><option value="above-600">Above NGN 600,000</option></select></label>
          <label>Length<select value={lengthFilter} onChange={event => setLengthFilter(event.target.value)}><option>{ALL_LENGTHS}</option>{lengthOptions.map(length => <option key={length}>{length}</option>)}</select></label>
          <label>Lace / fitting<select value={fittingFilter} onChange={event => setFittingFilter(event.target.value)}><option>{ALL_FITTINGS}</option>{fittingOptions.map(fitting => <option key={fitting}>{fitting}</option>)}</select></label>
          <label>Sort by<select value={sort} onChange={event => setSort(event.target.value as SortOption)}><option value="featured">Featured</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label>
          <label className="sale-checkbox"><input type="checkbox" checked={saleOnly} onChange={event => setSaleOnly(event.target.checked)} />On sale only</label>
          <button type="button" onClick={resetDiscovery} className="filter-reset">Clear all</button>
        </>}
      />
      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 md:p-6">
          <div aria-hidden="true" className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={closeProduct} />
          <div
            ref={productDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-dialog-title"
            tabIndex={-1}
            className="product-detail relative z-10 grid max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/70 outline-none md:grid-cols-[1.05fr_0.95fr]"
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

              {selected.tag && (
                <span className={`absolute left-4 top-4 px-2.5 py-1 text-xs font-bold uppercase tracking-widest ${tagColors[selected.tag]}`}>
                  {selected.tag}
                </span>
              )}
            </div>

            <div className="p-5 md:flex md:flex-col md:justify-center md:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a84c]">Product details</p>
              <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
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
        <div className="admin-overlay">
          <div aria-hidden="true" className="admin-backdrop" onClick={closeAdmin} />
          <div ref={adminDialogRef} role="dialog" aria-modal="true" aria-labelledby="admin-dialog-title" tabIndex={-1} className={`admin-workspace ${adminUnlocked ? '' : 'is-locked'}`}>
            <header className="admin-header" inert={Boolean(inventoryConfirmation)}>
              <div className="admin-heading"><img src="/images/logo.png" alt="" width="196" height="168" /><div><span>GLAMOURSPHAIR</span><h2 id="admin-dialog-title">Inventory</h2></div></div>
              <div className="admin-header-actions">
                {adminUnlocked && <>
                  <button type="button" className="admin-primary" disabled={adminSaving} onClick={requestNewProduct} aria-label="New product" title="New product"><HiPlus size={18} /> New product</button>
                  <button type="button" className="inventory-icon" disabled={adminSaving} onClick={() => { setAdminAccessCode(''); setAdminUnlocked(false); setAdminPassword(''); setShowAdminPassword(false) }} aria-label="Lock inventory" title="Lock inventory"><HiLockClosed size={20} /></button>
                </>}
                <button type="button" className="inventory-icon" onClick={closeAdmin} aria-label="Close admin products" title="Close inventory"><HiX size={22} /></button>
              </div>
            </header>
            {!adminUnlocked ? <form onSubmit={unlockAdmin} className="admin-login">
              <HiLockClosed className="admin-login-symbol" size={27} aria-hidden="true" />
              <h3>Private inventory access</h3>
              <label htmlFor="admin-password">Password</label>
              <div className="admin-password-control"><input id="admin-password" name="admin-password" type={showAdminPassword ? 'text' : 'password'} value={adminPassword} onChange={event => setAdminPassword(event.target.value)} autoComplete="current-password" required aria-invalid={Boolean(adminError)} aria-describedby={adminError ? 'admin-access-error' : undefined} /><button type="button" onClick={() => setShowAdminPassword(value => !value)} aria-label={showAdminPassword ? 'Hide admin password' : 'Show admin password'} title={showAdminPassword ? 'Hide password' : 'Show password'}>{showAdminPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}</button></div>
              {adminError && <p id="admin-access-error" role="alert" className="admin-operation-error">{adminError}</p>}
              <button className="admin-primary" disabled={adminVerifying}>{adminVerifying ? 'Verifying...' : 'Unlock inventory'}</button>
            </form> : <>
              <div className="admin-statusbar" inert={Boolean(inventoryConfirmation)}><p role="status" aria-live="polite"><span className={adminSaving ? 'status-saving' : 'status-dot'} />{databaseStatus}</p><span>{allProducts.length} products</span></div>
              {adminError && !inventoryConfirmation && <p role="alert" className="admin-operation-error">{adminError}</p>}
              <div className="admin-mobile-tabs" aria-label="Inventory views" inert={Boolean(inventoryConfirmation)}><button type="button" aria-pressed={adminPane === 'products'} onClick={() => setAdminPane('products')}>Products</button><button type="button" aria-pressed={adminPane === 'editor'} onClick={() => setAdminPane('editor')}>{editingProductId ? 'Edit product' : 'New product'}</button></div>
              <div className="admin-columns" data-pane={adminPane} inert={Boolean(inventoryConfirmation)}>
                <form onSubmit={saveProduct} className="admin-editor">
                  <fieldset disabled={adminSaving} className="admin-editor-fields">
                  <div className="admin-editor-title"><h2>{editingProductId ? 'Edit product' : 'New product'}</h2>{editingProductId && <button type="button" className="inventory-icon" onClick={cancelEditingProduct} aria-label="Cancel product editing" title="Cancel edit"><HiX size={19} /></button>}</div>
                  <label className="admin-upload">
                    {productForm.image ? (
                      <img src={productForm.image} alt="Product upload preview" width="750" height="1000" className="admin-upload-preview" />
                    ) : (
                      <span className="grid gap-3 text-neutral-500">
                        <HiUpload size={32} className="mx-auto text-[#c9a84c]" />
                        <span className="text-sm">Upload product image</span>
                      </span>
                    )}
                    <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Product photograph" onChange={handleImageUpload} className="sr-only" />
                  </label>

                  <div className="grid gap-3 md:grid-cols-2">
                    <AdminField label="Product name" wide>
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
                        type="number"
                        min="1"
                        step="1"
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
                        type="number"
                        min="1"
                        step="1"
                        className={adminInputClass}
                      />
                    </AdminField>
                    <AdminField label="Product URL slug" wide><input value={productForm.slug} onChange={event => setProductForm(prev => ({ ...prev, slug: event.target.value }))} placeholder="Automatic for new products" pattern="[a-z0-9]+(-[a-z0-9]+)*" className={adminInputClass} /></AdminField>
                    <details className="admin-specifications md:col-span-2"><summary>Specifications</summary><div className="grid gap-3 md:grid-cols-2">
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

                    </div></details>
                    <AdminField label="Reference / Instagram link (optional)" wide>
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
                        list="admin-collection-options"
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
                        <option value="">No tag</option>
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



                  <div className="admin-editor-actions">
                    <button disabled={adminSaving} className="admin-primary">
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
                  <datalist id="admin-collection-options">{collectionGroups.map(group => <option key={group.name} value={group.name} />)}</datalist>
                  </fieldset>
                </form>
                <InventoryList products={allProducts} busy={adminSaving} editingId={editingProductId} draggedId={draggedProductId} hoveredId={dragOverProductId} onEdit={startEditingProduct} onDelete={id => { const product = allProducts.find(item => item.id === id); if (product) { setAdminError(''); setInventoryConfirmation({ action: 'delete', product }) } }} onMove={(from, to) => { void reorderProduct(from, to) }} onPointerSort={startProductPointerSort} onDragStart={handleProductDragStart} onDragOver={handleProductDragOver} onDrop={handleProductDrop} onDragEnd={endProductDrag} hoverClass={dragHoverClass} />
              </div>
            </>}
            {inventoryConfirmation && <div className="inventory-confirm-overlay"><div className="inventory-confirm-panel" role="alertdialog" aria-modal="true" aria-labelledby="inventory-confirm-title"><h3 id="inventory-confirm-title">{inventoryConfirmation.action === 'delete' ? 'Delete product?' : 'Discard unsaved changes?'}</h3><p>{inventoryConfirmation.action === 'delete' ? `${inventoryConfirmation.product.name} (${formatNgn(inventoryConfirmation.product.price)}) will be removed from the storefront.` : 'The current product draft has not been saved.'}</p>{adminError && <p role="alert" className="admin-operation-error">{adminError}</p>}<div><button ref={confirmationCancelRef} type="button" className="admin-secondary" disabled={adminSaving} onClick={() => setInventoryConfirmation(null)}>Cancel</button><button type="button" className="admin-primary danger" disabled={adminSaving} onClick={confirmInventoryAction}>{adminSaving ? 'Deleting...' : inventoryConfirmation.action === 'delete' ? 'Delete product' : 'Discard changes'}</button></div></div></div>}
            {dragPoint && pointerSortProductId && <div className="inventory-drag-ghost" aria-hidden="true" style={{ left: Math.min(dragPoint.x + 18, window.innerWidth - 245), top: dragPoint.y - 22 }}><HiUpload size={17} /><span>{allProducts.find(product => product.id === pointerSortProductId)?.name}</span></div>}
          </div>
        </div>
      )}
    </section>
  )
}
