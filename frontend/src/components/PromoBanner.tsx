const promos = [
  'Mega Sales: Buy 2 hairs, get FREE installation!',
  'New Collection: Luxury ready-to-wear units now available',
  'Delivery across Nigeria and internationally',
  'Book a consultation - choose your perfect unit',
]

export default function PromoBanner() {
  const doubled = [...promos, ...promos]

  return (
    <div id="promotions" className="relative z-30 mt-[72px] overflow-hidden bg-[#c9a84c] py-2.5">
      <div className="flex gap-10 whitespace-nowrap motion-safe:animate-marquee" style={{ animationDuration: '16s' }}>
        {doubled.map((promo, i) => (
          <span key={i} className="flex-shrink-0 px-4 text-sm font-semibold tracking-wide text-black">
            {promo}
          </span>
        ))}
      </div>
    </div>
  )
}
