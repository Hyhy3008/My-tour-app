import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ valid: false }, { status: 400 });
    const { data: order, error } = await supabaseAdmin.from('orders').select('*')
      .eq('user_id', userId).eq('status', 'paid')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }).limit(1).single();
    if (error || !order) return NextResponse.json({ valid: false });
    return NextResponse.json({ valid: true, expiresAt: order.expires_at, paidAt: order.paid_at });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: error.message });
  }
}
