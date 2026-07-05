"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClient(formData: FormData) {
  // In a real app, you would get the authenticated user's company ID.
  // For this prototype, we'll fetch the first company or create a default one.
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "WEBWORKS STUDIOS",
        email: "rccindia@webworksstudios.com",
      }
    });
  }

  const companyName = formData.get("companyName") as string;
  const clientName = formData.get("clientName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const billingAddress = formData.get("billingAddress") as string;
  const gstNumber = formData.get("gstNumber") as string;
  const pan = formData.get("pan") as string;

  if (!companyName || !clientName || !email || !billingAddress) {
    throw new Error("Missing required fields");
  }

  await prisma.client.create({
    data: {
      companyId: company.id,
      companyName,
      clientName,
      email,
      phone,
      billingAddress,
      gstNumber,
      pan,
    },
  });

  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}

export async function getClients() {
  return prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function deleteClient(id: string) {
  await prisma.client.delete({
    where: { id }
  });
  revalidatePath("/dashboard/clients");
}

export async function updateClient(id: string, formData: FormData) {
  const companyName = formData.get("companyName") as string;
  const clientName = formData.get("clientName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const billingAddress = formData.get("billingAddress") as string;
  const gstNumber = formData.get("gstNumber") as string;
  const pan = formData.get("pan") as string;

  if (!companyName || !clientName || !email || !billingAddress) {
    throw new Error("Missing required fields");
  }

  await prisma.client.update({
    where: { id },
    data: {
      companyName,
      clientName,
      email,
      phone,
      billingAddress,
      gstNumber,
      pan,
    },
  });

  revalidatePath("/dashboard/clients");
  redirect("/dashboard/clients");
}
