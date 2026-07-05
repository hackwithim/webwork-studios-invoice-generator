"use server";

import prisma from "@/lib/prisma";

export async function getPayments() {
  const company = await prisma.company.findFirst();
  if (!company) return [];

  const payments = await prisma.receipt.findMany({
    include: {
      invoice: {
        include: {
          client: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return payments;
}
