"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const CART_KEY = "glassstudio-cart-v1";

export default function Header() {
  const { user, displayName, signOut } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const updateCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        const total = cart.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    const interval = setInterval(updateCount, 1500);

    return () => {
      window.removeEventListener("storage", updateCount);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      <div className="topbar">
        <div className="container flex-between text-xs">
          <div className="topbar-marquee-item">
            <span className="location-pill-chip">📍 HYDERABAD VIP OFFER</span>
            <span>
              <strong>100% FREE DELIVERY + FREE WALL INSTALLATION</strong> ACROSS HYDERABAD & SECUNDERABAD! • PAY ON DELIVERY
            </span>
          </div>
          <div className="topbar-right-group flex items-center gap-14 hide-mobile">
            <span className="text-muted">🛠️ Certified Technician Installation</span>
            <a href="https://wa.me/919266472817?text=Hello%20GlassStudio%20Hyderabad%2C%20I%20want%20to%20order%20a%20mirror%20with%20free%20installation" target="_blank" rel="noopener noreferrer" className="topbar-link">
              <span className="topbar-icon">💬</span> WhatsApp Quick Order
            </a>
          </div>
        </div>
      </div>

      <header className="header-wrapper">
        <div className="container header-inner">
          <Link href="/" className="brand-logo" aria-label="GlassStudio Home">
            <span className="brand-title">GLASSSTUDIO</span>
            <span className="brand-dot">.</span>
            <span className="brand-sub">LUXURY MIRROR ATELIER • HYDERABAD</span>
          </Link>

          <nav className="desktop-nav">
            <Link href="/#shop" className="nav-link">Shop Mirrors</Link>
            <Link href="/#led-collection" className="nav-link">LED Collection</Link>
            <Link href="/custom-mirror" className="nav-link">Custom Studio</Link>
            <Link href="/#craftsmanship" className="nav-link">Craftsmanship</Link>
          </nav>

          <div className="header-actions">
            {/* User Auth Section */}
            {user ? (
              <div className="relative user-dropdown-container">
                <button
                  type="button"
                  className="auth-pill-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  aria-expanded={userDropdownOpen}
                >
                  <span className="avatar-chip">{displayName.charAt(0).toUpperCase()}</span>
                  <span className="user-name-label">{displayName}</span>
                  <span className="dropdown-caret">▾</span>
                </button>

                {userDropdownOpen && (
                  <div className="luxury-dropdown-menu glass-panel">
                    <div className="dropdown-user-header">
                      <strong>{displayName}</strong>
                      <span className="muted text-xs truncate">{user.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <Link
                      href="/account"
                      className="dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      📦 My Orders & Tracking
                    </Link>
                    <Link
                      href="/account?tab=addresses"
                      className="dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      📍 Saved Delivery Addresses
                    </Link>
                    <Link
                      href="/custom-mirror"
                      className="dropdown-item"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      ✨ Custom Mirror Request
                    </Link>
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-item text-danger"
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await signOut();
                      }}
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="auth-login-link">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Button */}
            <Link href="/checkout" className="cart-badge-btn" aria-label="View Cart">
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <span className="cart-label hide-mobile">Cart</span>
              {cartCount > 0 && <span className="cart-counter">{cartCount}</span>}
            </Link>

            {/* Mobile Hamburger */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-drawer glass-panel">
            <Link href="/#shop" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Shop Mirrors</Link>
            <Link href="/#led-collection" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>LED Collection</Link>
            <Link href="/custom-mirror" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Custom Studio</Link>
            <Link href="/#craftsmanship" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Craftsmanship</Link>
            <div className="dropdown-divider" />
            {user ? (
              <>
                <Link href="/account" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>📦 My Orders ({displayName})</Link>
                <button
                  className="mobile-nav-link text-danger w-100 text-left"
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut();
                  }}
                >
                  🚪 Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>👤 Sign In / Create Account</Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
