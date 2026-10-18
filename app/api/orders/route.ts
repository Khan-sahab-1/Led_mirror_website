import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { validateItems } from "@/lib/orders";
import Razorpay from "razorpay";
import crypto from "crypto";

export const runtime = "nodejs";

function cleanText(value: unknown, max=300) {
  return String(value ?? "").trim().slice(0,max);
}

export async function POST(request: Request) {
  let insertedOrderId: string | null = null;
  try {
    const body = await request.json();
    const customer = body?.customer || {};
    const paymentMethod = body?.paymentMethod;
    if (!["cod","razorpay"].includes(paymentMethod)) return NextResponse.json({error:"Invalid payment method."},{status:400});
    const name=cleanText(customer.name,100), phone=cleanText(customer.phone,20).replace(/\D/g,"");
    const email=cleanText(customer.email,150), address=cleanText(customer.address,500), city=cleanText(customer.city,100), state=cleanText(customer.state,100), pincode=cleanText(customer.pincode,10), notes=cleanText(customer.notes,500);
    if (!name || !/^[6-9]\d{9}$/.test(phone) || !address || !city || !state || !/^\d{6}$/.test(pincode)) return NextResponse.json({error:"Please provide valid customer and delivery details."},{status:400});
    const {items,total}=await validateItems(body.items);
    const supabase=getSupabaseAdmin();
    const orderId=`GS-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const orderItems=items.map(({product,quantity})=>({product_id:product.id,name:product.name,quantity,unit_price:product.price,line_total:product.price*quantity}));
    const userId = typeof body?.userId === "string" && body.userId.trim() ? body.userId.trim() : null;
    const {error:insertError}=await supabase.from("orders").insert({
      order_number:orderId,customer_name:name,phone,email:email||null,user_id:userId,address,city,state,pincode,notes:notes||null,
      payment_method:paymentMethod,payment_status:"pending",order_status:"new",total_amount:total,currency:"INR",items:orderItems
    });
    if (insertError) {
      console.error("[POST /api/orders] Failed to insert order into Supabase:", insertError);
      throw new Error(`Could not save order: ${insertError.message || "Check Supabase schema and environment variables."}`);
    }
    insertedOrderId=orderId;

    // Automatically save / update address for future 1-click auto-fill
    if (userId || email) {
      try {
        let dupQuery = supabase
          .from("customer_addresses")
          .select("id")
          .eq("address", address)
          .eq("pincode", pincode);
        if (userId) dupQuery = dupQuery.eq("user_id", userId);
        else dupQuery = dupQuery.ilike("email", email);

        const { data: existingAddr } = await dupQuery.maybeSingle();

        if (existingAddr?.id) {
          await supabase
            .from("customer_addresses")
            .update({
              name,
              phone,
              city,
              state,
              is_default: true,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingAddr.id);
        } else {
          if (userId) {
            await supabase.from("customer_addresses").update({ is_default: false }).eq("user_id", userId);
          } else if (email) {
            await supabase.from("customer_addresses").update({ is_default: false }).ilike("email", email);
          }
          await supabase.from("customer_addresses").insert({
            user_id: userId,
            email: email || null,
            name,
            phone,
            address,
            city,
            state,
            pincode,
            label: "Home",
            is_default: true,
          });
        }
      } catch (addrErr) {
        console.warn("[POST /api/orders] Non-fatal address sync warning:", addrErr);
      }
    }

    if(paymentMethod==="cod") return NextResponse.json({orderId,paymentMethod:"cod"});

    if(!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) throw new Error("Online payment is not configured yet. Please choose COD.");
    const razorpay=new Razorpay({key_id:process.env.RAZORPAY_KEY_ID,key_secret:process.env.RAZORPAY_KEY_SECRET});
    const rzOrder=await razorpay.orders.create({amount:total*100,currency:"INR",receipt:orderId,notes:{glassstudio_order_id:orderId}});
    const {error:updateError}=await supabase.from("orders").update({razorpay_order_id:rzOrder.id}).eq("order_number",orderId);
    if(updateError) {
      console.error("[POST /api/orders] Failed to link Razorpay order ID:", updateError);
      throw new Error("Could not link payment order.");
    }
    return NextResponse.json({orderId,razorpayOrderId:rzOrder.id,amount:rzOrder.amount,currency:rzOrder.currency,keyId:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID});
  } catch(error:any) {
    console.error("[POST /api/orders] Error:", error);
    if(insertedOrderId) {
      try { const supabase=getSupabaseAdmin(); await supabase.from("orders").update({order_status:"payment_setup_error"}).eq("order_number",insertedOrderId).eq("payment_status","pending"); } catch {}
    }
    return NextResponse.json({error:error.message||"Unexpected server error."},{status:500});
  }
}
