import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { Send, MessageCircle, Mail, Clock, CheckCircle2, XCircle } from "lucide-react";
import { getCompany } from "@/actions/company";

export const dynamic = 'force-dynamic';

export default async function WhatsAppLogsPage() {
  const company = await getCompany();
  if (!company) {
    return <div>No company context found.</div>;
  }
  const companyId = company.id;

  const logs = await prisma.communicationLog.findMany({
    where: { companyId, type: "WHATSAPP" },
    orderBy: { createdAt: "desc" },
    include: {
      lead: true,
      client: true,
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "SENT":
      case "DELIVERED":
      case "READ":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "FAILED":
        return <XCircle size={16} className="text-red-500" />;
      case "MOCKED":
        return <Clock size={16} className="text-blue-500" />;
      default:
        return <Clock size={16} className="text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "SENT" || s === "DELIVERED" || s === "READ") {
      return <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">{status}</span>;
    }
    if (s === "FAILED") {
      return <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 text-xs font-medium border border-red-100">{status}</span>;
    }
    if (s === "MOCKED") {
      return <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">{status}</span>;
    }
    return <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">{status}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>
          WhatsApp Logs
        </h1>
        <p className="text-sm text-slate-500">
          History of all WhatsApp messages sent to your leads and clients.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
            <Send className="mb-4 text-slate-300" size={48} />
            <h3 className="text-lg font-medium text-slate-700 mb-2">No messages sent yet</h3>
            <p className="text-sm max-w-md">Your outbound communication history will appear here once you start messaging leads and clients.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Channel</th>
                  <th className="px-6 py-4">Recipient</th>
                  <th className="px-6 py-4">Message</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => {
                  const isWhatsApp = log.type.toUpperCase() === "WHATSAPP";
                  let recipientName = log.lead?.name || log.client?.clientName;
                  let recipientType = log.lead ? "Lead" : (log.client ? "Client" : "Unknown");

                  if (!recipientName) {
                    try {
                      const meta = JSON.parse(log.metadata || '{}');
                      recipientName = meta.to || meta.phone || "Unknown";
                    } catch (e) {
                      recipientName = "Unknown";
                    }
                  }

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-700">
                          {format(new Date(log.createdAt), "MMM d, yyyy")}
                        </div>
                        <div className="text-xs text-slate-400">
                          {format(new Date(log.createdAt), "h:mm a")}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center gap-2 text-sm font-medium ${isWhatsApp ? 'text-emerald-600' : 'text-blue-600'}`}>
                          {isWhatsApp ? <MessageCircle size={16} /> : <Mail size={16} />}
                          {isWhatsApp ? 'WhatsApp' : 'Email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-700">{recipientName}</div>
                        <div className="text-xs text-slate-400">{recipientType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 max-w-xs truncate">
                          {log.subject && <span className="font-semibold block truncate">{log.subject}</span>}
                          <span className="truncate block opacity-80">{log.content}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {getStatusIcon(log.status)}
                          {getStatusBadge(log.status)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
