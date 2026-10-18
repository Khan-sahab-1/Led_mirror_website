"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/products";

const CART_KEY = "glassstudio-cart-v1";

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  const primaryImage = product.image_url || (Array.isArray(product.images) && product.images[0]) || null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const found = cart.find(
        (x: any) => x.productId === product.id || (product.slug && (x.productId === product.slug || x.slug === product.slug))
      );
      if (found) {
        found.quantity = Math.min(20, (Number(found.quantity) || 1) + 1);
        found.price = product.price;
        found.name = product.name;
        found.slug = product.slug;
        found.shape = product.shape;
        found.image_url = primaryImage;
      } else {
        cart.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          slug: product.slug,
          shape: product.shape,
          image_url: primaryImage,
          quantity: 1,
        });
      }
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Cart add error:", err);
    }
  };

  const comparePrice = product.compare_at || product.compareAt;
  const discountPercent =
    comparePrice && comparePrice > product.price
      ? Math.round(((comparePrice - product.price) / comparePrice) * 100)
      : null;

  return (
    <article className="luxury-product-card">
      <Link href={`/products/${product.slug}`} className="product-image-container" aria-label={`View ${product.name}`}>
        <div className="product-badges-row">
          {product.badge && <span className="luxury-badge">{product.badge}</span>}
          {discountPercent && <span className="discount-badge">−{discountPercent}% OFF</span>}
        </div>

        {primaryImage ? (
          <img src={primaryImage} alt={product.name} className="product-card-img" />
        ) : (
          /* Realistic mirror mockup */
          <div className="mirror-stage">
            <div className="stage-backlight" />
            <div className={`luxury-mirror ${product.shape} ${product.led ? "led-active" : ""}`}>
              <div className="mirror-glass-reflection" />
              <div className="mirror-specular-edge" />
            </div>
          </div>
        )}

        <div className="card-quick-preview">
          <span>Click to inspect 360° details →</span>
        </div>
      </Link>

      <div className="product-card-body">
        <div className="product-meta-row">
          <span className="product-category-tag">{product.category}</span>
          <div className="rating-pill">★ 4.9 <span className="muted">(Verified)</span></div>
        </div>

        <h3 className="product-name">
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>

        <p className="product-brief truncate-2">{product.description}</p>

        <div className="product-specs-chips">
          <span className="spec-chip">{product.dimensions || "24 × 36 in"}</span>
          <span className="spec-chip">{product.glass_specs ? (product.glass_specs.length > 18 ? product.glass_specs.slice(0, 18) + "…" : product.glass_specs) : "5mm Saint-Gobain"}</span>
          {product.led ? <span className="spec-chip">✨ LED Backlit</span> : <span className="spec-chip">Natural Mirror</span>}
        </div>

        <div className="product-card-delivery-perk">
          <span className="perk-bullet">⚡</span>
          <span>Free Hyderabad Delivery &amp; Installation</span>
        </div>

        <div className="product-bottom-row">
          <div className="price-stack">
            <span className="current-price">{formatINR(product.price)}</span>
            {comparePrice && comparePrice > product.price && (
              <span className="original-price">{formatINR(comparePrice)}</span>
            )}
          </div>

          <button
            type="button"
            className={`quick-add-btn ${added ? "added-success" : ""}`}
            onClick={handleQuickAdd}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? "✓ Added" : "+ Add to Cart"}
          </button>
        </div>
      </div>
    </article>
  );
}
