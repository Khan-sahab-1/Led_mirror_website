export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "LED Mirror" | "Wall Mirror" | "Full-Length Mirror" | string;
  price: number;
  compareAt?: number | null;
  compare_at?: number | null;
  description: string;
  shape: "arch" | "round" | "rect" | "full" | string;
  led?: boolean;
  badge?: string | null;
  dimensions?: string | null;
  glass_specs?: string | null;
  mounting?: string | null;
  lighting_specs?: string | null;
  warranty?: string | null;
  image_url?: string | null;
  images?: string[];
  active?: boolean;
  created_at?: string;
};

export const products: Product[] = [
  {
    id: "mirror-001",
    slug: "halo-led-arch-mirror",
    name: "Halo Arch LED Mirror",
    category: "LED Mirror",
    price: 8999,
    compareAt: 10999,
    compare_at: 10999,
    description: "Arch-top mirror with a soft LED glow for modern bathrooms and dressing areas.",
    shape: "arch",
    led: true,
    badge: "Bestseller",
    dimensions: "24 × 36 inches",
    glass_specs: "5mm Saint-Gobain Float Glass with Shatterproof Vinyl",
    mounting: "Heavy-Duty French Cleat Wall Mount Included",
    lighting_specs: "3000K-6000K Tri-Color LED with Touch Dimmer",
    warranty: "5-Year Replacement Warranty on Frame & LED",
    image_url: "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/71o7kcfdael-_sx679_-1791649153012-8wzuy.jpg",
    images: [
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/71o7kcfdael-_sx679_-1791649153012-8wzuy.jpg",
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/71tfqnfgbvl-_sx679_-1791649153693-fgmty.jpg",
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/71x-p99m-fl-_sx679_-1791649154096-wciy5.jpg",
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/41-cmplsryl-_ss100_-1791649154403-vay05.jpg",
    ],
    active: true,
  },
  {
    id: "mirror-002",
    slug: "luna-round-wall-mirror",
    name: "Luna Round Wall Mirror",
    category: "Wall Mirror",
    price: 2500,
    compareAt: 4499,
    compare_at: 4499,
    description: "A minimal round mirror that adds light and visual space to your room.",
    shape: "round",
    led: false,
    badge: "Minimalist",
    dimensions: "30 inch Diameter (Round)",
    glass_specs: "5mm Saint-Gobain High-Clarity Beveled Float Glass",
    mounting: "Dual Precision Keyhole Brackets Included",
    lighting_specs: "Natural Optical Reflection (Ambient)",
    warranty: "5-Year Moisture & Rust Resistance Warranty",
    image_url: "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/luna-frameless-anti-fog-dimmable-led-bat-1791649583477-gsn6f.jpg",
    images: [
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/luna-frameless-anti-fog-dimmable-led-bat-1791649583477-gsn6f.jpg",
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/luna-800mm-frameless-anti-fog-dimmable-l-1791649653124-ocm3w.webp",
    ],
    active: true,
  },
  {
    id: "mirror-003",
    slug: "linea-rectangle-led-mirror",
    name: "Linea Rectangle LED Mirror",
    category: "LED Mirror",
    price: 2000,
    compareAt: 8999,
    compare_at: 8999,
    description: "Clean rectangular design with integrated LED lighting for contemporary interiors.",
    shape: "rect",
    led: true,
    badge: "New",
    dimensions: "24 × 48 inches",
    glass_specs: "5mm Saint-Gobain Distortion-Free Glass with Beveled Edges",
    mounting: "Horizontal & Vertical Heavy-Duty French Cleat Included",
    lighting_specs: "Circadian Warm-to-Cool Backlight Strip (CRI 95+)",
    warranty: "5-Year Full Replacement Guarantee",
    image_url: "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/images-1791649800713-56at0.jpeg",
    images: [
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/images-1791649800713-56at0.jpeg",
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/images--1--1791649802043-wwl6t.jpeg",
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/images--2--1791649802405-nz76f.jpeg",
    ],
    active: true,
  },
  {
    id: "mirror-004",
    slug: "full-length-dressing-mirror",
    name: "Full-Length Dressing Mirror",
    category: "Full-Length Mirror",
    price: 5999,
    compareAt: 7999,
    compare_at: 7999,
    description: "A tall mirror for bedrooms, wardrobes and dressing corners.",
    shape: "full",
    led: false,
    badge: "Wardrobe Must",
    dimensions: "20 × 66 inches (Full Height)",
    glass_specs: "5mm Architectural Float Glass with Copper-Free Backing",
    mounting: "Free-standing Kickstand + Anti-Tip Wall Anchor Kit",
    lighting_specs: "True-to-Life Natural Reflection",
    warranty: "5-Year Structural Frame Warranty",
    image_url: "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/special-room-mirror-design-1791649947811-06chy.jpeg",
    images: [
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/special-room-mirror-design-1791649947811-06chy.jpeg",
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/-decorac-a-o-1791649945481-xsjj7.jpeg",
    ],
    active: true,
  },
  {
    id: "mirror-005",
    slug: "arcade-decor-wall-mirror",
    name: "Arcade Decorative Mirror",
    category: "Wall Mirror",
    price: 4299,
    compareAt: 5499,
    compare_at: 5499,
    description: "A refined arched mirror designed for entryways and accent walls.",
    shape: "arch",
    led: false,
    badge: "Artisanal",
    dimensions: "22 × 34 inches",
    glass_specs: "5mm Saint-Gobain Mirror with Hand-Polished Diamond Edge",
    mounting: "Heavy-Duty Pre-installed Z-Bar Bracket",
    lighting_specs: "Natural Architectural Ambient Reflection",
    warranty: "5-Year Finish & Structural Warranty",
    image_url: "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/shopping--1--1791650119069-ffch1.webp",
    images: [
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/shopping--1--1791650119069-ffch1.webp",
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/shopping-1791650119839-i3cb6.webp",
    ],
    active: true,
  },
  {
    id: "mirror-006",
    slug: "glow-premium-led-mirror",
    name: "Glow Premium LED Mirror",
    category: "LED Mirror",
    price: 3999,
    compareAt: 15999,
    compare_at: 15999,
    description: "A statement LED mirror for premium residential and hospitality interiors.",
    shape: "round",
    led: true,
    badge: "Luxury Atelier",
    dimensions: "36 inch Large Diameter",
    glass_specs: "5mm Ultra-Clear Saint-Gobain Glass with Anti-Fog Heating Pad",
    mounting: "Aircraft-Grade Aluminum Hanging System Included",
    lighting_specs: "Ultra-High Lumens 12V Dual LED Ring with Memory Touch Sensor",
    warranty: "5-Year Comprehensive Electric & Glass Warranty",
    image_url: "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/169-700x700-1791650198204-2rlff.webp",
    images: [
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/169-700x700-1791650198204-2rlff.webp",
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/152bd-700x700-1791650196298-238lc.webp",
      "https://jqkpkjmhqgeltfwqrvnq.supabase.co/storage/v1/object/public/product-images/products/169-700x700--1--1791650197191-4lhb8.webp",
    ],
    active: true,
  },
];

