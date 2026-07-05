"use server";

import prisma from "@/lib/prisma";

export async function getAnalyticsData() {
  const company = await prisma.company.findFirst();
  if (!company) {
    return {
      revenueData: [],
      categoryData: [],
      metrics: {
        totalRevenue: 0,
        totalInvoiced: 0,
        outstanding: 0
      }
    };
  }

  // Fetch all invoices for the last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const invoices = await prisma.invoice.findMany({
    where: { 
      companyId: company.id,
      invoiceDate: { gte: sixMonthsAgo },
      status: { not: 'Draft' } // count anything not draft
    },
    include: {
      items: true
    }
  });

  const receipts = await prisma.receipt.findMany({
    where: {
      companyId: company.id,
      paymentDate: { gte: sixMonthsAgo }
    }
  });

  // Map product categories to use for invoice items
  const products = await prisma.product.findMany({
    where: { companyId: company.id }
  });
  const productCategoryMap = new Map<string, string>();
  products.forEach(p => {
    if (p.category) productCategoryMap.set(p.serviceName.toLowerCase(), p.category);
  });

  // Calculate actual metrics
  let totalRevenue = 0;
  receipts.forEach(r => {
    totalRevenue += r.amountPaid;
  });

  let totalInvoiced = 0;
  invoices.forEach(inv => {
    if (inv.status !== 'CANCELLED') totalInvoiced += inv.grandTotal;
  });

  const outstanding = Math.max(0, totalInvoiced - totalRevenue);

  // Calculate category data from invoice items matching product categories
  const categoryMap = new Map<string, number>();
  invoices.forEach(inv => {
    if (inv.status === 'CANCELLED') return;
    inv.items.forEach(item => {
      const category = productCategoryMap.get(item.description.toLowerCase()) || "Other"; 
      const current = categoryMap.get(category) || 0;
      categoryMap.set(category, current + item.total);
    });
  });

  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value); // sort by highest revenue

  if (categoryData.length === 0) {
    categoryData.push({ name: "No Data", value: 0 });
  }

  // Group data by month
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dataByMonth = new Map<string, { revenue: number, invoiced: number }>();

  invoices.forEach(inv => {
    if (inv.status === 'CANCELLED') return;
    const month = monthNames[new Date(inv.invoiceDate).getMonth()];
    const current = dataByMonth.get(month) || { revenue: 0, invoiced: 0 };
    current.invoiced += inv.grandTotal;
    dataByMonth.set(month, current);
  });

  receipts.forEach(r => {
    const month = monthNames[new Date(r.paymentDate).getMonth()];
    const current = dataByMonth.get(month) || { revenue: 0, invoiced: 0 };
    current.revenue += r.amountPaid;
    dataByMonth.set(month, current);
  });

  // Generate last 6 months labels
  const revenueData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = monthNames[d.getMonth()];
    const data = dataByMonth.get(month) || { revenue: 0, invoiced: 0 };
    revenueData.push({
      name: month,
      revenue: data.revenue,
      invoiced: data.invoiced
    });
  }

  return {
    revenueData,
    categoryData,
    metrics: {
      totalRevenue,
      totalInvoiced,
      outstanding
    }
  };
}
