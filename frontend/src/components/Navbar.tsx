import { useState } from 'react'
import { HiShoppingBag, HiMenu, HiX, HiSearch, HiArrowRight } from 'react-icons/hi'
import { track } from '@vercel/analytics'
import { useDialogA11y } from '../hooks/useDialogA11y'

interface NavbarProps { cartCount: number; onCartClick: () => void; productsPage?: boolean }
const links = [
  { label: 'Home', id: 'home' },
  { label: 'All products', id: 'shop' },
  { label: 'About', id: 'about' },
  { label: 'Support', id: 'shopping-support' },
  { label: 'Contact', id: 'contact' },
]
const popularSearches = ['HD Lace', 'Bouncy', 'Straight', 'Blonde', 'Awoof Sales']

export default function Navbar({ cartCount, onCartClick, productsPage = false }: NavbarProps) {
  const linkHref = (id: string) => id === 'shop' ? '/products' : id === 'shopping-support' ? '#shopping-support' : `${productsPage ? '/' : ''}#${id}`
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const menuRef = useDialogA11y<HTMLDivElement>(menuOpen, () => setMenuOpen(false))
  const searchRef = useDialogA11y<HTMLDivElement>(searchOpen, () => setSearchOpen(false))

  const submitSearch = (term = query) => {
    const clean = term.trim()
    if (!clean) return
    track('Search', { query: clean })
    if (!productsPage) {
      window.location.assign(`/products?q=${encodeURIComponent(clean)}`)
      return
    }
    window.dispatchEvent(new CustomEvent('glamoursphair:search', { detail: clean }))
    document.getElementById('shop')?.scrollIntoView()
    setSearchOpen(false)
    setMenuOpen(false)
    setQuery('')
  }

  return <>
    <header className="luxury-header">
      <a href="/#home" className="header-brand" aria-label="Glamoursphair home"><img src="/images/logo.png" alt="" width="196" height="168" /><span>GLAMOURSPHAIR</span></a>
      <nav aria-label="Main navigation"><ul>{links.map(link => <li key={link.id}><a href={linkHref(link.id)} aria-current={productsPage && link.id === 'shop' ? 'page' : undefined}>{link.label}</a></li>)}</ul></nav>
      <div className="header-actions">
        <button onClick={() => setSearchOpen(true)} aria-label="Open search" title="Search"><HiSearch size={21} /></button>
        <button onClick={onCartClick} aria-label={`Open cart, ${cartCount} item${cartCount === 1 ? '' : 's'}`} title="Your cart"><HiShoppingBag size={22} />{cartCount > 0 && <span key={cartCount} className="cart-count">{cartCount}</span>}</button>
        <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu" aria-expanded={menuOpen} title="Menu"><HiMenu size={25} /></button>
      </div>
    </header>

    {menuOpen && <div className="navigation-backdrop">
      <div className="absolute inset-0" aria-hidden="true" onClick={() => setMenuOpen(false)} />
      <div ref={menuRef} role="dialog" aria-modal="true" aria-label="Mobile navigation" tabIndex={-1} className="mobile-navigation">
        <button className="menu-close round-tool" onClick={() => setMenuOpen(false)} aria-label="Close menu"><HiX size={23} /></button>
        <img src="/images/logo.png" alt="GLAMOURSPHAIR" width="196" height="168" />
        <nav aria-label="Mobile navigation">{links.map(link => <a key={link.id} href={linkHref(link.id)} aria-current={productsPage && link.id === 'shop' ? 'page' : undefined} onClick={() => setMenuOpen(false)}>{link.label}<HiArrowRight size={18} /></a>)}</nav>
        <a href="https://wa.me/2348128288948" target="_blank" rel="noopener noreferrer" className="luxury-button outline">WhatsApp support</a>
      </div>
    </div>}

    {searchOpen && <div className="fixed inset-0 z-[90] bg-black/80 p-4">
      <div ref={searchRef} role="dialog" aria-modal="true" aria-labelledby="search-dialog-title" tabIndex={-1} className="search-dialog">
        <div className="flex items-center justify-between gap-4"><h2 id="search-dialog-title">Find your next look</h2><button className="round-tool" onClick={() => setSearchOpen(false)} aria-label="Close search"><HiX size={22} /></button></div>
        <form onSubmit={event => { event.preventDefault(); submitSearch() }} role="search">
          <label htmlFor="site-search" className="sr-only">Search products</label>
          <input id="site-search" name="q" type="search" autoFocus value={query} onChange={event => setQuery(event.target.value)} placeholder="Search wigs, bouncy, HD lace..." />
          <button type="submit" aria-label="Submit search" title="Search"><HiArrowRight size={22} /></button>
        </form>
        <div className="search-suggestions">{popularSearches.map(term => <button key={term} onClick={() => submitSearch(term)}>{term}</button>)}</div>
      </div>
    </div>}
  </>
}