export function normalizeProduct(row: any): Product {
  const compPrice =
    row.compare_at != null
      ? Number(row.compare_at)
      : row.compareAt != null
      ? Number(row.compareAt)
      : null;

  const rawImages: string[] = Array.isArray(row.images)
    ? row.images.filter(Boolean)
    : row.image_url
    ? [row.image_url]
    : [];

  let primaryImg = rawImages[0] || row.image_url || null;

  // Fallback to high-res catalog mirror photo if DB has no image yet!
  if (!primaryImg && row.slug) {
    const fallback = products.find((p) => p.slug === row.slug);
    if (fallback) {
      primaryImg = fallback.image_url || null;
      if (rawImages.length === 0 && fallback.images) {
        rawImages.push(...fallback.images);
      }
    }
  }

  return {
    id: String(row.id),
    slug: String(row.slug),
    name: String(row.name),
    category: String(row.category || "Wall Mirror"),
    price: Number(row.price) || 0,
    compareAt: compPrice,
    compare_at: compPrice,
    description: String(row.description || ""),
    shape: (row.shape || "rect") as Product["shape"],
    led: Boolean(row.led),
    badge: row.badge || null,
    dimensions: row.dimensions || "24 × 36 inches",
    glass_specs: row.glass_specs || "5mm Saint-Gobain Float Glass",
    mounting: row.mounting || "Heavy-Duty French Cleat Included",
    lighting_specs:
      row.lighting_specs ||
      (row.led ? "Warm & Cool LED Dimmer" : "Natural Ambient Reflection"),
    warranty: row.warranty || "5-Year Structural & LED Warranty",
    image_url: primaryImg,
    images: rawImages,
    active: row.active !== false,
    created_at: row.created_at,
  };
}

export function formatINR(amount: number) {
  const num = Math.round(Number(amount) || 0);
  const str = Math.abs(num).toString();
  const lastThree = str.length > 3 ? str.slice(-3) : str;
  const remaining = str.length > 3 ? str.slice(0, -3) : "";
  const formatted =
    remaining !== ""
      ? remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
  return num < 0 ? `-₹${formatted}` : `₹${formatted}`;
}
