import { NextResponse } from "next/server";
import { getWhatsAppClient } from "@/lib/whatsapp";

// Opt out of caching
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // This will either return the existing client or start initializing a new one
    getWhatsAppClient();
    return NextResponse.json({ success: true, message: "Initialization triggered." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
