"use client";

import { useState } from "react";

export default function HyderabadPerks() {
  const [pincode, setPincode] = useState("");
  const [checked, setChecked] = useState(false);
  const [isHyderabad, setIsHyderabad] = useState(true);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincode.trim().replace(/\D/g, "");
    if (clean.length < 3) return;
    
    // 500xxx is Hyderabad / Secunderabad / Telangana
    if (clean.startsWith("500") || clean.startsWith("501") || clean.startsWith("502")) {
      setIsHyderabad(true);
    } else {
      setIsHyderabad(false);
    }
    setChecked(true);
  };

  return (
    <div className="hyderabad-perks-container glass-panel">
      <div className="hyderabad-perks-header">
        <div className="hyderabad-badge-pill">
          <span className="live-dot" /> 📍 HYDERABAD & SECUNDERABAD EXCLUSIVE ATELIER
        </div>
        <h3 className="serif-title text-xl mb-6">
          100% Free Express Delivery & Free White-Glove Installation
        </h3>
        <p className="muted text-sm max-w-xl">
          Order any handcrafted LED or architectural mirror today. Our certified technicians will safely deliver 
          in armored wooden crating, unbox, and professionally wall-mount it with heavy-duty French-cleats on your bathroom or living room wall — <strong>completely free of cost</strong>.
        </p>
      </div>

      <div className="hyderabad-perks-grid mt-20">
        <div className="perk-card">
          <div className="perk-icon">🚚</div>
          <div className="perk-body">
            <strong>Free 24–48H Delivery</strong>
            <span className="text-xs muted block">Dispatched from our Hyderabad central hub</span>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon">🛠️</div>
          <div className="perk-body">
            <strong>Free Wall Installation</strong>
            <span className="text-xs muted block">Certified technician mounts it with laser precision (Save ₹1,499)</span>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon">💵</div>
          <div className="perk-body">
            <strong>Pay After Doorstep Check</strong>
            <span className="text-xs muted block">Inspect glass clarity & lights before paying via Cash / UPI</span>
          </div>
        </div>

        <div className="perk-card">
          <div className="perk-icon">🛡️</div>
          <div className="perk-body">
            <strong>5-Year Replacement Warranty</strong>
            <span className="text-xs muted block">Saint-Gobain glass & waterproof LED driver covered</span>
          </div>
        </div>
      </div>

      {/* Pincode Availability Checker */}
      <div className="pincode-checker-box mt-20">
        <form onSubmit={handleCheck} className="flex gap-8 items-center flex-wrap">
          <div className="pincode-input-wrap flex-1">
            <span className="pincode-icon">📍</span>
            <input
              type="text"
              maxLength={6}
              placeholder="Enter your PIN code (e.g. 500034, 500081...)"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value);
                setChecked(false);
              }}
              className="pincode-field"
            />
          </div>
          <button type="submit" className="btn btn-luxury btn-sm">
            Check Free Installation
          </button>
        </form>

        {checked && (
          <div className={`pincode-result-banner mt-12 ${isHyderabad ? "success" : "all-india"}`}>
            {isHyderabad ? (
              <div>
                <span className="font-bold text-sm">🎉 Congratulations! PIN Code {pincode} qualifies for:</span>
                <ul className="text-xs mt-4 space-y-1">
                  <li>✓ <strong>100% FREE Express Doorstep Delivery</strong> within 24–48 hours</li>
                  <li>✓ <strong>100% FREE Professional Wall Installation & Drill Fitting</strong> (Zero extra charges)</li>
                  <li>✓ <strong>Cash on Delivery (COD)</strong> with Open-Box Quality Verification</li>
                </ul>
              </div>
            ) : (
              <div>
                <span className="font-bold text-sm">✓ Nationwide Delivery Available for PIN {pincode}:</span>
                <span className="text-xs block mt-2 text-muted">
                  Free insured wooden-crate delivery across India with pre-installed French-cleat brackets. Full doorstep breakage insurance included!
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hyderabad-areas-tagline mt-15">
        <span className="text-xxs muted">
          Serving: Jubilee Hills • Banjara Hills • Gachibowli • Hitec City • Madhapur • Kondapur • Kukatpally • Begumpet • Secunderabad • Miyapur • Manikonda & all 500xxx PIN codes.
        </span>
      </div>
    </div>
  );
}
