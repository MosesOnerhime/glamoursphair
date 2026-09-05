import { FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa'
import { HiChevronRight, HiChatAlt2, HiShoppingBag, HiSparkles, HiTruck } from 'react-icons/hi'
import type { IconType } from 'react-icons'

const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029Vb8gQMqK5cDJFIwnVk2y'
const WHATSAPP_CHAT = 'https://wa.me/2348128288948?text=Hello%20GLAMOURSPHAIR!%20I%27d%20like%20a%20consultation.'
const INSTAGRAM = 'https://www.instagram.com/glamoursphair'
const TIKTOK = 'https://www.tiktok.com/@abujahairboss'

interface HubLink {
  title: string
  subtitle: string
  href: string
  image: string
  icon: IconType
  search?: string
}

const hubLinks: HubLink[] = [
  {
    title: 'Shop New Arrivals',
    subtitle: 'Browse fresh drops and new arrivals',
    href: '#shop',
    image: '/images/Wig Kellyin HDlace 1.jpeg',
    icon: HiSparkles,
    search: 'New',
  },
  {
    title: 'Shop Collection',
    subtitle: 'Browse premium wigs and hair care',
    href: '#shop',
    image: '/images/11a.jpeg',
    icon: HiShoppingBag,
    search: '',
  },
  {
    title: 'Signature Collection',
    subtitle: 'Explore polished statement units',
    href: '#shop',
    image: '/images/9.webp',
    icon: HiTruck,
    search: 'Signature Collection',
  },
  {
    title: 'Book Consultation',
    subtitle: 'Get help choosing the right unit',
    href: WHATSAPP_CHAT,
    image: '/images/logo.jpeg',
    icon: HiChatAlt2,
  },
]

export default function ChannelHub() {
  return (
    <section id="channel" className="bg-[#0d0d0d] px-4 py-14 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[0.92fr_1.08fr] md:items-center">
        <div className="text-center md:text-left">
          <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border border-[#c9a84c]/60 bg-black shadow-[0_0_45px_rgba(201,168,76,0.18)] md:mx-0">
            <div className="absolute inset-1 rounded-full border border-white/15" />
            <img
              src="/images/logo.png"
              alt="GLAMOURSPHAIR"
              width="196"
              height="168"
              className="relative h-20 w-20 object-contain"
            />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#c9a84c]">From Instagram to checkout</p>
          <h2 className="mt-3 font-display text-4xl leading-tight text-white md:text-6xl">
            Glamoursphair <span className="text-[#c9a84c]">Luxury Hair</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-400 md:mx-0 md:text-base">
            Join our WhatsApp channel for restocks, offers, new arrivals and quick buying updates from the Abuja studio.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3 md:justify-start">
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" aria-label="Open Glamoursphair on Instagram" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-neutral-300 transition-colors hover:bg-[#c9a84c] hover:text-black">
              <FaInstagram size={19} />
            </a>
            <a href={TIKTOK} target="_blank" rel="noopener noreferrer" aria-label="Open Glamoursphair on TikTok" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-neutral-300 transition-colors hover:bg-[#c9a84c] hover:text-black">
              <FaTiktok size={18} />
            </a>
            <a href={WHATSAPP_CHAT} target="_blank" rel="noopener noreferrer" aria-label="Chat with Glamoursphair on WhatsApp" className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/14 text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white">
              <FaWhatsapp size={19} />
            </a>
          </div>

          <a
            href={WHATSAPP_CHANNEL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 flex min-h-12 w-full items-center justify-center gap-3 rounded-full border border-[#c9a84c]/80 bg-[#c9a84c]/8 px-6 py-4 text-[#c9a84c] transition-[background-color,color] duration-300 hover:bg-[#c9a84c] hover:text-black md:max-w-md"
          >
            <FaWhatsapp size={19} />
            <span className="font-semibold tracking-wide">Join WhatsApp Channel</span>
          </a>
        </div>

        <div className="space-y-3">
          {hubLinks.map(link => {
            const Icon = link.icon
            const external = link.href.startsWith('http')

            return (
              <a
                key={link.title}
                href={link.href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                onClick={event => {
                  if (external || link.search === undefined) return
                  event.preventDefault()
                  window.dispatchEvent(new CustomEvent('glamoursphair:search', { detail: link.search }))
                  document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="group flex items-center gap-4 rounded-[8px] border border-white/10 bg-[#101010] p-3 text-left transition-[border-color,background-color] duration-300 hover:border-[#c9a84c]/60 hover:bg-[#151310]"
              >
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-[8px] bg-black">
                  <img src={link.image} alt="" width="64" height="64" loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/25" />
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Icon size={22} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-white">{link.title}</p>
                  <p className="mt-0.5 truncate text-sm text-neutral-500">{link.subtitle}</p>
                </div>
                <HiChevronRight className="flex-shrink-0 text-neutral-600 transition-colors group-hover:text-[#c9a84c]" size={22} />
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
