import { track } from '@vercel/analytics'
import { HiLocationMarker, HiPhone, HiMail, HiClock } from 'react-icons/hi'
import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa'

const phones = [
  { number: '08128288948', display: '0812 828 8948' },
  { number: '+2347072066544', display: '+234 707 206 6544' },
]

const WHATSAPP_ORDER =
  'https://wa.me/2348128288948?text=Hello%20GLAMOURSPHAIR!%20I%27d%20like%20to%20place%20an%20order.'

export default function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#0d0d0d] px-4 py-16 md:py-24">
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/45 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center md:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#c9a84c]">Talk to us</p>
          <h2 className="mt-2 font-display text-4xl text-white md:text-6xl">
            Need help choosing?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-neutral-500">
            Visit the Abuja studio, order through WhatsApp, or ask us for the best unit for your look.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            <a href="https://maps.app.goo.gl/p8znThFBibsLGWa39" target="_blank" rel="noopener noreferrer" className="group border border-white/8 bg-[#111] p-5 transition-colors hover:border-[#c9a84c]/35">
              <HiLocationMarker className="text-[#c9a84c]" size={24} />
              <h3 className="mt-4 text-base font-semibold text-white">Abuja Studio</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                Shop 28, Cappador Galaxy Mall, Aminu Kano Crescent, Wuse II, Abuja.
              </p>
            </a>

            <div className="border border-white/8 bg-[#111] p-5">
              <HiPhone className="text-[#c9a84c]" size={24} />
              <h3 className="mt-4 text-base font-semibold text-white">Phone / WhatsApp</h3>
              <div className="mt-2 space-y-1.5">
                {phones.map(phone => (
                  <a key={phone.number} href={`tel:${phone.number}`} className="block text-sm text-neutral-500 transition-colors hover:text-[#c9a84c]">
                    {phone.display}
                  </a>
                ))}
              </div>
            </div>

            <div className="border border-white/8 bg-[#111] p-5">
              <HiClock className="text-[#c9a84c]" size={24} />
              <h3 className="mt-4 text-base font-semibold text-white">Business Hours</h3>
              <p className="mt-2 text-sm text-neutral-500">Mon - Sat: 9:00 AM - 7:00 PM</p>
              <p className="text-sm text-neutral-500">Sunday: Closed</p>
            </div>

            <a href="mailto:glamoursphair@gmail.com" className="border border-white/8 bg-[#111] p-5 transition-colors hover:border-[#c9a84c]/35">
              <HiMail className="text-[#c9a84c]" size={24} />
              <h3 className="mt-4 text-base font-semibold text-white">Email</h3>
              <p className="mt-2 text-sm text-neutral-500">glamoursphair@gmail.com</p>
            </a>
          </div>

          <div className="flex flex-col justify-between border border-[#25D366]/20 bg-[#25D366]/5 p-6 text-center md:p-8">
            <div>
              <FaWhatsapp className="mx-auto text-[#25D366]" size={54} />
              <h3 className="mt-5 font-display text-3xl text-white">Order on WhatsApp</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-neutral-400">
                Get quick replies, confirm availability, request custom pieces and receive order support.
              </p>
            </div>
            <a
              href={WHATSAPP_ORDER}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track('WhatsApp Click', { surface: 'contact-section' })}
              className="mt-7 flex min-h-12 w-full items-center justify-center bg-[#25D366] px-5 text-sm font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#20b85a]"
            >
              Chat on WhatsApp
            </a>
            <div className="mt-6 flex items-center justify-center gap-4">
              <a href="https://www.instagram.com/glamoursphair" target="_blank" rel="noopener noreferrer" aria-label="Open Instagram" className="flex h-10 w-10 items-center justify-center border border-white/10 text-neutral-400 transition-colors hover:border-[#c9a84c]/50 hover:text-[#c9a84c]">
                <FaInstagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@abujahairboss" target="_blank" rel="noopener noreferrer" aria-label="Open TikTok" className="flex h-10 w-10 items-center justify-center border border-white/10 text-neutral-400 transition-colors hover:border-[#c9a84c]/50 hover:text-[#c9a84c]">
                <FaTiktok size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
