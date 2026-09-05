import { FaWhatsapp } from 'react-icons/fa'
import { HiSparkles } from 'react-icons/hi'

const WHATSAPP_ORDER =
  'https://wa.me/2348128288948?text=Hello%20GLAMOURSPHAIR!%20I%27d%20like%20to%20shop%20your%20luxury%20hair%20collection.'

export default function Hero() {
  const scrollToShop = () => {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToChannel = () => {
    document.getElementById('channel')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="relative min-h-[calc(100svh-42px)] overflow-hidden bg-[#090807] pt-24 md:min-h-[88vh]">
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/images/Wig Kellyin HDlace 2.jpeg"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-45"
        style={{ objectPosition: '50% 18%' }}
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#090807]/66 to-[#0d0d0d]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 md:grid-cols-[1.02fr_0.98fr] md:px-8 md:pb-16">
        <div className="max-w-xl pt-4 text-center md:text-left">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 border border-[#c9a84c]/25 bg-black/35 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c9a84c] md:mx-0">
            <HiSparkles size={14} />
            Luxury Hair Experience
          </div>

          <h1 className="font-display text-5xl uppercase leading-[0.9] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            <span className="block">You</span>
            <span className="block text-4xl normal-case leading-none text-[#c9a84c] sm:text-5xl md:text-6xl lg:text-7xl">
              deserve
            </span>
            <span className="block">Luxury</span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-neutral-300 md:mx-0 md:text-lg">
            Premium wigs and hair extensions crafted for queens. Elevate your crown - because every day deserves to be a great hair day.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <button
              onClick={scrollToShop}
              className="flex min-h-12 items-center justify-center bg-[#c9a84c] px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-white"
            >
              Shop Luxury Wigs Now
            </button>
            <a
              href={WHATSAPP_ORDER}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-2 border border-[#25D366]/45 bg-[#25D366]/10 px-6 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#25D366] transition-colors hover:bg-[#25D366] hover:text-white"
            >
              <FaWhatsapp size={17} />
              Order on WhatsApp
            </a>
          </div>

          <button
            onClick={scrollToChannel}
            className="mt-4 text-sm font-medium text-neutral-400 underline decoration-[#c9a84c]/50 underline-offset-4 transition-colors hover:text-[#c9a84c]"
          >
            Join our WhatsApp channel for new drops and restocks
          </button>
        </div>

        <div className="grid grid-cols-[0.84fr_1fr] items-end gap-3 md:gap-4">
          <div className="overflow-hidden border border-white/10 bg-[#111] shadow-2xl shadow-black/50">
            <img src="/images/Wig Kellyin HDlace 2.jpeg" alt="Wig Kelly in HD Lace" width="607" height="606" fetchPriority="high" className="aspect-[3/4] h-full w-full object-cover" />
          </div>
          <div className="space-y-3 md:space-y-4">
            <div className="overflow-hidden border border-[#c9a84c]/35 bg-[#111] shadow-2xl shadow-black/60">
              <img src="/images/12a.jpeg" alt="400g Donor bouncy wig" width="607" height="787" className="aspect-[4/5] h-full w-full object-cover" />
            </div>
            <div className="border border-white/10 bg-black/60 p-4 text-left backdrop-blur md:p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Starting from</p>
              <p className="mt-1 font-display text-3xl text-[#c9a84c]">NGN 110k</p>
              <p className="mt-1 text-xs text-neutral-400">Premium units, serum care and worldwide dispatch.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-5 md:px-8">
        <div className="h-px bg-gradient-to-r from-transparent via-[#c9a84c]/30 to-transparent" />
      </div>
    </section>
  )
}
