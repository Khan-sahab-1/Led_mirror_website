import Link from "next/link";

export default function Footer() {
  return (
    <footer className="luxury-footer-root">
      <div className="container footer-top-grid">
        {/* Brand Mission Column */}
        <div className="footer-brand-column">
          <Link href="/" className="brand-logo footer-brand">
            <span className="brand-title">GLASSSTUDIO</span>
            <span className="brand-dot">.</span>
            <span className="brand-sub">LUXURY ATELIER</span>
          </Link>
          <p className="footer-brand-mission">
            Crafting architectural mirrors that elevate modern living. Designed with Saint-Gobain optical glass,
            diamond-cut beveling, and ambient circadian illumination for residences, boutique hotels, and design studios across India.
          </p>
          <div className="footer-trust-badges">
            <span className="footer-chip">💎 Saint-Gobain Glass</span>
            <span className="footer-chip">🛡️ 5-Year Warranty</span>
            <span className="footer-chip">📦 Insured Crate Logistics</span>
          </div>
        </div>

        {/* Collections Links */}
        <div className="footer-links-column">
          <h4 className="footer-nav-title">Collections</h4>
          <ul className="footer-nav-list">
            <li><Link href="/#shop">All Mirrors</Link></li>
            <li><Link href="/#led-collection">LED Backlit Series</Link></li>
            <li><Link href="/products/halo-led-arch-mirror">Halo Arch LED Mirror</Link></li>
            <li><Link href="/products/luna-round-wall-mirror">Luna Round Mirror</Link></li>
            <li><Link href="/products/full-length-dressing-mirror">Full-Length Dressing Mirror</Link></li>
            <li><Link href="/custom-mirror">Bespoke Atelier Studio</Link></li>
          </ul>
        </div>

        {/* Customer Concierge */}
        <div className="footer-links-column">
          <h4 className="footer-nav-title">Client Services</h4>
          <ul className="footer-nav-list">
            <li><Link href="/account">My Orders & Live Tracking</Link></li>
            <li><Link href="/login">Client Account Sign In</Link></li>
            <li><Link href="/checkout">Secure Checkout (COD & Online)</Link></li>
            <li><Link href="/custom-mirror">Request Custom Dimensions</Link></li>
            <li><Link href="/admin">Staff Admin Portal</Link></li>
          </ul>
        </div>

        {/* Concierge & Contact */}
        <div className="footer-contact-column">
          <h4 className="footer-nav-title">Atelier Concierge</h4>
          <p className="footer-contact-text">
            Have a custom space requirement, architectural blueprint, or bulk hospitality inquiry?
          </p>
          <div className="footer-contact-card">
            <div className="contact-line">
              <span className="contact-icon">💬</span>
              <div>
                <strong>WhatsApp Concierge</strong>
                <a
                  href="https://wa.me/91 9266472817?text=Hello%20GlassStudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  +91 9266472817
                </a>
              </div>
            </div>
            <div className="contact-line mt-12">
              <span className="contact-icon">✉️</span>
              <div>
                <strong>Client Email</strong>
                <a href="mailto:glassstudiowork@gmail.com" className="contact-link">
                  glassstudiowork@gmail.com
                </a>
              </div>
            </div>
          </div>
          <span className="support-hours-badge">Mon–Sat • 9:30 AM to 8:00 PM IST</span>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="container footer-bottom-inner">
          <div className="copyright-text">
            © {new Date().getFullYear()} GlassStudio. All Rights Reserved.
          </div>
          <div className="payment-security-badges">
            <span>🔒 256-bit SSL Secure Checkout</span>
            <span>•</span>
            <span>UPI / Cards / Netbanking / COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
