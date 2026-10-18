"use client";

import { useState, useMemo, useEffect } from "react";
import { products as fallbackProducts, Product } from "@/lib/products";
import ProductCard from "./ProductCard";

export default function ShopCatalog({ initialProducts }: { initialProducts?: Product[] }) {
  const [productsList, setProductsList] = useState<Product[]>(initialProducts || fallbackProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc">("featured");

  useEffect(() => {
    let active = true;

    const fetchLatest = () => {
      fetch(`/api/products?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (active && data?.ok && Array.isArray(data.products) && data.products.length > 0) {
            setProductsList(data.products);
          }
        })
        .catch((err) => console.warn("Failed to fetch fresh products:", err));
    };

    fetchLatest();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchLatest();
      }
    };

    window.addEventListener("focus", fetchLatest);
    window.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      window.removeEventListener("focus", fetchLatest);
      window.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const categories = [
    { id: "all", label: "All Mirrors" },
    { id: "led", label: "✨ LED Backlit" },
    { id: "arch", label: "Arched Mirrors" },
    { id: "round", label: "Round Mirrors" },
    { id: "full", label: "Full Length" },
  ];

  const filtered = useMemo(() => {
    let list = [...productsList];

    if (selectedCategory === "led") {
      list = list.filter((p) => p.led);
    } else if (selectedCategory === "arch") {
      list = list.filter((p) => p.shape === "arch");
    } else if (selectedCategory === "round") {
      list = list.filter((p) => p.shape === "round");
    } else if (selectedCategory === "full") {
      list = list.filter((p) => p.shape === "full");
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [productsList, selectedCategory, sortBy]);

  return (
    <div className="shop-catalog-section" id="shop">
      <div className="catalog-toolbar">
        <div className="filter-pills-row">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`catalog-filter-pill ${selectedCategory === c.id ? "active" : ""}`}
              onClick={() => setSelectedCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="sort-selector-wrapper">
          <label htmlFor="catalog-sort" className="muted text-xs">Sort by:</label>
          <select
            id="catalog-sort"
            className="luxury-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="featured">Curated & Bestsellers</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="product-results-count">
        Showing <strong>{filtered.length}</strong> mastercrafted mirror designs
      </div>

      <div className="luxury-product-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
