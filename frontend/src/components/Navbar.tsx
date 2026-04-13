import { useState, useEffect } from 'react'
import { HiShoppingBag, HiMenu, HiX, HiSearch } from 'react-icons/hi'

interface NavbarProps {
  cartCount: number
  onCartClick: () => void
}

const links = ['Home', 'Shop', 'Promotions', 'Contact']

export default function Navbar({ cartCount, onCartClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuVisible, setMenuVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openMenu = () => {
    setMenuVisible(true)
    setMenuOpen(true)
  }

  const closeMenu = () => {
    setMenuOpen(false)
    setTimeout(() => setMenuVisible(false), 200)
  }

  const toggleMenu = () => menuOpen ? closeMenu() : openMenu()

  const scrollTo = (id: string) => {
    const el = document.getElementById(id.toLowerCase())
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    closeMenu()
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#c9a84c]/20 py-3' : 'bg-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex flex-col leading-none cursor-pointer" onClick={() => scrollTo('home')}>
            <span className="font-display text-2xl md:text-3xl tracking-[0.15em]">
              <span className="text-[#c9a84c]">GLAMOURS</span>
              <span className="text-white">PHAIR</span>
            </span>
            <div className="h-px bg-gradient-to-r from-[#c9a84c] to-transparent mt-1" />
          </div>
          {/* <div className="cursor-pointer flex items-center" onClick={() => scrollTo('home')}>
            <img
              src="/images/logo.png"
              alt="GLAMOURSPHAIR"
              className="w-40 md:w-40 h-24 md:h-20 object-contain"
            />
          </div> */}

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {links.map(link => (
              <li key={link}>
                <button
                  onClick={() => scrollTo(link)}
                  className="text-sm tracking-[0.2em] uppercase text-neutral-300 hover:text-[#c9a84c] transition-colors duration-300 relative group"
                >
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#c9a84c] group-hover:w-full transition-all duration-300" />
                </button>
              </li>
            ))}
          </ul>

          {/* Cart + Hamburger + search icon */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
              className="p-2 text-neutral-400 hover:text-[#c9a84c] transition-colors"
            >
              <HiSearch size={20} />
            </button>
            <button onClick={onCartClick} className="relative p-2 hover:text-[#c9a84c] transition-colors">
              <HiShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#c9a84c] text-black text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="md:hidden p-2 text-white" onClick={toggleMenu}>
              {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {menuVisible && (
        <div className="fixed top-[60px] right-4 z-40 bg-[#0a0a0a]/98 backdrop-blur-md border border-[#c9a84c]/20 md:hidden animate-dropdown w-48 shadow-xl shadow-black/50">
          <ul className="flex flex-col py-2">
            {links.map((link, i) => (
              <li key={link}>
                <button
                  onClick={() => scrollTo(link)}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  className="w-full text-left px-5 py-3.5 text-xs tracking-[0.2em] uppercase text-neutral-300 hover:text-[#c9a84c] hover:bg-[#c9a84c]/5 transition-all duration-200 border-b border-white/5 last:border-0"
                >
                  {link}
                </button>
              </li>
            ))}
            <li className="px-5 py-3">
              <span className="text-[#c9a84c]/40 tracking-[0.25em] text-[10px] uppercase">
                Luxury Hair & Wigs
              </span>
            </li>
          </ul>
        </div>
      )}
    </>
  )
}
