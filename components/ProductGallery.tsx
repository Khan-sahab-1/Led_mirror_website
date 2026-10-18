"use client";

import { useState } from "react";

type ProductGalleryProps = {
  images?: string[];
  imageUrl?: string | null;
  name: string;
  shape: string;
  led?: boolean;
  badge?: string | null;
  discount?: number | null;
  glassSpecs?: string | null;
};

export default function ProductGallery({
  images = [],
  imageUrl,
  name,
  shape,
  led,
  badge,
  discount,
  glassSpecs,
}: ProductGalleryProps) {
  const allImages = (Array.isArray(images) && images.length > 0
    ? images.filter(Boolean)
    : (imageUrl ? [imageUrl] : []));

  const [activeIdx, setActiveIdx] = useState(0);
  const currentImage = allImages[activeIdx] || allImages[0] || null;

  return (
    <div className="product-visual-stage glass-panel">
      <div className="visual-stage-badges">
        {badge && <span className="luxury-badge">{badge}</span>}
        {discount && <span className="discount-badge">SAVE {discount}%</span>}
      </div>

      {currentImage ? (
        <div className="product-photo-wrapper">
          <img
            src={currentImage}
            alt={`${name} - View ${activeIdx + 1}`}
            className="product-large-image"
          />
        </div>
      ) : (
        <div className="product-large-mirror-container">
          <div
            className={`large-mirror-silhouette ${shape} ${
              led ? "led-active" : ""
            }`}
          >
            <div className="mirror-glass-reflection" />
            <div className="mirror-specular-edge" />
            <div className="mirror-brand-watermark">GLASSSTUDIO</div>
          </div>
        </div>
      )}

      {/* Multi-image thumbnail carousel */}
      {allImages.length > 1 && (
        <div className="product-thumbnails-strip mt-15">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`product-thumb-pill ${idx === activeIdx ? "active" : ""}`}
              onClick={() => setActiveIdx(idx)}
              aria-label={`View angle ${idx + 1}`}
            >
              <img src={img} alt={`${name} angle ${idx + 1}`} className="thumb-img" />
              {idx === 0 && <span className="thumb-main-tag">Main</span>}
            </button>
          ))}
        </div>
      )}

      <div className="stage-footer-note mt-15">
        <span>✦ {glassSpecs || "Handcrafted 5mm Saint-Gobain Diamond Glass"} • Shatterproof Safety Backing</span>
      </div>
    </div>
  );
}

