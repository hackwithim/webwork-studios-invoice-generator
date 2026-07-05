import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendWhatsAppMessage, getWhatsAppStatus } from "@/lib/whatsapp";

export async function POST(request: Request) {
  try {
    const { to, text, leadId, clientId } = await request.json();

    if (!to || !text) {
      return NextResponse.json({ error: "Missing required fields (to, text)" }, { status: 400 });
    }

    // Get company
    const company = await prisma.company.findFirst();
    
    if (!company) {
      return NextResponse.json({ error: "Company settings not found." }, { status: 400 });
    }

    // Check if real client is connected
    const { status } = getWhatsAppStatus();
    let sentViaRealClient = false;

    if (status === "disconnected") {
      // Kick off initialization so it connects in the background for next time
      const { getWhatsAppClient } = await import("@/lib/whatsapp");
      getWhatsAppClient();
    }

    if (status === "connected") {
      try {
        await sendWhatsAppMessage(to, text);
        sentViaRealClient = true;
        console.log(`[WhatsApp Real] Sent to ${to}: ${text}`);
      } catch (err: any) {
        console.error("Failed to send real WhatsApp message:", err);
        return NextResponse.json({ error: err.message || "Failed to send WhatsApp message." }, { status: 500 });
      }
    } else if (status === "generating_qr") {
      console.log(`[WhatsApp Mock] Skipped sending to ${to} because client is waiting for QR scan.`);
      return NextResponse.json({ error: "WhatsApp is currently waiting for you to scan the QR code, or it is still booting up. Please go to the WhatsApp Setup page and wait for it to connect." }, { status: 400 });
    } else {
      console.log(`[WhatsApp Mock] Skipped sending to ${to} because client is not connected.`);
      return NextResponse.json({ error: "WhatsApp is not connected. Please go to the WhatsApp Setup page to link your device." }, { status: 400 });
    }

    // Log the communication
    await prisma.communicationLog.create({
      data: {
        companyId: company.id,
        leadId,
        clientId,
        type: "WHATSAPP",
        direction: "OUTBOUND",
        status: "SENT",
        content: text,
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: sentViaRealClient ? "WhatsApp message sent successfully." : "WhatsApp message logged (Mock)." 
    });
  } catch (error: any) {
    console.error("WhatsApp send error:", error);
    return NextResponse.json({ error: error.message || "Failed to send WhatsApp message" }, { status: 500 });
  }
}
