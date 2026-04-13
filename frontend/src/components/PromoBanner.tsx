const promos = [
  // '✨ Pay in Installments: 20% down, 60 days to pay!',
  '🔥 Mega Sales: Buy 2 hairs, get FREE installation!',
  '💎 New Collection: Luxury Bone Straight now available',
  '🚚 Free delivery on orders above ₦150,000',
  '⭐ Book a consultation — look like royalty every day',
]

export default function PromoBanner() {
  const doubled = [...promos, ...promos]

  return (
    <div id="promotions" className="bg-[#c9a84c] overflow-hidden py-2.5 relative z-30 mt-[72px]">
      <div className="flex gap-12 whitespace-nowrap animate-marquee" style={{ animationDuration: '15s' }}>
        {doubled.map((promo, i) => (
          <span key={i} className="text-black font-semibold tracking-wide text-sm flex-shrink-0 px-4">
            {promo}
          </span>
        ))}
      </div>
    </div>
  )
}
