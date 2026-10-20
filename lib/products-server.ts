import { createClient } from "@supabase/supabase-js";
import { Product, products, normalizeProduct } from "./products";

export async function getStoreProducts(): Promise<Product[]> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) return products;

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return products;
    }

    return data.map(normalizeProduct);
  } catch (err) {
    console.warn("Failed to fetch products from Supabase, using fallback:", err);
    return products;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return products.find((p) => p.slug === slug) || null;
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error || !data) {
      return products.find((p) => p.slug === slug) || null;
    }

    return normalizeProduct(data);
  } catch (err) {
    console.warn("Failed to fetch product by slug from Supabase, using fallback:", err);
    return products.find((p) => p.slug === slug) || null;
  }
}
