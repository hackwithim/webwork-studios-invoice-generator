"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Wallet, Download, Filter, IndianRupee, MoreVertical, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default function PaymentList({ initialPayments }: { initialPayments: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPayments = initialPayments.filter(pay => 
    pay.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    pay.invoice?.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pay.invoice?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search payments or clients..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          <button className="whitespace-nowrap h-8 px-3 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-50 transition-colors">
            <Filter size={14} /> All Status
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Client & Invoice</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Method</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((payment, index) => (
                <motion.tr 
                  key={payment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Wallet size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary mb-0.5 truncate max-w-[120px]">{payment.receiptNumber}</p>
                        <p className="text-xs text-slate-500">Receipt ID</p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 align-top">
                    <div className="text-sm font-semibold text-slate-800 mb-0.5">{payment.invoice?.client?.companyName}</div>
                    <div className="text-xs text-slate-500">For {payment.invoice?.invoiceNumber}</div>
                  </td>

                  <td className="px-6 py-4 align-top">
                    <div className="text-sm text-slate-800 mb-0.5">{new Date(payment.paymentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    <div className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block">{payment.paymentMethod}</div>
                  </td>
                  
                  <td className="px-6 py-4 align-top text-right">
                    <div className="text-sm font-bold text-slate-900">{formatCurrency(payment.amountPaid)}</div>
                  </td>

                  <td className="px-6 py-4 align-top text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-600 border border-green-100">
                      <CheckCircle2 size={12} />
                      Completed
                    </span>
                  </td>

                  <td className="px-6 py-4 align-top text-right">
                    <button className="p-2 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredPayments.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Wallet size={24} />
              </div>
              <h3 className="text-base font-bold text-primary mb-1">No payments found</h3>
              <p className="text-sm text-slate-500 mb-6">You haven't recorded any payments yet.</p>
              <Link href="/dashboard/receipts/create" className="inline-flex h-10 px-6 rounded-xl bg-primary text-white text-sm font-medium items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
                <Plus size={16} />
                Record a Payment
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
