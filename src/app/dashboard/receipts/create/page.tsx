"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Calendar, FileText, User } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { createReceipt, getNextReceiptNumber, getReceiptById, updateReceipt } from "@/actions/receipt";
import { getClients } from "@/actions/client";
import { getInvoices } from "@/actions/invoice";
import { useRouter, useSearchParams } from "next/navigation";

type FormValues = {
  receiptNumber: string;
  clientId: string;
  invoiceId: string;
  date: string;
  paymentMethod: string;
  amountPaid: number;
  notes: string;
  terms: string;
};

function CreateReceiptContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!!editId);

  useEffect(() => {
    getClients().then(setClients).catch(console.error);
    getInvoices().then(setInvoices).catch(console.error);
    
    if (editId) {
      getReceiptById(editId).then(receipt => {
        if (receipt) {
          setValue("receiptNumber", receipt.receiptNumber);
          setValue("clientId", receipt.invoice?.clientId || "");
          setValue("invoiceId", receipt.invoiceId);
          setValue("date", new Date(receipt.paymentDate).toISOString().split('T')[0]);
          setValue("paymentMethod", receipt.paymentMethod);
          setValue("amountPaid", receipt.amountPaid);
          setValue("notes", receipt.remarks || "");
        }
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
        setIsLoading(false);
      });
    } else {
      getNextReceiptNumber().then(num => setValue("receiptNumber", num)).catch(console.error);
    }
  }, [editId]);
  
  const { register, watch, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      receiptNumber: `REC-${new Date().getFullYear()}-001`,
      clientId: "",
      invoiceId: "",
      date: new Date().toISOString().split('T')[0],
      paymentMethod: "Bank Transfer",
      amountPaid: 0,
      notes: "Thank you for your payment.",
      terms: "This is a computer generated receipt.",
    }
  });

  const watchClientId = watch("clientId");
  const watchInvoiceId = watch("invoiceId");
  const watchAmountPaid = watch("amountPaid") || 0;

  const filteredInvoices = invoices.filter(inv => inv.clientId === watchClientId);
  const selectedInvoice = invoices.find(inv => inv.id === watchInvoiceId);
  const selectedClient = clients.find(c => c.id === watchClientId);
  
  const totalProjectCost = selectedInvoice?.grandTotal || 0;
  const balanceRemaining = Math.max(0, totalProjectCost - watchAmountPaid);
  
  const isFullPayment = watchAmountPaid > 0 && watchAmountPaid >= totalProjectCost;
  const isPartialPayment = watchAmountPaid > 0 && watchAmountPaid < totalProjectCost;

  const onSubmit = async (data: FormValues) => {
    if (!data.invoiceId) {
      alert("Please select an invoice.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editId) {
        await updateReceipt(editId, {
          ...data,
          receivedFrom: selectedClient?.companyName || "Client"
        });
      } else {
        await createReceipt({ 
          ...data, 
          receivedFrom: selectedClient?.companyName || "Client"
        });
      }
      router.push("/dashboard/receipts");
    } catch (error) {
      console.error("Failed to save receipt", error);
      alert("Failed to save receipt.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/receipts" className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors bg-white shadow-sm">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>
              {editId ? "Edit Receipt" : "Create Receipt"}
            </h1>
            <p className="text-sm text-slate-500">
              {editId ? "Update your existing payment receipt." : "Draft a new payment receipt for your client."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            {isSubmitting ? "Saving..." : "Save Receipt"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Editor */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Document Details */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6"
          >
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2" style={{ fontFamily: "var(--font-poppins)" }}>Document Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  Client
                </label>
                <select 
                  {...register("clientId", { required: "Client is required" })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.companyName} ({client.clientName})</option>
                  ))}
                </select>
                {errors.clientId && <p className="text-xs text-red-500 mt-1">{errors.clientId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText size={14} className="text-slate-400" />
                  Invoice
                </label>
                <select 
                  {...register("invoiceId", { required: "Invoice is required" })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                  disabled={!watchClientId}
                >
                  <option value="">Select an invoice...</option>
                  {filteredInvoices.map(invoice => (
                    <option key={invoice.id} value={invoice.id}>{invoice.invoiceNumber} - {formatCurrency(invoice.grandTotal)}</option>
                  ))}
                </select>
                {errors.invoiceId && <p className="text-xs text-red-500 mt-1">{errors.invoiceId.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText size={14} className="text-slate-400" />
                  Receipt Number
                </label>
                <input 
                  {...register("receiptNumber", { required: "Required" })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  Payment Date
                </label>
                <input 
                  type="date"
                  {...register("date", { required: "Required" })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-700"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <FileText size={14} className="text-slate-400" />
                  Payment Method
                </label>
                <select 
                  {...register("paymentMethod", { required: "Required" })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-700"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Notes & Terms */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Remarks</label>
                <textarea 
                  {...register("notes")}
                  className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none text-slate-700 placeholder:text-slate-400"
                  placeholder="Additional notes for the receipt..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Terms & Conditions</label>
                <textarea 
                  {...register("terms")}
                  className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none text-slate-700 placeholder:text-slate-400"
                  placeholder="Terms and conditions..."
                />
              </div>
            </div>
          </motion.div>

        </div>

        {/* Right Column: Summary & Actions */}
        <div className="xl:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24"
          >
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider" style={{ fontFamily: "var(--font-poppins)" }}>Payment Summary</h3>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Project Cost</p>
                <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: "var(--font-poppins)" }}>
                  {formatCurrency(totalProjectCost)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount Paid</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium">₹</span>
                  <input
                    type="number"
                    {...register("amountPaid", { valueAsNumber: true, min: 1 })}
                    className="w-full h-14 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-lg font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    placeholder="0.00"
                  />
                </div>
                {isFullPayment && <p className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-1 rounded-md">Paid in Full</p>}
                {isPartialPayment && <p className="text-xs font-medium text-amber-600 bg-amber-50 inline-block px-2 py-1 rounded-md">Partial Payment</p>}
              </div>
              
              <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-bold text-slate-600 uppercase">Balance Remaining</span>
                <span className="text-lg font-bold text-slate-800" style={{ fontFamily: "var(--font-poppins)" }}>
                  {formatCurrency(balanceRemaining)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

export default function CreateReceiptPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading editor...</div>}>
      <CreateReceiptContent />
    </Suspense>
  );
}
