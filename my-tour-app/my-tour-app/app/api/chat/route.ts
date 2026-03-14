import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAIResponse, getOfflineResponse } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, locationName, contextPrompt, offline } = body;

    if (userId) {
      const { data: order } = await supabaseAdmin
        .from('orders').select('*')
        .eq('user_id', userId).eq('status', 'paid')
        .gt('expires_at', new Date().toISOString()).single();
      if (!order) {
        return NextResponse.json({ error: "Phiên đã hết hạn. Vui lòng thanh toán lại." }, { status: 401 });
      }
    }

    if (offline) {
      const response = getOfflineResponse(locationName);
      return NextResponse.json({ reply: response, offline: true });
    }

    const response = await getAIResponse(contextPrompt || locationName);
    return NextResponse.json({ reply: response });
  } catch (error: any) {
    const offlineResponse = getOfflineResponse('unknown');
    return NextResponse.json({ reply: offlineResponse, offline: true, error: error.message });
  }
}
