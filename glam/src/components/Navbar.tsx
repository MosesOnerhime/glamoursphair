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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id.toLowerCase())
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#c9a84c]/20 py-3' : 'bg-transparent py-5'
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
          <div className="flex items-center gap-4">
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
            <button className="md:hidden p-2 text-white" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`fixed inset-0 z-40 bg-[#0a0a0a] flex flex-col items-center justify-center gap-8 transition-all duration-500 ${
        menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {links.map((link, i) => (
          <button
            key={link}
            onClick={() => scrollTo(link)}
            className="font-display text-4xl tracking-widest text-white hover:text-[#c9a84c] transition-colors"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            {link}
          </button>
        ))}
        <div className="mt-8 text-[#c9a84c] tracking-[0.3em] text-xs uppercase">Luxury Hair & Wigs</div>
      </div>
    </>
  )
}
