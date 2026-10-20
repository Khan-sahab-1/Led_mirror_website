"use client";

import { useState, useMemo, useEffect } from "react";
import { products as fallbackProducts, Product } from "@/lib/products";
import ProductCard from "./ProductCard";

export default function ShopCatalog({
  initialProducts,
}: {
  initialProducts?: Product[];
}) {
  const [productsList, setProductsList] = useState<Product[]>(
    initialProducts || fallbackProducts
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
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
    { id: "arch", label: "Arch & Capsule" },
    { id: "round", label: "Round & Halo" },
    { id: "full", label: "Full Length Body" },
    { id: "organic", label: "Organic Pebble" },
  ];

  const filtered = useMemo(() => {
    let list = [...productsList];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.shape?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.dimensions?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (selectedCategory === "led") {
      list = list.filter((p) => p.led);
    } else if (selectedCategory === "arch") {
      list = list.filter((p) => p.shape === "arch" || p.name.toLowerCase().includes("arch"));
    } else if (selectedCategory === "round") {
      list = list.filter((p) => p.shape === "round" || p.name.toLowerCase().includes("round") || p.name.toLowerCase().includes("halo"));
    } else if (selectedCategory === "full") {
      list = list.filter((p) => p.shape === "full" || p.name.toLowerCase().includes("full") || p.category.toLowerCase().includes("full"));
    } else if (selectedCategory === "organic") {
      list = list.filter((p) => p.shape === "organic" || p.shape === "irregular" || p.name.toLowerCase().includes("pebble") || p.name.toLowerCase().includes("organic"));
    }

    // Sorting
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [productsList, selectedCategory, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("featured");
  };

  return (
    <div className="shop-catalog-section" id="shop">
      {/* Modern Search & Filter Toolbar */}
      <div className="catalog-toolbar-container">
        {/* Search Bar */}
        <div className="catalog-search-wrapper">
          <svg
            className="search-input-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            id="catalog-search"
            type="search"
            className="catalog-search-input"
            placeholder="Search by shape (e.g. Arch, Round), LED, or size..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter pills & Sorting */}
        <div className="catalog-controls-row">
          <div className="filter-pills-row">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`catalog-filter-pill ${
                  selectedCategory === c.id ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="sort-selector-wrapper">
            <label htmlFor="catalog-sort" className="muted text-xs">
              Sort:
            </label>
            <select
              id="catalog-sort"
              className="luxury-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="featured">Best Sellers &amp; Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="product-results-header flex-between items-center mb-20">
        <div className="product-results-count">
          Showing <strong>{filtered.length}</strong> mirror designs
          {(selectedCategory !== "all" || searchQuery) && (
            <button
              type="button"
              className="clear-all-filter-btn"
              onClick={resetFilters}
            >
              Clear filters ✕
            </button>
          )}
        </div>

        <div className="catalog-free-perk-hint hide-mobile">
          <span>⚡ All mirrors include <strong>Free Express Hyderabad Delivery &amp; Fitting</strong></span>
        </div>
      </div>

      {/* Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="catalog-empty-state glass-panel text-center">
          <div className="empty-state-icon">🪞</div>
          <h3 className="empty-state-title">No mirrors matched your search</h3>
          <p className="muted text-sm max-w-400 m-auto mt-6">
            Try adjusting your search keywords or explore our complete handcrafted mirror collection.
          </p>
          <button
            type="button"
            className="btn btn-luxury mt-16"
            onClick={resetFilters}
          >
            View All Mirrors
          </button>
        </div>
      ) : (
        <div className="luxury-product-grid">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
