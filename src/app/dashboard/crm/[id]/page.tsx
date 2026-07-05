import { ArrowLeft, Mail, MessageSquare, Building2, User, Phone, CheckCircle } from "lucide-react";
import Link from "next/link";
import { getLeadById, convertLeadToClient, updateLeadStatus } from "@/actions/crm";
import { format } from "date-fns";
import AICraftMessage from "@/components/crm/AICraftMessage";
import SendManualEmail from "@/components/crm/SendManualEmail";

export default async function LeadDetailsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const lead = await getLeadById(id);

  if (!lead) {
    return <div>Lead not found</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/crm"
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>
              {lead.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
              <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                lead.status === 'NEW' ? 'bg-blue-50 text-blue-600' :
                lead.status === 'CONTACTED' ? 'bg-amber-50 text-amber-600' :
                lead.status === 'QUALIFIED' ? 'bg-green-50 text-green-600' :
                lead.status === 'CONVERTED' ? 'bg-purple-50 text-purple-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                {lead.status}
              </span>
              <span>•</span>
              <span>Added {format(new Date(lead.createdAt), "MMM dd, yyyy")}</span>
            </div>
          </div>
        </div>

        {lead.status !== "CONVERTED" && (
          <form action={async () => {
            "use server";
            await convertLeadToClient(lead.id);
          }}>
            <button 
              type="submit"
              className="w-full sm:w-auto h-10 px-4 rounded-xl bg-green-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-sm"
            >
              <CheckCircle size={16} />
              Convert to Client
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">Contact Information</h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User size={18} className="text-slate-400 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Full Name</div>
                  <div className="text-sm font-medium text-slate-700">{lead.name}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 size={18} className="text-slate-400 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Company</div>
                  <div className="text-sm font-medium text-slate-700">{lead.companyName || "N/A"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail size={18} className="text-slate-400 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Email Address</div>
                  <div className="text-sm font-medium text-slate-700">{lead.email || "N/A"}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone size={18} className="text-slate-400 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-500">Phone Number</div>
                  <div className="text-sm font-medium text-slate-700">{lead.phone || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-800">Change Status</h3>
            <form action={async (formData) => {
              "use server";
              const newStatus = formData.get("status") as string;
              if (newStatus) {
                await updateLeadStatus(lead.id, newStatus);
              }
            }} className="flex gap-2">
              <select 
                name="status" 
                defaultValue={lead.status}
                className="flex-1 h-10 px-3 rounded-xl bg-slate-50 border border-slate-200 outline-none text-sm focus:ring-2 focus:ring-primary/20"
              >
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="LOST">Lost</option>
              </select>
              <button 
                type="submit"
                className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Update
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Outreach & History */}
        <div className="lg:col-span-2 space-y-6">
          <SendManualEmail lead={lead} />
          <AICraftMessage lead={lead} />

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Communication History</h3>
            
            {lead.communications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No communications logged yet. Use the tool above to start outreach.
              </div>
            ) : (
              <div className="space-y-4">
                {lead.communications.map((log) => (
                  <div key={log.id} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="mt-1">
                      {log.type === 'EMAIL' ? (
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                          <Mail size={14} />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                          <MessageSquare size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-sm font-semibold text-slate-800">
                            {log.type === 'EMAIL' ? 'Email Sent' : 'WhatsApp Sent'}
                          </span>
                          {log.subject && <div className="text-sm text-slate-600">{log.subject}</div>}
                        </div>
                        <span className="text-xs text-slate-500">
                          {format(new Date(log.createdAt), "MMM dd, h:mm a")}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-slate-600 whitespace-pre-wrap">
                        {log.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
