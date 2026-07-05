"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, Trash2, Calendar, FileText, User } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { createInvoice, getNextInvoiceNumber, getInvoiceById, updateInvoice } from "@/actions/invoice";
import { getClients } from "@/actions/client";
import { useRouter, useSearchParams } from "next/navigation";
import AiAssistButton from "@/components/ai-assist-button";

type FormValues = {
  invoiceNumber: string;
  clientId: string;
  date: string;
  dueDate: string;
  items: {
    id: string;
    description: string;
    quantity: number;
    rate: number;
  }[];
  notes: string;
  terms: string;
  isTaxable: boolean;
  taxRate: number;
};

function CreateInvoiceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(!!editId);

  useEffect(() => {
    getClients().then(setClients).catch(console.error);
    
    if (editId) {
      getInvoiceById(editId).then(invoice => {
        if (invoice) {
          setValue("invoiceNumber", invoice.invoiceNumber);
          setValue("clientId", invoice.clientId);
          setValue("date", new Date(invoice.invoiceDate).toISOString().split('T')[0]);
          setValue("dueDate", new Date(invoice.dueDate).toISOString().split('T')[0]);
          setValue("notes", invoice.notes || "");
          setValue("terms", invoice.terms || "");
          setValue("isTaxable", invoice.taxRate > 0);
          setValue("taxRate", invoice.taxRate || 18);
          
          if (invoice.items && invoice.items.length > 0) {
            // Remove default item
            remove(0);
            invoice.items.forEach((item: any) => {
              append({
                id: item.id,
                description: item.description,
                quantity: item.quantity,
                rate: item.rate
              });
            });
          }
        }
        setIsLoading(false);
      }).catch(err => {
        console.error(err);
        setIsLoading(false);
      });
    } else {
      getNextInvoiceNumber().then(num => setValue("invoiceNumber", num)).catch(console.error);
    }
  }, [editId]);
  
  const { register, control, watch, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      invoiceNumber: `INV-${new Date().getFullYear()}-001`,
      clientId: "",
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ id: "1", description: "", quantity: 1, rate: 0 }],
      notes: "Thank you for your business.",
      terms: "Payment is due within 14 days.",
      isTaxable: true,
      taxRate: 18,
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const watchIsTaxable = watch("isTaxable");
  const watchTaxRate = watch("taxRate") || 0;
  
  // Calculations
  const subtotal = watchItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.rate)), 0);
  const gst = watchIsTaxable ? subtotal * (watchTaxRate / 100) : 0;
  const total = subtotal + gst;

  const onSubmit = async (data: FormValues, status: "DRAFT" | "PUBLISHED") => {
    setIsSubmitting(true);
    try {
      if (editId) {
        await updateInvoice(editId, { ...data, subtotal, gst, total, status, taxRate: watchIsTaxable ? watchTaxRate : 0 });
      } else {
        await createInvoice({ ...data, subtotal, gst, total, status, taxRate: watchIsTaxable ? watchTaxRate : 0 });
      }
      router.push("/dashboard/invoices");
    } catch (error) {
      console.error("Failed to save invoice", error);
      alert("Failed to save invoice. Please ensure you have created a client first and selected one.");
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
          <Link href="/dashboard/invoices" className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors bg-white shadow-sm">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>
              {editId ? "Edit Invoice" : "Create Invoice"}
            </h1>
            <p className="text-sm text-slate-500">
              {editId ? "Update your existing invoice." : "Draft a new invoice for your client."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleSubmit((data) => onSubmit(data, "DRAFT"))}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save as Draft"}
          </button>
          <button 
            onClick={handleSubmit((data) => onSubmit(data, "PUBLISHED"))}
            disabled={isSubmitting}
            className="flex-1 sm:flex-none h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save size={16} />
            {isSubmitting ? "Saving..." : "Save & Publish"}
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
                  Invoice Number
                </label>
                <input 
                  {...register("invoiceNumber", { required: "Required" })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  Date of Issue
                </label>
                <input 
                  type="date"
                  {...register("date", { required: "Required" })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  Due Date
                </label>
                <input 
                  type="date"
                  {...register("dueDate", { required: "Required" })}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-slate-700"
                />
              </div>
            </div>
          </motion.div>

          {/* Line Items */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider" style={{ fontFamily: "var(--font-poppins)" }}>Line Items</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-3 w-7/12">Item Description</th>
                    <th className="px-6 py-3 w-2/12">Qty</th>
                    <th className="px-6 py-3 w-2/12">Rate (₹)</th>
                    <th className="px-6 py-3 w-1/12">Amount</th>
                    <th className="px-6 py-3 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-3">
                        <textarea
                          {...register(`items.${index}.description` as const, { required: true })}
                          placeholder="E.g. Web Design Services"
                          className="w-full min-h-[44px] p-2.5 rounded-lg bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none text-sm text-slate-700 placeholder:text-slate-400"
                          rows={1}
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          {...register(`items.${index}.quantity` as const, { valueAsNumber: true, min: 1 })}
                          className="w-full h-11 px-3 rounded-lg bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm text-slate-700 text-center"
                        />
                      </td>
                      <td className="px-6 py-3">
                        <input
                          type="number"
                          {...register(`items.${index}.rate` as const, { valueAsNumber: true, min: 0 })}
                          className="w-full h-11 px-3 rounded-lg bg-transparent border border-transparent hover:border-slate-200 focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all text-sm text-slate-700 text-right"
                        />
                      </td>
                      <td className="px-6 py-3 font-semibold text-slate-800 text-right">
                        {formatCurrency((watchItems[index]?.quantity || 0) * (watchItems[index]?.rate || 0))}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button 
                          type="button" 
                          onClick={() => remove(index)}
                          className="p-2 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button 
                type="button"
                onClick={() => append({ id: Date.now().toString(), description: "", quantity: 1, rate: 0 })}
                className="flex items-center gap-2 text-sm font-medium text-accent hover:text-accent/80 transition-colors px-2 py-1 rounded-lg"
              >
                <Plus size={16} />
                Add Line Item
              </button>
            </div>
          </motion.div>

          {/* Notes & Terms */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700">Notes to Client</label>
                  <AiAssistButton 
                    onGenerate={(text) => setValue("notes", text, { shouldValidate: true, shouldDirty: true })} 
                    context="Creating an invoice. Need professional notes to the client thanking them for their business."
                    placeholder="e.g. Write a professional thank you note"
                  />
                </div>
                <textarea 
                  {...register("notes")}
                  className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none text-slate-700 placeholder:text-slate-400"
                  placeholder="Additional notes or payment instructions..."
                />
              </div>
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-semibold text-slate-700">Terms & Conditions</label>
                  <AiAssistButton 
                    onGenerate={(text) => setValue("terms", text, { shouldValidate: true, shouldDirty: true })} 
                    context="Creating an invoice. Need professional terms and conditions regarding payment deadlines or late fees."
                    placeholder="e.g. Write standard payment terms with 14-day net"
                  />
                </div>
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
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24"
          >
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider" style={{ fontFamily: "var(--font-poppins)" }}>Financial Summary</h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">Subtotal</span>
                <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex flex-col gap-3 py-2">
                <label className="flex items-center gap-2 text-sm text-slate-600 font-medium cursor-pointer">
                  <input type="checkbox" {...register("isTaxable")} className="rounded text-accent focus:ring-accent w-4 h-4 border-slate-300" />
                  Apply Tax (GST)
                </label>
                
                {watchIsTaxable && (
                  <div className="flex justify-between items-center text-sm pl-6">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Tax</span>
                      <div className="flex items-center bg-slate-50 rounded-lg px-2 border border-slate-200">
                        <input type="number" {...register("taxRate", { valueAsNumber: true, min: 0 })} className="w-12 h-7 bg-transparent text-sm focus:outline-none text-right font-medium" />
                        <span className="text-slate-500 text-xs ml-1">%</span>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-800">{formatCurrency(gst)}</span>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-base font-bold text-slate-800 uppercase">Total Amount</span>
                <span className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
               <button className="w-full h-11 rounded-xl border-2 border-slate-200 bg-white text-slate-700 text-sm font-bold flex items-center justify-center gap-2 hover:border-slate-300 hover:bg-slate-50 transition-colors shadow-sm">
                  <FileText size={16} />
                  Preview PDF
               </button>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

export default function CreateInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading editor...</div>}>
      <CreateInvoiceContent />
    </Suspense>
  );
}
