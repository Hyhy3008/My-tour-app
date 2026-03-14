import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { action, password } = await req.json();

    // Verify admin password
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (action === 'login') {
      return NextResponse.json({ success: true });
    }

    if (action === 'stats') {
      // Trả về data mẫu (sau này kết nối Supabase)
      return NextResponse.json({
        totalRevenue: 0,
        totalOrders: 0,
        activeUsers: 0,
        totalVisits: 0,
        recentOrders: [],
        topLocations: [],
        dailyRevenue: [],
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
