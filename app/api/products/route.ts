import { NextResponse } from "next/server";
import { getStoreProducts } from "@/lib/products-server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const products = await getStoreProducts();
    return NextResponse.json(
      { ok: true, products },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

