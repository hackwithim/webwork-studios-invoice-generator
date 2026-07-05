import { ArrowUpRight, ArrowDownRight, IndianRupee, FileText, Users, Clock } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import DashboardChart from "@/components/dashboard-chart";
import { getDashboardStats } from "@/actions/dashboard";

const getStatusColor = (status: string) => {
  switch (status) {
    case "PAID": return "bg-green-50 text-green-600 border-green-200";
    case "PENDING": return "bg-amber-50 text-amber-600 border-amber-200";
    case "OVERDUE": return "bg-red-50 text-red-600 border-red-200";
    default: return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

const iconMap: any = {
  "Total Revenue": IndianRupee,
  "Outstanding": Clock,
  "Total Invoices": FileText,
  "Total Clients": Users,
};

export default async function DashboardPage() {
  const { stats, recentInvoices, chartData } = await getDashboardStats();

  return (
    <div className="space-y-6">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => {
          const Icon = iconMap[stat.title];
          return (
            <div
              key={stat.title}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === "up" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                }`}>
                  {stat.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1 truncate">{stat.title}</p>
                <h3 className="text-xl md:text-2xl font-bold text-primary truncate" style={{ fontFamily: "var(--font-poppins)" }}>
                  {stat.title.includes("Revenue") || stat.title.includes("Outstanding") 
                    ? formatCurrency(stat.value)
                    : stat.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Revenue Overview</h3>
            <select className="text-sm font-medium text-slate-500 bg-slate-50 border-none rounded-lg focus:ring-0 cursor-pointer outline-none">
              <option>This Year</option>
              <option>Last 6 Months</option>
              <option>This Month</option>
            </select>
          </div>
          <DashboardChart data={chartData} />
        </div>

        {/* Recent Invoices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Recent Invoices</h3>
            <Link href="/dashboard/invoices" className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
              View All
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            {recentInvoices.map((invoice: any) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:text-accent transition-colors group-hover:shadow-sm shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary mb-0.5 truncate">{invoice.client?.companyName}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{invoice.invoiceNumber} • {new Date(invoice.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-sm font-bold text-primary mb-1">{formatCurrency(invoice.grandTotal)}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
            
            {recentInvoices.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500">No recent invoices.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
}
