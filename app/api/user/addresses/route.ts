import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

function cleanText(val: unknown, max = 200) {
  return String(val ?? "").trim().slice(0, max);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId")?.trim();
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!userId && !email) {
      return NextResponse.json({ error: "userId or email is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("customer_addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("updated_at", { ascending: false });

    if (userId && email) {
      query = query.or(`user_id.eq.${userId},email.ilike.${email}`);
    } else if (userId) {
      query = query.eq("user_id", userId);
    } else if (email) {
      query = query.ilike("email", email);
    }

    const { data, error } = await query;
    if (error) {
      console.error("[GET /api/user/addresses] Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // If no addresses in customer_addresses yet, fallback to check recent orders
    if (!data || data.length === 0) {
      let ordersQuery = supabase
        .from("orders")
        .select("customer_name, phone, email, address, city, state, pincode, created_at")
        .order("created_at", { ascending: false });

      if (userId && email) {
        ordersQuery = ordersQuery.or(`user_id.eq.${userId},email.ilike.${email}`);
      } else if (userId) {
        ordersQuery = ordersQuery.eq("user_id", userId);
      } else if (email) {
        ordersQuery = ordersQuery.ilike("email", email);
      }

      const { data: pastOrders } = await ordersQuery.limit(5);

      if (pastOrders && pastOrders.length > 0) {
        const uniqueAddresses: any[] = [];
        const seen = new Set<string>();

        for (const o of pastOrders) {
          const key = `${o.address}_${o.pincode}`.toLowerCase();
          if (o.address && !seen.has(key)) {
            seen.add(key);
            uniqueAddresses.push({
              user_id: userId || null,
              email: email || o.email || null,
              name: o.customer_name,
              phone: o.phone,
              address: o.address,
              city: o.city,
              state: o.state,
              pincode: o.pincode,
              label: "Home",
              is_default: uniqueAddresses.length === 0,
            });
          }
        }

        if (uniqueAddresses.length > 0) {
          // Persist these into customer_addresses
          const { data: inserted } = await supabase
            .from("customer_addresses")
            .insert(uniqueAddresses)
            .select("*");

          return NextResponse.json({ addresses: inserted || uniqueAddresses });
        }
      }
    }

    return NextResponse.json({ addresses: data || [] });
  } catch (err: any) {
    console.error("[GET /api/user/addresses] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to load addresses." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = cleanText(body.userId, 100) || null;
    const email = cleanText(body.email, 150).toLowerCase() || null;
    const name = cleanText(body.name, 100);
    const phone = cleanText(body.phone, 20).replace(/\D/g, "");
    const address = cleanText(body.address, 500);
    const city = cleanText(body.city, 100);
    const state = cleanText(body.state, 100);
    const pincode = cleanText(body.pincode, 10);
    const label = cleanText(body.label, 50) || "Home";
    const isDefault = Boolean(body.is_default ?? true);
    const id = body.id ? cleanText(body.id, 50) : null;

    if (!name || !phone || !address || !city || !state || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { error: "Please enter a valid complete address, phone, and 6-digit PIN code." },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    // If this address is set as default, reset previous default for this user
    if (isDefault) {
      if (userId) {
        await supabase
          .from("customer_addresses")
          .update({ is_default: false })
          .eq("user_id", userId);
      }
      if (email) {
        await supabase
          .from("customer_addresses")
          .update({ is_default: false })
          .ilike("email", email);
      }
    }

    let result;
    if (id) {
      // Update existing address
      result = await supabase
        .from("customer_addresses")
        .update({
          name,
          phone,
          address,
          city,
          state,
          pincode,
          label,
          is_default: isDefault,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();
    } else {
      // Check if this exact address already exists for user to avoid duplicate spam
      let duplicateQuery = supabase
        .from("customer_addresses")
        .select("id")
        .eq("address", address)
        .eq("pincode", pincode);

      if (userId) duplicateQuery = duplicateQuery.eq("user_id", userId);
      else if (email) duplicateQuery = duplicateQuery.ilike("email", email);

      const { data: existingDup } = await duplicateQuery.maybeSingle();

      if (existingDup?.id) {
        result = await supabase
          .from("customer_addresses")
          .update({
            name,
            phone,
            city,
            state,
            label,
            is_default: isDefault,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingDup.id)
          .select("*")
          .single();
      } else {
        result = await supabase
          .from("customer_addresses")
          .insert({
            user_id: userId,
            email,
            name,
            phone,
            address,
            city,
            state,
            pincode,
            label,
            is_default: isDefault,
          })
          .select("*")
          .single();
      }
    }

    if (result.error) {
      console.error("[POST /api/user/addresses] Supabase error:", result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ address: result.data }, { status: id ? 200 : 201 });
  } catch (err: any) {
    console.error("[POST /api/user/addresses] Error:", err);
    return NextResponse.json({ error: err.message || "Failed to save address." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();

    if (!id) {
      return NextResponse.json({ error: "Address ID is required." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("customer_addresses").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete address." }, { status: 500 });
  }
}

