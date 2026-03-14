import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { action, password } = await req.json();
    if (password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (action === 'login') return NextResponse.json({ success: true });
    if (action === 'stats') {
      const { data: revenueData } = await supabaseAdmin.from('orders').select('amount, currency').eq('status', 'paid');
      const totalRevenue = revenueData?.reduce((sum, o) => {
        if (o.currency === 'VND') return sum + Math.round(o.amount / 24000);
        return sum + o.amount;
      }, 0) || 0;
      const { count: totalOrders } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'paid');
      const { count: activeUsers } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'paid').gt('expires_at', new Date().toISOString());
      const { count: totalVisits } = await supabaseAdmin.from('visits').select('*', { count: 'exact', head: true });
      const { data: recentOrders } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(10);
      const { data: topLocations } = await supabaseAdmin.from('locations').select('name, visit_count').order('visit_count', { ascending: false }).limit(5);
      const dailyRevenue = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const { data } = await supabaseAdmin.from('orders').select('amount, currency').eq('status', 'paid').gte('paid_at', `${dateStr}T00:00:00`).lt('paid_at', `${dateStr}T23:59:59`);
        const dayRevenue = data?.reduce((sum, o) => {
          if (o.currency === 'VND') return sum + Math.round(o.amount / 24000);
          return sum + o.amount;
        }, 0) || 0;
        dailyRevenue.push({ date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }), revenue: dayRevenue / 100 });
      }
      return NextResponse.json({ totalRevenue, totalOrders: totalOrders || 0, activeUsers: activeUsers || 0, totalVisits: totalVisits || 0, recentOrders: recentOrders || [], topLocations: topLocations?.map(l => ({ name: l.name, visits: l.visit_count })) || [], dailyRevenue });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
