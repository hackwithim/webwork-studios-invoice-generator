"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical, Edit2, Trash2, FileText, Download, Send, Filter, IndianRupee } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteQuotation } from "@/actions/quotation";
import { sendQuotationEmail } from "@/actions/email";
import toast from "react-hot-toast";
import EmailModal from "@/components/email-modal";

const getStatusStyle = (status: string) => {
  switch (status) {
    case "ACCEPTED": return "bg-green-50 text-green-600 border-green-200";
    case "SENT": return "bg-blue-50 text-blue-600 border-blue-200";
    case "REJECTED": return "bg-red-50 text-red-600 border-red-200";
    case "EXPIRED": return "bg-slate-100 text-slate-500 border-slate-300";
    case "DRAFT": return "bg-slate-50 text-slate-600 border-slate-200";
    case "PUBLISHED": return "bg-blue-50 text-blue-600 border-blue-200";
    default: return "bg-slate-50 text-slate-600 border-slate-200";
  }
};

export default function QuotationList({ initialQuotations }: { initialQuotations: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedQuotationId, setSelectedQuotationId] = useState("");

  const filteredQuotations = initialQuotations.filter(quo => 
    quo.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    quo.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quo.client?.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      toast.promise(
        deleteQuotation(id),
        {
          loading: 'Deleting...',
          success: 'Quotation deleted!',
          error: 'Failed to delete.',
        }
      );
    }
  };

  const handleSendClick = (id: string) => {
    setSelectedQuotationId(id);
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (customMessage: string) => {
    await sendQuotationEmail(selectedQuotationId, customMessage);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search quotations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
            />
          </div>
          <button className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-primary transition-colors focus:ring-2 focus:ring-accent/20">
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Quotation Details</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredQuotations.map((quotation, i) => (
                <motion.tr
                  key={quotation.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary mb-0.5">{quotation.quotationNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="text-sm font-medium text-slate-700">{quotation.client?.companyName}</p>
                    <p className="text-xs text-slate-500">{quotation.client?.clientName}</p>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                      <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                        <IndianRupee size={12} />
                      </div>
                      {formatCurrency(quotation.grandTotal).replace('₹', '')}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border inline-block ${getStatusStyle(quotation.status)}`}>
                      {quotation.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="text-sm text-slate-600 mb-1">Quote: <span className="font-medium text-slate-900">{formatDate(quotation.invoiceDate)}</span></p>
                    <p className="text-xs text-slate-400">Valid: {formatDate(quotation.validityDate)}</p>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button onClick={() => handleSendClick(quotation.id)} className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Send Email">
                        <Send size={16} />
                      </button>
                      <Link href={`/quotation/${quotation.id}`} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors block" title="Download PDF" target="_blank">
                        <Download size={16} />
                      </Link>
                      <div className="w-px h-4 bg-slate-200 mx-1"></div>
                      <Link href={`/dashboard/quotations/create?edit=${quotation.id}`} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors block" title="Edit">
                        <Edit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(quotation.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredQuotations.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-base font-bold text-primary mb-1">No quotations found</h3>
              <p className="text-sm text-slate-500 mb-6">Get started by creating your first quotation.</p>
            </div>
          )}
        </div>
      </div>

      <EmailModal 
        isOpen={emailModalOpen} 
        onClose={() => setEmailModalOpen(false)} 
        onSend={handleSendEmail} 
        documentType="Quotation" 
      />
    </div>
  );
}
