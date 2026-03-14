import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase";
import { createPayOSOrder } from "@/lib/payos";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2023-10-16" });

export async function POST(req: NextRequest) {
  try {
    const { method, email, phone } = await req.json();
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    if (method === 'payos' || method === 'vietqr') {
      const orderCode = Date.now();
      await supabaseAdmin.from('orders').insert({
        user_id: userId, email, phone, amount: 149000, currency: 'VND',
        payment_method: 'payos', payment_id: orderCode.toString(),
        status: 'pending', expires_at: expiresAt.toISOString(),
      });
      const payosOrder = await createPayOSOrder({
        orderCode, amount: 149000, description: 'Tour Guide AI 24h',
        returnUrl: `${domain}/?status=success&user_id=${userId}`,
        cancelUrl: `${domain}/?status=cancel`,
      });
      return NextResponse.json({ url: payosOrder.checkoutUrl, qrCode: payosOrder.qrCode, userId });
    } else {
      const { data: order } = await supabaseAdmin.from('orders').insert({
        user_id: userId, email, amount: 600, currency: 'USD',
        payment_method: 'stripe', status: 'pending', expires_at: expiresAt.toISOString(),
      }).select().single();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price_data: { currency: "usd", product_data: { name: "Ninh Binh AI Tour Guide - 24h", description: "AI guide + 7 locations + Offline mode", images: [`${domain}/icon.png`] }, unit_amount: 600 }, quantity: 1 }],
        mode: "payment",
        success_url: `${domain}/?status=success&user_id=${userId}`,
        cancel_url: `${domain}/?status=cancel`,
        customer_email: email,
        metadata: { userId, orderId: order?.id },
      });
      await supabaseAdmin.from('orders').update({ payment_id: session.id }).eq('id', order?.id);
      return NextResponse.json({ url: session.url, userId });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
