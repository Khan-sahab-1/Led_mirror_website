import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddToCart from "@/components/AddToCart";
import ProductGallery from "@/components/ProductGallery";
import PincodeChecker from "@/components/PincodeChecker";
import { formatINR, products } from "@/lib/products";
import { getProductBySlug } from "@/lib/products-server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const comparePrice = product.compare_at || product.compareAt;
  const discount =
    comparePrice && comparePrice > product.price
      ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
      : null;

  return (
    <>
      <Header />
      <main className="container section-spacing">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-nav mb-20" aria-label="Breadcrumb">
          <Link href="/" className="breadcrumb-link">
            Home
          </Link>
          <span className="breadcrumb-separator">/</span>
          <Link href="/#shop" className="breadcrumb-link">
            Shop Mirrors
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        <div className="product-editorial-layout">
          {/* LEFT: Mirror Visual Showcase with Multi-Image Gallery */}
          <ProductGallery
            images={product.images}
            imageUrl={product.image_url}
            name={product.name}
            shape={product.shape}
            led={product.led}
            badge={product.badge}
            discount={discount}
            glassSpecs={product.glass_specs}
          />

          {/* RIGHT: Product Details & Purchase Form */}
          <div className="product-info-column">
            <div className="product-header-block">
              <span className="eyebrow-luxury">{product.category}</span>
              <h1 className="product-hero-title">{product.name}</h1>
              <div className="product-rating-row">
                <span className="stars-gold">★★★★★</span>
                <span className="rating-score">4.9</span>
                <span className="muted text-xs">
                  (48 Verified Homeowners &amp; Architects in Hyderabad)
                </span>
              </div>
            </div>

            <div className="product-pricing-block">
              <span className="price-big">{formatINR(product.price)}</span>
              {comparePrice && comparePrice > product.price && (
                <span className="compare-big">{formatINR(comparePrice)}</span>
              )}
              {discount && <span className="discount-chip">Save {discount}% Today</span>}
              <div className="tax-shipping-subtext">
                All taxes included • Free Insured Wooden Crate Delivery Across India
              </div>
            </div>

            <div className="product-description-block">
              <p>{product.description}</p>
            </div>

            {/* Pincode & Installation Checker */}
            <PincodeChecker />

            {/* HYDERABAD VIP PERKS & CONVERSION BOX */}
            <div className="product-vip-perks-box glass-panel mb-25">
              <div className="vip-perks-header">
                <span className="vip-pulse-indicator" />
                <span className="vip-header-title">HYDERABAD VIP PERKS INCLUDED</span>
                <span className="vip-badge-pill">100% Free</span>
              </div>
              <div className="vip-perks-grid">
                <div className="vip-perk-item">
                  <span className="vip-perk-icon">🚚</span>
                  <div>
                    <strong>Free 24–48h Express Delivery</strong>
                    <span className="text-xxs muted block">
                      Across all Hyderabad &amp; Secunderabad pincodes
                    </span>
                  </div>
                </div>
                <div className="vip-perk-item">
                  <span className="vip-perk-icon">🛠️</span>
                  <div>
                    <strong>Free Certified Wall Fitting</strong>
                    <span className="text-xxs muted block">
                      Laser-level mounting included (Worth ₹1,499)
                    </span>
                  </div>
                </div>
                <div className="vip-perk-item">
                  <span className="vip-perk-icon">💵</span>
                  <div>
                    <strong>Pay on Delivery (COD)</strong>
                    <span className="text-xxs muted block">
                      Open crate &amp; inspect glass before paying
                    </span>
                  </div>
                </div>
                <div className="vip-perk-item">
                  <span className="vip-perk-icon">💎</span>
                  <div>
                    <strong>5-Year Replacement Warranty</strong>
                    <span className="text-xxs muted block">
                      Saint-Gobain diamond glass &amp; LEDs covered
                    </span>
                  </div>
                </div>
              </div>

              <div className="vip-perks-footer">
                <a
                  href={`https://wa.me/919266472817?text=${encodeURIComponent(
                    `Hi GlassStudio Hyderabad! I want to order "${product.name}" (${formatINR(
                      product.price
                    )}) with Free Express Delivery & Free Wall Installation. Please assist!`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="whatsapp-vip-order-btn"
                >
                  <span className="wa-icon">💬</span> Order in 1-Click via WhatsApp (Hyderabad VIP)
                </a>
              </div>
            </div>

            {/* Architectural Specifications Table */}
            <div className="specs-accordion glass-panel mb-25">
              <h4 className="specs-heading">Architectural Specifications</h4>
              <div className="specs-table-grid">
                <div className="spec-row">
                  <span className="spec-key">Dimensions / Size</span>
                  <span className="spec-val font-semibold">
                    {product.dimensions || "24 × 36 inches"}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-key">Glass Purity</span>
                  <span className="spec-val">
                    {product.glass_specs || "5mm Saint-Gobain Float Glass"}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-key">Silhouette / Shape</span>
                  <span className="spec-val" style={{ textTransform: "capitalize" }}>
                    {product.shape} Architectural Profile
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-key">Illumination</span>
                  <span className="spec-val">
                    {product.lighting_specs ||
                      (product.led
                        ? "CRI 95+ High-Density 12V LED Strip (Tricolor)"
                        : "Ambient Reflection (Non-LED)")}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-key">Mounting Hardware</span>
                  <span className="spec-val">
                    {product.mounting || "Heavy-Duty Flush French-Cleat Included"}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-key">Warranty &amp; Assurance</span>
                  <span className="spec-val">
                    {product.warranty || "5-Year Structural & LED Replacement"}
                  </span>
                </div>
              </div>
            </div>

            {/* Add to Cart widget */}
            <AddToCart product={product} productId={product.id} productName={product.name} />

            {/* Bespoke Quote Banner */}
            <div className="bespoke-mini-banner glass-panel mt-25">
              <div>
                <strong>Need custom dimensions or specific LED positioning?</strong>
                <p className="muted text-xs mt-4">
                  We custom-fabricate any width, height, bevel angle, or smart switch placement for your space.
                </p>
              </div>
              <Link href="/custom-mirror" className="btn secondary btn-sm mt-10 inline-block">
                Request Custom Size Quote →
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
