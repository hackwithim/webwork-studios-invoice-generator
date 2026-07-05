"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteFileFromDrive } from "@/lib/drive";

export async function createInvoice(data: any) {
  // We expect data to match the form fields, plus subtotal, gst, total.
  // We need a company first
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "WEBWORKS STUDIOS",
        email: "rccindia@webworksstudios.com",
      }
    });
  }

  // Create Invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: new Date(data.date),
      dueDate: new Date(data.dueDate),
      status: data.status || "DRAFT",
      notes: data.notes,
      terms: data.terms,
      subtotal: data.subtotal,
      taxRate: data.taxRate || 0,
      cgst: (data.gst || 0) / 2,
      sgst: (data.gst || 0) / 2,
      grandTotal: data.total,
      companyId: company.id,
      // For now, if no client ID is selected, we can't create it, so we ensure the user picks one.
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

  revalidatePath("/dashboard/invoices");
  return invoice;
}

export async function getInvoices() {
  return prisma.invoice.findMany({
    include: {
      client: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getNextInvoiceNumber() {
  const lastInvoice = await prisma.invoice.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  if (!lastInvoice) return `INV-${new Date().getFullYear()}-001`;
  const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
  if (match) {
    const nextNum = parseInt(match[1]) + 1;
    return lastInvoice.invoiceNumber.replace(/(\d+)$/, nextNum.toString().padStart(match[1].length, '0'));
  }
  return `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;
}

export async function deleteInvoice(id: string) {
  const invoice = await prisma.invoice.findUnique({ where: { id } });
  if (invoice?.driveFileId) {
    await deleteFileFromDrive(invoice.driveFileId);
  }
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/dashboard/invoices");
}

export async function getInvoiceById(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      client: true
    }
  });
}

export async function updateInvoice(id: string, data: any) {
  // Update invoice and recreate its line items
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      invoiceNumber: data.invoiceNumber,
      invoiceDate: new Date(data.date),
      dueDate: new Date(data.dueDate),
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
        deleteMany: {}, // Delete all old items
        create: data.items.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          total: item.quantity * item.rate
        }))
      }
    }
  });

  revalidatePath("/dashboard/invoices");
  return invoice;
}
