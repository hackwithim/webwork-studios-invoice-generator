import { Plus } from "lucide-react";
import Link from "next/link";
import LeadList from "@/components/crm/lead-list";
import { getLeads } from "@/actions/crm";
import SyncButton from "@/components/crm/sync-button";

export default async function CRMPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>CRM & Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your prospective clients and outreach.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <SyncButton />
          <Link
            href="/dashboard/crm/create"
            className="w-full sm:w-auto h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add Lead
          </Link>
        </div>
      </div>

      <LeadList initialLeads={leads} />
    </div>
  );
}
