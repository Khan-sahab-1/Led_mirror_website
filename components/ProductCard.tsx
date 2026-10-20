"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Product } from "@/lib/products";
import { formatINR } from "@/lib/products";
import { openCartDrawer } from "./CartDrawer";
import QuickViewModal from "./QuickViewModal";

const CART_KEY = "glassstudio-cart-v1";
const WISHLIST_KEY = "glassstudio-wishlist-v1";

export default function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const primaryImage =
    product.image_url || (Array.isArray(product.images) && product.images[0]) || null;

  useEffect(() => {
    try {
      const list = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
      if (Array.isArray(list) && list.includes(product.id)) {
        setIsWishlisted(true);
      }
    } catch {}
  }, [product.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const list: string[] = JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
      let updated: string[];
      if (list.includes(product.id)) {
        updated = list.filter((id) => id !== product.id);
        setIsWishlisted(false);
      } else {
        updated = [...list, product.id];
        setIsWishlisted(true);
      }
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
    } catch (err) {
      console.error("Wishlist error:", err);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      const found = cart.find(
        (x: any) =>
          x.productId === product.id ||
          (product.slug && (x.productId === product.slug || x.slug === product.slug))
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
      setTimeout(() => {
        setAdded(false);
        openCartDrawer();
      }, 350);
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
    <>
      <article className="luxury-product-card">
        <div className="product-image-container">
          <Link
            href={`/products/${product.slug}`}
            className="product-image-link"
            aria-label={`View ${product.name}`}
          >
            {primaryImage ? (
              <img
                src={primaryImage}
                alt={product.name}
                className="product-card-img"
                loading="lazy"
              />
            ) : (
              <div className="mirror-stage">
                <div className="stage-backlight" />
                <div
                  className={`luxury-mirror ${product.shape} ${product.led ? "led-active" : ""}`}
                >
                  <div className="mirror-glass-reflection" />
                  <div className="mirror-specular-edge" />
                </div>
              </div>
            )}
          </Link>

          {/* Top Badges */}
          <div className="product-badges-row">
            {product.badge && <span className="luxury-badge">{product.badge}</span>}
            {discountPercent && (
              <span className="discount-badge">−{discountPercent}% OFF</span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            className={`product-wishlist-btn ${isWishlisted ? "active" : ""}`}
            onClick={toggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isWishlisted ? "#e63946" : "none"}
              stroke={isWishlisted ? "#e63946" : "currentColor"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>

          {/* Quick View Hover Trigger */}
          <button
            type="button"
            className="card-quick-look-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickView(true);
            }}
          >
            <span>👁 Quick Look</span>
          </button>
        </div>

        <div className="product-card-body">
          <div className="product-meta-row">
            <span className="product-category-tag">{product.category}</span>
            <div className="rating-pill">
              ★ 4.9 <span className="muted">(Verified)</span>
            </div>
          </div>

          <h3 className="product-name">
            <Link href={`/products/${product.slug}`}>{product.name}</Link>
          </h3>

          <p className="product-brief truncate-2">{product.description}</p>

          <div className="product-specs-chips">
            <span className="spec-chip">{product.dimensions || "24 × 36 in"}</span>
            <span className="spec-chip">
              {product.glass_specs
                ? product.glass_specs.length > 18
                  ? product.glass_specs.slice(0, 18) + "…"
                  : product.glass_specs
                : "5mm Saint-Gobain"}
            </span>
            {product.led ? (
              <span className="spec-chip">✨ LED Backlit</span>
            ) : (
              <span className="spec-chip">Natural Mirror</span>
            )}
          </div>

          {/* High-Converting Hyderabad Delivery & Installation Perk */}
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
              aria-label={`Add ${product.name} to bag`}
            >
              {added ? "✓ Added!" : "+ Add to Bag"}
            </button>
          </div>
        </div>
      </article>

      {/* Quick View Modal */}
      {showQuickView && (
        <QuickViewModal
          product={product}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </>
  );
}
