import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { to, subject, text, leadId, clientId } = await request.json();

    if (!to || !subject || !text) {
      return NextResponse.json({ error: "Missing required fields (to, subject, text)" }, { status: 400 });
    }

    // Get SMTP credentials from the default company
    const company = await prisma.company.findFirst();
    
    if (!company) {
      return NextResponse.json({ error: "Company settings not found." }, { status: 400 });
    }

    // Use company SMTP or fallback to env vars for demonstration
    const host = company.smtpHost || process.env.SMTP_HOST;
    const port = company.smtpPort || Number(process.env.SMTP_PORT) || 587;
    const user = company.smtpUser || process.env.SMTP_USER;
    const pass = company.smtpPassword || process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      console.log("SMTP not configured, mocking email send to", to);
      
      await prisma.communicationLog.create({
        data: {
          companyId: company.id,
          leadId,
          clientId,
          type: "EMAIL",
          direction: "OUTBOUND",
          status: "SENT",
          subject,
          content: text,
          metadata: JSON.stringify({ messageId: "mock-email-" + Date.now(), mocked: true, to })
        }
      });

      return NextResponse.json({ success: true, messageId: "mock-email-" + Date.now(), mocked: true });
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"${company.name}" <rccindia@webworksstudios.com>`,
      to,
      subject,
      text,
    });

    // Log the communication
    await prisma.communicationLog.create({
      data: {
        companyId: company.id,
        leadId,
        clientId,
        type: "EMAIL",
        direction: "OUTBOUND",
        status: "SENT",
        subject,
        content: text,
        metadata: JSON.stringify({ messageId: info.messageId, to })
      }
    });

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: error.message || "Failed to send email" }, { status: 500 });
  }
}
