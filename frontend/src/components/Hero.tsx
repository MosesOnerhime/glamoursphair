import { FaWhatsapp } from 'react-icons/fa'

export default function Hero() {
  return (
    <section id="home" className="luxury-hero">
      <img src="/images/bone-straight.jpeg" alt="Glamoursphair hair worn at our Abuja studio" width="1126" height="2000" fetchPriority="high" className="hero-photograph" />
      <div className="hero-shade" />
      <div className="hero-brand"><img src="/images/logo.png" alt="" width="196" height="168" /><h1>GLAMOURSPHAIR</h1></div>
      <div className="hero-content">
        <p className="hero-tagline">You deserve Luxury</p>
        <p className="hero-subtext">Premium wigs and hair extensions crafted for queens. Elevate your crown - because every day deserves to be a great hair day.</p>
        <div className="hero-buttons">
          <a href="https://wa.me/2348128288948?text=Hello%20GLAMOURSPHAIR!%20I%27d%20like%20to%20shop%20your%20luxury%20hair%20collection." target="_blank" rel="noopener noreferrer" className="luxury-button"><FaWhatsapp size={18} /> Shop on WhatsApp</a>
          <a href="#shop" className="luxury-button outline">See the collection</a>
        </div>
      </div>
    </section>
  )
}
