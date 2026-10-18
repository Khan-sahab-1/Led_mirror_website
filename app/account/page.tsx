"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatINR } from "@/lib/products";
import Link from "next/link";

type OrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string | null;
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
};

type SavedAddress = {
  id?: string;
  user_id?: string;
  email?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  label?: string;
  is_default?: boolean;
};

const emptyAddressForm = {
  name: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  label: "Home",
  is_default: false,
};

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, displayName, signOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressBusy, setAddressBusy] = useState(false);
  const [addressMsg, setAddressMsg] = useState("");
  const [addressErr, setAddressErr] = useState("");

  const loadAddresses = useCallback(async () => {
    if (!user) return;
    setFetchingAddresses(true);
    try {
      const res = await fetch(
        `/api/user/addresses?userId=${encodeURIComponent(user.id)}&email=${encodeURIComponent(user.email || "")}`
      );
      const data = await res.json();
      if (data?.addresses) setAddresses(data.addresses);
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    } finally {
      setFetchingAddresses(false);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "addresses" || tab === "orders" || tab === "profile") {
        setActiveTab(tab);
      }
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      setFetchingOrders(false);
      setFetchingAddresses(false);
      return;
    }

    if (user?.email) {
      setFetchingOrders(true);
      fetch(`/api/user/orders?email=${encodeURIComponent(user.email)}&userId=${encodeURIComponent(user.id)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch((err) => console.error("Error fetching orders:", err))
        .finally(() => setFetchingOrders(false));

      void loadAddresses();
    }
  }, [user, loading, loadAddresses]);

  const handleOpenAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm({
      name: displayName || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      label: "Home",
      is_default: addresses.length === 0,
    });
    setAddressErr("");
    setAddressMsg("");
    setShowAddressForm(true);
  };

  const handleOpenEditAddress = (addr: SavedAddress) => {
    setEditingAddressId(addr.id || null);
    setAddressForm({
      name: addr.name || "",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      label: addr.label || "Home",
      is_default: Boolean(addr.is_default),
    });
    setAddressErr("");
    setAddressMsg("");
    setShowAddressForm(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setAddressBusy(true);
    setAddressErr("");
    setAddressMsg("");

    try {
      const payload = {
        ...addressForm,
        id: editingAddressId || undefined,
        userId: user.id,
        email: user.email,
      };

      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save address.");

      setAddressMsg("✓ Delivery address saved successfully!");
      setShowAddressForm(false);
      await loadAddresses();
      setTimeout(() => setAddressMsg(""), 3500);
    } catch (err: any) {
      setAddressErr(err.message || "Failed to save address.");
    } finally {
      setAddressBusy(false);
    }
  };

  const handleSetDefault = async (addr: SavedAddress) => {
    if (!user || !addr.id) return;
    try {
      await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...addr,
          userId: user.id,
          email: user.email,
          is_default: true,
        }),
      });
      await loadAddresses();
    } catch {}
  };

  const handleDeleteAddress = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this delivery address?")) return;
    try {
      const res = await fetch(`/api/user/addresses?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadAddresses();
      }
    } catch {}
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="container section text-center">
          <div className="skeleton-loader p-40">Loading your profile...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!user) {
    return (
      <>
        <Header />
        <main className="container section">
          <div className="auth-card glass-panel text-center max-w-500 m-auto">
            <span className="eyebrow-luxury">CUSTOMER PORTAL</span>
            <h1 className="serif-title mt-10">Sign in to view orders</h1>
            <p className="muted mb-25">
              Please sign in with your GlassStudio credentials to view your order tracking and personal details.
            </p>
            <div className="flex-center gap-14">
              <Link href="/login?redirect=/account" className="btn btn-luxury">
                Sign In / Register
              </Link>
              <Link href="/" className="btn secondary">
                Browse Mirrors
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <span className="status-pill status-delivered">✓ Delivered</span>;
      case "shipped":
        return <span className="status-pill status-shipped">🚚 In Transit / Shipped</span>;
      case "processing":
        return <span className="status-pill status-processing">⚙️ Being Handcrafted</span>;
      case "confirmed":
        return <span className="status-pill status-confirmed">✓ Order Confirmed</span>;
      case "new":
        return <span className="status-pill status-new">● Order Placed</span>;
      case "cancelled":
        return <span className="status-pill status-cancelled">✕ Cancelled</span>;
      default:
        return <span className="status-pill status-default">{status}</span>;
    }
  };

  return (
    <>
      <Header />
      <main className="container section">
        <div className="account-hero glass-panel">
          <div className="account-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="account-details">
            <span className="eyebrow-luxury">AUTHENTICATED CLIENT</span>
            <h1 className="account-name">{displayName}</h1>
            <p className="account-email">{user.email}</p>
          </div>
          <div className="account-actions">
            <button
              className="btn secondary btn-sm"
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="account-nav-tabs">
          <button
            className={`account-tab ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            My Orders ({orders.length})
          </button>
          <button
            className={`account-tab ${activeTab === "addresses" ? "active" : ""}`}
            onClick={() => setActiveTab("addresses")}
          >
            Saved Addresses ({addresses.length})
          </button>
          <button
            className={`account-tab ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            Profile & Concierge
          </button>
        </div>

        {activeTab === "orders" && (
          <div className="orders-wrapper">
            {fetchingOrders ? (
              <div className="p-30 text-center muted">Retrieving order history...</div>
            ) : orders.length === 0 ? (
              <div className="empty-orders-card glass-panel text-center">
                <div className="empty-icon">🪞</div>
                <h3>No Orders Yet</h3>
                <p className="muted max-w-400 m-auto mb-20">
                  You haven’t placed any mirror orders with this account yet. Discover our handcrafted collection today!
                </p>
                <Link href="/#shop" className="btn btn-luxury">
                  Explore Mirrors
                </Link>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.order_number} className="order-luxury-card glass-panel">
                    <div className="order-card-header">
                      <div>
                        <span className="order-id">Order #{order.order_number}</span>
                        <div className="order-date">
                          Placed on {new Date(order.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                      <div className="order-status-badge">
                        {getStatusBadge(order.order_status)}
                      </div>
                    </div>

                    <div className="order-items-grid">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="order-item-row">
                          <div className="order-item-icon">🪞</div>
                          <div className="order-item-info">
                            <strong>{item.name}</strong>
                            <div className="muted text-xs">Quantity: {item.quantity}</div>
                          </div>
                          <div className="order-item-price">
                            {formatINR(item.line_total || item.unit_price * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <div className="order-shipping-summary">
                        <strong>Delivery Address:</strong>
                        <div className="muted text-xs">
                          {order.customer_name} • {order.phone}
                          <br />
                          {order.address}, {order.city}, {order.state} - {order.pincode}
                        </div>
                      </div>
                      <div className="order-total-summary">
                        <div className="payment-type">
                          Method: <strong>{order.payment_method.toUpperCase()}</strong> ({order.payment_status})
                        </div>
                        <div className="total-label">
                          Total Amount: <span className="gold-text">{formatINR(order.total_amount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="addresses-wrapper">
            <div className="flex-between items-center mb-20 flex-wrap gap-10">
              <div>
                <h2 className="serif-title mb-0">Delivery Address Book</h2>
                <p className="muted text-xs">
                  Saved delivery locations auto-fill during checkout for rapid 1-click orders.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-luxury btn-sm"
                onClick={handleOpenAddAddress}
              >
                ➕ Add New Delivery Address
              </button>
            </div>

            {addressMsg && <div className="alert-success mb-20">{addressMsg}</div>}
            {addressErr && <div className="alert-error mb-20">{addressErr}</div>}

            {/* Inline Add / Edit Address Form */}
            {showAddressForm && (
              <div className="address-form-modal glass-panel p-25 mb-25">
                <div className="flex-between items-center mb-15">
                  <h3 className="serif-title mb-0">
                    {editingAddressId ? "Edit Delivery Address" : "Add New Delivery Address"}
                  </h3>
                  <button
                    type="button"
                    className="btn secondary btn-sm"
                    onClick={() => setShowAddressForm(false)}
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleSaveAddress} className="form-grid">
                  <div className="field">
                    <label>Recipient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jamshed Ali"
                      value={addressForm.name}
                      onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit phone number"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>PIN Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="6-digit pincode"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. New Delhi"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>State *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Delhi"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    />
                  </div>

                  <div className="field">
                    <label>Address Label</label>
                    <div className="flex gap-8 mt-4">
                      {["Home", "Office", "Other"].map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          className={`btn secondary btn-sm ${addressForm.label === lbl ? "btn-luxury" : ""}`}
                          onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                        >
                          {lbl === "Home" ? "🏠 Home" : lbl === "Office" ? "🏢 Office" : "📍 Other"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field full">
                    <label>Complete Street Address (Flat, Floor, Building, Landmark) *</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="House/Flat number, Building name, Street, Landmark"
                      value={addressForm.address}
                      onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                    />
                  </div>

                  <div className="field full">
                    <label className="checkbox-label cursor-pointer flex items-center gap-6">
                      <input
                        type="checkbox"
                        checked={addressForm.is_default}
                        onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                      />
                      Make this my default shipping address for checkout auto-fill
                    </label>
                  </div>

                  <div className="field full flex gap-10 mt-10">
                    <button type="submit" className="btn btn-luxury" disabled={addressBusy}>
                      {addressBusy ? "Saving..." : editingAddressId ? "💾 Update Address" : "✓ Save Address"}
                    </button>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {fetchingAddresses ? (
              <div className="p-30 text-center muted">Loading your delivery addresses...</div>
            ) : addresses.length === 0 ? (
              <div className="empty-orders-card glass-panel text-center">
                <div className="empty-icon">📍</div>
                <h3>No Saved Addresses</h3>
                <p className="muted max-w-400 m-auto mb-20">
                  Save your home or office address once, and our checkout will automatically fill it for rapid ordering.
                </p>
                <button
                  type="button"
                  className="btn btn-luxury"
                  onClick={handleOpenAddAddress}
                >
                  ➕ Add First Delivery Address
                </button>
              </div>
            ) : (
              <div className="addresses-grid">
                {addresses.map((addr) => (
                  <div key={addr.id} className={`address-luxury-card glass-panel ${addr.is_default ? "is-default" : ""}`}>
                    <div className="flex-between items-center mb-8">
                      <span className="address-chip-label">
                        {addr.label === "Office" ? "🏢 Office" : addr.label === "Other" ? "📍 Other" : "🏠 Home"}
                      </span>
                      {addr.is_default && (
                        <span className="badge-available">★ Default Delivery Address</span>
                      )}
                    </div>

                    <strong className="text-base block mb-4">{addr.name}</strong>
                    <div className="text-xs muted mb-8">📞 {addr.phone}</div>
                    <p className="text-sm line-height-16 mb-16">
                      {addr.address}
                      <br />
                      <strong>{addr.city}</strong>{addr.state ? `, ${addr.state}` : ""} — <strong>{addr.pincode}</strong>
                    </p>

                    <div className="address-card-actions flex gap-8 items-center flex-wrap pt-10 border-t border-line">
                      {!addr.is_default && (
                        <button
                          type="button"
                          className="btn secondary btn-xs"
                          onClick={() => handleSetDefault(addr)}
                        >
                          ⭐ Set as Default
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn secondary btn-xs"
                        onClick={() => handleOpenEditAddress(addr)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        type="button"
                        className="btn secondary btn-xs text-danger"
                        onClick={() => handleDeleteAddress(addr.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-grid">
            <div className="glass-panel p-25">
              <h3 className="serif-title mb-15">Client Information</h3>
              <div className="info-row">
                <span className="muted">Name:</span>
                <strong>{displayName}</strong>
              </div>
              <div className="info-row">
                <span className="muted">Email:</span>
                <strong>{user.email}</strong>
              </div>
              <div className="info-row">
                <span className="muted">Member Since:</span>
                <strong>{new Date(user.created_at || Date.now()).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</strong>
              </div>
            </div>

            <div className="glass-panel p-25">
              <h3 className="serif-title mb-15">Bespoke Concierge</h3>
              <p className="muted text-sm line-height-16 mb-20">
                Need architectural custom glass, customized LED switch placement, or French-cleat installation support?
              </p>
              <Link href="/custom-mirror" className="btn btn-luxury w-100 text-center">
                Request Bespoke Mirror Quote
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

