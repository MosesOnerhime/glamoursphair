import { HiLocationMarker, HiPhone, HiMail, HiClock } from 'react-icons/hi'
import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa'

const phones = [
  // { number: '08188030965', display: '0818 803 0965' },
  { number: '08128288948', display: '0812 828 8948' },
  { number: '+2347072066544', display: '+234 707 206 6544' },
]

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-4 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a84c]/50 to-transparent" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-[#c9a84c]/5 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-12 bg-[#c9a84c]" />
            <span className="text-[#c9a84c] tracking-[0.4em] text-xs uppercase">Find Us</span>
            <div className="h-px w-12 bg-[#c9a84c]" />
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-white tracking-tight">
            Get in <span className="text-[#c9a84c]">Touch</span>
          </h2>
          <p className="mt-4 text-neutral-500 max-w-md mx-auto">
            Visit our showroom or reach us any time. We're always here to help you find your perfect look.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Info cards */}
          <div className="space-y-4">
            {/* Address */}
            <div className="flex gap-4 p-6 border border-white/5 hover:border-[#c9a84c]/30 transition-colors duration-300 group">
              <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c9a84c]/20 transition-colors">
                <HiLocationMarker className="text-[#c9a84c]" size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold tracking-wide mb-1">Our Showroom</h3>
                <a
                  href="https://maps.app.goo.gl/p8znThFBibsLGWa39"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-400 text-sm leading-relaxed hover:text-[#c9a84c] transition-colors"
                >
                  Glamoursphair  Studio <br/>
                  SHOP NO. 28, 
                  CAPPADOR GALAXY MALL <br/>
                  AMINU KANO CRESCENT, 
                  WUSE II, 
                  Abuja.
                </a>
              </div>
            </div>

            {/* Phone numbers */}
            <div className="flex gap-4 p-6 border border-white/5 hover:border-[#c9a84c]/30 transition-colors duration-300 group">
              <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c9a84c]/20 transition-colors">
                <HiPhone className="text-[#c9a84c]" size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold tracking-wide mb-2">Phone / WhatsApp</h3>
                <div className="space-y-1.5">
                  {phones.map(p => (
                    <a
                      key={p.number}
                      href={`tel:${p.number}`}
                      className="block text-neutral-400 text-sm hover:text-[#c9a84c] transition-colors"
                    >
                      {p.display}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Hours */}
            <div className="flex gap-4 p-6 border border-white/5 hover:border-[#c9a84c]/30 transition-colors duration-300 group">
              <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c9a84c]/20 transition-colors">
                <HiClock className="text-[#c9a84c]" size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold tracking-wide mb-1">Business Hours</h3>
                <p className="text-neutral-400 text-sm">Mon – Sat: 9:00 AM – 7:00 PM</p>
                <p className="text-neutral-400 text-sm">Sunday: 12:00 PM – 5:00 PM</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex gap-4 p-6 border border-white/5 hover:border-[#c9a84c]/30 transition-colors duration-300 group">
              <div className="w-10 h-10 rounded-full bg-[#c9a84c]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#c9a84c]/20 transition-colors">
                <HiMail className="text-[#c9a84c]" size={20} />
              </div>
              <div>
                <h3 className="text-white font-semibold tracking-wide mb-1">Email</h3>
                <a href="mailto:info@glamoursphair.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 text-sm hover:text-[#c9a84c] transition-colors">
                  glamoursphair@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* WhatsApp + Social CTA */}
          <div className="flex flex-col gap-6">
            <div className="flex-1 border border-[#25D366]/20 bg-[#25D366]/5 p-8 flex flex-col items-center justify-center text-center gap-6">
              <FaWhatsapp className="text-[#25D366]" size={52} />
              <div>
                <h3 className="text-white font-display text-2xl mb-2">Chat with Us</h3>
                <p className="text-neutral-400 text-sm">Get instant replies, place orders, and ask questions on WhatsApp.</p>
              </div>
              <a
                href="https://wa.me/2348128288948?text=Hello%20GLAMOURSPHAIR!%20I%27d%20like%20to%20place%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#25D366] text-white font-bold tracking-[0.2em] text-sm uppercase hover:bg-[#20b85a] transition-colors duration-300"
              >
                Chat on WhatsApp
              </a>
            </div>

            {/* Social links */}
            <div className="border border-white/5 p-6 flex items-center justify-center gap-6">
              <span className="text-neutral-500 text-sm tracking-widest uppercase">Follow Us</span>
              <a href="https://www.instagram.com/glamoursphair" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-[#c9a84c] hover:border-[#c9a84c]/50 transition-all duration-300">
                <FaInstagram size={18} />
              </a>
              <a href="https://www.tiktok.com/@abujahairboss" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-[#c9a84c] hover:border-[#c9a84c]/50 transition-all duration-300">
                <FaTiktok size={18} />
              </a>
              <a href="https://wa.me/2348128288948" target="_blank" rel="noopener noreferrer" className="w-10 h-10 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-[#c9a84c] hover:border-[#c9a84c]/50 transition-all duration-300">
                <FaWhatsapp size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
