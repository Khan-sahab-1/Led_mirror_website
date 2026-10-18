"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/products";

type Order = {
  order_number: string;
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state?: string;
  pincode: string;
  items: any[];
  total_amount: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
  notes?: string;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at?: number | null;
  category: string;
  shape: string;
  badge?: string | null;
  dimensions?: string;
  glass_specs?: string;
  mounting?: string;
  lighting_specs?: string;
  warranty?: string;
  description: string;
  image_url?: string | null;
  images?: string[];
  led: boolean;
  active: boolean;
};

const blankForm = {
  name: "",
  slug: "",
  price: "",
  compare_at: "",
  category: "LED Mirror",
  shape: "arch",
  badge: "Bestseller",
  dimensions: "24 × 36 inches (600 × 900 mm)",
  glass_specs: "5mm Saint-Gobain Float Glass",
  mounting: "Heavy-Duty French Cleat Included",
  lighting_specs: "Tricolor 3000K–6000K Smart Dimming",
  warranty: "5-Year Structural & LED Warranty",
  description: "",
  image_url: "",
  images: [] as string[],
  led: true,
  active: true,
};

export default function AdminPanel() {
  const [ok, setOk] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<"overview" | "orders" | "products">("overview");
  const [form, setForm] = useState<any>(blankForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [manualUrlInput, setManualUrlInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadData() {
    try {
      const [resOrders, resProducts] = await Promise.all([
        fetch("/api/admin/orders"),
        fetch("/api/admin/products"),
      ]);

      if (resOrders.status === 401 || resProducts.status === 401) {
        setOk(false);
        return;
      }

      const ordersData = await resOrders.json();
      const productsData = await resProducts.json();

      if (!resOrders.ok || !resProducts.ok) {
        setError(ordersData.error || productsData.error || "Could not load data.");
        return;
      }

      setOrders(ordersData.orders || []);
      setProducts(productsData.products || []);
      setOk(true);
    } catch {
      setError("Failed to connect to admin API.");
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setPassword("");
      await loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function changeOrderStatus(orderNumber: string, orderStatus: string) {
    const res = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber, orderStatus }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error);
    else await loadData();
  }

  function handleNameChange(name: string) {
    const generatedSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setForm((prev: any) => ({
      ...prev,
      name,
      slug: editId ? prev.slug : generatedSlug,
    }));
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload image(s) from local device.");

      const newUrls: string[] = Array.isArray(data.urls) && data.urls.length > 0
        ? data.urls
        : (data.url ? [data.url] : []);

      if (newUrls.length === 0) {
        throw new Error("No image URLs returned from upload server.");
      }

      setForm((prev: any) => {
        const existing = Array.isArray(prev.images) && prev.images.length > 0
          ? [...prev.images]
          : (prev.image_url ? [prev.image_url] : []);
        const combined = [...existing, ...newUrls];
        return {
          ...prev,
          images: combined,
          image_url: combined[0] || "",
        };
      });

      setSuccess(`✓ Successfully uploaded ${newUrls.length} image${newUrls.length > 1 ? "s" : ""} from your device!`);
      setTimeout(() => setSuccess(""), 3500);
    } catch (err: any) {
      setError(err?.message || "Failed to upload image(s) from local device.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function removeImage(index: number) {
    setForm((prev: any) => {
      const existing = Array.isArray(prev.images) && prev.images.length > 0
        ? [...prev.images]
        : (prev.image_url ? [prev.image_url] : []);
      const updated = existing.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        image_url: updated[0] || "",
      };
    });
  }

  function makePrimaryImage(index: number) {
    setForm((prev: any) => {
      const existing = Array.isArray(prev.images) && prev.images.length > 0
        ? [...prev.images]
        : (prev.image_url ? [prev.image_url] : []);
      if (index <= 0 || index >= existing.length) return prev;
      const target = existing[index];
      const rest = existing.filter((_, i) => i !== index);
      const reordered = [target, ...rest];
      return {
        ...prev,
        images: reordered,
        image_url: target,
      };
    });
  }

  function addManualImageUrl() {
    const url = manualUrlInput.trim();
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
      setError("Please enter a valid HTTP/HTTPS image URL or path.");
      return;
    }
    setForm((prev: any) => {
      const existing = Array.isArray(prev.images) && prev.images.length > 0
        ? [...prev.images]
        : (prev.image_url ? [prev.image_url] : []);
      if (existing.includes(url)) return prev;
      const combined = [...existing, url];
      return {
        ...prev,
        images: combined,
        image_url: combined[0] || "",
      };
    });
    setManualUrlInput("");
    setSuccess("✓ Image URL added to gallery!");
    setTimeout(() => setSuccess(""), 3000);
  }

  function copyToClipboard(text: string): boolean {
    if (typeof window === "undefined") return false;

    if (typeof navigator !== "undefined" && navigator?.clipboard?.writeText) {
      try {
        navigator.clipboard.writeText(text).catch(() => {
          fallbackCopy(text);
        });
        return true;
      } catch {
        return fallbackCopy(text);
      }
    }

    return fallbackCopy(text);
  }

  function fallbackCopy(text: string): boolean {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "-9999px";
      textArea.style.left = "-9999px";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(textArea);
      return ok;
    } catch (err) {
      console.warn("Clipboard fallback failed:", err);
      return false;
    }
  }

  function copyAddress(order: Order) {
    const text = [
      order.customer_name,
      `Phone: ${order.phone}${order.email ? ` | ${order.email}` : ""}`,
      order.address,
      `${order.city}${order.state ? `, ${order.state}` : ""} - ${order.pincode}`,
      order.notes ? `Delivery Note: ${order.notes}` : "",
    ].filter(Boolean).join("\n");

    copyToClipboard(text);
    setCopiedId(order.order_number);
    setTimeout(() => setCopiedId(null), 2500);
  }

  function startEdit(product: Product) {
    setEditId(product.id);
    const existingImages = Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : (product.image_url ? [product.image_url] : []);

    setForm({
      name: product.name,
      slug: product.slug,
      price: String(product.price),
      compare_at: product.compare_at ? String(product.compare_at) : "",
      category: product.category,
      shape: product.shape,
      badge: product.badge || "",
      dimensions: product.dimensions || "24 × 36 inches",
      glass_specs: product.glass_specs || "5mm Saint-Gobain Float Glass",
      mounting: product.mounting || "Heavy-Duty French Cleat Included",
      lighting_specs: product.lighting_specs || "Tricolor 3000K–6000K Smart Dimming",
      warranty: product.warranty || "5-Year Structural & LED Warranty",
      description: product.description || "",
      image_url: product.image_url || existingImages[0] || "",
      images: existingImages,
      led: product.led ?? product.category === "LED Mirror",
      active: product.active !== false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const imagesArr = Array.isArray(form.images) && form.images.length > 0
        ? form.images
        : (form.image_url ? [form.image_url] : []);

      const payload = {
        ...form,
        id: editId || undefined,
        price: Number(form.price),
        compare_at: form.compare_at ? Number(form.compare_at) : null,
        images: imagesArr,
        image_url: imagesArr[0] || null,
      };

      const res = await fetch("/api/admin/products", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save product.");

      setSuccess(editId ? "Product updated successfully!" : "New product published successfully!");
      setForm(blankForm);
      setEditId(null);
      await loadData();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteProduct(id: string, name: string) {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error);
      else await loadData();
    } catch {
      setError("Failed to delete product.");
    }
  }

  if (!ok) {
    return (
      <div className="auth-card glass-panel">
        <span className="eyebrow-luxury">GLASSSTUDIO ATELIER</span>
        <h1 className="serif-title mt-4">Staff Administration</h1>
        <p className="muted text-sm mb-20">Sign in to manage orders, catalogue specifications, and fulfillment.</p>
        <form onSubmit={handleLogin} className="auth-form">
          <div className="input-group">
            <label>Admin Email</label>
            <input
              type="email"
              required
              placeholder="admin@glassstudio.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn btn-luxury w-100" disabled={busy}>
            {busy ? "Authenticating..." : "Sign In to Admin"}
          </button>
          {error && <div className="alert-error mt-12">{error}</div>}
        </form>
      </div>
    );
  }

  const paidRevenue = orders
    .filter((o) => o.payment_status === "paid")
    .reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrders = orders.filter((o) => o.order_status === "new").length;

  return (
    <div className="admin-dashboard-wrapper">
      <div className="section-head">
        <div>
          <span className="eyebrow-luxury">ADMIN CONTROL PANEL</span>
          <h1 className="serif-heading mb-0">Atelier Operations</h1>
          <p className="muted text-sm">Real-time orders, revenue, and product catalogue management.</p>
        </div>
        <button
          className="btn secondary btn-sm"
          onClick={async () => {
            await fetch("/api/admin/logout", { method: "POST" });
            setOk(false);
          }}
        >
          Sign Out 🚪
        </button>
      </div>

      {error && <div className="alert-error mb-20">{error}</div>}
      {success && <div className="alert-success mb-20">{success}</div>}

      <div className="flex-between flex-wrap gap-12 mb-25">
        <div className="tab-pill-group mb-0">
          <button
            className={`tab-pill ${tab === "overview" ? "active" : ""}`}
            onClick={() => setTab("overview")}
          >
            📊 Store Overview
          </button>
          <button
            className={`tab-pill ${tab === "orders" ? "active" : ""}`}
            onClick={() => setTab("orders")}
          >
            📦 Orders ({orders.length})
          </button>
          <button
            className={`tab-pill ${tab === "products" ? "active" : ""}`}
            onClick={() => setTab("products")}
          >
            🪞 Catalogue ({products.length})
          </button>
        </div>
        <button className="btn secondary btn-sm" onClick={() => void loadData()}>
          ↻ Refresh Data
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <>
          <div className="benefits mb-30">
            <div className="benefit">
              <span className="eyebrow-luxury">TOTAL ORDERS</span>
              <strong style={{ fontSize: 32 }}>{orders.length}</strong>
              <p className="muted text-xs">All-time lifetime orders placed</p>
            </div>
            <div className="benefit">
              <span className="eyebrow-luxury">NEW / PENDING</span>
              <strong style={{ fontSize: 32, color: "var(--gold-dark)" }}>{pendingOrders}</strong>
              <p className="muted text-xs">Orders awaiting confirmation/dispatch</p>
            </div>
            <div className="benefit">
              <span className="eyebrow-luxury">PAID ONLINE REVENUE</span>
              <strong style={{ fontSize: 32, color: "var(--success)" }}>{formatINR(paidRevenue)}</strong>
              <p className="muted text-xs">Captured via Razorpay payments</p>
            </div>
          </div>

          <h2 className="serif-title mb-15">Recent Orders</h2>
          <OrdersTable
            orders={orders.slice(0, 10)}
            changeStatus={changeOrderStatus}
            onSelectOrder={setSelectedOrder}
            onCopyAddress={copyAddress}
            copiedId={copiedId}
          />
        </>
      )}

      {/* ORDERS TAB */}
      {tab === "orders" && (
        <>
          <h2 className="serif-title mb-15">All Customer Orders ({orders.length})</h2>
          <OrdersTable
            orders={orders}
            changeStatus={changeOrderStatus}
            onSelectOrder={setSelectedOrder}
            onCopyAddress={copyAddress}
            copiedId={copiedId}
          />
        </>
      )}

      {/* PRODUCTS TAB */}
      {tab === "products" && (
        <div className="admin-products-layout">
          {/* PRODUCT FORM */}
          <div className="product-form-container glass-panel p-30 mb-35">
            <div className="flex-between mb-20">
              <div>
                <span className="eyebrow-luxury">{editId ? "EDIT PRODUCT" : "CREATE NEW ATELIER PIECE"}</span>
                <h2 className="serif-title mb-0">{editId ? "Update Product Specifications" : "Add Product to Catalogue"}</h2>
                <p className="muted text-xs">All fields entered below will display directly on the customer storefront & product detail page.</p>
              </div>
              {editId && (
                <button
                  type="button"
                  className="btn secondary btn-sm"
                  onClick={() => {
                    setEditId(null);
                    setForm(blankForm);
                  }}
                >
                  ✕ Cancel Editing
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProduct} className="admin-product-form">
              {/* SECTION 1: ESSENTIAL INFO */}
              <h4 className="form-section-subtitle">1. Basic Information</h4>
              <div className="form-grid">
                <div className="field">
                  <label>Product Name *</label>
                  <input
                    required
                    placeholder="e.g. Halo Arch LED Mirror"
                    value={form.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>

                <div className="field">
                  <label>URL Slug (Unique path) *</label>
                  <input
                    required
                    placeholder="e.g. halo-arch-led-mirror"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      setForm({
                        ...form,
                        category: cat,
                        led: cat === "LED Mirror",
                      });
                    }}
                  >
                    <option value="LED Mirror">LED Mirror</option>
                    <option value="Wall Mirror">Wall Mirror</option>
                    <option value="Full-Length Mirror">Full-Length Mirror</option>
                  </select>
                </div>

                <div className="field">
                  <label>Mirror Silhouette Shape *</label>
                  <select
                    value={form.shape}
                    onChange={(e) => setForm({ ...form, shape: e.target.value })}
                  >
                    <option value="arch">Arched Top (arch)</option>
                    <option value="round">Round / Circular (round)</option>
                    <option value="rect">Rectangle / Square (rect)</option>
                    <option value="full">Full Length (full)</option>
                  </select>
                </div>
              </div>

              {/* SECTION 2: PRICING & FRONTEND BADGES */}
              <h4 className="form-section-subtitle mt-25">2. Pricing & Badges</h4>
              <div className="form-grid">
                <div className="field">
                  <label>Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="e.g. 8999"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Original MRP / Compare-at Price (₹) [For Strikethrough & Discount %]</label>
                  <input
                    type="number"
                    min={1}
                    placeholder="e.g. 10999 (shows 'SAVE 18%' on card)"
                    value={form.compare_at}
                    onChange={(e) => setForm({ ...form, compare_at: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Frontend Badge (Card Tag)</label>
                  <input
                    placeholder="e.g. Bestseller, New, Trending, Limited Edition"
                    value={form.badge}
                    onChange={(e) => setForm({ ...form, badge: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>LED Backlit Illumination?</label>
                  <select
                    value={form.led ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, led: e.target.value === "true" })}
                  >
                    <option value="true">Yes — Active LED Backlit (Displays Glow Effect)</option>
                    <option value="false">No — Non-LED Ambient Mirror</option>
                  </select>
                </div>
              </div>

              {/* SECTION 3: ARCHITECTURAL SPECIFICATIONS */}
              <h4 className="form-section-subtitle mt-25">3. Architectural Specifications (Shown on Product Page)</h4>
              <div className="form-grid">
                <div className="field">
                  <label>Dimensions (Size Specifications) *</label>
                  <input
                    required
                    placeholder="e.g. 24 × 36 inches (600 × 900 mm)"
                    value={form.dimensions}
                    onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Glass Purity Specification *</label>
                  <input
                    required
                    placeholder="e.g. 5mm Saint-Gobain Diamond Float Glass"
                    value={form.glass_specs}
                    onChange={(e) => setForm({ ...form, glass_specs: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Mounting System *</label>
                  <input
                    required
                    placeholder="e.g. Heavy-Duty French Cleat Included"
                    value={form.mounting}
                    onChange={(e) => setForm({ ...form, mounting: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Lighting / Color Temperature *</label>
                  <input
                    required
                    placeholder="e.g. Tricolor 3000K–6000K Smart Dimming"
                    value={form.lighting_specs}
                    onChange={(e) => setForm({ ...form, lighting_specs: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Warranty Terms *</label>
                  <input
                    required
                    placeholder="e.g. 5-Year Structural & LED Replacement Warranty"
                    value={form.warranty}
                    onChange={(e) => setForm({ ...form, warranty: e.target.value })}
                  />
                </div>

                <div className="field full">
                  <div className="flex-between items-center mb-8">
                    <label className="font-semibold block mb-0">
                      Product Images Gallery ({((Array.isArray(form.images) && form.images.length > 0) ? form.images : (form.image_url ? [form.image_url] : [])).length} photos)
                    </label>
                    <span className="text-xs muted">
                      ★ The #1 cover image is displayed on storefront catalogue cards
                    </span>
                  </div>

                  {(() => {
                    const currentImages: string[] = (Array.isArray(form.images) && form.images.length > 0)
                      ? form.images
                      : (form.image_url ? [form.image_url] : []);

                    return (
                      <div className="admin-gallery-manager">
                        {currentImages.length > 0 && (
                          <div className="admin-gallery-grid mb-15">
                            {currentImages.map((img, idx) => (
                              <div
                                key={idx}
                                className={`admin-gallery-item ${idx === 0 ? "is-primary" : ""}`}
                              >
                                <div className="admin-gallery-thumb-wrap">
                                  <img
                                    src={img}
                                    alt={`Product view ${idx + 1}`}
                                    className="admin-gallery-thumb"
                                  />
                                  <span className="admin-gallery-rank">#{idx + 1}</span>
                                  {idx === 0 && (
                                    <span className="admin-primary-badge">★ Primary Cover</span>
                                  )}
                                </div>
                                <div className="admin-gallery-item-actions">
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      className="admin-gallery-btn make-primary"
                                      onClick={() => makePrimaryImage(idx)}
                                    >
                                      ⭐ Make Primary
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="admin-gallery-btn delete-btn"
                                    onClick={() => removeImage(idx)}
                                  >
                                    ✕ Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="admin-upload-controls">
                          <div className="file-upload-dropzone">
                            <input
                              type="file"
                              id="product-images-picker"
                              multiple
                              accept="image/png, image/jpeg, image/webp, image/avif"
                              className="file-input-hidden"
                              onChange={handleImageFile}
                              disabled={uploadingImage}
                            />
                            <label htmlFor="product-images-picker" className="file-upload-label">
                              <div className="upload-icon-circle">
                                {uploadingImage ? "⏳" : "📷"}
                              </div>
                              <strong className="text-sm">
                                {uploadingImage
                                  ? "Uploading images from device to Supabase Storage..."
                                  : currentImages.length > 0
                                  ? "➕ Add more images from local device (Select multiple)"
                                  : "Click here to choose multiple images directly from local device"}
                              </strong>
                              <span className="muted text-xs mt-4">
                                Supports picking multiple files at once (JPG, PNG, WEBP, AVIF up to 10MB each)
                              </span>
                            </label>
                          </div>

                          <div className="manual-url-adder mt-12 flex gap-8">
                            <input
                              type="text"
                              className="flex-1"
                              placeholder="Or paste external image URL (e.g. https://images.unsplash.com/...)"
                              value={manualUrlInput}
                              onChange={(e) => setManualUrlInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addManualImageUrl();
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="btn secondary btn-sm"
                              onClick={addManualImageUrl}
                            >
                              ➕ Add Image URL
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* SECTION 4: DESCRIPTION & STATUS */}
              <h4 className="form-section-subtitle mt-25">4. Story & Published Status</h4>
              <div className="form-grid">
                <div className="field full">
                  <label>Product Description & Editorial Highlights *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Detailed craftsmanship notes, styling recommendations, and architectural finish..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>

                <div className="field">
                  <label>Catalogue Visibility</label>
                  <select
                    value={form.active ? "true" : "false"}
                    onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}
                  >
                    <option value="true">Active (Visible on storefront)</option>
                    <option value="false">Draft / Hidden (Internal only)</option>
                  </select>
                </div>
              </div>

              <div className="mt-25 flex-between">
                <button className="btn btn-luxury" disabled={busy}>
                  {busy ? "Processing..." : editId ? "💾 Update Product" : "✨ Publish Product to Storefront"}
                </button>
                {editId && (
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => {
                      setEditId(null);
                      setForm(blankForm);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* CATALOGUE LIST */}
          <h2 className="serif-title mb-15">Current Storefront Catalogue ({products.length} Products)</h2>
          <div className="admin-product-cards-grid">
            {products.map((p) => (
              <div key={p.id} className="admin-product-card glass-panel">
                <div className="admin-product-header">
                  <div className="admin-card-lead">
                    {(p.image_url || (p.images && p.images[0])) && (
                      <img
                        src={p.image_url || (p.images && p.images[0])}
                        alt={p.name}
                        className="admin-product-cover-thumb"
                      />
                    )}
                    <div>
                      <span className="product-category-tag">{p.category}</span>
                      <h3 className="admin-card-title">{p.name}</h3>
                      <div className="muted text-xs">
                        Slug: <code>/products/{p.slug}</code> • Shape: <strong>{p.shape}</strong>
                        {Array.isArray(p.images) && p.images.length > 1 && (
                          <span className="badge-thumb-count ml-8">📷 {p.images.length} photos</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="admin-card-badges">
                    {p.badge && <span className="luxury-badge">{p.badge}</span>}
                    {p.active ? (
                      <span className="badge-available">Live</span>
                    ) : (
                      <span className="badge-instant">Draft</span>
                    )}
                  </div>
                </div>

                <div className="admin-card-specs">
                  <div>
                    <span className="muted text-xs block">Selling Price:</span>
                    <strong className="current-price">{formatINR(p.price)}</strong>
                    {p.compare_at && (
                      <span className="original-price ml-10">{formatINR(p.compare_at)}</span>
                    )}
                  </div>
                  <div>
                    <span className="muted text-xs block">Dimensions:</span>
                    <span className="text-xs font-bold">{p.dimensions || "24 × 36 inches"}</span>
                  </div>
                  <div>
                    <span className="muted text-xs block">Lighting:</span>
                    <span className="text-xs">{p.led ? "✨ LED Active" : "Non-LED"}</span>
                  </div>
                </div>

                <p className="admin-card-desc truncate-2">{p.description}</p>

                <div className="admin-card-actions">
                  <button className="btn secondary btn-sm" onClick={() => startEdit(p)}>
                    ✏️ Edit Specs
                  </button>
                  <button
                    className="btn secondary btn-sm text-danger"
                    onClick={() => handleDeleteProduct(p.id, p.name)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ORDER DETAIL SLIP MODAL */}
      {selectedOrder && (
        <div className="order-modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <div>
                <span className="eyebrow-luxury">ATELIER DISPATCH MANIFEST</span>
                <h2 className="serif-title mb-0">{selectedOrder.order_number}</h2>
                <span className="muted text-xs">
                  Placed on {new Date(selectedOrder.created_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short" })}
                </span>
              </div>
              <button
                className="order-modal-close"
                onClick={() => setSelectedOrder(null)}
                aria-label="Close manifest"
              >
                ✕
              </button>
            </div>

            <div className="order-modal-grid">
              <div className="order-info-tile">
                <h4>Customer Contact</h4>
                <p className="font-semibold text-base">{selectedOrder.customer_name}</p>
                <p className="text-sm mt-6">
                  <a href={`tel:${selectedOrder.phone}`} className="phone-link">📞 {selectedOrder.phone}</a>
                </p>
                {selectedOrder.email && (
                  <p className="text-sm mt-4">
                    <a href={`mailto:${selectedOrder.email}`}>✉️ {selectedOrder.email}</a>
                  </p>
                )}
              </div>

              <div className="order-info-tile">
                <h4>📍 Complete Shipping Destination</h4>
                <p className="font-semibold text-base">{selectedOrder.address}</p>
                <p className="text-sm mt-4">
                  {selectedOrder.city}{selectedOrder.state ? `, ${selectedOrder.state}` : ""} — <strong>{selectedOrder.pincode}</strong>
                </p>
                {selectedOrder.notes && (
                  <div className="order-notes-chip mt-8">
                    <strong>Delivery Notes:</strong> {selectedOrder.notes}
                  </div>
                )}
                <button
                  type="button"
                  className="btn secondary btn-sm mt-12"
                  onClick={() => copyAddress(selectedOrder)}
                >
                  {copiedId === selectedOrder.order_number ? "✓ Address Copied!" : "📋 Copy Shipping Address for Crate"}
                </button>
              </div>
            </div>

            <div className="order-info-tile mb-20">
              <h4>Ordered Mirror Items ({selectedOrder.items?.length || 0})</h4>
              <div className="items-list mt-8">
                {(selectedOrder.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex-between py-8 border-b border-line text-sm">
                    <span>{item.name} × <strong>{item.quantity}</strong></span>
                    <strong className="font-semibold">{formatINR((item.unit_price || item.price || 0) * item.quantity)}</strong>
                  </div>
                ))}
                <div className="flex-between pt-12 text-base font-bold">
                  <span>Total Order Value:</span>
                  <span className="current-price">{formatINR(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            <div className="flex-between items-center bg-surface p-16 rounded border border-line">
              <div>
                <span className="muted text-xs block">Payment Method & Status:</span>
                <strong>{selectedOrder.payment_method.toUpperCase()}</strong> •{" "}
                <span className={selectedOrder.payment_status === "paid" ? "text-success font-bold" : "muted"}>
                  {selectedOrder.payment_status.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="muted text-xs block mb-4">Update Order Status:</span>
                <select
                  value={selectedOrder.order_status}
                  onChange={(e) => {
                    changeOrderStatus(selectedOrder.order_number, e.target.value);
                    setSelectedOrder({ ...selectedOrder, order_status: e.target.value });
                  }}
                  className="luxury-select text-sm"
                >
                  {[
                    "new",
                    "confirmed",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                    "payment_setup_error",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTable({
  orders,
  changeStatus,
  onSelectOrder,
  onCopyAddress,
  copiedId,
}: {
  orders: Order[];
  changeStatus: (id: string, status: string) => void;
  onSelectOrder: (order: Order) => void;
  onCopyAddress: (order: Order) => void;
  copiedId: string | null;
}) {
  if (!orders.length) return <div className="notice p-25 text-center">No customer orders recorded yet.</div>;

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", minWidth: 980, borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "var(--cream-surface)" }}>
            {[
              "Order ID / Date",
              "Customer Contact",
              "📍 Delivery Destination (Address)",
              "Items Purchased",
              "Total Amount",
              "Payment",
              "Status / Action",
            ].map((x) => (
              <th key={x} style={{ textAlign: "left", padding: 12, borderBottom: "1.5px solid var(--line)" }}>
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.order_number}>
              <td style={{ padding: 12, borderBottom: "1px solid var(--line)", verticalAlign: "top" }}>
                <strong>{o.order_number}</strong>
                <div className="muted text-xs mt-2">
                  {new Date(o.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </td>
              <td style={{ padding: 12, borderBottom: "1px solid var(--line)", verticalAlign: "top" }}>
                <strong>{o.customer_name}</strong>
                <div className="mt-2">
                  <a href={`tel:${o.phone}`} style={{ color: "var(--primary)", fontWeight: 600 }}>📞 {o.phone}</a>
                </div>
                {o.email && (
                  <div className="muted text-xs mt-2">
                    <a href={`mailto:${o.email}`}>✉️ {o.email}</a>
                  </div>
                )}
              </td>
              <td style={{ padding: 12, borderBottom: "1px solid var(--line)", verticalAlign: "top" }}>
                <div className="order-shipping-card">
                  <div className="shipping-address-text">
                    📍 {o.address}
                  </div>
                  <div className="shipping-city-state mt-4">
                    <strong>{o.city}</strong>{o.state ? `, ${o.state}` : ""} — <span className="font-semibold">{o.pincode}</span>
                  </div>
                  {o.notes && (
                    <div className="order-notes-chip mt-6">
                      <strong>Note:</strong> {o.notes}
                    </div>
                  )}
                  <button
                    type="button"
                    className="shipping-copy-btn"
                    onClick={() => onCopyAddress(o)}
                  >
                    {copiedId === o.order_number ? "✓ Copied!" : "📋 Copy Shipping Address"}
                  </button>
                </div>
              </td>
              <td style={{ padding: 12, borderBottom: "1px solid var(--line)", verticalAlign: "top" }}>
                {(o.items || []).map((i: any, idx: number) => (
                  <div key={idx} className="text-xs mb-2">
                    {i.name} × <strong>{i.quantity}</strong>
                  </div>
                ))}
              </td>
              <td style={{ padding: 12, borderBottom: "1px solid var(--line)", fontWeight: 700, verticalAlign: "top" }}>
                {formatINR(o.total_amount)}
              </td>
              <td style={{ padding: 12, borderBottom: "1px solid var(--line)", verticalAlign: "top" }}>
                <span className="badge">{o.payment_method.toUpperCase()}</span>
                <div className="muted text-xs mt-4">{o.payment_status}</div>
              </td>
              <td style={{ padding: 12, borderBottom: "1px solid var(--line)", verticalAlign: "top" }}>
                <select
                  value={o.order_status}
                  onChange={(e) => changeStatus(o.order_number, e.target.value)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "4px",
                    border: "1px solid var(--line)",
                    fontSize: "12px",
                    fontWeight: 600,
                    width: "100%",
                  }}
                >
                  {[
                    "new",
                    "confirmed",
                    "processing",
                    "shipped",
                    "delivered",
                    "cancelled",
                    "payment_setup_error",
                  ].map((s) => (
                    <option key={s} value={s}>
                      {s.toUpperCase()}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="btn secondary btn-sm mt-8 w-100"
                  onClick={() => onSelectOrder(o)}
                  style={{ fontSize: "11px", padding: "4px 8px" }}
                >
                  👁️ View Full Slip
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
