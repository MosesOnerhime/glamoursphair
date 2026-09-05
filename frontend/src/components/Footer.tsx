import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa'

const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029Vb8gQMqK5cDJFIwnVk2y'

const shopLinks = [
  { label: 'New Arrivals', target: 'collection', search: 'New' },
  { label: 'HD Lace', target: 'shop', search: 'HD Lace' },
  { label: 'Bouncy', target: 'shop', search: 'Bouncy' },
  { label: 'Awoof Sales', target: 'collection', search: 'Awoof Sales' },
]

const helpLinks = [
  { label: 'Contact', target: 'contact' },
  { label: 'Delivery Support', href: 'https://wa.me/2348128288948?text=Hello%20GLAMOURSPHAIR!%20I%20have%20a%20delivery%20question.' },
  { label: 'Book Consultation', href: 'https://wa.me/2348128288948?text=Hello%20GLAMOURSPHAIR!%20I%27d%20like%20a%20consultation.' },
  { label: 'WhatsApp Support', href: 'https://wa.me/2348128288948' },
]

export default function Footer() {
  const year = new Date().getFullYear()

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

  return (
    <footer className="border-t border-white/10 bg-[#070707] px-4 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.15fr_0.55fr_0.55fr_0.95fr]">
          <div>
            <img src="/images/logo.png" alt="GLAMOURSPHAIR" width="196" height="168" loading="lazy" className="h-24 w-24 object-contain" />
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
            <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-[#c9a84c]">Shopping updates</h3>
            <p className="text-sm leading-relaxed text-neutral-400">
              Join our WhatsApp channel for restocks, new drops, offers and shopping updates.
            </p>
            <a
              href={WHATSAPP_CHANNEL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 border border-[#25D366]/35 px-5 text-sm font-semibold text-[#25D366] transition-colors hover:bg-[#25D366]/10"
            >
              <FaWhatsapp size={17} />
              Join WhatsApp channel
            </a>
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
