import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa'

export default function Footer() {
  const year = new Date().getFullYear()

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer className="bg-[#060606] border-t border-white/5 px-4 pt-16 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="mb-4">
              <span className="font-display text-3xl tracking-[0.15em] text-[#c9a84c]">GLAMOURS</span>
              <span className="font-display text-3xl tracking-[0.15em] text-white">PHAIR</span>
            </div>
            <div className="h-px w-24 bg-gradient-to-r from-[#c9a84c] to-transparent mb-5" />
            <p className="text-neutral-500 text-sm leading-relaxed max-w-xs">
              Premium luxury hair and wig brand based in Abuja. We believe every woman deserves to feel like royalty, every single day.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="https://www.instagram.com/glamoursphair" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-[#c9a84c] transition-colors"><FaInstagram size={20} /></a>
              <a href="https://www.tiktok.com/@abujahairboss" target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-[#c9a84c] transition-colors"><FaTiktok size={20} /></a>
              <a
                href="https://wa.me/2348128288948"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-500 hover:text-[#25D366] transition-colors"
              >
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold tracking-[0.2em] uppercase text-xs mb-5">Navigate</h4>
            <ul className="space-y-3">
              {['Home', 'Shop', 'Promotions', 'Contact'].map(link => (
                <li key={link}>
                  <button
                    onClick={() => scrollTo(link.toLowerCase())}
                    className="text-neutral-500 text-sm hover:text-[#c9a84c] transition-colors tracking-wide"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold tracking-[0.2em] uppercase text-xs mb-5">Contact</h4>
            <div className="space-y-3 text-sm text-neutral-500">
              <p className="leading-relaxed">
                Suite FB-53, New Banex Plaza<br />
                Wuse 2, Abuja, FCT
              </p>
              <div className="space-y-1.5 pt-1">
                <a href="tel:08188030965" className="block hover:text-[#c9a84c] transition-colors">0818 803 0965</a>
                <a href="tel:08128288948" className="block hover:text-[#c9a84c] transition-colors">0812 828 8948</a>
                <a href="tel:+2347072066544" className="block hover:text-[#c9a84c] transition-colors">+234 707 206 6544</a>
              </div>
            </div>
          </div>
        </div>

        {/* Promo strip */}
        <div className="border-t border-white/5 border-b border-b-white/5 py-4 my-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[#c9a84c] tracking-wide">💎 Pay in Installments: 20% down, 60 days to pay!</span>
          <span className="text-neutral-600">🔥 Buy 2 hairs, get FREE installation!</span>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
          <span>© {year} GLAMOURSPHAIR. All rights reserved.</span>
          <span className="tracking-widest uppercase">Luxury Hair · Abuja, Nigeria</span>
        </div>
      </div>
    </footer>
  )
}
