import { NextResponse } from "next/server";
import { disconnectWhatsApp } from "@/lib/whatsapp";

// Opt out of caching
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    await disconnectWhatsApp();
    return NextResponse.json({ success: true, message: "Disconnected successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
