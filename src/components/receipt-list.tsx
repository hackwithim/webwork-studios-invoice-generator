"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical, Edit2, Trash2, FileText, Download, Send, Filter, IndianRupee } from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { deleteReceipt } from "@/actions/receipt";
import { sendReceiptEmail } from "@/actions/email";
import toast from "react-hot-toast";
import EmailModal from "@/components/email-modal";

export default function ReceiptList({ initialReceipts }: { initialReceipts: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState("");

  const filteredReceipts = initialReceipts.filter(rec => 
    rec.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    rec.receivedFrom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.invoice?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this receipt?")) {
      toast.promise(
        deleteReceipt(id),
        {
          loading: 'Deleting...',
          success: 'Receipt deleted!',
          error: 'Failed to delete.',
        }
      );
    }
  };

  const handleSendClick = (id: string) => {
    setSelectedReceiptId(id);
    setEmailModalOpen(true);
  };

  const handleSendEmail = async (customMessage: string) => {
    await sendReceiptEmail(selectedReceiptId, customMessage);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search receipts..."
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
                <th className="px-6 py-4">Receipt Details</th>
                <th className="px-6 py-4">Received From</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment Info</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReceipts.map((receipt, i) => (
                <motion.tr
                  key={receipt.id}
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
                        <p className="text-sm font-bold text-primary mb-0.5">{receipt.receiptNumber}</p>
                        <p className="text-xs text-slate-500">Ref: {receipt.invoice?.invoiceNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="text-sm font-medium text-slate-700">{receipt.receivedFrom}</p>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                      <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                        <IndianRupee size={12} />
                      </div>
                      {formatCurrency(receipt.amountPaid).replace('₹', '')}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="text-sm font-medium text-slate-700">{receipt.paymentMethod}</p>
                    {receipt.transactionId && <p className="text-xs text-slate-500">ID: {receipt.transactionId}</p>}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <p className="text-sm text-slate-900">{formatDate(receipt.paymentDate)}</p>
                  </td>
                  <td className="px-6 py-4 align-top text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <button onClick={() => handleSendClick(receipt.id)} className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Send Email">
                        <Send size={16} />
                      </button>
                      <Link href={`/receipt/${receipt.id}`} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors block" title="Download PDF" target="_blank">
                        <Download size={16} />
                      </Link>
                      <div className="w-px h-4 bg-slate-200 mx-1"></div>
                      <Link href={`/dashboard/receipts/create?edit=${receipt.id}`} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors block" title="Edit">
                        <Edit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(receipt.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredReceipts.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-base font-bold text-primary mb-1">No receipts found</h3>
              <p className="text-sm text-slate-500 mb-6">Get started by creating your first receipt.</p>
            </div>
          )}
        </div>
      </div>

      <EmailModal 
        isOpen={emailModalOpen} 
        onClose={() => setEmailModalOpen(false)} 
        onSend={handleSendEmail} 
        documentType="Receipt" 
      />
    </div>
  );
}
