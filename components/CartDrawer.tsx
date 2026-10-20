"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/products";

type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  price?: number;
  slug?: string;
  shape?: string;
  image_url?: string | null;
};

const CART_KEY = "glassstudio-cart-v1";

export function openCartDrawer() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("glassstudio-open-cart"));
  }
}

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);

  const loadCart = () => {
    try {
      const data = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadCart();

    const handleOpen = () => {
      loadCart();
      setIsOpen(true);
    };

    const handleStorage = () => {
      loadCart();
    };

    window.addEventListener("glassstudio-open-cart", handleOpen);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("glassstudio-open-cart", handleOpen);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const updateQuantity = (productId: string, delta: number) => {
    const updated = items
      .map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: Math.min(20, newQty) } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    setItems(updated);
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const removeItem = (productId: string) => {
    const updated = items.filter((item) => item.productId !== productId);
    setItems(updated);
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  };

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const totalCount = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  if (!isOpen) return null;

  return (
    <div className="cart-drawer-overlay" onClick={() => setIsOpen(false)}>
      <div
        className="cart-drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping Cart"
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="cart-header-title-row">
            <h3 className="cart-drawer-title">
              Your Bag <span className="cart-count-pill">({totalCount})</span>
            </h3>
            <button
              type="button"
              className="cart-drawer-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close cart drawer"
            >
              ✕
            </button>
          </div>

          {/* Hyderabad VIP Free Delivery & Installation Highlight */}
          <div className="cart-perk-banner">
            <div className="cart-perk-icon">🎉</div>
            <div className="cart-perk-content">
              <strong>HYDERABAD VIP BENEFIT UNLOCKED:</strong>
              <p>100% Free Express Delivery (24-48h) + Free Wall Mounting included!</p>
            </div>
          </div>
        </div>

        {/* Drawer Body: Items or Empty */}
        <div className="cart-drawer-body">
          {items.length === 0 ? (
            <div className="cart-empty-view">
              <div className="cart-empty-icon">🪞</div>
              <h4 className="cart-empty-title">Your shopping bag is empty</h4>
              <p className="cart-empty-sub">
                Explore our handcrafted LED &amp; designer mirrors built with 5mm Saint-Gobain glass.
              </p>
              <button
                type="button"
                className="btn btn-luxury mt-16"
                onClick={() => {
                  setIsOpen(false);
                  const shop = document.getElementById("shop");
                  if (shop) shop.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Browse Best Sellers ↓
              </button>
            </div>
          ) : (
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.productId} className="cart-drawer-item">
                  <div className="cart-item-thumb">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} />
                    ) : (
                      <div className={`mini-mirror ${item.shape || "rect"}`} />
                    )}
                  </div>

                  <div className="cart-item-info">
                    <div className="cart-item-title-row">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <button
                        type="button"
                        className="cart-item-remove-btn"
                        onClick={() => removeItem(item.productId)}
                        aria-label="Remove item"
                      >
                        🗑
                      </button>
                    </div>

                    <div className="cart-item-specs-text">
                      Saint-Gobain Glass • Free Hyderabad Fitting
                    </div>

                    <div className="cart-item-bottom-row">
                      <div className="cart-qty-stepper">
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.productId, -1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="qty-value">{item.quantity}</span>
                        <button
                          type="button"
                          className="qty-btn"
                          onClick={() => updateQuantity(item.productId, 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="cart-item-price-display">
                        {formatINR((item.price || 0) * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal-row">
              <span className="subtotal-label">Subtotal</span>
              <span className="subtotal-amount">{formatINR(subtotal)}</span>
            </div>

            <div className="cart-shipping-notice">
              <span>🚚 Insured Wooden Crate Delivery:</span>
              <strong className="text-success">FREE</strong>
            </div>

            <div className="cart-installation-notice">
              <span>🛠️ Wall Installation in Hyderabad:</span>
              <strong className="text-success">FREE (Included)</strong>
            </div>

            <div className="cart-checkout-actions">
              <Link
                href="/checkout"
                className="btn btn-luxury w-100 btn-large"
                onClick={() => setIsOpen(false)}
              >
                Proceed to Checkout • {formatINR(subtotal)} →
              </Link>

              <a
                href={`https://wa.me/919266472817?text=${encodeURIComponent(
                  `Hi GlassStudio Hyderabad! I have ${totalCount} mirror(s) in my cart totaling ${formatINR(
                    subtotal
                  )}. I want to place this order with 100% Free Express Delivery & Free Wall Installation.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="cart-wa-quick-btn"
              >
                <span>💬</span> Quick Order via WhatsApp
              </a>

              <div className="cart-cod-assurance">
                <span className="assurance-check">✓</span> Cash on Delivery (COD) Available • Inspect Glass Before Paying
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

