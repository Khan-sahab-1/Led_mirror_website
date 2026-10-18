import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email")?.trim().toLowerCase();
    const userId = searchParams.get("userId")?.trim();

    if (!email && !userId) {
      return NextResponse.json({ error: "Email or userId is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false });

    if (userId && email) {
      query = query.or(`user_id.eq.${userId},email.ilike.${email}`);
    } else if (userId) {
      query = query.eq("user_id", userId);
    } else if (email) {
      query = query.ilike("email", email);
    }

    const { data: orders, error } = await query.limit(100);

    if (error) {
      console.error("[GET /api/user/orders] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (err: any) {
    console.error("[GET /api/user/orders] Unexpected error:", err);
    return NextResponse.json({ error: err.message || "Failed to load orders." }, { status: 500 });
  }
}

