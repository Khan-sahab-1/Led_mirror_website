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
    active: true,
  },
  {
    id: "mirror-002",
    slug: "luna-round-wall-mirror",
    name: "Luna Round Wall Mirror",
    category: "Wall Mirror",
    price: 3499,
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
    active: true,
  },
  {
    id: "mirror-003",
    slug: "linea-rectangle-led-mirror",
    name: "Linea Rectangle LED Mirror",
    category: "LED Mirror",
    price: 7499,
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
    active: true,
  },
  {
    id: "mirror-006",
    slug: "glow-premium-led-mirror",
    name: "Glow Premium LED Mirror",
    category: "LED Mirror",
    price: 12499,
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
    active: true,
  },
];

export function normalizeProduct(row: any): Product {
  const compPrice = row.compare_at != null ? Number(row.compare_at) : (row.compareAt != null ? Number(row.compareAt) : null);
  const rawImages = Array.isArray(row.images)
    ? row.images.filter(Boolean)
    : (row.image_url ? [row.image_url] : []);
  const primaryImg = rawImages[0] || row.image_url || null;

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
      lighting_specs: row.lighting_specs || (row.led ? "Warm & Cool LED Dimmer" : "Natural Ambient Reflection"),
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
    const formatted = remaining !== "" ? remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree : lastThree;
    return num < 0 ? `-₹${formatted}` : `₹${formatted}`;
  }

