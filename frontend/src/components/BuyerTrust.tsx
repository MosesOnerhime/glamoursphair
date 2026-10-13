import { HiCreditCard, HiGlobeAlt, HiChatAlt2, HiShoppingBag } from 'react-icons/hi'

const details = [
  { icon: HiShoppingBag, title: 'Prices upfront', copy: 'See each unit, its specifications and its NGN price before ordering.' },
  { icon: HiCreditCard, title: 'Secure checkout', copy: 'Pay through Paystack. Your final NGN total is shown before payment.' },
  { icon: HiChatAlt2, title: 'Personal support', copy: 'Ask about a product, request a custom unit or book a consultation on WhatsApp.' },
  { icon: HiGlobeAlt, title: 'From Abuja, to you', copy: 'Nigeria and international delivery, with a location-based fee at checkout.' },
]

export default function BuyerTrust() {
  return (
    <section id="shopping-support" className="buyer-confidence light-band">
      <div className="section-inner">
        <h2>Why Glamoursphair</h2>
        <div className="benefit-grid">{details.map(item => { const Icon = item.icon; return <div key={item.title} className="benefit"><Icon size={24} aria-hidden="true" /><h3>{item.title}</h3><p>{item.copy}</p></div> })}</div>
        <div className="delivery-note"><h3>Your next look, delivered.</h3><p>Select your delivery location at checkout to see the fee. USD and GBP displays are estimates; payments are made in NGN.</p><a href="https://wa.me/2348128288948?text=Hello%20GLAMOURSPHAIR!%20I%20have%20a%20delivery%20question." target="_blank" rel="noopener noreferrer">Ask about delivery</a></div>
      </div>
    </section>
  )
}
