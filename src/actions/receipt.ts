"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { deleteFileFromDrive } from "@/lib/drive";

export async function createReceipt(data: any) {
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "WEBWORKS STUDIOS",
        email: "rccindia@webworksstudios.com",
      }
    });
  }

  const receipt = await prisma.receipt.create({
    data: {
      receiptNumber: data.receiptNumber,
      paymentDate: new Date(data.date),
      paymentMethod: data.paymentMethod,
      amountPaid: data.amountPaid,
      remarks: data.notes,
      companyId: company.id,
      invoiceId: data.invoiceId,
      receivedFrom: data.receivedFrom || "Client",
    }
  });

  revalidatePath("/dashboard/receipts");
  return receipt;
}

export async function getReceipts() {
  return prisma.receipt.findMany({
    include: {
      invoice: {
        include: {
          client: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getNextReceiptNumber() {
  const lastReceipt = await prisma.receipt.findFirst({
    orderBy: { createdAt: 'desc' }
  });
  if (!lastReceipt) return `REC-${new Date().getFullYear()}-001`;
  const match = lastReceipt.receiptNumber.match(/(\d+)$/);
  if (match) {
    const nextNum = parseInt(match[1]) + 1;
    return lastReceipt.receiptNumber.replace(/(\d+)$/, nextNum.toString().padStart(match[1].length, '0'));
  }
  return `REC-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)}`;
}

export async function deleteReceipt(id: string) {
  const receipt = await prisma.receipt.findUnique({ where: { id } });
  if (receipt?.driveFileId) {
    await deleteFileFromDrive(receipt.driveFileId);
  }
  await prisma.receipt.delete({ where: { id } });
  revalidatePath("/dashboard/receipts");
}

export async function getReceiptById(id: string) {
  return prisma.receipt.findUnique({
    where: { id },
    include: {
      invoice: {
        include: {
          client: true
        }
      }
    }
  });
}

export async function updateReceipt(id: string, data: any) {
  const receipt = await prisma.receipt.update({
    where: { id },
    data: {
      receiptNumber: data.receiptNumber,
      paymentDate: new Date(data.date),
      paymentMethod: data.paymentMethod,
      amountPaid: data.amountPaid,
      remarks: data.notes,
      invoiceId: data.invoiceId,
      receivedFrom: data.receivedFrom || "Client",
    }
  });

  revalidatePath("/dashboard/receipts");
  return receipt;
}
