import { FaInstagram, FaTiktok, FaWhatsapp } from 'react-icons/fa'
import { HiChevronRight } from 'react-icons/hi'
import type { IconType } from 'react-icons'

const WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029Vb8gQMqK5cDJFIwnVk2y'
const WHATSAPP_CHAT = 'https://wa.me/2348128288948'
const INSTAGRAM = 'https://www.instagram.com/glamoursphair'
const TIKTOK = 'https://www.tiktok.com/@abujahairboss'

interface HubLink {
  title: string
  subtitle: string
  href: string
  image: string
  icon: IconType
}

const hubLinks: HubLink[] = [
  // {
  //   title: 'Shop New Arrivals',
  //   subtitle: 'Fresh luxury units and signature styles',
  //   href: '#shop',
  //   image: '/images/12a.jpeg',
  //   icon: HiSparkles,
  // },
  // {
  //   title: 'Shop Collection',
  //   subtitle: 'Explore premium wigs and hair extensions',
  //   href: '#shop',
  //   image: '/images/11a.jpeg',
  //   icon: HiShoppingBag,
  // },
  // {
  //   title: 'Ready to Ship Hair',
  //   subtitle: 'Buy today and arrange fast dispatch',
  //   href: '#shop',
  //   image: '/images/9.png',
  //   icon: HiTruck,
  // },
  // {
  //   title: 'Book a Consultation',
  //   subtitle: 'Get help choosing your perfect unit',
  //   href: WHATSAPP_CHAT,
  //   image: '/images/logo.jpeg',
  //   icon: HiChatAlt2,
  // },
]

export default function ChannelHub() {
  return (
    <section id="channel" className="bg-[#0d0d0d] px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <div className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border border-[#c9a84c]/60 bg-black shadow-[0_0_45px_rgba(201,168,76,0.16)]">
          <div className="absolute inset-1 rounded-full border border-white/15" />
          <img
            src="/images/logo.png"
            alt="GLAMOURSPHAIR"
            className="relative h-24 w-24 object-contain"
          />
        </div>

        <h2 className="font-display text-3xl text-white tracking-wide">
          Glamoursphair <span className="text-[#c9a84c]">Luxury Hair</span>
        </h2>
        <p className="mt-3 text-neutral-400 leading-relaxed">
          Abuja luxury hair studio for premium wigs, ready-to-ship units, custom installs and queen-level finishing.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href={INSTAGRAM}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Glamoursphair on Instagram"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-neutral-300 transition-colors hover:bg-[#c9a84c] hover:text-black"
          >
            <FaInstagram size={20} />
          </a>
          <a
            href={TIKTOK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open Glamoursphair on TikTok"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-neutral-300 transition-colors hover:bg-[#c9a84c] hover:text-black"
          >
            <FaTiktok size={19} />
          </a>
          <a
            href={WHATSAPP_CHAT}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Glamoursphair on WhatsApp"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-neutral-300 transition-colors hover:bg-[#25D366] hover:text-white"
          >
            <FaWhatsapp size={20} />
          </a>
        </div>

        <a
          href={WHATSAPP_CHANNEL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-[#c9a84c]/80 px-6 py-4 text-[#c9a84c] transition-all duration-300 hover:bg-[#c9a84c] hover:text-black"
        >
          <FaWhatsapp size={19} />
          <span className="font-semibold tracking-wide">Join WhatsApp Channel</span>
        </a>

        <div className="mt-7 space-y-4">
          {hubLinks.map(link => {
            const Icon = link.icon

            return (
              <a
                key={link.title}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-4 rounded-[8px] border border-white/10 bg-[#0f0f0f] p-3 text-left transition-all duration-300 hover:border-[#c9a84c]/60 hover:bg-[#141414]"
              >
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-[8px] bg-black">
                  <img src={link.image} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 flex items-center justify-center text-white/90">
                    <Icon size={21} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-medium text-white">{link.title}</p>
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
