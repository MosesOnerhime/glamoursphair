import { FaWhatsapp, FaInstagram, FaTiktok } from 'react-icons/fa'

export default function Footer() {
  return (
    <footer className="luxury-footer">
      <a href="/#home" className="footer-brand">GLAMOURSPHAIR</a>
      <p>Luxury hair. Abuja, Nigeria.</p>
      <div className="footer-socials">
        <a href="https://www.instagram.com/glamoursphair" target="_blank" rel="noopener noreferrer"><FaInstagram size={18} /> Instagram</a>
        <a href="https://www.tiktok.com/@abujahairboss" target="_blank" rel="noopener noreferrer"><FaTiktok size={17} /> TikTok</a>
        <a href="https://wa.me/2348128288948" target="_blank" rel="noopener noreferrer"><FaWhatsapp size={18} /> WhatsApp</a>
      </div>
      <p className="footer-copy">&copy; {new Date().getFullYear()} Glamoursphair Luxury</p>
    </footer>
  )
}
