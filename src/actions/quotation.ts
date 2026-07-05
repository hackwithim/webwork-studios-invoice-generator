"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteFileFromDrive } from "@/lib/drive";

export async function createQuotation(data: any) {
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "WEBWORKS STUDIOS",
        email: "rccindia@webworksstudios.com",
      }
    });
  }

  const quotation = await prisma.quotation.create({
    data: {
      quotationNumber: data.quotationNumber,
      invoiceDate: new Date(data.date),
      validityDate: new Date(data.validityDate),
      status: data.status || "DRAFT",
      notes: data.notes,
      terms: data.terms,
      subtotal: data.subtotal,
      taxRate: data.taxRate || 0,
      cgst: (data.gst || 0) / 2,
      sgst: (data.gst || 0) / 2,
      grandTotal: data.total,
      companyId: company.id,
      clientId: data.clientId, 
      items: {
        create: data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          total: item.quantity * item.rate
        }))
      }
    }
  });

  revalidatePath("/dashboard/quotations");
  return quotation;
}

export async function getQuotations() {
  return prisma.quotation.findMany({
    include: {
      client: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getNextQuotationNumber() {
  const lastQuotation = await prisma.quotation.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  if (!lastQuotation) return `QUO-${new Date().getFullYear()}-001`;
  const match = lastQuotation.quotationNumber.match(/(\d+)$/);
  if (match) {
    const nextNum = parseInt(match[1]) + 1;
    return lastQuotation.quotationNumber.replace(/(\d+)$/, nextNum.toString().padStart(match[1].length, '0'));
  }
  return `QUO-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;
}

export async function deleteQuotation(id: string) {
  const quotation = await prisma.quotation.findUnique({ where: { id } });
  if (quotation?.driveFileId) {
    await deleteFileFromDrive(quotation.driveFileId);
  }
  await prisma.quotation.delete({ where: { id } });
  revalidatePath("/dashboard/quotations");
}

export async function getQuotationById(id: string) {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      items: true,
      client: true
    }
  });
}

export async function updateQuotation(id: string, data: any) {
  const quotation = await prisma.quotation.update({
    where: { id },
    data: {
      quotationNumber: data.quotationNumber,
      invoiceDate: new Date(data.date),
      validityDate: new Date(data.validityDate),
      status: data.status || "DRAFT",
      notes: data.notes,
      terms: data.terms,
      subtotal: data.subtotal,
      taxRate: data.taxRate || 0,
      cgst: (data.gst || 0) / 2,
      sgst: (data.gst || 0) / 2,
      grandTotal: data.total,
      clientId: data.clientId, 
      items: {
        deleteMany: {},
        create: data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          total: item.quantity * item.rate
        }))
      }
    }
  });

  revalidatePath("/dashboard/quotations");
  return quotation;
}
