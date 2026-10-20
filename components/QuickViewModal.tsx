"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/products";
import { openCartDrawer } from "./CartDrawer";

const CART_KEY = "glassstudio-cart-v1";

export default function QuickViewModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [selectedImage, setSelectedImage] = useState<string | null>(
    (Array.isArray(product.images) && product.images[0]) || product.image_url || null
  );
  const [lightMode, setLightMode] = useState<"warm" | "neutral" | "cool">("warm");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const imagesList = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image_url
    ? [product.image_url]
    : [];

  const comparePrice = product.compare_at || product.compareAt;
  const discountPercent =
    comparePrice && comparePrice > product.price
      ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
      : null;

  const handleAddToCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const found = cart.find(
        (x: any) =>
          x.productId === product.id ||
          (product.slug && (x.productId === product.slug || x.slug === product.slug))
      );

      const primaryImg = selectedImage || product.image_url || null;

      if (found) {
        found.quantity = Math.min(20, (Number(found.quantity) || 1) + qty);
        found.price = product.price;
        found.name = product.name;
        found.slug = product.slug;
        found.shape = product.shape;
        found.image_url = primaryImg;
      } else {
        cart.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          slug: product.slug,
          shape: product.shape,
          image_url: primaryImg,
          quantity: qty,
        });
      }

      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
        openCartDrawer();
      }, 600);
    } catch (err) {
      console.error("Quick add error:", err);
    }
  };

  return (
    <div className="quickview-overlay" onClick={onClose}>
      <div
        className="quickview-modal glass-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
      >
        <button
          type="button"
          className="quickview-close-btn"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="quickview-grid">
          {/* Visual column */}
          <div className="quickview-visual">
            <div className={`quickview-stage ${product.led ? `light-${lightMode}` : ""}`}>
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="quickview-main-img"
                />
              ) : (
                <div className={`luxury-mirror ${product.shape} ${product.led ? "led-active" : ""}`}>
                  <div className="mirror-glass-reflection" />
                </div>
              )}

              {product.badge && <span className="luxury-badge top-left">{product.badge}</span>}
              {discountPercent && (
                <span className="discount-badge top-right">−{discountPercent}% OFF</span>
              )}
            </div>

            {imagesList.length > 1 && (
              <div className="quickview-thumbs-row">
                {imagesList.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`qv-thumb-btn ${selectedImage === img ? "active" : ""}`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {product.led && (
              <div className="quickview-light-switch">
                <span className="text-xxs muted uppercase font-bold tracking-wider">
                  Test Light Color:
                </span>
                <div className="light-mode-buttons">
                  <button
                    type="button"
                    className={`light-btn warm ${lightMode === "warm" ? "active" : ""}`}
                    onClick={() => setLightMode("warm")}
                  >
                    3000K Warm
                  </button>
                  <button
                    type="button"
                    className={`light-btn neutral ${lightMode === "neutral" ? "active" : ""}`}
                    onClick={() => setLightMode("neutral")}
                  >
                    4500K Neutral
                  </button>
                  <button
                    type="button"
                    className={`light-btn cool ${lightMode === "cool" ? "active" : ""}`}
                    onClick={() => setLightMode("cool")}
                  >
                    6500K Daylight
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Details column */}
          <div className="quickview-details">
            <div className="qv-meta-row">
              <span className="product-category-tag">{product.category}</span>
              <div className="rating-pill">★ 4.9 <span className="muted">(Verified)</span></div>
            </div>

            <h2 className="qv-title">{product.name}</h2>

            <div className="qv-price-stack">
              <span className="qv-current-price">{formatINR(product.price)}</span>
              {comparePrice && comparePrice > product.price && (
                <span className="qv-original-price">{formatINR(comparePrice)}</span>
              )}
              {discountPercent && (
                <span className="discount-chip">Save {discountPercent}%</span>
              )}
            </div>

            <p className="qv-description">{product.description}</p>

            {/* Architectural Highlights */}
            <div className="qv-specs-box">
              <div className="qv-spec-item">
                <span className="spec-label">Dimensions</span>
                <span className="spec-val">{product.dimensions || "24 × 36 inches"}</span>
              </div>
              <div className="qv-spec-item">
                <span className="spec-label">Glass Purity</span>
                <span className="spec-val">{product.glass_specs || "5mm Saint-Gobain Diamond Float"}</span>
              </div>
              <div className="qv-spec-item">
                <span className="spec-label">Mounting</span>
                <span className="spec-val">French Cleat + Free Fitting Included</span>
              </div>
            </div>

            {/* Hyderabad Perks Pill */}
            <div className="qv-perks-pill">
              <span className="pill-dot">●</span>
              <span>
                <strong>Hyderabad Special:</strong> 100% Free Express Delivery &amp; Wall Fitting
              </span>
            </div>

            {/* Quantity & CTA */}
            <div className="qv-action-row">
              <div className="stepper-box">
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                >
                  −
                </button>
                <span className="stepper-value">{qty}</span>
                <button
                  type="button"
                  className="stepper-btn"
                  onClick={() => setQty(Math.min(20, qty + 1))}
                >
                  +
                </button>
              </div>

              <button
                type="button"
                className={`btn btn-luxury flex-1 ${added ? "added-success" : ""}`}
                onClick={handleAddToCart}
              >
                {added ? "✓ Added to Bag!" : `Add to Bag • ${formatINR(product.price * qty)}`}
              </button>
            </div>

            <div className="qv-footer-links">
              <Link
                href={`/products/${product.slug}`}
                className="gold-link text-xs"
                onClick={onClose}
              >
                View Full Architectural Details &amp; Warranty →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

