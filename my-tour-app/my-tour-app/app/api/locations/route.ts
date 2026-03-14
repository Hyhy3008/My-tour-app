import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: locations, error } = await supabaseAdmin.from('locations')
      .select('*').eq('is_active', true).order('name');
    if (error) throw error;
    return NextResponse.json(locations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
