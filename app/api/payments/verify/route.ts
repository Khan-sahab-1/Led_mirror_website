import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body=await request.json();
    const orderId=String(body.orderId||"");
    const razorpayOrderId=String(body.razorpay_order_id||"");
    const paymentId=String(body.razorpay_payment_id||"");
    const signature=String(body.razorpay_signature||"");
    const secret=process.env.RAZORPAY_KEY_SECRET;
    if(!orderId||!razorpayOrderId||!paymentId||!signature||!secret) return NextResponse.json({error:"Missing payment verification data."},{status:400});
    const expected=crypto.createHmac("sha256",secret).update(`${razorpayOrderId}|${paymentId}`).digest("hex");
    const a=Buffer.from(expected,"hex"), b=Buffer.from(signature,"hex");
    if(a.length!==b.length||!crypto.timingSafeEqual(a,b)) return NextResponse.json({error:"Payment signature verification failed."},{status:400});
    const supabase=getSupabaseAdmin();
    const {data:order,error:findError}=await supabase.from("orders").select("id,order_number,razorpay_order_id,payment_status").eq("order_number",orderId).maybeSingle();
    if(findError||!order) return NextResponse.json({error:"Order not found."},{status:404});
    if(order.razorpay_order_id!==razorpayOrderId) return NextResponse.json({error:"Payment does not match this order."},{status:400});
    if(order.payment_status==="paid") return NextResponse.json({ok:true,alreadyPaid:true});
    const {error:updateError}=await supabase.from("orders").update({payment_status:"paid",razorpay_payment_id:paymentId,order_status:"confirmed"}).eq("order_number",orderId).eq("payment_status","pending");
    if(updateError) return NextResponse.json({error:"Payment was verified but order update failed. Contact support."},{status:500});
    return NextResponse.json({ok:true});
  } catch {
    return NextResponse.json({error:"Unexpected verification error."},{status:500});
  }
}
