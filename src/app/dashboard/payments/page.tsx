import { Plus, Download } from "lucide-react";
import Link from "next/link";
import PaymentList from "@/components/payment-list";
import { getPayments } from "@/actions/payment";

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary mb-1" style={{ fontFamily: "var(--font-poppins)" }}>Payments</h1>
          <p className="text-sm text-slate-500">Track and manage received payments.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} />
            <span className="hidden sm:inline">Export</span>
          </button>
          
          <Link href="/dashboard/receipts/create" className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
            <Plus size={16} />
            Record Payment
          </Link>
        </div>
      </div>

      <PaymentList initialPayments={payments} />
    </div>
  );
}
