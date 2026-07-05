import { NextResponse } from "next/server";
import { getWhatsAppStatus } from "@/lib/whatsapp";

// Opt out of caching
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = getWhatsAppStatus();
  return NextResponse.json(status);
}
