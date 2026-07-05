"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  const company = await prisma.company.findFirst();
  if (!company) {
    return {
      stats: [
        { title: "Total Revenue", value: 0, change: "0%", trend: "up", color: "text-green-500", bg: "bg-green-50" },
        { title: "Outstanding", value: 0, change: "0%", trend: "up", color: "text-amber-500", bg: "bg-amber-50" },
        { title: "Total Invoices", value: 0, change: "0%", trend: "up", color: "text-blue-500", bg: "bg-blue-50" },
        { title: "Total Clients", value: 0, change: "0%", trend: "up", color: "text-purple-500", bg: "bg-purple-50" },
      ],
      recentInvoices: [],
      chartData: []
    };
  }

  // Get all invoices for the company
  const invoices = await prisma.invoice.findMany({
    where: { companyId: company.id },
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate totals
  const totalInvoices = invoices.length;
  
  const totalRevenue = invoices
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);
    
  const totalOutstanding = invoices
    .filter(inv => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + inv.grandTotal, 0);

  const totalClients = await prisma.client.count({
    where: { companyId: company.id }
  });

  const recentInvoices = invoices.slice(0, 4);

  // Calculate actual chart data based on receipts (revenue)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const revenueByMonth = new Map<string, number>();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const receipts = await prisma.receipt.findMany({
    where: { companyId: company.id, paymentDate: { gte: sixMonthsAgo } }
  });

  receipts.forEach(r => {
    const month = monthNames[new Date(r.paymentDate).getMonth()];
    const current = revenueByMonth.get(month) || 0;
    revenueByMonth.set(month, current + r.amountPaid);
  });

  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = monthNames[d.getMonth()];
    chartData.push({
      name: month,
      total: revenueByMonth.get(month) || 0
    });
  }

  return {
    stats: [
      { title: "Total Revenue", value: totalRevenue, change: "+0%", trend: "up", color: "text-green-500", bg: "bg-green-50" },
      { title: "Outstanding", value: totalOutstanding, change: "+0%", trend: "up", color: "text-amber-500", bg: "bg-amber-50" },
      { title: "Total Invoices", value: totalInvoices, change: `+${totalInvoices > 0 ? "100" : "0"}%`, trend: "up", color: "text-blue-500", bg: "bg-blue-50" },
      { title: "Total Clients", value: totalClients, change: `+${totalClients > 0 ? "100" : "0"}%`, trend: "up", color: "text-purple-500", bg: "bg-purple-50" },
    ],
    recentInvoices,
    chartData
  };
}
