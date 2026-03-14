import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPayOSWebhook } from "@/lib/payos";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const isValid = verifyPayOSWebhook(body);
    if (!isValid) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    const { orderCode, code } = body.data || body;
    if (code === "00") {
      await supabaseAdmin.from('orders').update({
        status: 'paid', paid_at: new Date().toISOString(),
      }).eq('payment_id', orderCode.toString()).eq('payment_method', 'payos');
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
