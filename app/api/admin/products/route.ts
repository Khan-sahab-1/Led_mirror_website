import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

const validCategories = ["LED Mirror", "Wall Mirror", "Full-Length Mirror"];
const validShapes = ["arch", "round", "rect", "full"];

function validateProductInput(body: any) {
  const name = String(body.name || "").trim().slice(0, 160);
  const slug = String(body.slug || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
  const price = Number(body.price);
  const compareAt = body.compare_at || body.compareAt ? Number(body.compare_at || body.compareAt) : null;
  const category = String(body.category || "");
  const shape = String(body.shape || "");
  const badge = String(body.badge || "").trim().slice(0, 50) || null;
  const dimensions = String(body.dimensions || "").trim().slice(0, 100) || "24 × 36 inches";
  const glassSpecs = String(body.glass_specs || body.glassSpecs || "").trim().slice(0, 150) || "5mm Saint-Gobain Float Glass";
  const mounting = String(body.mounting || "").trim().slice(0, 150) || "Heavy-Duty French Cleat Included";
  const lightingSpecs = String(body.lighting_specs || body.lightingSpecs || "").trim().slice(0, 150) || (category === "LED Mirror" ? "Tricolor 3000K–6000K Smart Dimming" : "Non-LED Pure Mirror");
  const warranty = String(body.warranty || "").trim().slice(0, 100) || "5-Year Structural & LED Warranty";
  const description = String(body.description || "").slice(0, 2000);

  // Parse multiple images array + primary image URL
  const rawList: string[] = Array.isArray(body.images)
    ? body.images.map((x: any) => String(x || "").trim()).filter(Boolean)
    : (body.image_url ? [String(body.image_url).trim()] : []);

  const validImages = rawList.filter((u) => u.startsWith("https://") || u.startsWith("/"));
  const primaryImage = validImages[0] || (String(body.image_url || "").trim() || null);

  if (!name || !slug || !Number.isInteger(price) || price < 1 || price > 500000) {
    throw new Error("Please enter a valid product name, slug, and positive price.");
  }

  if (compareAt !== null && (!Number.isInteger(compareAt) || compareAt < price)) {
    throw new Error("Compare-at (MRP) price must be an integer greater than or equal to the selling price.");
  }

  if (!validCategories.includes(category)) {
    throw new Error("Please select a valid category: LED Mirror, Wall Mirror, or Full-Length Mirror.");
  }

  if (!validShapes.includes(shape)) {
    throw new Error("Please select a valid shape: arch, round, rect, or full.");
  }

  if (primaryImage && !primaryImage.startsWith("https://") && !primaryImage.startsWith("/")) {
    throw new Error("Image URL must use HTTPS or be a valid site asset path.");
  }

  const isLed = body.led !== undefined ? Boolean(body.led) : category === "LED Mirror";

  return {
    name,
    slug,
    price,
    compare_at: compareAt,
    category,
    shape,
    badge,
    dimensions,
    glass_specs: glassSpecs,
    mounting,
    lighting_specs: lightingSpecs,
    warranty,
    description,
    image_url: primaryImage,
    images: validImages,
    led: isLed,
    active: body.active !== false,
  };
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(
      { products: data || [] },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: any) {
    console.error("[GET /api/admin/products] Error:", err);
    return NextResponse.json({ error: "Could not load products from Supabase." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = validateProductInput(body);

    const { data, error } = await getSupabaseAdmin()
      .from("products")
      .insert(validated)
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A product with this URL slug already exists. Please choose a unique slug." }, { status: 400 });
      }
      throw error;
    }

    try {
      revalidatePath("/");
      revalidatePath(`/products/${validated.slug}`);
      revalidatePath("/products");
    } catch {}

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Could not create product." }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const validated = validateProductInput(body);

    const { data, error } = await getSupabaseAdmin()
      .from("products")
      .update({ ...validated, updated_at: new Date().toISOString() })
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) throw error;

    try {
      revalidatePath("/");
      revalidatePath(`/products/${validated.slug}`);
      revalidatePath("/products");
    } catch {}

    return NextResponse.json({ product: data });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Could not update product." }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    const { error } = await getSupabaseAdmin()
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    try {
      revalidatePath("/");
      revalidatePath("/products");
    } catch {}

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Could not delete product." }, { status: 400 });
  }
}
