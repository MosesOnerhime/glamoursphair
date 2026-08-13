import { useState } from 'react'
import { track } from '@vercel/analytics'
import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa'

const shopLinks = [
  { label: 'New Arrivals', target: 'shop' },
  { label: 'HD Lace', target: 'shop', search: 'HD Lace' },
  { label: 'Bouncy', target: 'shop', search: 'Bouncy' },
  { label: 'Hair Care', target: 'shop', search: 'Serum' },
]

const helpLinks = [
  { label: 'Contact', target: 'contact' },
  { label: 'Shipping', target: 'contact' },
  { label: 'Hair Care', target: 'shop', search: 'Serum' },
  { label: 'WhatsApp Support', href: 'https://wa.me/2348128288948' },
]

export default function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)

  const goTo = (item: { target?: string; href?: string; search?: string }) => {
    if (item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer')
      return
    }

    if (item.search) {
      window.dispatchEvent(new CustomEvent('glamoursphair:search', { detail: item.search }))
    }

    if (item.target) document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' })
  }

  const joinNewsletter = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return
    track('Newsletter Signup', { source: 'footer' })
    setJoined(true)
    setEmail('')
  }

  return (
    <footer className="border-t border-white/10 bg-[#070707] px-4 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.15fr_0.55fr_0.55fr_0.95fr]">
          <div>
            <img src="/images/logo.png" alt="GLAMOURSPHAIR" className="h-24 w-24 object-contain" />
            <h2 className="mt-5 font-display text-4xl leading-none">GLAMOURSPHAIR</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
              Luxury hair designed to make every entrance memorable. Ready-to-wear units, custom support and secure checkout from Abuja.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a href="https://www.instagram.com/glamoursphair" target="_blank" rel="noopener noreferrer" aria-label="Open Instagram" className="transition-colors hover:text-[#c9a84c]"><FaInstagram size={20} /></a>
              <a href="https://www.tiktok.com/@abujahairboss" target="_blank" rel="noopener noreferrer" aria-label="Open TikTok" className="transition-colors hover:text-[#c9a84c]"><FaTiktok size={20} /></a>
              <a href="https://wa.me/2348128288948" target="_blank" rel="noopener noreferrer" aria-label="Open WhatsApp" className="transition-colors hover:text-[#25D366]"><FaWhatsapp size={20} /></a>
            </div>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#c9a84c]">Shop</h3>
            <ul className="space-y-3">
              {shopLinks.map(link => (
                <li key={link.label}>
                  <button onClick={() => goTo(link)} className="text-sm text-neutral-400 transition-colors hover:text-white">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#c9a84c]">Help</h3>
            <ul className="space-y-3">
              {helpLinks.map(link => (
                <li key={link.label}>
                  <button onClick={() => goTo(link)} className="text-sm text-neutral-400 transition-colors hover:text-white">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#c9a84c]">Newsletter</h3>
            <p className="text-sm leading-relaxed text-neutral-400">
              Join for restocks, new drops and private shopping updates.
            </p>
            <form onSubmit={joinNewsletter} className="mt-5 flex border border-white/10 bg-[#101010]">
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="Email address"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-[#c9a84c]"
              />
              <button className="bg-[#c9a84c] px-5 text-xs font-bold uppercase tracking-[0.16em] text-black">
                Join
              </button>
            </form>
            {joined && <p className="mt-3 text-sm text-neutral-400">You're on the list.</p>}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {year} Glamoursphair Luxury. All rights reserved.</span>
          <span className="uppercase tracking-[0.2em] text-neutral-600">Premium hair. Premium presentation. Premium experience.</span>
        </div>
      </div>
    </footer>
  )
}
