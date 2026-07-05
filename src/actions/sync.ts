"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function syncContacts(contacts: { name: string; email?: string; phone?: string }[]) {
  try {
    const company = await prisma.company.findFirst();
    if (!company) throw new Error("Company not found");

    const validContacts = contacts.filter(c => c.name && (c.email || c.phone));
    
    // Fetch existing leads to filter out duplicates
    const existingLeads = await prisma.lead.findMany({
      where: { companyId: company.id }
    });

    const existingIdentifiers = new Set([
      ...existingLeads.map(l => l.email?.toLowerCase()).filter(Boolean),
      ...existingLeads.map(l => l.phone).filter(Boolean)
    ]);

    const leadsToCreate = validContacts.filter(c => {
      const email = c.email?.toLowerCase();
      const phone = c.phone;
      if (email && existingIdentifiers.has(email)) return false;
      if (phone && existingIdentifiers.has(phone)) return false;
      return true;
    }).map(c => ({
      companyId: company.id,
      name: c.name,
      email: c.email || null,
      phone: c.phone || null,
      source: "CSV Sync",
      status: "NEW"
    }));

    if (leadsToCreate.length > 0) {
      await prisma.lead.createMany({
        data: leadsToCreate
      });
    }

    revalidatePath("/dashboard/crm");
    return { success: true, count: leadsToCreate.length };
  } catch (error: any) {
    console.error("Error syncing contacts:", error);
    return { success: false, error: error.message || "Failed to sync contacts" };
  }
}
