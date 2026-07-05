"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLead(formData: FormData) {
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "WEBWORKS STUDIOS",
        email: "rccindia@webworksstudios.com",
      }
    });
  }

  const name = formData.get("name") as string;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const companyName = formData.get("companyName") as string | null;
  const source = formData.get("source") as string | null;

  if (!name) {
    throw new Error("Name is required");
  }

  await prisma.lead.create({
    data: {
      companyId: company.id,
      name,
      email,
      phone,
      companyName,
      source,
    },
  });

  revalidatePath("/dashboard/crm");
}

export async function getLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateLeadStatus(id: string, status: string) {
  await prisma.lead.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/dashboard/crm");
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      communications: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });
}

export async function convertLeadToClient(id: string) {
  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) throw new Error("Lead not found");

  const client = await prisma.client.create({
    data: {
      companyId: lead.companyId,
      companyName: lead.companyName || "Unknown Company",
      clientName: lead.name,
      email: lead.email || `unknown-${Date.now()}@example.com`,
      phone: lead.phone,
      billingAddress: "Update Address",
    }
  });

  await prisma.lead.update({
    where: { id },
    data: { status: "CONVERTED" }
  });

  revalidatePath("/dashboard/crm");
  revalidatePath("/dashboard/clients");
  return client;
}

export async function deleteLead(id: string) {
  // Delete communications first to avoid foreign key constraint errors if not cascading
  await prisma.communicationLog.deleteMany({
    where: { leadId: id }
  });
  
  await prisma.lead.delete({
    where: { id }
  });
  revalidatePath("/dashboard/crm");
}

export async function updateLead(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const companyName = formData.get("companyName") as string | null;
  const source = formData.get("source") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!name) {
    throw new Error("Name is required");
  }

  await prisma.lead.update({
    where: { id },
    data: {
      name,
      email,
      phone,
      companyName,
      source,
      notes,
    }
  });

  revalidatePath("/dashboard/crm");
  revalidatePath(`/dashboard/crm/${id}`);
  
  const { redirect } = await import("next/navigation");
  redirect("/dashboard/crm");
}
