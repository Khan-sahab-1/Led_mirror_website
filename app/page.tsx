import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InteractiveHeroMirror from "@/components/InteractiveHeroMirror";
import ShopCatalog from "@/components/ShopCatalog";
import { getStoreProducts } from "@/lib/products-server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialProducts = await getStoreProducts();
  return (
    <>
      <Header />
      <main>
        {/* HERO SECTION */}
        <section className="luxury-hero-container">
          <div className="container hero-split-grid">
            <div className="hero-editorial-column">
              <div className="editorial-eyebrow">
                <span className="gold-sparkle">✦</span> ATELIER EDITION • HYDERABAD & ALL INDIA
              </div>
              <h1 className="hero-luxury-heading">
                The Art of <br />
                <span className="italic-serif">Pure Reflection.</span>
              </h1>
              <p className="hero-luxury-description">
                Handcrafted with 5mm Saint-Gobain float glass, copper-free silvering,
                and ambient circadian backlighting. <strong>Free Express Delivery & Free Wall Installation across Hyderabad</strong>. Pay on delivery (COD) after inspecting glass clarity!
              </p>

              <div className="hero-cta-group">
                <a href="#shop" className="btn btn-luxury">
                  Shop Best Sellers ↓
                </a>
                <Link href="/custom-mirror" className="btn secondary">
                  Bespoke Studio ↗
                </Link>
              </div>

              {/* Trust Pills with Free Hyderabad Installation */}
              <div className="hero-trust-row">
                <div className="trust-item">
                  <span className="trust-icon">🚚</span>
                  <div>
                    <strong>Free Delivery in 24-48H</strong>
                    <span className="text-xs muted block">Across all Hyderabad PIN codes</span>
                  </div>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">🛠️</span>
                  <div>
                    <strong>Free Wall Installation</strong>
                    <span className="text-xs muted block">By certified technicians</span>
                  </div>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">💵</span>
                  <div>
                    <strong>Cash on Delivery (COD)</strong>
                    <span className="text-xs muted block">Inspect glass before paying</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-visual-column">
              <InteractiveHeroMirror />
            </div>
          </div>
        </section>

        {/* TRUST BANNER TICKER */}
        <div className="trust-strip-wrapper">
          <div className="container trust-strip-inner">
            <div className="trust-pill-badge">
              <span>📍 Hyderabad Hub: In Stock & Ready to Ship</span>
            </div>
            <div className="trust-pill-badge">
              <span>🛠️ 100% Free Professional Wall Mounting</span>
            </div>
            <div className="trust-pill-badge">
              <span>✓ 5mm Saint-Gobain Diamond Float Glass</span>
            </div>
            <div className="trust-pill-badge">
              <span>✓ Instant Doorstep Breakage Replacement</span>
            </div>
          </div>
        </div>

        {/* COLLECTION SECTION - DIRECTLY INTO SHOPPING */}
        <section className="container section-spacing" id="shop">
          <div className="section-header-editorial">
            <span className="eyebrow-luxury">THE CURATED COLLECTION</span>
            <h2 className="serif-heading">Statement Mirrors For Modern Homes & Villas</h2>
            <p className="section-subtitle">
              From organic arches to luxury LED backlit wall mirrors. Delivered in reinforced wooden crates with <strong>Free Wall Installation</strong> across Hyderabad.
            </p>
          </div>

          <ShopCatalog initialProducts={initialProducts} />
        </section>

        {/* LED ARCHITECTURE SPOTLIGHT */}
        <section className="led-spotlight-section" id="led-collection">
          <div className="container spotlight-grid">
            <div className="spotlight-visual-card glass-panel">
              <div className="spotlight-mirror-preview">
                <div className="halo-glow-ring" />
                <div className="spotlight-glass round">
                  <div className="specular-lens-flare" />
                </div>
              </div>
              <div className="spotlight-badge-overlay">
                CRI 95+ High-Fidelity Daylight LEDs
              </div>
            </div>

            <div className="spotlight-content">
              <span className="eyebrow-luxury">LIGHTING ARCHITECTURE</span>
              <h2 className="serif-heading">Illumination Designed For True Color Fidelity</h2>
              <p className="spotlight-description">
                Standard mirrors create unflattering shadows. GlassStudio LED mirrors project diffused
                forward and back-facing illumination, engineered specifically for flawless grooming, makeup application,
                and soothing atmospheric ambience.
              </p>

              <div className="spotlight-features-list">
                <div className="feature-row">
                  <div className="feature-number">01</div>
                  <div>
                    <strong>Tricolor Dimming (3000K – 6000K)</strong>
                    <p className="muted text-sm">Switch effortlessly between warm mood lighting, neutral midday, and cool pure task light.</p>
                  </div>
                </div>
                <div className="feature-row">
                  <div className="feature-number">02</div>
                  <div>
                    <strong>Integrated Rapid Heating Demister Pad</strong>
                    <p className="muted text-sm">Maintains a crystal-clear central mirror viewing zone even during steaming hot showers.</p>
                  </div>
                </div>
                <div className="feature-row">
                  <div className="feature-number">03</div>
                  <div>
                    <strong>IP67 Water-Resistant Driver</strong>
                    <p className="muted text-sm">Enclosed moisture-proof 12V solid-state driver protects against bathroom humidity and spikes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CRAFTSMANSHIP PILLARS */}
        <section className="container section-spacing" id="craftsmanship">
          <div className="section-header-editorial text-center">
            <span className="eyebrow-luxury">UNCOMPROMISING PRECISION</span>
            <h2 className="serif-heading">Built to Last Generations</h2>
            <p className="section-subtitle max-w-600 m-auto">
              Every detail is engineered with architectural standards, from precision diamond-edge polishing
              to heavy-duty mounting systems.
            </p>
          </div>

          <div className="craft-pillars-grid">
            <div className="craft-card glass-panel">
              <div className="craft-icon">💎</div>
              <h3>Saint-Gobain 5mm Float Glass</h3>
              <p className="muted text-sm">
                Highest optical purity in the industry. Lead-free, copper-free, and resistant to edge-blackening over decades of use.
              </p>
            </div>

            <div className="craft-card glass-panel">
              <div className="craft-icon">🛡️</div>
              <h3>Reinforced Shatter-Safe Backing</h3>
              <p className="muted text-sm">
                Industrial vinyl safety film applied to the rear prevents shattering fragments in the rare event of accidental impact.
              </p>
            </div>

            <div className="craft-card glass-panel">
              <div className="craft-icon">📐</div>
              <h3>Aircraft-Grade French Cleat</h3>
              <p className="muted text-sm">
                Interlocking aluminum cleats spread weight evenly across your wall, ensuring 100% level, vibration-free hanging in 10 minutes.
              </p>
            </div>

            <div className="craft-card glass-panel">
              <div className="craft-icon">📦</div>
              <h3>Armored Wooden Crate Logistics</h3>
              <p className="muted text-sm">
                Protected with high-density EVA shock absorbing foam and reinforced wooden exterior frames. Guaranteed zero breakage on arrival.
              </p>
            </div>
          </div>
        </section>


        {/* BESPOKE ATELIER CALLOUT */}
        <section className="bespoke-cta-section">
          <div className="container">
            <div className="bespoke-card glass-panel">
              <div className="bespoke-content">
                <span className="eyebrow-luxury">BESPOKE FABRICATION ATELIER</span>
                <h2 className="serif-heading">Need a Custom Size or Unique Shape?</h2>
                <p className="bespoke-description">
                  Our master glass cutters create custom dimensions up to 8 feet, bespoke asymmetrical silhouettes,
                  frosted border sandblasting, and bespoke backlit mirror art for luxury residences and hotels.
                </p>
                <div className="flex-center-wrap gap-14 mt-20">
                  <Link href="/custom-mirror" className="btn btn-luxury">
                    Open Custom Mirror Studio →
                  </Link>
                  <a
                    href="https://wa.me/91 9266472817?text=Hello%20GlassStudio%2C%20I%20need%20a%20custom%20mirror%20consultation"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn secondary"
                  >
                    Chat on WhatsApp ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
