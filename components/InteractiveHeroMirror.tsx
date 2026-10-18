"use client";

import { useState } from "react";

export default function InteractiveHeroMirror() {
  const [ledOn, setLedOn] = useState(true);
  const [lightColor, setLightColor] = useState<"warm" | "natural" | "cool">("warm");

  const colorStyles = {
    warm: {
      glow: "0 0 45px rgba(245, 185, 95, 0.45), 0 0 100px rgba(245, 185, 95, 0.25)",
      borderGlow: "#f5b95f",
      label: "Warm Amber (3000K)",
    },
    natural: {
      glow: "0 0 45px rgba(255, 230, 180, 0.5), 0 0 100px rgba(255, 230, 180, 0.28)",
      borderGlow: "#ffe6b4",
      label: "Natural Daylight (4000K)",
    },
    cool: {
      glow: "0 0 45px rgba(200, 230, 255, 0.5), 0 0 100px rgba(200, 230, 255, 0.3)",
      borderGlow: "#c8e6ff",
      label: "Pure Cool (6000K)",
    },
  };

  const activeStyle = colorStyles[lightColor];

  return (
    <div className="interactive-hero-stage">
      <div className="hero-mirror-wrapper">
        <div
          className={`hero-interactive-mirror ${ledOn ? "is-illuminated" : "is-off"}`}
          style={{
            boxShadow: ledOn
              ? `${activeStyle.glow}, 25px 35px 50px rgba(18, 35, 27, 0.25), inset 0 0 0 2px rgba(255,255,255,0.7)`
              : "15px 25px 35px rgba(18, 35, 27, 0.15), inset 0 0 0 1px rgba(255,255,255,0.4)",
            borderColor: ledOn ? activeStyle.borderGlow : "#c9c3b4",
          }}
        >
          {/* Inner Mirror Reflection Simulation */}
          <div className="mirror-interior">
            <div className="specular-light-sweep" />
            <div className="mirror-brand-watermark">GLASSSTUDIO</div>

            {/* Simulated Touch Sensor on Glass */}
            <button
              type="button"
              className={`glass-touch-sensor ${ledOn ? "sensor-active" : ""}`}
              onClick={() => setLedOn(!ledOn)}
              title="Click to toggle LED light"
              aria-label="Toggle mirror light"
            >
              <span className="sensor-ring" />
              <span className="sensor-icon">⚡</span>
            </button>
          </div>
        </div>

        {/* Interactive Controls Overlay */}
        <div className="mirror-control-bar glass-panel">
          <div className="control-group">
            <span className="control-label">Light Power:</span>
            <button
              type="button"
              className={`pill-btn ${ledOn ? "active-gold" : ""}`}
              onClick={() => setLedOn(!ledOn)}
            >
              {ledOn ? "● LED ON" : "○ LED OFF"}
            </button>
          </div>

          {ledOn && (
            <div className="control-group">
              <span className="control-label">Kelvin:</span>
              <div className="color-temp-swatches">
                <button
                  type="button"
                  className={`temp-swatch warm ${lightColor === "warm" ? "selected" : ""}`}
                  onClick={() => setLightColor("warm")}
                  title="3000K Warm"
                />
                <button
                  type="button"
                  className={`temp-swatch natural ${lightColor === "natural" ? "selected" : ""}`}
                  onClick={() => setLightColor("natural")}
                  title="4000K Natural"
                />
                <button
                  type="button"
                  className={`temp-swatch cool ${lightColor === "cool" ? "selected" : ""}`}
                  onClick={() => setLightColor("cool")}
                  title="6000K Cool"
                />
              </div>
              <span className="temp-text-hint">{activeStyle.label}</span>
            </div>
          )}
        </div>
      </div>

      <div className="hero-stage-badge">
        <span className="pulse-dot" /> Live Interactive Preview • Tap Mirror Sensor
      </div>
    </div>
  );
}
