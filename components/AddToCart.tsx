"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";

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

function readCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function AddToCart({
  product,
  productId,
  productName,
}: {
  product?: Product;
  productId?: string;
  productName?: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  const targetId = product?.id || productId || "";
  const targetName = product?.name || productName || "Mirror";

  function add(andCheckout: boolean = false) {
    setBusy(true);
    const cart = readCart();
    const found = cart.find(
      (x) => x.productId === targetId || (product?.slug && (x.productId === product.slug || x.slug === product.slug))
    );

    if (found) {
      found.quantity = Math.min(20, (Number(found.quantity) || 1) + qty);
      if (product) {
        found.price = product.price;
        found.name = product.name;
        found.slug = product.slug;
        found.shape = product.shape;
        found.image_url = product.image_url;
      }
    } else {
      cart.push({
        productId: targetId,
        name: targetName,
        quantity: qty,
        price: product?.price,
        slug: product?.slug,
        shape: product?.shape,
        image_url: product?.image_url || null,
      });
    }

    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event("storage"));

    if (andCheckout) {
      router.push("/checkout");
    } else {
      setMessage(`✓ ${qty} × ${targetName} added to your bag.`);
      setTimeout(() => setMessage(""), 3500);
      setBusy(false);
    }
  }

  return (
    <div className="add-to-cart-widget">
      <div className="quantity-selector-row">
        <label className="qty-label">QUANTITY</label>
        <div className="stepper-box">
          <button
            type="button"
            className="stepper-btn"
            onClick={() => setQty(Math.max(1, qty - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="stepper-value">{qty}</span>
          <button
            type="button"
            className="stepper-btn"
            onClick={() => setQty(Math.min(20, qty + 1))}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      <div className="cart-action-buttons">
        <button
          type="button"
          className="btn btn-luxury flex-1"
          onClick={() => add(false)}
          disabled={busy}
        >
          {busy ? "Updating Bag..." : "Add to Bag"}
        </button>
        <button
          type="button"
          className="btn secondary flex-1"
          onClick={() => add(true)}
        >
          Buy Now →
        </button>
      </div>

      {message && (
        <div className="alert-success mt-12 text-sm" role="status">
          {message} • <Link href="/checkout" className="underline font-bold">Go to Checkout</Link>
        </div>
      )}
    </div>
  );
}
