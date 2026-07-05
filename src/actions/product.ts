"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const company = await prisma.company.findFirst();
  if (!company) return [];

  const products = await prisma.product.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: 'desc' }
  });

  return products;
}

export async function createProduct(formData: FormData) {
  const company = await prisma.company.findFirst();
  if (!company) {
    throw new Error("Company not found. Please setup company first.");
  }

  const name = formData.get('serviceName') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string || '0');
  const unit = formData.get('unit') as string || 'Qty';
  const category = formData.get('category') as string;
  const hsnSac = formData.get('hsnSac') as string;
  const gstRate = parseFloat(formData.get('gstRate') as string || '0');

  const product = await prisma.product.create({
    data: {
      serviceName: name,
      description,
      price,
      unit,
      category,
      hsnSac,
      gstRate,
      companyId: company.id
    }
  });

  revalidatePath('/dashboard/products');
  return product;
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({
    where: { id }
  });
  revalidatePath("/dashboard/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const name = formData.get('serviceName') as string;
  const description = formData.get('description') as string;
  const price = parseFloat(formData.get('price') as string || '0');
  const unit = formData.get('unit') as string || 'Qty';
  const category = formData.get('category') as string;
  const hsnSac = formData.get('hsnSac') as string;
  const gstRate = parseFloat(formData.get('gstRate') as string || '0');
  const status = formData.get('status') as string || 'active';

  const product = await prisma.product.update({
    where: { id },
    data: {
      serviceName: name,
      description,
      price,
      unit,
      category,
      hsnSac,
      gstRate,
      status
    }
  });

  revalidatePath('/dashboard/products');
  return product;
}
