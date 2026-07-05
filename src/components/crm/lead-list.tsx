"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Search, Mail, MessageSquare, MoreVertical, Building2, Trash2, Edit2 } from "lucide-react";
import { createLead, updateLeadStatus, deleteLead } from "@/actions/crm";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LeadList({ initialLeads }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead? This cannot be undone.")) return;
    
    setIsDeleting(id);
    try {
      await deleteLead(id);
      setLeads(leads.filter(l => l.id !== id));
      toast.success("Lead deleted successfully");
    } catch (e: any) {
      toast.error("Failed to delete lead");
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredLeads = leads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.companyName && lead.companyName.toLowerCase().includes(search.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search leads..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium">
            <tr>
              <th className="px-6 py-4">Lead</th>
              <th className="px-6 py-4">Company</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{lead.name}</div>
                      <div className="text-slate-500 text-xs">{lead.email || lead.phone || "No contact info"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 size={16} />
                    {lead.companyName || "N/A"}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    lead.status === 'NEW' ? 'bg-blue-50 text-blue-600' :
                    lead.status === 'CONTACTED' ? 'bg-amber-50 text-amber-600' :
                    lead.status === 'QUALIFIED' ? 'bg-green-50 text-green-600' :
                    lead.status === 'CONVERTED' ? 'bg-purple-50 text-purple-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {format(new Date(lead.createdAt), "MMM dd, yyyy")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/dashboard/crm/${lead.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-white px-3 text-xs font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/dashboard/crm/${lead.id}/edit`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      title="Edit Lead"
                    >
                      <Edit2 size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(lead.id)}
                      disabled={isDeleting === lead.id}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Delete Lead"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No leads found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
