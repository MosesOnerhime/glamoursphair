import { useCallback, useEffect, useMemo, useState } from 'react'
import { HiArrowLeft, HiArrowRight, HiChevronLeft, HiChevronRight, HiMinus, HiPlus, HiRefresh, HiSearch, HiShoppingBag, HiTrash, HiX } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'
import { track } from '@vercel/analytics'
import { useDialogA11y } from '../hooks/useDialogA11y'
import { NOVEMBER_SALE } from '../lib/novemberSale.js'
import type { SaleProduct } from '../lib/novemberSale.js'
import { fetchSale, money, readSaleBag, readSalePayment, SALE_BAG_KEY } from '../lib/salesClient'
import type { SaleBagItem, SaleQuote, SaleSnapshot } from '../lib/salesClient'
import SaleCheckout from './SaleCheckout'
import './SalesPage.css'

const ORIGIN = 'https://www.glamoursphairluxury.com'
const photo = (product: SaleProduct) => product.images?.[0] || product.image
const dateCopy = { upcoming: 'Opens 9 November', active: 'The Christmas sale is open', ended: 'The Christmas sale has ended' }

function Quantity({ value, onChange, name }: { value: number; onChange: (quantity: number) => void; name: string }) {
  return <div className="sale-quantity"><button type="button" className="sale-icon" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={`Decrease ${name} quantity`} title="Decrease quantity"><HiMinus /></button><output aria-label={`${name} quantity`}>{value}</output><button type="button" className="sale-icon" onClick={() => onChange(value + 1)} disabled={value >= 20} aria-label={`Increase ${name} quantity`} title="Increase quantity"><HiPlus /></button></div>
}

