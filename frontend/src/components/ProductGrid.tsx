import { useState } from 'react'
import { HiShoppingCart, HiCheck } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import type { Product } from '../types'

const WHATSAPP = '2348128288948'


const products: Product[] = [
  {
    id: 1,
    name: '1',
    price: 135000,
    tag: 'Best Seller',
    description: 'Silky smooth, jet black bone straight wig. 26" length, 180% density.',
    gradient: 'from-neutral-900 to-neutral-800',
    image: '/images/1.png',
  },
  {
    id: 2,
    name: '2',
    price: 298000,
    tag: 'New',
    description: 'Voluminous bouncy curls with natural-looking body. 22" length.',
    gradient: 'from-stone-900 to-neutral-800',
    image: '/images/2.jpeg',
  },
  {
    id: 3,
    name: '3',
    price: 265000,
    tag: 'Premium',
    description: 'Deep ocean wave pattern. HD lace frontal. 24" length, 200% density.',
    gradient: 'from-zinc-900 to-stone-900',
    image: '/images/3.jpeg',
  },
  {
    id: 4,
    name: '4',
    price: 185000,
    description: 'Classic body wave texture. Lightweight and breathable cap. 20" length.',
    gradient: 'from-neutral-800 to-zinc-900',
    image: '/images/4.png',
  },
  {
    id: 5,
    name: '5',
    price: 235000,
    tag: 'Trending',
    description: 'Embrace your natural roots. Full kinky coily texture. 18" length.',
    gradient: 'from-stone-800 to-neutral-900',
    image: '/images/5.png',
  },
  {
    id: 6,
    name: '6',
    price: 235000,
    description: 'Our most luxurious piece. Virgin Remy hair, 28" length. 220% density.',
    gradient: 'from-zinc-800 to-neutral-900',
    image: '/images/6.png',
  },
  {
    id: 7,
    name: '7',
    price: 235000,
    description: 'Effortless beach waves. Beginner-friendly. 20" length, 150% density.',
    gradient: 'from-neutral-900 to-stone-800',
    image: '/images/7.png',
  },
  {
    id: 8,
    name: '8',
    price: 110000,
    tag: 'Limited',
    description: 'Stunning water wave texture with HD transparent lace. 24" length.',
    gradient: 'from-stone-900 to-zinc-800',
    image: '/images/8.png',
  },
  {
    id: 9,
    name: '9',
    price: 850000,
    tag: 'Exclusive',
    description: 'Stunning water wave texture with HD transparent lace. 24" length.',
    gradient: 'from-stone-900 to-zinc-800',
    image: '/images/9.png',
  },
  {
    id: 10,
    name: '10',
    price: 345000,
    description: 'Stunning water wave texture with HD transparent lace. 24" length.',
    gradient: 'from-stone-900 to-zinc-800',
    image: '/images/10.png',
  },
]

const tagColors: Record<string, string> = {
  'Best Seller': 'bg-[#c9a84c] text-black',
  'New': 'bg-emerald-500 text-white',
  'Premium': 'bg-purple-600 text-white',
  'Trending': 'bg-rose-500 text-white',
  'Exclusive': 'bg-[#c9a84c] text-black',
  'Limited': 'bg-red-600 text-white',
}

interface ProductGridProps {
  onAddToCart: (product: Product) => void
}

