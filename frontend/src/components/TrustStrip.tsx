import { HiCreditCard, HiGlobeAlt, HiLocationMarker, HiChatAlt2 } from 'react-icons/hi'

const trustItems = [
  { icon: HiCreditCard, title: 'Secure Paystack checkout', detail: 'Cards accepted worldwide' },
  { icon: HiGlobeAlt, title: 'Worldwide delivery', detail: 'Nigeria, UK, USA, UAE and more' },
  { icon: HiLocationMarker, title: 'Abuja studio', detail: 'Pickup and in-person support' },
  { icon: HiChatAlt2, title: 'WhatsApp support', detail: 'Fast help before and after ordering' },
]

export default function TrustStrip() {
  return (
    <section className="bg-[#0d0d0d] px-4 py-5">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {trustItems.map(item => {
          const Icon = item.icon

          return (
            <div key={item.title} className="border border-white/10 bg-[#12100d] p-3 md:p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center bg-[#c9a84c]/12 text-[#c9a84c]">
                <Icon size={18} />
              </div>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-500">{item.detail}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
