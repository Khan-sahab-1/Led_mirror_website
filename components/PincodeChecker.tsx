"use client";

import { useState, useEffect } from "react";

export default function PincodeChecker() {
  const [pincode, setPincode] = useState("");
  const [status, setStatus] = useState<null | {
    isHyd: boolean;
    pin: string;
    message: string;
  }>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("glassstudio-user-pincode");
      if (saved && /^\d{6}$/.test(saved)) {
        setPincode(saved);
        checkPin(saved);
      }
    } catch {}
  }, []);

  const checkPin = (pinStr: string) => {
    const clean = pinStr.trim().replace(/\D/g, "");
    if (clean.length !== 6) return;

    try {
      localStorage.setItem("glassstudio-user-pincode", clean);
    } catch {}

    const isHyd = clean.startsWith("500") || clean.startsWith("501") || clean.startsWith("502");
    if (isHyd) {
      setStatus({
        isHyd: true,
        pin: clean,
        message: "Free 24–48H Express Delivery + Free Wall Installation in Hyderabad Included!",
      });
    } else {
      setStatus({
        isHyd: false,
        pin: clean,
        message: "Standard Delivery in 3–5 Days • Armored wooden crate with 100% transit insurance.",
      });
    }
  };

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    checkPin(pincode);
  };

  return (
    <div className="pincode-checker-card glass-panel mb-25">
      <div className="pincode-header-row">
        <span className="pincode-icon">📍</span>
        <span className="pincode-title">Check Delivery &amp; Free Installation</span>
      </div>

      <form className="pincode-form" onSubmit={handleCheck}>
        <input
          type="text"
          maxLength={6}
          placeholder="Enter 6-digit Pincode (e.g. 500033)"
          className="pincode-input"
          value={pincode}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPincode(val);
            if (val.length === 6) checkPin(val);
          }}
        />
        <button type="submit" className="pincode-check-btn">
          Check
        </button>
      </form>

      {status && (
        <div
          className={`pincode-result-box ${status.isHyd ? "hyd-success" : "india-success"}`}
        >
          {status.isHyd ? (
            <div>
              <div className="pincode-badge-success">
                <span>🎉</span> <strong>PIN {status.pin}: HYDERABAD VIP ELIGIBLE</strong>
              </div>
              <ul className="pincode-perks-bullets">
                <li>🚚 <strong>Express Delivery:</strong> Within 24–48 Hours</li>
                <li>🛠️ <strong>Free Wall Installation:</strong> Certified technician included (Save ₹1,499)</li>
                <li>💵 <strong>Payment:</strong> Cash on Delivery (COD) supported</li>
              </ul>
            </div>
          ) : (
            <div>
              <div className="pincode-badge-normal">
                <span>✓</span> <strong>PIN {status.pin}: Deliverable Across India</strong>
              </div>
              <p className="text-xs mt-4 mb-0">
                {status.message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

