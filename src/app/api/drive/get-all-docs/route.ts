import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({ select: { id: true, invoiceNumber: true } });
    const quotations = await prisma.quotation.findMany({ select: { id: true, quotationNumber: true } });
    const receipts = await prisma.receipt.findMany({ select: { id: true, receiptNumber: true } });

    const allDocs = [
      ...invoices.map(doc => ({ type: "Invoice", id: doc.id, num: doc.invoiceNumber })),
      ...quotations.map(doc => ({ type: "Quotation", id: doc.id, num: doc.quotationNumber })),
      ...receipts.map(doc => ({ type: "Receipt", id: doc.id, num: doc.receiptNumber }))
    ];

    return NextResponse.json(allDocs);
  } catch (error: any) {
    console.error("Failed to fetch documents for backup:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
