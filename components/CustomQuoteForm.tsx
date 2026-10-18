"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function CustomQuoteForm() {
  const { user, displayName } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    shape: "Arched",
    lighting: "Backlit Dual-Tone LED",
    width: "",
    height: "",
    finish: "5mm Saint-Gobain Diamond Bevel",
    notes: "",
  });
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || displayName || "",
      }));
    }
  }, [user, displayName]);

  function update(key: string, value: string) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.width || !form.height) {
      setError("Please fill in your name, mobile number and approximate dimensions.");
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    const msg = `Hello GlassStudio Atelier, I would like a custom mirror consultation.%0A%0A✦ *Client:* ${encodeURIComponent(
      form.name
    )}%0A✦ *Mobile:* ${encodeURIComponent(cleanPhone)}%0A✦ *Shape:* ${encodeURIComponent(
      form.shape
    )}%0A✦ *Dimensions:* ${encodeURIComponent(form.width)} × ${encodeURIComponent(
      form.height
    )}%0A✦ *Lighting:* ${encodeURIComponent(form.lighting)}%0A✦ *Glass Finish:* ${encodeURIComponent(
      form.finish
    )}%0A✦ *Special Notes:* ${encodeURIComponent(form.notes || "None")}`;

    window.open(`https://wa.me/91 9266472817?text=${msg}`, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  }

  return (
    <form className="custom-quote-card glass-panel" onSubmit={submit}>
      <div className="quote-intro-block">
        <span className="eyebrow-luxury">BESPOKE GLASS CRAFT</span>
        <h2 className="serif-heading mt-6">Design Your Custom Silhouette</h2>
        <p className="muted text-sm max-w-500">
          Our studio fabricates mirrors to any millimeter specification with CAD drawings provided prior to cutting.
        </p>
      </div>

      <div className="form-grid mt-20">
        <div className="field">
          <label>Full Name *</label>
          <input
            required
            placeholder="e.g. Vikramaditya Singhania"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>

        <div className="field">
          <label>Mobile Number (WhatsApp) *</label>
          <input
            required
            type="tel"
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
          />
        </div>

        <div className="field">
          <label>Mirror Shape</label>
          <select value={form.shape} onChange={(e) => update("shape", e.target.value)}>
            <option value="Arched">Arched Top (Contemporary Classic)</option>
            <option value="Round">Round / Circular (Beveled Edge)</option>
            <option value="Capsule">Capsule / Stadium Oval</option>
            <option value="Rectangle">Clean Rectangle / Square</option>
            <option value="Organic">Organic Asymmetrical Silhouette</option>
            <option value="Full-Length">Full-Length Architectural Dressing</option>
          </select>
        </div>

        <div className="field">
          <label>Lighting Configuration</label>
          <select value={form.lighting} onChange={(e) => update("lighting", e.target.value)}>
            <option value="Backlit Dual-Tone LED">Backlit Ambient Aura (Warm + Cool LED)</option>
            <option value="Front Light Frosted Strip">Front-Facing Sandblasted Light Border</option>
            <option value="Dual Light (Front + Back)">Dual Lighting (Ultimate Luxury)</option>
            <option value="Non-LED Minimalist">Non-LED Pure Mirror (Zero Electricals)</option>
          </select>
        </div>

        <div className="field">
          <label>Width (Inches or Millimeters) *</label>
          <input
            required
            placeholder="e.g. 24 inches or 600 mm"
            value={form.width}
            onChange={(e) => update("width", e.target.value)}
          />
        </div>

        <div className="field">
          <label>Height (Inches or Millimeters) *</label>
          <input
            required
            placeholder="e.g. 48 inches or 1200 mm"
            value={form.height}
            onChange={(e) => update("height", e.target.value)}
          />
        </div>

        <div className="field full">
          <label>Edge & Frame Finish</label>
          <select value={form.finish} onChange={(e) => update("finish", e.target.value)}>
            <option value="5mm Saint-Gobain Diamond Bevel">5mm Saint-Gobain Frameless with Diamond Polish Edge</option>
            <option value="Brushed Brass Gold Metal Frame">Brushed Brass Gold Aluminum Frame (Slim 10mm)</option>
            <option value="Matte Black Anodized Frame">Matte Black Anodized Aluminum Frame</option>
            <option value="Fluted Glass Border">Artisanal Fluted Textured Glass Border</option>
          </select>
        </div>

        <div className="field full">
          <label>Additional Notes / Touch Sensor / Installation City</label>
          <textarea
            rows={3}
            placeholder="e.g. Need sensor on bottom right; wall is marble tiles; destination Bengaluru."
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </div>
      </div>

      <div className="quote-action-row mt-20">
        <button type="submit" className="btn btn-luxury btn-large w-100">
          Send Specification to Master Craftsman on WhatsApp →
        </button>
      </div>

      {error && <div className="alert-error mt-12" role="alert">{error}</div>}
      {submitted && (
        <div className="alert-success mt-12" role="status">
          ✓ WhatsApp opened with your custom specifications. Our atelier will prepare your 3D quote shortly!
        </div>
      )}
    </form>
  );
}