export default function SalesPage() {
  const [snapshot, setSnapshot] = useState<SaleSnapshot | null>(null)
  const [loadError, setLoadError] = useState('')
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')
  const [bag, setBag] = useState<SaleBagItem[]>(readSaleBag)
  const [bagOpen, setBagOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(() => Boolean(readSalePayment()))
  const [selectedId, setSelectedId] = useState<string | null>(() => new URLSearchParams(window.location.search).get('product'))
  const [imageIndex, setImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [announcement, setAnnouncement] = useState('')
  const selected = snapshot?.products.find(product => product.slug === selectedId || String(product.id) === selectedId) ?? null
  const active = snapshot?.phase === 'active'
  const closeProduct = useCallback(() => {
    setSelectedId(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('product')
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  }, [])
  const productRef = useDialogA11y<HTMLDivElement>(Boolean(selected), closeProduct)
  const bagRef = useDialogA11y<HTMLDivElement>(bagOpen, () => setBagOpen(false))

  useEffect(() => {
    let disposed = false
    let cancelRequest = () => {}
    async function load() {
      cancelRequest()
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), 12000)
      let superseded = false
      cancelRequest = () => { superseded = true; controller.abort(); clearTimeout(timer) }
      try {
        const data = await fetchSale(controller.signal)
        if (disposed || superseded) return
        setSnapshot(data); setLoadError('')
      } catch {
        if (!disposed && !superseded) setLoadError('The sale collection could not load. Please try again.')
      } finally {
        clearTimeout(timer)
        if (!disposed && !superseded) setLoading(false)
      }
    }
    void load()
    const interval = window.setInterval(() => void load(), 60000)
    return () => { disposed = true; cancelRequest(); window.clearInterval(interval) }
  }, [refreshKey])

  useEffect(() => {
    try { localStorage.setItem(SALE_BAG_KEY, JSON.stringify(bag)) } catch { /* Shopping still works when storage is unavailable. */ }
  }, [bag])
  useEffect(() => {
    const sync = () => { setSelectedId(new URLSearchParams(window.location.search).get('product')); setImageIndex(0); setQuantity(1) }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  useEffect(() => {
    const title = selected ? `${selected.name} - Christmas Sale | GLAMOURSPHAIR` : 'Christmas Sales: 9-15 November | GLAMOURSPHAIR'
    const url = selected ? `${ORIGIN}/sales?product=${encodeURIComponent(selected.slug || String(selected.id))}` : `${ORIGIN}/sales`
    document.title = title
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url)
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) document.querySelector(selector)?.setAttribute('content', title)
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url)
    const script = document.createElement('script')
    script.id = 'christmas-sale-structured-data'; script.type = 'application/ld+json'
    script.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'ItemList',
      name: NOVEMBER_SALE.name, itemListElement: (snapshot?.products ?? []).map((product, index) => ({
        '@type': 'ListItem', position: index + 1, item: { '@type': 'Product', name: product.name,
          description: product.description, image: product.images || [product.image],
          url: `${ORIGIN}/sales?product=${encodeURIComponent(product.slug || String(product.id))}`,
          brand: { '@type': 'Brand', name: 'GLAMOURSPHAIR' },
          ...(active ? { offers: { '@type': 'Offer', price: product.price, priceCurrency: 'NGN', priceValidUntil: '2026-11-15', url: `${ORIGIN}/sales?product=${encodeURIComponent(product.slug || String(product.id))}` } } : {}),
        },
      })),
    })
    document.head.appendChild(script)
    return () => script.remove()
  }, [active, selected, snapshot?.products])

  const products = useMemo(() => {
    const term = search.trim().toLowerCase()
    const result = (snapshot?.products ?? []).filter(product => [product.name, product.description, product.group, product.length, product.fitting].filter(Boolean).join(' ').toLowerCase().includes(term))
    if (sort === 'low') result.sort((a, b) => a.price - b.price)
    if (sort === 'high') result.sort((a, b) => b.price - a.price)
    return result
  }, [search, snapshot?.products, sort])
  const offers = new Map(snapshot?.products.map(product => [product.id, product]))
  const bagTotal = bag.reduce((sum, item) => sum + (offers.get(item.id)?.price ?? 0) * item.qty, 0)
  const bagCount = bag.reduce((sum, item) => sum + item.qty, 0)
  const invalidBag = bag.some(item => !offers.has(item.id))
  const images = selected ? selected.images?.length ? selected.images : selected.image ? [selected.image] : [] : []
  const image = images.length ? images[imageIndex % images.length] : undefined
  const refresh = () => { setLoading(true); setRefreshKey(value => value + 1) }

  function openProduct(product: SaleProduct) {
    setSelectedId(product.slug || String(product.id)); setImageIndex(0); setQuantity(1)
    const url = new URL(window.location.href); url.searchParams.set('product', product.slug || String(product.id))
    window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
    track('Christmas Sale Product View', { product: product.name })
  }
  function add(product: SaleProduct) {
    if (!active || loadError) return
    setBag(current => {
      const exists = current.find(item => item.id === product.id)
      return exists ? current.map(item => item.id === product.id ? { ...item, qty: Math.min(20, item.qty + quantity) } : item) : [...current, { id: product.id, qty: quantity }]
    })
    closeProduct(); setBagOpen(true); setAnnouncement(`${product.name} added to your sale bag.`)
    track('Christmas Sale Add To Bag', { product: product.name, price: product.price })
  }
  function updateQuantity(id: number, qty: number) { setBag(current => current.map(item => item.id === id ? { ...item, qty: Math.max(1, Math.min(20, qty)) } : item)) }
  function paid(lines: SaleQuote['items']) {
    setBag(current => current.flatMap(item => {
      const remaining = item.qty - (lines.find(line => line.id === item.id)?.qty ?? 0)
      return remaining > 0 ? [{ ...item, qty: remaining }] : []
    }))
    setAnnouncement('Your Christmas sale payment is verified.')
  }
  const saleLabel = active ? 'Sale price' : snapshot?.phase === 'ended' ? 'Christmas sale price' : '9-15 November price'

  return <div className="sales-site">
    <a className="sale-skip" href="#sale-products">Skip to sale pieces</a>
    <header className="sale-header">
      <a href="/#home" className="sale-brand" aria-label="GLAMOURSPHAIR home"><img src="/images/logo-mark.png" alt="" width="392" height="336" /><span>GLAMOURSPHAIR</span></a>
      <nav aria-label="Sale navigation"><a href="/products">All products</a><a href="/sales" aria-current="page">Christmas sale</a></nav>
      <button type="button" className="sale-bag-trigger" onClick={() => setBagOpen(true)} aria-label={`Open sale bag, ${bagCount} ${bagCount === 1 ? 'item' : 'items'}`} title="Sale bag"><span className="sale-bag-icon"><HiShoppingBag size={23} /><span>{bagCount}</span></span><span>{snapshot ? money(bagTotal) : 'Sale bag'}</span></button>
    </header>
    <main>
      <section className="sale-intro" aria-labelledby="sale-page-title"><div><p className="sale-eyebrow">9-15 NOVEMBER 2026 · ABUJA, NIGERIA</p><h1 id="sale-page-title">Christmas <em>Sales</em></h1><p className="sale-intro-copy">20% off selected pieces.<br className="sale-mobile-break" /> A little more luxury, for a little less.</p></div><div className="sale-date-stamp"><strong>20<span>%</span></strong><span>OFF THE CHRISTMAS EDIT</span><p role="status">{snapshot ? dateCopy[snapshot.phase] : '9-15 November · Nigeria time'}</p></div></section>
      <section className="sale-catalog" id="sale-products" tabIndex={-1} aria-label="Christmas sale pieces">
        <div className="sale-catalog-toolbar"><div className="sale-search"><HiSearch aria-hidden="true" /><label className="sr-only" htmlFor="sale-search">Search sale pieces</label><input id="sale-search" type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Find your Christmas piece" />{search && <button type="button" className="sale-icon" onClick={() => setSearch('')} aria-label="Clear sale search"><HiX /></button>}</div><label className="sale-sort">Sort<select value={sort} onChange={event => setSort(event.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
        {snapshot && <div className="sale-catalog-context"><p>{snapshot.phase === 'upcoming' ? 'Preview the Christmas edit' : snapshot.phase === 'ended' ? 'The edit, now closed' : 'The Christmas edit'}</p><span role="status">{products.length} piece{products.length === 1 ? '' : 's'}</span></div>}
        {loadError && <div className="sale-load-error" role="alert"><p>{loadError}</p><button type="button" className="sale-button secondary" onClick={refresh}><HiRefresh /> Try again</button></div>}
        {loading && !snapshot ? <div className="sale-product-grid" aria-label="Loading sale pieces" aria-busy="true">{[1, 2].map(number => <div key={number} className="sale-card-skeleton" />)}</div> : snapshot && products.length ? <div className="sale-product-grid">{products.map((product, index) => <article key={product.id} className="sale-product-card" data-sale-product-id={product.id}>
          <a className="sale-product-photo" href={`/sales?product=${encodeURIComponent(product.slug || String(product.id))}`} onClick={event => { event.preventDefault(); openProduct(product) }} aria-label={`View ${product.name}`}><img src={photo(product)} alt={product.name} width="750" height="1000" loading={index < 2 ? 'eager' : 'lazy'} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async" /><span className="sale-discount">20% OFF</span><span className="sale-view-label">View piece <HiArrowRight aria-hidden="true" /></span></a>
          <div className="sale-product-caption"><p>{[product.length, product.fitting].filter(Boolean).join(' / ') || product.group || 'GLAMOURSPHAIR'}</p><h2><a href={`/sales?product=${encodeURIComponent(product.slug || String(product.id))}`} onClick={event => { event.preventDefault(); openProduct(product) }}>{product.name}</a></h2><div className="sale-product-prices"><span><span className="sr-only">{saleLabel}: </span>{money(product.price)}</span><del><span className="sr-only">Regular price: </span>{money(product.regularPrice)}</del><small>{saleLabel}</small></div></div>
        </article>)}</div> : snapshot && <div className="sale-empty"><h2>{search ? 'No matching pieces' : 'The Christmas edit is being prepared'}</h2><p>{search ? 'Try another product name, length or fitting.' : 'Join our WhatsApp channel for collection updates.'}</p>{search ? <button className="sale-button secondary" type="button" onClick={() => setSearch('')}>Clear search</button> : <a href="https://whatsapp.com/channel/0029Vb8gQMqK5cDJFIwnVk2y" target="_blank" rel="noopener noreferrer" className="sale-button"><FaWhatsapp /> Join the channel</a>}</div>}
        {snapshot?.phase === 'ended' && <div className="sale-ended"><p>This sale ran 9-15 November 2026. Explore the current collection for regular prices.</p><a href="/products" className="sale-button secondary">Shop all products <HiArrowRight /></a></div>}
      </section>
      <section className="sale-support-band"><div><p className="sale-eyebrow">A PERSONAL TOUCH, FROM ABUJA</p><h2>Your next look,<br /><em>with a little guidance.</em></h2></div><div><p>Ask about a unit, its fit or delivery before ordering.</p><a href="https://wa.me/2348128288948?text=Hello%20GLAMOURSPHAIR%2C%20I%20have%20a%20question%20about%20the%20Christmas%20sale." target="_blank" rel="noopener noreferrer" className="sale-button secondary"><FaWhatsapp /> Talk to GLAMOURSPHAIR</a></div></section>
    </main>
    <footer className="sale-footer"><a href="/#home">GLAMOURSPHAIR</a><address>3rd Floor, Cappador Galaxy Mall<br />81 Aminu Kano Crescent, Wuse 2, Abuja, Nigeria</address><a href="https://whatsapp.com/channel/0029Vb8gQMqK5cDJFIwnVk2y" target="_blank" rel="noopener noreferrer">Join our WhatsApp channel <HiArrowRight /></a></footer>
    <p className="sr-only" role="status" aria-live="polite">{announcement}</p>

    {selected && <div className="sale-dialog-backdrop"><div className="sale-dialog-scrim" aria-hidden="true" onClick={closeProduct} /><div ref={productRef} className="sale-product-dialog sale-dialog" role="dialog" aria-modal="true" aria-labelledby="sale-product-title" tabIndex={-1}>
      <header className="sale-dialog-header"><span className="sale-eyebrow">THE CHRISTMAS EDIT</span><button className="sale-icon" type="button" onClick={closeProduct} aria-label="Close sale product" title="Close product"><HiX size={23} /></button></header>
      <div className="sale-product-dialog-body"><div className="sale-gallery"><img src={image} alt={`${selected.name}, view ${imageIndex % Math.max(1, images.length) + 1} of ${images.length}`} width="750" height="1000" />{images.length > 1 && <><button className="sale-icon previous" type="button" onClick={() => setImageIndex(current => (current + images.length - 1) % images.length)} aria-label="Previous sale product image" title="Previous image"><HiChevronLeft size={25} /></button><button className="sale-icon next" type="button" onClick={() => setImageIndex(current => (current + 1) % images.length)} aria-label="Next sale product image" title="Next image"><HiChevronRight size={25} /></button><p className="sale-gallery-count" role="status">{imageIndex % images.length + 1} / {images.length}</p></>}</div>
        <div className="sale-product-details"><p className="sale-eyebrow">20% OFF · 9-15 NOVEMBER</p><h2 id="sale-product-title">{selected.name}</h2><p className="sale-modal-price">{money(selected.price)} <del>{money(selected.regularPrice)}</del></p><p className="sale-detail-description">{selected.description}</p><dl className="sale-specifications">{[['Length', selected.length], ['Fitting', selected.fitting], ['Volume', selected.volume], ['Source', selected.source]].filter(([, value]) => value).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <div className="sale-buy-row"><Quantity value={quantity} onChange={setQuantity} name={selected.name} /><strong>Save {money((selected.regularPrice - selected.price) * quantity)}</strong></div>
          {active ? <button type="button" className="sale-button" onClick={() => add(selected)} disabled={Boolean(loadError)}><HiShoppingBag /> Add to sale bag - {money(selected.price * quantity)}</button> : <p className="sale-notice">{snapshot?.phase === 'ended' ? 'This sale has ended.' : 'Sale checkout opens 9 November, Nigeria time.'}</p>}
          {!active && <a className="sale-button secondary" href={`/products?product=${encodeURIComponent(selected.slug || String(selected.id))}`}>View the regular collection <HiArrowRight /></a>}
          <a className="sale-text-button" href={`https://wa.me/2348128288948?text=${encodeURIComponent(`Hello GLAMOURSPHAIR, I am interested in ${selected.name} in Christmas Sales (9-15 November). Listed sale price: ${money(selected.price)}. ${ORIGIN}/sales?product=${selected.slug || selected.id}`)}`} target="_blank" rel="noopener noreferrer"><FaWhatsapp /> Ask about this piece</a><p className="sale-payment-note">Delivery is added at checkout. Payments are charged in NGN.</p>
        </div></div>
    </div></div>}

    {bagOpen && <div className="sale-dialog-backdrop"><div className="sale-dialog-scrim" aria-hidden="true" onClick={() => setBagOpen(false)} /><div ref={bagRef} className="sale-bag-dialog sale-dialog" role="dialog" aria-modal="true" aria-labelledby="sale-bag-title" tabIndex={-1}>
      <header className="sale-dialog-header"><div><span className="sale-eyebrow">CHRISTMAS SALES</span><h2 id="sale-bag-title">Your sale bag <span>({bagCount})</span></h2></div><button className="sale-icon" type="button" onClick={() => setBagOpen(false)} aria-label="Close sale bag" title="Close bag"><HiX size={23} /></button></header>
      {bag.length ? <><ul className="sale-bag-items">{bag.map(item => { const product = offers.get(item.id); return <li key={item.id}>{product && <img src={photo(product)} alt="" width="80" height="100" />}<div><h3>{product?.name ?? 'No longer in this sale'}</h3>{product ? <><p>{money(product.price)} <del>{money(product.regularPrice)}</del></p><Quantity value={item.qty} onChange={qty => updateQuantity(item.id, qty)} name={product.name} /><strong>{money(product.price * item.qty)}</strong></> : <p className="sale-field-error">Remove this item before checkout.</p>}</div><button type="button" className="sale-icon" onClick={() => setBag(current => current.filter(line => line.id !== item.id))} aria-label={`Remove ${product?.name ?? 'unavailable item'}`} title="Remove item"><HiTrash size={18} /></button></li> })}</ul>
        <div className="sale-bag-summary"><div><span>Sale subtotal</span><strong>{money(bagTotal)}</strong></div><p>Delivery is added after you select your shipping region.</p>{!active && <p className="sale-notice">{snapshot?.phase === 'ended' ? 'The Christmas sale has ended.' : 'Sale checkout opens 9 November.'}</p>}<button type="button" className="sale-button" disabled={!active || invalidBag || Boolean(loadError)} onClick={() => { setBagOpen(false); setCheckoutOpen(true); track('Christmas Sale Checkout') }}>Checkout <HiArrowRight /></button><button type="button" className="sale-text-button" onClick={() => setBagOpen(false)}>Keep shopping</button></div>
      </> : <div className="sale-empty-bag"><HiShoppingBag size={40} aria-hidden="true" /><h3>Your sale bag is empty</h3><p>{active ? 'Find your next look in the Christmas edit.' : snapshot?.phase === 'ended' ? 'This sale has ended. Visit the regular collection for current prices.' : 'Preview the edit. Sale checkout opens 9 November.'}</p><button className="sale-button" type="button" onClick={() => setBagOpen(false)}><HiArrowLeft /> Explore the edit</button></div>}
    </div></div>}
    <SaleCheckout open={checkoutOpen} onClose={() => setCheckoutOpen(false)} items={bag} snapshot={snapshot} onPaid={paid} onRefresh={refresh} />
  </div>
}
