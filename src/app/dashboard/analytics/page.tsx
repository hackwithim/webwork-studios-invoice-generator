import { ArrowUpRight, ArrowDownRight, Target, CreditCard, TrendingUp, Download } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAnalyticsData } from "@/actions/analytics";
import { AnalyticsCharts } from "@/components/analytics-charts";

export default async function AnalyticsPage() {
  const { revenueData, categoryData, metrics } = await getAnalyticsData();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-poppins)" }}>Analytics Overview</h1>
          <p className="text-sm text-slate-500">Track your business performance and revenue growth.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium focus:ring-2 focus:ring-accent/20 focus:outline-none">
            <option>Last 6 Months</option>
            <option>This Year</option>
            <option>Last Year</option>
          </select>
          <button className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 rounded-lg bg-green-50 text-green-600"><TrendingUp size={18} /></div>
             <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Total Revenue (Paid)</p>
           </div>
           <h3 className="text-3xl font-bold text-primary mb-2">{formatCurrency(metrics.totalRevenue)}</h3>
           <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
             <span>Received last 6 months</span>
           </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Target size={18} /></div>
             <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Total Invoiced</p>
           </div>
           <h3 className="text-3xl font-bold text-primary mb-2">{formatCurrency(metrics.totalInvoiced)}</h3>
           <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
             <span>Generated last 6 months</span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-3 mb-4">
             <div className="p-2 rounded-lg bg-amber-50 text-amber-600"><CreditCard size={18} /></div>
             <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Outstanding</p>
           </div>
           <h3 className="text-3xl font-bold text-primary mb-2">{formatCurrency(metrics.outstanding)}</h3>
           <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
             <span>Awaiting Payment</span>
           </div>
        </div>
      </div>

      <AnalyticsCharts revenueData={revenueData} categoryData={categoryData} />
      
    </div>
  );
}
