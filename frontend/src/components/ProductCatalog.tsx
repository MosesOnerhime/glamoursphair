import { useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { HiAdjustments, HiArrowLeft, HiArrowRight, HiCheck, HiCollection, HiSearch, HiShoppingBag, HiViewGrid, HiX } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import type { Product } from '../types'

interface ProductCatalogProps {
  products: Product[]
  collections: { name: string; products: Product[] }[]
  collection: string
  onCollection: (name: string) => void
  search: string
  onSearch: (value: string) => void
  filtersOpen: boolean
  onToggleFilters: () => void
  filterCount: number
  filters: ReactNode
  onReset: () => void
  onProduct: (product: Product) => void
  onAdd: (product: Product) => void
  added: number | null
  productLink: (product: Product) => string
  whatsappLink: (product: Product) => string
}

const money = (value: number) => `\u20a6${value.toLocaleString('en-NG')}`

export default function ProductCatalog(props: ProductCatalogProps) {
  const [view, setView] = useState<'carousel' | 'grid'>('carousel')
  const [position, setPosition] = useState(0)
  const swipe = useRef<{ x: number; y: number } | null>(null)
  const suppressClick = useRef(false)
  const count = props.products.length
  const index = count ? position % count : 0
  const move = (direction: number) => setPosition(value => count ? (value + direction + count) % count : 0)
  const offsetFor = (item: number) => {
    let offset = (item - index + count) % count
    if (offset > count / 2) offset -= count
    return offset
  }

  const card = (product: Product, offset?: number) => (
    <article key={product.id} data-product-id={product.id}
      className={offset === undefined ? 'catalog-card' : 'catalog-card showcase-card'}
      style={offset === undefined ? undefined : { '--offset': offset, '--scale': offset === 0 ? 1 : Math.abs(offset) === 1 ? 0.78 : 0.6, zIndex: 10 - Math.abs(offset) } as CSSProperties}
      hidden={offset !== undefined && Math.abs(offset) > 2} aria-label={product.name}
    >
      <a href={props.productLink(product)} className="catalog-media" onClick={event => { event.preventDefault(); props.onProduct(product) }}>
        {product.images?.[0] || product.image ? <img src={product.images?.[0] ?? product.image} alt={product.name} width="750" height="1000" loading="lazy" decoding="async" /> : <HiShoppingBag size={48} aria-hidden="true" />}
      </a>
      <div className="catalog-info">
        <h3><a href={props.productLink(product)} onClick={event => { event.preventDefault(); props.onProduct(product) }}>{product.name}</a></h3>
        <p className="catalog-spec">{[product.length, product.volume, product.fitting].filter(Boolean).join(' / ') || product.group || 'Signature Collection'}</p>
        <div className="catalog-card-row">
          <div className="catalog-price"><span><span className="sr-only">Current price </span>{money(product.price)}</span>{product.originalPrice && product.originalPrice > product.price && <del><span className="sr-only">Original price </span>{money(product.originalPrice)}</del>}</div>
          <div className="catalog-actions">
            <button type="button" className="catalog-add" onClick={() => props.onAdd(product)} aria-label={`Add ${product.name} to cart`} title={`Add ${product.name} to cart`}>{props.added === product.id ? <HiCheck size={21} /> : <HiShoppingBag size={21} />}</button>
            <a href={props.whatsappLink(product)} target="_blank" rel="noopener noreferrer" className="catalog-order" aria-label={`Order ${product.name} on WhatsApp`}><FaWhatsapp aria-hidden="true" /> Order</a>
          </div>
        </div>
      </div>
    </article>
  )

  return (
    <div className="catalog-content" id="collection">
      <header className="catalog-header">
        <div className="catalog-title-row">
          <button type="button" className="round-tool filter-tool" onClick={props.onToggleFilters} aria-expanded={props.filtersOpen} aria-controls="product-filters" aria-label={`Filters${props.filterCount ? `, ${props.filterCount} applied` : ''}`} title="Filter and sort"><HiAdjustments size={20} /></button>
          <h2>Discover the Collection</h2>
          <button type="button" className="round-tool view-tool" onClick={() => setView(value => value === 'carousel' ? 'grid' : 'carousel')} aria-label={view === 'carousel' ? 'Show product grid' : 'Show product carousel'} title={view === 'carousel' ? 'Grid view' : 'Carousel view'}>{view === 'carousel' ? <HiViewGrid size={20} /> : <HiCollection size={20} />}</button>
        </div>
        <p className="catalog-subtitle">Choose your signature look</p>
      </header>
      <div className="catalog-discovery">
        <div className="catalog-collections" aria-label="Product collections">
          <button type="button" aria-pressed={props.collection === 'All Collections'} onClick={() => { props.onCollection('All Collections'); setPosition(0) }}>All collections</button>
          {props.collections.map(collection => <button type="button" key={collection.name} aria-pressed={props.collection === collection.name} onClick={() => { props.onCollection(collection.name); setPosition(0) }}>{collection.name} <span>{collection.products.length}</span></button>)}
        </div>
        <div className="catalog-search">
          <HiSearch size={17} aria-hidden="true" />
          <label htmlFor="product-search" className="sr-only">Search products</label>
          <input id="product-search" name="q" type="search" placeholder="Search your next look..." value={props.search} onChange={event => { props.onSearch(event.target.value); setPosition(0) }} />
          {props.search && <button type="button" onClick={() => props.onSearch('')} aria-label="Clear product search"><HiX size={17} /></button>}
        </div>
      </div>
      {props.filtersOpen && <div id="product-filters" className="catalog-filters">{props.filters}</div>}
      <p className="catalog-count" role="status" aria-live="polite">{count} product{count === 1 ? '' : 's'}{props.collection !== 'All Collections' ? ` in ${props.collection}` : ''}{props.filterCount > 0 || props.search ? ' matching your selection' : ''}</p>
      {count > 0 ? view === 'carousel' ? (
        <div className="product-showcase" role="region" aria-roledescription="carousel" aria-label="Hair collection"
          onPointerDown={event => { swipe.current = { x: event.clientX, y: event.clientY }; suppressClick.current = false }}
          onPointerUp={event => {
            if (!swipe.current) return
            const dx = event.clientX - swipe.current.x
            const dy = event.clientY - swipe.current.y
            if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) { suppressClick.current = true; move(dx < 0 ? 1 : -1) }
            swipe.current = null
          }}
          onPointerCancel={() => { swipe.current = null }}
          onClickCapture={event => { if (suppressClick.current) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false } }}
        >
          <div className="showcase-track">{props.products.map((product, item) => card(product, offsetFor(item)))}</div>
          {count > 1 && <>
            <button type="button" className="round-tool showcase-prev" onClick={() => move(-1)} aria-label="Previous product" title="Previous product"><HiArrowLeft size={21} /></button>
            <button type="button" className="round-tool showcase-next" onClick={() => move(1)} aria-label="Next product" title="Next product"><HiArrowRight size={21} /></button>
          </>}
          <p className="showcase-position" aria-live="polite" aria-atomic="true">{index + 1} / {count}<span className="sr-only">: {props.products[index].name}</span></p>
        </div>
      ) : <div className="catalog-grid">{props.products.map(product => card(product))}</div> : (
        <div className="catalog-empty"><h3>No matching pieces</h3><p>Try another name, length or fitting.</p><button type="button" className="luxury-button outline" onClick={props.onReset}>Clear search and filters</button></div>
      )}
      <p className="sr-only" role="status">{props.added !== null ? 'Product added to cart' : ''}</p>
    </div>
  )
}
