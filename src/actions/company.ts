"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCompany() {
  return prisma.company.findFirst();
}

export async function updateCompany(data: any) {
  let company = await prisma.company.findFirst();
  
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "WEBWORK STUDIOS",
        email: "contact@webworkstudios.in",
      }
    });
  }

  // Prisma schema does not have accountName, so we omit it from the incoming data
  const { accountName, ...validData } = data;

  const updatedCompany = await prisma.company.update({
    where: { id: company.id },
    data: {
      ...validData,
      autoNumber: validData.autoNumber ? parseInt(validData.autoNumber, 10) : company.autoNumber,
      smtpPort: validData.smtpPort ? parseInt(validData.smtpPort, 10) : null,
    }
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/invoices");
  revalidatePath("/dashboard/receipts");
  revalidatePath("/dashboard/quotations");
  
  return updatedCompany;
}
