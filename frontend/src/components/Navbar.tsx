import { useEffect, useState } from 'react'
import { HiShoppingBag, HiMenu, HiX, HiSearch, HiArrowRight } from 'react-icons/hi'
import { track } from '@vercel/analytics'

interface NavbarProps {
  cartCount: number
  onCartClick: () => void
}

const links = [
  { label: 'Shop', id: 'shop' },
  { label: 'New Arrivals', id: 'shop' },
  { label: 'Collections', id: 'collections' },
  { label: 'About', id: 'about' },
]

const popularSearches = ['HD Lace', 'Bouncy', 'Straight', 'Blonde', 'Serum']

export default function Navbar({ cartCount, onCartClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const submitSearch = (term = query) => {
    const cleanTerm = term.trim()
    if (!cleanTerm) return

    window.dispatchEvent(new CustomEvent('glamoursphair:search', { detail: cleanTerm }))
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
    track('Search', { query: cleanTerm })
    setSearchOpen(false)
    setMenuOpen(false)
    setQuery('')
  }

  return (
    <>
      <nav className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/10 bg-[#090807]/92 py-3 text-white shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-md'
          : 'bg-transparent py-4 text-white'
      }`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 md:px-8">
          <button className="text-left leading-none" onClick={() => scrollTo('home')} aria-label="Go to homepage">
            <span className="font-display text-2xl tracking-[0.12em] md:text-3xl">
              GLAMOURSPHAIR
            </span>
            <span className={`mt-1 block h-px w-24 ${scrolled ? 'bg-[#c9a84c]/70' : 'bg-[#c9a84c]'}`} />
          </button>

          <ul className="hidden items-center gap-8 md:flex">
            {links.map(link => (
              <li key={link.label}>
                <button
                  onClick={() => scrollTo(link.id)}
                  className={`relative text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                    scrolled ? 'text-neutral-300 hover:text-[#c9a84c]' : 'text-neutral-200 hover:text-[#c9a84c]'
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className={`flex h-10 w-10 items-center justify-center transition-colors ${scrolled ? 'text-neutral-200 hover:text-[#c9a84c]' : 'text-neutral-300 hover:text-[#c9a84c]'}`}
              aria-label="Open search"
            >
              <HiSearch size={20} />
            </button>
            <button
              onClick={onCartClick}
              className={`relative flex h-10 w-10 items-center justify-center transition-colors ${scrolled ? 'text-neutral-200 hover:text-[#c9a84c]' : 'hover:text-[#c9a84c]'}`}
              aria-label="Open cart"
            >
              <HiShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a84c] text-xs font-bold text-black">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className="flex h-10 w-10 items-center justify-center text-white md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <HiMenu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-[#090807] text-white md:hidden">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <span className="font-display text-2xl tracking-[0.12em]">GLAMOURSPHAIR</span>
            <button onClick={() => setMenuOpen(false)} className="flex h-10 w-10 items-center justify-center" aria-label="Close menu">
              <HiX size={24} />
            </button>
          </div>

          <div className="px-5 py-8">
            <div className="space-y-5">
              {links.map(link => (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.id)}
                  className="flex w-full items-center justify-between border-b border-white/10 pb-5 text-left font-display text-4xl transition-colors hover:text-[#c9a84c]"
                >
                  {link.label}
                  <HiArrowRight size={22} className="text-[#c9a84c]" />
                </button>
              ))}
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className="mt-8 flex w-full items-center justify-center gap-2 bg-[#c9a84c] px-5 py-4 text-sm font-bold uppercase tracking-[0.16em] text-black"
            >
              <HiSearch size={18} />
              Search Glamoursphair
            </button>

            <p className="mt-8 max-w-xs text-sm leading-relaxed text-neutral-400">
              Premium ready-to-wear units, custom installs and WhatsApp support from Abuja.
            </p>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="fixed inset-0 z-[70] bg-black/75 p-4 backdrop-blur-md">
          <div className="mx-auto mt-20 max-w-2xl border border-white/10 bg-[#0d0d0d] p-5 shadow-2xl shadow-black/70 md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c9a84c]">Search</p>
                <h2 className="mt-1 font-display text-3xl text-white">Search Glamoursphair</h2>
              </div>
              <button onClick={() => setSearchOpen(false)} className="flex h-10 w-10 items-center justify-center text-neutral-400 hover:text-white" aria-label="Close search">
                <HiX size={24} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                submitSearch()
              }}
              className="flex gap-2"
            >
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search wigs, bouncy, HD lace..."
                className="min-w-0 flex-1 border border-white/10 bg-[#111] px-4 py-4 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-[#c9a84c]/60"
              />
              <button className="bg-[#c9a84c] px-5 text-sm font-bold uppercase tracking-[0.14em] text-black">
                Go
              </button>
            </form>

            <div className="mt-6">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Popular searches</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {popularSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => submitSearch(term)}
                    className="border border-white/10 px-4 py-2 text-sm text-neutral-300 transition-colors hover:border-[#c9a84c]/50 hover:text-[#c9a84c]"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
