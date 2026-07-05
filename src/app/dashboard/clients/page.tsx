import { Plus } from "lucide-react";
import Link from "next/link";
import ClientList from "@/components/client-list";
import { getClients } from "@/actions/client";

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Clients</h1>
        
        <Link
          href="/dashboard/clients/create"
          className="w-full sm:w-auto h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Client
        </Link>
      </div>

      <ClientList initialClients={clients} />
    </div>
  );
}
