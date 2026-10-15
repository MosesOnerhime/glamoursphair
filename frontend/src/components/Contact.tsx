import { HiLocationMarker, HiPhone, HiMail, HiClock } from 'react-icons/hi'
import { FaWhatsapp } from 'react-icons/fa'

export default function Contact() {
  return (
    <section id="contact" className="contact-band light-band">
      <div className="section-inner">
        <h2>A personal touch, from Abuja</h2>
        <div className="studio-details">
          <a href="https://www.google.com/maps/search/?api=1&query=3rd%20Floor%2C%20Cappador%20Galaxy%20Mall%2C%2081%20Aminu%20Kano%20Crescent%2C%20Wuse%202%2C%20Abuja%2C%20Nigeria" target="_blank" rel="noopener noreferrer"><HiLocationMarker size={23} /><h3>Visit our studio</h3><p>3rd Floor, Cappador Galaxy Mall,<br />81 Aminu Kano Crescent,<br />Wuse 2, Abuja, Nigeria.</p></a>
          <div><HiPhone size={23} /><h3>Talk to us</h3><a href="tel:+2348128288948">0812 828 8948</a><a href="tel:+2347072066544">+234 707 206 6544</a></div>
          <div><HiClock size={23} /><h3>Studio hours</h3><p>Mon - Sat: 9:00 AM - 7:00 PM<br />Sunday: Closed</p></div>
          <a href="mailto:glamoursphair@gmail.com"><HiMail size={23} /><h3>Email</h3><p>glamoursphair@gmail.com</p></a>
        </div>
        <div className="personal-shopping"><div><h3>Not sure which unit is yours?</h3><p>Ask a question, book a consultation or request a custom piece.</p></div><a href="https://wa.me/2348128288948?text=Hello%20GLAMOURSPHAIR!%20I%20need%20help%20choosing%20a%20unit%20or%20creating%20a%20custom%20piece." target="_blank" rel="noopener noreferrer" className="luxury-button"><FaWhatsapp size={18} /> Let's talk</a></div>
      </div>
    </section>
  )
}
