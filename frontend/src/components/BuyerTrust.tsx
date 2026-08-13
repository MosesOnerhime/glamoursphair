import { HiCheckCircle, HiCreditCard, HiGlobeAlt, HiRefresh, HiChatAlt2 } from 'react-icons/hi'

const details = [
  { icon: HiCreditCard, title: 'Secure payments via Paystack', copy: 'Checkout stays in NGN with clear totals before payment.' },
  { icon: HiGlobeAlt, title: 'Local and international delivery', copy: 'Delivery fees are shown after your location is selected.' },
  { icon: HiRefresh, title: 'Live currency estimates', copy: 'USD and GBP displays refresh from a trusted rate source.' },
  { icon: HiChatAlt2, title: 'WhatsApp order support', copy: 'Confirm orders, ask questions and request custom pieces quickly.' },
]

export default function BuyerTrust() {
  return (
    <section className="bg-[#090807] px-4 py-18 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-[0.95fr_1.05fr] md:items-center">
          <div>
            <div className="mb-4 flex w-fit items-center gap-2 border border-[#c9a84c]/25 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#c9a84c]">
              <HiCheckCircle size={15} />
              Buyer confidence
            </div>
            <h2 className="font-display text-4xl leading-tight text-white md:text-6xl">
              Premium hair, simple ordering, trusted delivery.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-400 md:text-base">
              Built for Instagram buyers who want to see the product, confirm details fast, and pay with confidence.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {details.map(item => {
              const Icon = item.icon

              return (
                <div key={item.title} className="border border-white/10 bg-[#111] p-5">
                  <Icon className="text-[#c9a84c]" size={24} />
                  <h3 className="mt-4 text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-500">{item.copy}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
