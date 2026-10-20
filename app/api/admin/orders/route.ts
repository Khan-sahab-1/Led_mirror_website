import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      console.error("[GET /api/admin/orders] Supabase error:", error);
      throw error;
    }

    return NextResponse.json({ orders: data || [] });
  } catch (err: any) {
    console.error("[GET /api/admin/orders] Catch:", err);
    return NextResponse.json(
      { error: err?.message || "Could not load orders. Check Supabase schema and environment." },
      { status: 500 }
    );
  }
}
