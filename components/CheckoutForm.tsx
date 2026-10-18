"use client";

import { useEffect, useMemo, useState } from "react";
import { formatINR, products as fallbackProducts, Product } from "@/lib/products";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

type CartItem = {
  productId: string;
  name?: string;
  quantity: number;
  price?: number;
  slug?: string;
  shape?: string;
  image_url?: string | null;
};
type Customer = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
};

export type SavedAddress = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  label?: string;
  is_default?: boolean;
};

const CART_KEY = "glassstudio-cart-v1";
const emptyCustomer: Customer = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  notes: "",
};

declare global {
  interface Window {
    Razorpay?: new (options: any) => { open: () => void };
  }
}

export default function CheckoutForm() {
  const { user, displayName } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>(fallbackProducts);
  const [customer, setCustomer] = useState<Customer>(emptyCustomer);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState<string>("Home");
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [method, setMethod] = useState<"razorpay" | "cod">("cod");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [orderPlacedId, setOrderPlacedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem(CART_KEY) || "[]"));
    } catch {
      setCart([]);
    }
  }, []);

  // Fetch live products from DB so all database UUIDs match seamlessly
  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (active && data?.ok && Array.isArray(data.products) && data.products.length > 0) {
          setAvailableProducts(data.products);
        }
      })
      .catch((err) => console.warn("Failed to fetch fresh products for checkout:", err));

    return () => {
      active = false;
    };
  }, []);

  // Autofill user details and load saved addresses if logged in
  useEffect(() => {
    if (!user) return;

    setCustomer((prev) => ({
      ...prev,
      name: prev.name || displayName || "",
      email: prev.email || user.email || "",
    }));

    const cacheKey = `glassstudio_saved_addresses_${user.id || user.email}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const list: SavedAddress[] = JSON.parse(cached);
        if (Array.isArray(list) && list.length > 0) {
          setSavedAddresses(list);
          const def = list.find((a) => a.is_default) || list[0];
          if (def) {
            setSelectedAddressId(def.id || "0");
            setCustomer((prev) => ({
              ...prev,
              name: prev.name || def.name || displayName || "",
              phone: prev.phone || def.phone || "",
              email: prev.email || def.email || user.email || "",
              address: prev.address || def.address || "",
              city: prev.city || def.city || "",
              state: prev.state || def.state || "",
              pincode: prev.pincode || def.pincode || "",
            }));
          }
        }
      }
    } catch {}

    let active = true;
    fetch(`/api/user/addresses?userId=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email || "")}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active || !data?.addresses) return;
        const list: SavedAddress[] = data.addresses;
        setSavedAddresses(list);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(list));
        } catch {}

        if (list.length > 0) {
          setCustomer((prev) => {
            if (!prev.address) {
              const def = list.find((a) => a.is_default) || list[0];
              setSelectedAddressId(def.id || "0");
              return {
                ...prev,
                name: def.name || prev.name || displayName || "",
                phone: def.phone || prev.phone || "",
                email: def.email || prev.email || user.email || "",
                address: def.address,
                city: def.city,
                state: def.state,
                pincode: def.pincode,
              };
            }
            return prev;
          });
        }
      })
      .catch((err) => console.warn("Failed to load saved addresses:", err));

    return () => {
      active = false;
    };
  }, [user, displayName]);

  const lines = useMemo(() => {
    const catalog = [...availableProducts, ...fallbackProducts];

    return cart.map((i) => {
      // Search by ID, slug, or matching name
      const found =
        catalog.find((p) => p.id === i.productId) ||
        catalog.find((p) => p.slug === i.productId) ||
        (i.name ? catalog.find((p) => p.name.toLowerCase() === i.name!.toLowerCase()) : undefined);

      const product: Product = found || {
        id: i.productId,
        slug: i.slug || i.productId,
        name: i.name || "Handcrafted Mirror",
        category: "Wall Mirror",
        price: i.price || 4999,
        shape: (i.shape as any) || "rect",
        description: "Artisan handcrafted Saint-Gobain glass mirror",
        dimensions: "24 × 36 inches",
        image_url: i.image_url || null,
      };

      return { ...i, product };
    });
  }, [cart, availableProducts]);

  const total = lines.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

  const isHyderabad = useMemo(() => {
    const c = (customer.city || "").toLowerCase().trim();
    const p = (customer.pincode || "").trim();
    return c.includes("hyderabad") || c.includes("secunderabad") || p.startsWith("500");
  }, [customer.city, customer.pincode]);

  function update<K extends keyof Customer>(key: K, value: Customer[K]) {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  }

  function handleQuantityChange(productId: string, delta: number) {
    const updated = cart
      .map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: Math.min(20, newQty) } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];

    setCart(updated);
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  }

  function handleRemoveItem(productId: string) {
    const updated = cart.filter((item) => item.productId !== productId);
    setCart(updated);
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
  }

  function selectAddress(addr: SavedAddress, idx: number) {
    setIsAddingNewAddress(false);
    setSelectedAddressId(addr.id || String(idx));
    setCustomer((prev) => ({
      ...prev,
      name: addr.name || prev.name || displayName || "",
      phone: addr.phone || prev.phone || "",
      email: addr.email || prev.email || user?.email || "",
      address: addr.address,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    }));
  }

  function handleSwitchToNewAddress() {
    setIsAddingNewAddress(true);
    setSelectedAddressId("new");
    setCustomer((prev) => ({
      ...prev,
      name: displayName || prev.name || "",
      email: user?.email || prev.email || "",
      phone: prev.phone || "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      notes: "",
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!lines.length) {
      setMessage("Your cart is empty. Please add a mirror first.");
      return;
    }

    const cleanPhone = customer.phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setMessage("Enter a valid 10-digit Indian mobile number (e.g. 9876543210).");
      return;
    }

    setBusy(true);

    try {
      const body = {
        customer: { ...customer, phone: cleanPhone },
        items: lines.map((i) => ({
          productId: i.product?.id || i.productId,
          quantity: i.quantity,
          name: i.product?.name,
        })),
        paymentMethod: method,
        userId: user?.id || null,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create order.");

      // Proactively sync address to user profile if adding new address or saveToAccount is checked
      if (user && (isAddingNewAddress || saveToAccount)) {
        try {
          fetch("/api/user/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: user.id,
              email: user.email,
              name: customer.name,
              phone: cleanPhone,
              address: customer.address,
              city: customer.city,
              state: customer.state,
              pincode: customer.pincode,
              label: newAddressLabel,
              is_default: true,
            }),
          })
            .then((r) => r.json())
            .then((resData) => {
              if (resData?.address) {
                setSavedAddresses((prev) => {
                  const updated = [resData.address, ...prev.filter((a) => a.id !== resData.address.id)];
                  try {
                    localStorage.setItem(`glassstudio_saved_addresses_${user.id || user.email}`, JSON.stringify(updated));
                  } catch {}
                  return updated;
                });
              }
            })
            .catch(() => {});
        } catch {}
      }

      setOrderPlacedId(data.orderId);

      if (method === "cod") {
        localStorage.removeItem(CART_KEY);
        setCart([]);
        window.dispatchEvent(new Event("storage"));
        setMessage(`Cash on Delivery order confirmed! Order ID: ${data.orderId}.`);
      } else {
        // Online Payment via Razorpay
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => {
          if (!window.Razorpay) {
            setMessage("Razorpay checkout failed to load. Please choose Cash on Delivery.");
            setBusy(false);
            return;
          }

          const checkout = new window.Razorpay({
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: "GlassStudio Atelier",
            description: "Luxury Mirror Order",
            order_id: data.razorpayOrderId,
            prefill: {
              name: customer.name,
              email: customer.email,
              contact: customer.phone,
            },
            notes: { glassstudio_order_id: data.orderId },
            theme: { color: "#1a3428" },
            handler: async (response: any) => {
              try {
                const verify = await fetch("/api/payments/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...response, orderId: data.orderId }),
                });
                const result = await verify.json();
                if (!verify.ok) throw new Error(result.error || "Payment verification failed.");
                localStorage.removeItem(CART_KEY);
                setCart([]);
                window.dispatchEvent(new Event("storage"));
                setMessage(`Payment successful! Order ID: ${data.orderId}. Thank you for choosing GlassStudio.`);
              } catch (err: any) {
                setMessage(
                  err.message ||
                    `Payment captured. Verifying status for order ${data.orderId}. Please contact concierge.`
                );
              }
              setBusy(false);
            },
            modal: {
              ondismiss: () => {
                setBusy(false);
                setMessage(
                  "Payment window closed. Your order is reserved as pending. You can retry or switch to COD."
                );
              },
            },
          });
          checkout.open();
        };

        script.onerror = () => {
          setMessage("Could not load payment provider. Please retry or choose Cash on Delivery.");
          setBusy(false);
        };
        document.body.appendChild(script);
      }
    } catch (err: any) {
      setMessage(err.message || "Something went wrong while placing your order.");
      setBusy(false);
    }
  }

  if (orderPlacedId && !lines.length) {
    return (
      <div className="order-success-card glass-panel text-center">
        <div className="success-icon-badge">✓</div>
        <span className="eyebrow-luxury">ORDER SUCCESSFUL</span>
        <h2 className="serif-title mt-10">Thank you for your order!</h2>
        <p className="order-success-id">
          Order Number: <strong>{orderPlacedId}</strong>
        </p>
        <p className="muted max-w-500 m-auto mb-25">
          Our master craftsmen will inspect, bevel, and prepare your mirror with reinforced wooden crate packaging.
          You will receive delivery and shipping updates on your phone.
        </p>
        <div className="flex-center-wrap gap-14">
          {user ? (
            <Link href="/account" className="btn btn-luxury">
              Track in My Orders →
            </Link>
          ) : (
            <Link href={`/login?redirect=/account`} className="btn btn-luxury">
              Create Account to Track Order →
            </Link>
          )}
          <Link href="/" className="btn secondary">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-two-column-layout">
      {/* LEFT: Customer & Delivery Details */}
      <form className="checkout-details-card glass-panel" onSubmit={submit}>
        <div className="auth-status-bar">
          {user ? (
            <div className="logged-in-pill">
              <span>👤 Signed in as <strong>{user.email}</strong></span>
              <span className="text-xs gold-text ml-auto">Order linked to your account ✓</span>
            </div>
          ) : (
            <div className="guest-checkout-alert">
              <span>Have an account?</span>
              <Link href="/login?redirect=/checkout" className="gold-link ml-10">
                Sign in for faster checkout & tracking →
              </Link>
            </div>
          )}
        </div>

        <div className="flex-between items-center mb-15">
          <h2 className="checkout-section-title mb-0">1. Delivery Address</h2>
          {user && (
            <span className="badge-available">
              {savedAddresses.length > 0 ? "✓ 1-Click Auto-Fill Active" : "Auto-Saves to Profile"}
            </span>
          )}
        </div>

        {/* SAVED ADDRESSES SELECTOR */}
        {user && savedAddresses.length > 0 && (
          <div className="saved-addresses-selector mb-20">
            <div className="flex-between items-center mb-10">
              <span className="text-xs uppercase tracking-wider font-semibold muted">
                📍 Saved Addresses ({savedAddresses.length})
              </span>
              {!isAddingNewAddress ? (
                <button
                  type="button"
                  className="btn secondary btn-xs"
                  onClick={handleSwitchToNewAddress}
                >
                  ➕ Add Another Address
                </button>
              ) : (
                <button
                  type="button"
                  className="btn secondary btn-xs"
                  onClick={() => selectAddress(savedAddresses[0], 0)}
                >
                  ↩ Use Saved Address
                </button>
              )}
            </div>

            <div className="saved-addresses-cards-grid">
              {savedAddresses.map((addr, idx) => {
                const isSelected = !isAddingNewAddress && (selectedAddressId === (addr.id || String(idx)));
                return (
                  <div
                    key={addr.id || idx}
                    className={`saved-address-tile ${isSelected ? "selected" : ""}`}
                    onClick={() => selectAddress(addr, idx)}
                  >
                    <div className="flex-between items-center mb-6">
                      <span className="address-chip-label">
                        {addr.label === "Office" ? "🏢 Office" : addr.label === "Other" ? "📍 Other" : "🏠 Home"}
                      </span>
                      {isSelected ? (
                        <span className="chip-selected-badge">✓ Selected</span>
                      ) : addr.is_default ? (
                        <span className="chip-default-badge">Default</span>
                      ) : null}
                    </div>
                    <strong className="tile-name block">{addr.name}</strong>
                    <div className="tile-phone text-xs muted">{addr.phone}</div>
                    <p className="tile-address text-xs mt-4">
                      {addr.address}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                    </p>
                  </div>
                );
              })}

              <div
                className={`saved-address-tile add-tile ${isAddingNewAddress ? "selected" : ""}`}
                onClick={handleSwitchToNewAddress}
              >
                <div className="add-tile-icon">➕</div>
                <strong className="text-xs block mt-4">Deliver to Another Address</strong>
                <span className="text-xxs muted">Add new home or office</span>
              </div>
            </div>

            {/* Informational state alerts */}
            {isAddingNewAddress ? (
              <div className="new-address-alert mt-12">
                <div className="flex-between items-center flex-wrap gap-8">
                  <span className="text-xs">
                    <strong>➕ Adding New Delivery Address:</strong> Fill in the fields below.
                  </span>
                  <div className="address-label-selector flex gap-6 items-center">
                    <span className="text-xs muted">Save as:</span>
                    {["Home", "Office", "Other"].map((lbl) => (
                      <button
                        key={lbl}
                        type="button"
                        className={`label-tag-btn ${newAddressLabel === lbl ? "active" : ""}`}
                        onClick={() => setNewAddressLabel(lbl)}
                      >
                        {lbl === "Home" ? "🏠 Home" : lbl === "Office" ? "🏢 Office" : "📍 Other"}
                      </button>
                    ))}
                    <label className="checkbox-label ml-10 text-xs cursor-pointer flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={saveToAccount}
                        onChange={(e) => setSaveToAccount(e.target.checked)}
                      />
                      Save to account
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="active-address-banner mt-12">
                <span className="text-xs">
                  ✓ <strong>Auto-filled:</strong> {customer.address ? `${customer.address.slice(0, 50)}...` : "Select an address"}
                </span>
                <button
                  type="button"
                  className="link-btn text-xs ml-auto"
                  onClick={handleSwitchToNewAddress}
                >
                  Deliver to another address →
                </button>
              </div>
            )}
          </div>
        )}

        <div className="form-grid">
          <div className="field">
            <label htmlFor="chk-name">Full Name *</label>
            <input
              id="chk-name"
              type="text"
              required
              placeholder="e.g. Priyanshi Mehta"
              value={customer.name}
              onChange={(e) => update("name", e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="field">
            <label htmlFor="chk-phone">Mobile Number *</label>
            <input
              id="chk-phone"
              type="tel"
              required
              placeholder="10-digit mobile (e.g. 9876543210)"
              value={customer.phone}
              onChange={(e) => update("phone", e.target.value)}
              autoComplete="tel"
            />
          </div>

          <div className="field">
            <label htmlFor="chk-email">Email (For receipt & dispatch tracking)</label>
            <input
              id="chk-email"
              type="email"
              placeholder="your@email.com"
              value={customer.email}
              onChange={(e) => update("email", e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="chk-pincode">PIN Code *</label>
            <input
              id="chk-pincode"
              type="text"
              required
              placeholder="6-digit pincode"
              value={customer.pincode}
              onChange={(e) => update("pincode", e.target.value)}
              autoComplete="postal-code"
            />
          </div>

          <div className="field">
            <label htmlFor="chk-city">City *</label>
            <input
              id="chk-city"
              type="text"
              required
              placeholder="e.g. Mumbai, Delhi, Bengaluru"
              value={customer.city}
              onChange={(e) => update("city", e.target.value)}
              autoComplete="address-level2"
            />
          </div>

          <div className="field">
            <label htmlFor="chk-state">State *</label>
            <input
              id="chk-state"
              type="text"
              required
              placeholder="e.g. Maharashtra"
              value={customer.state}
              onChange={(e) => update("state", e.target.value)}
              autoComplete="address-level1"
            />
          </div>

          <div className="field full">
            <label htmlFor="chk-address">Complete Delivery Address *</label>
            <textarea
              id="chk-address"
              required
              rows={3}
              placeholder="Apartment/Flat, Building name, Street, Landmark"
              value={customer.address}
              onChange={(e) => update("address", e.target.value)}
              autoComplete="street-address"
            />
          </div>

          <div className="field full">
            <label htmlFor="chk-notes">Delivery / Installation Instructions (Optional)</label>
            <textarea
              id="chk-notes"
              rows={2}
              placeholder="e.g. Please call before arrival; deliver on 3rd floor"
              value={customer.notes}
              onChange={(e) => update("notes", e.target.value)}
            />
          </div>
        </div>

        {isHyderabad ? (
          <div className="checkout-hyd-unlocked-banner mt-15">
            <div className="hyd-banner-title">
              <span className="hyd-banner-icon">🎉</span>
              <strong>Hyderabad VIP Privilege Unlocked!</strong>
            </div>
            <p className="text-xs mt-4 mb-0">
              Your delivery address qualifies for <strong>100% Free Express Delivery (24–48h)</strong> + <strong>Free Professional Wall Mounting</strong> by a certified technician at zero extra cost.
            </p>
          </div>
        ) : (
          <div className="checkout-all-india-banner mt-15">
            <span className="text-xs muted">
              🚚 <strong>All-India Safe Transit:</strong> Armored wooden crate delivery with 100% zero-breakage replacement guarantee.
            </span>
          </div>
        )}

        <div className="checkout-divider" />

        <h2 className="checkout-section-title">2. Payment Method</h2>
        <div className="payment-options-grid">
          <label className={`payment-radio-box ${method === "cod" ? "selected" : ""}`}>
            <input
              type="radio"
              name="payment"
              checked={method === "cod"}
              onChange={() => setMethod("cod")}
            />
            <div className="payment-radio-content">
              <strong>💵 Cash on Delivery (COD)</strong>
              <p className="muted text-xs">Pay upon safe doorstep delivery after inspecting crate seal.</p>
            </div>
            <span className="badge-available">Available</span>
          </label>

          <label className={`payment-radio-box ${method === "razorpay" ? "selected" : ""}`}>
            <input
              type="radio"
              name="payment"
              checked={method === "razorpay"}
              onChange={() => setMethod("razorpay")}
            />
            <div className="payment-radio-content">
              <strong>💳 Pay Online via Razorpay</strong>
              <p className="muted text-xs">UPI (GPay / PhonePe / Paytm), Credit & Debit Cards, Netbanking.</p>
            </div>
            <span className="badge-instant">Fastest Dispatch</span>
          </label>
        </div>

        <div className="checkout-divider" />

        <button
          className="btn btn-luxury w-100 btn-large"
          type="submit"
          disabled={busy || !lines.length}
        >
          {busy
            ? "Securing your order..."
            : method === "cod"
            ? `Confirm COD Order • ${formatINR(total)}`
            : `Proceed to Secure Payment • ${formatINR(total)}`}
        </button>

        {message && (
          <div
            className={
              message.toLowerCase().includes("could not") || message.toLowerCase().includes("failed")
                ? "alert-error mt-15"
                : "alert-success mt-15"
            }
            role="status"
          >
            {message}
          </div>
        )}
      </form>

      {/* RIGHT: Order Summary & Cart Line Items */}
      <aside className="checkout-summary-sidebar glass-panel">
        <h3 className="sidebar-heading">Order Summary ({lines.reduce((s, i) => s + i.quantity, 0)} items)</h3>

        {!lines.length ? (
          <div className="p-30 text-center">
            <p className="muted">Your bag is empty.</p>
            <Link href="/#shop" className="btn secondary btn-sm mt-10">
              Browse Mirrors
            </Link>
          </div>
        ) : (
          <div className="cart-items-scrollable">
            {lines.map((i) => (
              <div key={i.productId} className="sidebar-cart-item">
                <div className="sidebar-item-preview">
                  {i.product?.image_url ? (
                    <img src={i.product.image_url} alt={i.product.name} className="sidebar-item-img" />
                  ) : (
                    <div className={`mini-mirror ${i.product?.shape || "rect"}`} />
                  )}
                </div>
                <div className="sidebar-item-details">
                  <strong>{i.product?.name}</strong>
                  <div className="sidebar-qty-stepper">
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => handleQuantityChange(i.productId, -1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="qty-value">{i.quantity}</span>
                    <button
                      type="button"
                      className="qty-btn"
                      onClick={() => handleQuantityChange(i.productId, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="remove-link"
                      onClick={() => handleRemoveItem(i.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="sidebar-item-price">
                  {formatINR((i.product?.price || 0) * i.quantity)}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="sidebar-breakdown">
          <div className="breakdown-row">
            <span>Subtotal</span>
            <strong>{formatINR(total)}</strong>
          </div>
          <div className="breakdown-row">
            <span>Insured Wooden Crate Delivery</span>
            <span className="gold-text">FREE</span>
          </div>
          <div className="breakdown-row">
            <span>GST & Packaging Taxes</span>
            <span className="gold-text">Included</span>
          </div>
          <div className="breakdown-divider" />
          <div className="breakdown-row total-row">
            <span>Estimated Total</span>
            <span className="gold-amount">{formatINR(total)}</span>
          </div>
        </div>

        <div className="sidebar-guarantees">
          <div className="guarantee-chip">🛡️ 100% Zero-Breakage Guarantee</div>
          <div className="guarantee-chip">💎 5-Year Saint-Gobain Warranty</div>
          <div className="guarantee-chip">📞 Live WhatsApp Support</div>
        </div>
      </aside>
    </div>
  );
}