export default function ProductGrid({ onAddToCart }: ProductGridProps) {
  const [added, setAdded] = useState<number | null>(null)
  const [search, setSearch] = useState('')

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase()) ||
    (p.tag ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleAdd = (product: Product) => {
    onAddToCart(product)
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1800)
  }

  const whatsappLink = (product: Product) => {
    const msg = encodeURIComponent(`Hello GLAMOURSPHAIR! I'm interested in the *${product.name}* (₦${product.price.toLocaleString()}). Please provide more details.`)
    return `https://wa.me/${WHATSAPP}?text=${msg}`
  }

  return (
    <section id="shop" className="py-24 px-4 bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#c9a84c]" />
            <span className="text-[#c9a84c] tracking-[0.4em] text-xs uppercase">Our Collection</span>
            <div className="h-px w-12 bg-[#c9a84c]" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-white tracking-tight">
            The <span className="text-[#c9a84c]">Collection</span>
          </h2>
          <p className="mt-4 text-neutral-500 max-w-lg mx-auto leading-relaxed">
            Every strand hand-selected. Every style perfected. Shop our curated range of premium wigs and hair extensions.
          </p>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md mx-auto mb-12">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search wigs e.g. 'bone straight', 'curls'..."
            className="w-full bg-[#111] border border-white/10 focus:border-[#c9a84c]/50 outline-none px-5 py-4 text-sm text-white placeholder-neutral-600 tracking-wide transition-colors duration-300 search-pulse"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors text-lg"
            >
              ✕
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group relative bg-[#111] border border-white/5 hover:border-[#c9a84c]/40 transition-all duration-500 flex flex-col overflow-hidden"
            >
              {/* Image placeholder */}
              <div className={`relative h-64 bg-gradient-to-br ${product.gradient} overflow-hidden`}>
                {/* Decorative hair silhouette */}
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-20">
                    <svg viewBox="0 0 200 300" className="w-32 h-48 fill-[#c9a84c]">
                      <ellipse cx="100" cy="80" rx="60" ry="70" />
                      <path d="M40 80 Q20 180 30 280 Q100 260 170 280 Q180 180 160 80" />
                      <ellipse cx="100" cy="75" rx="50" ry="55" fill="#0a0a0a" opacity="0.5"/>
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#111]/80 to-transparent" />

                {/* Gold shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#c9a84c]/0 to-[#c9a84c]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Tag */}
                {product.tag && (
                  <span className={`absolute top-3 left-3 text-xs font-bold tracking-widest uppercase px-2.5 py-1 ${tagColors[product.tag]}`}>
                    {product.tag}
                  </span>
                )}

                {/* Price floating */}
                <div className="absolute bottom-3 right-3 bg-[#0a0a0a]/80 backdrop-blur-sm px-3 py-1.5">
                  <span className="text-[#c9a84c] font-bold text-lg">₦{product.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Card body */}
              <div className="flex flex-col flex-1 p-5 gap-3">
                <h3 className="font-display text-xl text-white tracking-wide group-hover:text-[#c9a84c] transition-colors duration-300">
                  {product.name}
                </h3>
                <p className="text-neutral-500 text-sm leading-relaxed flex-1">{product.description}</p>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => handleAdd(product)}
                    className={`w-full flex items-center justify-center gap-2 py-3 text-sm font-bold tracking-[0.15em] uppercase transition-all duration-300 ${
                      added === product.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#c9a84c] text-black hover:bg-white'
                    }`}
                  >
                    {added === product.id ? (
                      <><HiCheck size={16} /> Added!</>
                    ) : (
                      <><HiShoppingCart size={16} /> Add to Cart</>
                    )}
                  </button>

                  <a
                    href={whatsappLink(product)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold tracking-wide border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10 transition-all duration-300"
                  >
                    <FaWhatsapp size={16} />
                    Order via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No-Result Message */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-neutral-500 text-lg mb-2">No results for "<span className="text-[#c9a84c]">{search}</span>"</p>
            <p className="text-neutral-600 text-sm">Try searching for a different style or texture</p>
            <button
              onClick={() => setSearch('')}
              className="mt-6 px-6 py-2.5 border border-[#c9a84c]/30 text-[#c9a84c] text-sm tracking-widest uppercase hover:bg-[#c9a84c]/10 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-neutral-500 mb-4 text-sm">Can't find what you're looking for?</p>
          <a
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hello GLAMOURSPHAIR! I need a custom hair piece. Can you help?')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 border border-[#c9a84c]/40 text-[#c9a84c] hover:bg-[#c9a84c]/10 transition-all duration-300 text-sm tracking-widest uppercase"
          >
            <FaWhatsapp size={16} />
            Request Custom Order
          </a>
        </div>
      </div>
    </section>
  )
}
