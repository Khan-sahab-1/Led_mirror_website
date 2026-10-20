import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "NOT_SET";
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const serviceKeyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 12) + "..."
    : "NONE";

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("orders").select("id").limit(1);

    return NextResponse.json({
      connectedSupabaseUrl: url,
      hasServiceKey,
      serviceKeyPrefix,
      ordersTableTest: error
        ? {
            status: "ERROR",
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          }
        : {
            status: "OK",
            foundRows: data?.length || 0,
          },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        connectedSupabaseUrl: url,
        hasServiceKey,
        serviceKeyPrefix,
        thrownException: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}

