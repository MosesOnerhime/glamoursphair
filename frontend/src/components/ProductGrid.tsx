import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { track } from '@vercel/analytics'
import { HiShoppingCart, HiCheck, HiX, HiLink, HiChevronLeft, HiChevronRight } from 'react-icons/hi'
import { FaWhatsapp, FaInstagram } from 'react-icons/fa'
import type { Product } from '../types'

const WHATSAPP = '2348128288948'
const PRODUCT_PARAM = 'product'
const NGN = '\u20a6'

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
    id: 11,
    name: 'Signature Straight 22"',
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
    price: 135000,
    instagramLink: 'https://instagram.com/glamoursphair',
    tag: 'Trending',
    description: 'An everyday ready-to-wear Kelly unit with a clean finish and easy styling.',
    gradient: 'from-neutral-900 to-neutral-800',
    image: '/images/1.png',
  },
  {
    id: 3,
    name: 'Wig Tasha',
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
    price: 185000,
    instagramLink: 'https://instagram.com/glamoursphair',
    description: 'A neat ready-to-style unit for polished everyday looks.',
    gradient: 'from-neutral-800 to-zinc-900',
    image: '/images/4.png',
  },
  {
    id: 5,
    name: 'Wig Rossette',
    price: 235000,
    instagramLink: 'https://instagram.com/glamoursphair',
    tag: 'Trending',
    description: 'Soft, feminine and easy to style for elegant day-to-night wear.',
    gradient: 'from-stone-800 to-neutral-900',
    image: '/images/5.png',
  },
  {
    id: 6,
    name: 'Wig Rossette',
    price: 235000,
    instagramLink: 'https://instagram.com/glamoursphair',
    description: 'A refined Rossette unit with a flattering shape and premium finish.',
    gradient: 'from-zinc-800 to-neutral-900',
    image: '/images/6.png',
  },
  {
    id: 7,
    name: 'Wig Rossette Honey Blonde',
    price: 235000,
    instagramLink: 'https://instagram.com/glamoursphair',
    description: 'A warm honey blonde finish for soft glam and standout styling.',
    gradient: 'from-neutral-900 to-stone-800',
    image: '/images/7.png',
  },
  {
    id: 8,
    name: 'Signature Afro',
    price: 110000,
    instagramLink: 'https://instagram.com/glamoursphair',
    tag: 'Limited',
    description: 'A bold signature afro unit made for volume, texture and confident wear.',
    gradient: 'from-stone-900 to-zinc-800',
    image: '/images/8.png',
  },
  {
    id: 9,
    name: 'Signature Straight 28"',
    price: 850000,
    instagramLink: 'https://instagram.com/glamoursphair',
    tag: 'Exclusive',
    description: 'Long, sleek and premium with a high-shine finish for luxury styling.',
    gradient: 'from-stone-900 to-zinc-800',
    image: '/images/9.png',
  },
  {
    id: 10,
    name: 'Wig Kelly 14"',
    price: 345000,
    instagramLink: 'https://instagram.com/glamoursphair',
    description: 'A shorter Kelly unit with a natural finish and easy daily styling.',
    gradient: 'from-stone-900 to-zinc-800',
    image: '/images/10.png',
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
  return 'Ready-to-wear'
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [added, setAdded] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Product | null>(null)
  const [slideIndexes, setSlideIndexes] = useState<Record<number, number>>({})
  const [copiedProductId, setCopiedProductId] = useState<number | null>(null)

  const featuredProducts = useMemo(
    () => products.filter(product => ['Best Seller', 'New', 'Exclusive'].includes(product.tag ?? '')).slice(0, 4),
    []
  )

  const filtered = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description.toLowerCase().includes(search.toLowerCase()) ||
    (product.tag ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const findProductFromUrl = () => {
    const productParam = new URLSearchParams(window.location.search).get(PRODUCT_PARAM)
    if (!productParam) return null

    return products.find(product => product.slug === productParam || String(product.id) === productParam) ?? null
  }

  const productUrl = (product: Product) => {
    const url = new URL(window.location.href)
    url.searchParams.set(PRODUCT_PARAM, product.slug ?? String(product.id))
    url.hash = ''
    return url.toString()
  }

  const openProduct = (product: Product) => {
    setSelected(product)
    trackBuyerEvent('Product View', { product: product.name, price: product.price })

    const url = new URL(window.location.href)
    url.searchParams.set(PRODUCT_PARAM, product.slug ?? String(product.id))
    window.history.pushState({}, '', url)
  }

  const closeProduct = () => {
    setSelected(null)

    const url = new URL(window.location.href)
    url.searchParams.delete(PRODUCT_PARAM)
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
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

  useEffect(() => {
    const handleExternalSearch = (event: Event) => {
      const term = (event as CustomEvent<string>).detail
      if (term) setSearch(term)
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
  }, [])

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
    const msg = encodeURIComponent(`Hello GLAMOURSPHAIR! I'm interested in the *${product.name}* (${formatNgn(product.price)}). Please provide more details.`)
    return `https://wa.me/${WHATSAPP}?text=${msg}`
  }

  const renderProductImage = (product: Product, compact = false) => (
    <div className={`relative overflow-hidden bg-gradient-to-br ${product.gradient} ${compact ? 'h-44 sm:h-56' : 'h-48 sm:h-64'}`}>
      {product.images && product.images.length > 1 ? (
        <>
          <img
            src={product.images[getSlideIndex(product.id)]}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <button
            onClick={(e) => prevSlide(e, product.id, product.images!.length)}
            className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center bg-black/55 text-white transition-colors hover:bg-black/85"
            aria-label={`Previous ${product.name} image`}
          >
            <HiChevronLeft size={17} />
          </button>
          <button
            onClick={(e) => nextSlide(e, product.id, product.images!.length)}
            className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center bg-black/55 text-white transition-colors hover:bg-black/85"
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
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === getSlideIndex(product.id) ? 'w-4 bg-[#c9a84c]' : 'w-1.5 bg-white/45'
                }`}
                aria-label={`Show ${product.name} image ${i + 1}`}
              />
            ))}
          </div>
        </>
      ) : imageForProduct(product) ? (
        <img
          src={imageForProduct(product)}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-[#c9a84c]/30">
          <HiShoppingCart size={44} />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-[#111]/88 via-transparent to-black/15" />
      {product.tag && (
        <span className={`absolute left-3 top-3 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tagColors[product.tag]}`}>
          {product.tag}
        </span>
      )}
      <div className="absolute bottom-3 right-3 bg-black/80 px-3 py-1.5 backdrop-blur">
        {product.originalPrice && (
          <p className="text-[11px] text-neutral-400 line-through">Was {formatNgn(product.originalPrice)}</p>
        )}
        <p className="text-base font-bold leading-tight text-[#c9a84c] sm:text-lg">{formatNgn(product.price)}</p>
      </div>
    </div>
  )

  const renderProductCard = (product: Product, compact = false) => (
    <article
      key={`${compact ? 'featured' : 'grid'}-${product.id}`}
      onClick={() => openProduct(product)}
      className="group relative flex cursor-pointer flex-col overflow-hidden border border-white/8 bg-[#111] transition-all duration-500 hover:border-[#c9a84c]/45 hover:bg-[#15130f]"
    >
      {renderProductImage(product, compact)}

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-5">
        <h3 className="min-h-[2.6rem] text-base font-semibold leading-tight text-white transition-colors duration-300 group-hover:text-[#c9a84c] sm:text-lg">
          {product.name}
        </h3>
        <p className="h-5 overflow-hidden whitespace-nowrap text-sm leading-5 text-neutral-500 [mask-image:linear-gradient(90deg,#000_78%,transparent)]">
          {product.description}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleAdd(product)
            }}
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
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#c9a84c]">Best sellers</p>
              <h2 className="mt-2 font-display text-4xl leading-tight text-white md:text-6xl">
                Shop new drops before they sell out.
              </h2>
            </div>
            <button
              onClick={() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })}
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
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search wigs, serum, blonde..."
                className="w-full border border-white/10 bg-[#111] px-4 py-3 pr-10 text-sm text-white outline-none transition-colors placeholder:text-neutral-600 focus:border-[#c9a84c]/55"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg text-neutral-500 transition-colors hover:text-white"
                  aria-label="Clear product search"
                >
                  <HiX size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-4 md:gap-6">
            {filtered.map(product => renderProductCard(product))}
          </div>

          {filtered.length === 0 && (
            <div className="py-20 text-center">
              <p className="mb-2 text-lg text-neutral-500">No results for "<span className="text-[#c9a84c]">{search}</span>"</p>
              <p className="text-sm text-neutral-600">Try searching for a different style or texture.</p>
              <button
                onClick={() => setSearch('')}
                className="mt-6 border border-[#c9a84c]/30 px-6 py-2.5 text-sm uppercase tracking-widest text-[#c9a84c] transition-colors hover:bg-[#c9a84c]/10"
              >
                Clear Search
              </button>
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
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={closeProduct} />
          <div className="relative z-10 grid max-h-[92vh] w-full max-w-5xl overflow-y-auto border border-white/10 bg-[#0d0d0d] shadow-2xl shadow-black/70 md:grid-cols-[1.05fr_0.95fr]">
            <button
              onClick={closeProduct}
              className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 text-neutral-300 transition-colors hover:text-white"
              aria-label="Close product preview"
            >
              <HiX size={20} />
            </button>

            <div className={`relative min-h-[320px] bg-gradient-to-br ${selected.gradient} md:min-h-[620px]`}>
              {selected.images && selected.images.length > 1 ? (
                <>
                  <img
                    src={selected.images[slideIndexes[selected.id] ?? 0]}
                    alt={selected.name}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <button onClick={(e) => prevSlide(e, selected.id, selected.images!.length)} className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/60 text-white transition-colors hover:bg-black/90" aria-label={`Previous ${selected.name} image`}>
                    <HiChevronLeft size={22} />
                  </button>
                  <button onClick={(e) => nextSlide(e, selected.id, selected.images!.length)} className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/60 text-white transition-colors hover:bg-black/90" aria-label={`Next ${selected.name} image`}>
                    <HiChevronRight size={22} />
                  </button>
                  <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                    {selected.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSlideIndexes(prev => ({ ...prev, [selected.id]: i }))
                        }}
                        className={`h-1.5 rounded-full transition-all duration-200 ${
                          i === (slideIndexes[selected.id] ?? 0) ? 'w-5 bg-[#c9a84c]' : 'w-1.5 bg-white/40'
                        }`}
                        aria-label={`Show ${selected.name} image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : imageForProduct(selected) ? (
                <img src={imageForProduct(selected)} alt={selected.name} className="absolute inset-0 h-full w-full object-cover" />
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
                <h3 className="font-display text-3xl leading-tight text-white md:text-5xl">{selected.name}</h3>
                <div className="text-right">
                  {selected.originalPrice && (
                    <p className="text-xs text-neutral-500 line-through">Was {formatNgn(selected.originalPrice)}</p>
                  )}
                  <p className="whitespace-nowrap text-xl font-bold text-[#c9a84c]">{formatNgn(selected.price)}</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-neutral-400 md:text-base">{selected.description}</p>

              <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
                <div className="border border-white/8 p-3">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-600">Texture</p>
                  <p className="mt-1 text-white">{inferTexture(selected)}</p>
                </div>
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
                  <summary className="cursor-pointer list-none text-sm font-semibold text-white">Hair Care</summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                    Use gentle detangling, lightweight serum and proper storage to maintain softness, shine and shape.
                  </p>
                </details>
                <details className="group py-4">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-white">Delivery</summary>
                  <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                    Delivery fees are calculated in checkout after location selection. Abuja pickup and WhatsApp confirmation are available.
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
                  Order via WhatsApp
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
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
