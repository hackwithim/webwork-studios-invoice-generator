import { Plus } from "lucide-react";
import Link from "next/link";
import ReceiptList from "@/components/receipt-list";
import { getReceipts } from "@/actions/receipt";

export default async function ReceiptsPage() {
  const receipts = await getReceipts();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Receipts</h1>
        
        <Link
          href="/dashboard/receipts/create"
          className="w-full sm:w-auto h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Receipt
        </Link>
      </div>

      <ReceiptList initialReceipts={receipts} />
    </div>
  );
}
