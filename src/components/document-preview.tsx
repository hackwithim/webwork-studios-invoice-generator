"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Printer, Download, Share2, Cloud, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface DocumentPreviewProps {
  type: "Invoice" | "Quotation" | "Receipt";
  data: any;
  company: any;
  isServerPreview?: boolean;
  isBulkBackup?: boolean;
}

export default function DocumentPreview({ type, data, company, isServerPreview = false, isBulkBackup = false }: DocumentPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const hasAutoSaved = useRef(false);

  const handleSaveToDrive = async () => {
    if (!printRef.current || isSavingToDrive) return;
    setIsSavingToDrive(true);
    
    try {
      const { toJpeg } = await import("html-to-image");
      const { jsPDF } = await import("jspdf");
      
      const element = printRef.current;
      
      // Convert HTML node to a high-quality JPEG
      const dataUrl = await toJpeg(element, { 
        quality: 0.98, 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      // Create a new PDF and add the image
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output("blob");
      
      const filename = `${type}_${numberField}.pdf`;
      
      // Upload to our API
      const formData = new FormData();
      formData.append("file", pdfBlob, filename);
      formData.append("documentType", type);
      formData.append("documentNumber", numberField || "unknown");
      formData.append("documentId", data.id); // Send DB ID for updating driveFileId
      
      const response = await fetch("/api/drive/upload", {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.error || "Upload failed");
      
      toast.success(`${type} saved to Google Drive!`);
      if (isBulkBackup) {
        window.parent.postMessage({ type: 'backup-complete', success: true }, '*');
      }
    } catch (error: any) {
      console.error("Drive error:", error);
      if (!isBulkBackup) toast.error(`Failed to save to Drive: ${error.message}`);
      if (isBulkBackup) {
        window.parent.postMessage({ type: 'backup-complete', success: false, error: error.message }, '*');
      }
    } finally {
      setIsSavingToDrive(false);
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (isBulkBackup) {
       // Force backup immediately on load without checking driveFileId
       setTimeout(() => {
          handleSaveToDrive();
       }, 100);
       return;
    }

    if (isServerPreview) return; // Disable for server-side generation
    if (data && !data.driveFileId && !hasAutoSaved.current) {
      hasAutoSaved.current = true;
      // Slight delay to ensure fonts/images are fully rendered before PDF generation
      setTimeout(() => {
        handleSaveToDrive();
      }, 1500);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isBulkBackup, isServerPreview]);

  const handlePrint = () => {
    window.print();
  };

  // Determine field names based on type
  const numberField = type === "Quotation" ? data.quotationNumber : type === "Receipt" ? data.receiptNumber : data.invoiceNumber;
  const date1Label = type === "Quotation" ? "Quote Date" : type === "Receipt" ? "Payment Date" : "Issue Date";
  const date1Value = type === "Receipt" ? data.paymentDate : data.invoiceDate;
  const date2Label = type === "Quotation" ? "Valid Until" : type === "Receipt" ? "Reference" : "Due Date";
  const date2Value = type === "Quotation" ? data.validityDate : type === "Receipt" ? data.paymentMethod : data.dueDate;

  const clientLabel = type === "Quotation" ? "Prepared For" : type === "Receipt" ? "Received From" : "Billed To";
  const totalLabel = type === "Receipt" ? "Amount Received" : "Total";

  const documentClient = type === "Receipt" ? data.invoice?.client : data.client;

  // Calculations
  const subtotal = data.subtotal || data.subTotal || 0;
  const tax = data.totalTax || ((data.cgst || 0) + (data.sgst || 0)) || 0;
  const total = data.grandTotal || (type === "Receipt" ? data.amountPaid : 0);
  const taxRateStr = data.taxRate ? ` (${data.taxRate}%)` : "";

  return (
    <div className={`min-h-screen bg-slate-100 py-8 px-4 sm:px-8 font-sans print:bg-white print:py-0 print:px-0 ${isServerPreview ? 'py-0 px-0 bg-white min-w-[210mm]' : ''}`}>
      
      {/* Top Action Bar */}
      {!isServerPreview && (
        <div className="max-w-4xl mx-auto mb-6 flex justify-end gap-3 print:hidden">
          <button className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Share2 size={16} />
            Share
          </button>
          <button 
            onClick={handleSaveToDrive} 
            disabled={isSavingToDrive}
            className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSavingToDrive ? <Loader2 size={16} className="animate-spin text-accent" /> : <Cloud size={16} className="text-accent" />}
            {isSavingToDrive ? "Saving..." : "Save to Drive"}
          </button>
          <button onClick={handlePrint} className="h-10 px-4 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm">
            <Download size={16} />
            PDF
          </button>
          <button 
            onClick={handlePrint}
            className="h-10 px-4 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Printer size={16} />
            Print
          </button>
        </div>
      )}

      {/* A4 Paper Container */}
      <div className="max-w-[210mm] mx-auto shadow-xl print:shadow-none print:max-w-none print:w-full">
        <div 
          ref={printRef}
          className="bg-white min-h-[297mm] relative overflow-hidden w-full"
        >
        {/* Decorative Top Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
        <div className="absolute top-0 right-10 w-32 h-2 bg-accent"></div>

        <div className="p-10 sm:p-14">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-16">
            <div className="flex flex-col">
              <div className="w-16 h-16 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center mb-4 overflow-hidden">
                <Image src="/logo.png" alt={company?.companyName || "Company Logo"} width={48} height={48} className="object-contain" />
              </div>
              <h1 className="text-xl font-bold text-primary tracking-tight mb-0.5" style={{ fontFamily: "var(--font-poppins)" }}>{company?.companyName}</h1>
              <p className="text-[10px] font-bold text-accent tracking-wider uppercase mb-3">{company?.services || "Services"}</p>
              <p className="text-sm text-slate-500 mb-0.5">{company?.address?.split(',')[0]}</p>
              <p className="text-sm text-slate-500 mb-2">{company?.address?.split(',').slice(1).join(',')}</p>
              <p className="text-sm font-medium text-slate-600 mb-0.5">{company?.email}</p>
              <p className="text-sm font-medium text-slate-600 mb-0.5">{company?.phone}</p>
              <p className="text-sm font-medium text-slate-600">{company?.website}</p>
            </div>

            <div className="text-right">
              <h2 className="text-4xl font-black text-slate-100 uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-poppins)" }}>{type}</h2>
              <div className="inline-flex flex-col text-right">
                <p className="text-sm font-bold text-slate-800 mb-1">{type} No</p>
                <p className="text-lg font-bold text-primary mb-4" style={{ fontFamily: "var(--font-poppins)" }}>{numberField}</p>
                
                <p className="text-sm font-bold text-slate-800 mb-1">{date1Label}</p>
                <p className="text-sm text-slate-600 mb-4">{date1Value ? new Date(date1Value).toLocaleDateString("en-GB") : ""}</p>
                
                <p className="text-sm font-bold text-slate-800 mb-1">{date2Label}</p>
                <p className="text-sm text-slate-600">{type === "Receipt" ? date2Value : date2Value ? new Date(date2Value).toLocaleDateString("en-GB") : ""}</p>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="mb-12">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">{clientLabel}</p>
            <h3 className="text-lg font-bold text-primary mb-1" style={{ fontFamily: "var(--font-poppins)" }}>{documentClient?.companyName}</h3>
            {documentClient?.address && <p className="text-sm text-slate-600 mb-1 w-2/3">{documentClient?.address}</p>}
            {documentClient?.taxId && <p className="text-sm text-slate-600 mb-1">GSTIN: {documentClient?.taxId}</p>}
            {documentClient?.email && <p className="text-sm text-slate-600 mb-1">{documentClient?.email}</p>}
            {documentClient?.phone && <p className="text-sm text-slate-600">{documentClient?.phone}</p>}
          </div>

          {/* Items Table */}
          {type !== "Receipt" && (
            <div className="mb-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-slate-800 text-sm font-bold text-primary">
                    <th className="py-3 px-2 w-7/12">Description</th>
                    <th className="py-3 px-2 w-2/12 text-center">Qty</th>
                    <th className="py-3 px-2 w-2/12 text-right">Rate</th>
                    <th className="py-3 px-2 w-2/12 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.items?.map((item: any) => (
                    <tr key={item.id}>
                      <td className="py-4 px-2 text-sm font-medium text-slate-800">{item.description}</td>
                      <td className="py-4 px-2 text-sm text-slate-600 text-center">{item.quantity}</td>
                      <td className="py-4 px-2 text-sm text-slate-600 text-right">{formatCurrency(item.rate || item.unitPrice)}</td>
                      <td className="py-4 px-2 text-sm font-bold text-slate-800 text-right">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Receipt Details */}
          {type === "Receipt" && (
            <div className="mb-8">
               <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div>
                        <p className="text-xs text-slate-500 mb-1">For Invoice</p>
                        <p className="text-sm font-bold text-slate-800">{data.invoice?.invoiceNumber || "N/A"}</p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 mb-1">Payment Method</p>
                        <p className="text-sm font-bold text-slate-800">{data.paymentMethod}</p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 mb-1">Project Cost</p>
                        <p className="text-sm font-bold text-slate-800">{formatCurrency(data.invoice?.grandTotal || 0)}</p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500 mb-1">Amount Paid</p>
                        <p className="text-sm font-bold text-primary">{formatCurrency(data.amountPaid)}</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {/* Payment Details */}
          {type === "Invoice" && company && (
            <div className="mb-8 p-6 bg-slate-50 border border-slate-100 rounded-xl">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Payment Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">Bank Transfer</p>
                  <p className="text-sm font-bold text-slate-800">{company.accountName || "Webwork Studios LLP"}</p>
                  <p className="text-sm font-medium text-slate-700">{company.bankName === "MGB" ? "Maharashtra Gramin Bank" : company.bankName}</p>
                  <p className="text-sm text-slate-600">A/C: {company.accountNumber}</p>
                  <p className="text-sm text-slate-600">IFSC: {company.ifscCode}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">UPI Details</p>
                  <p className="text-sm font-medium text-slate-800">
                    {company.upiId === "sureshgaikwad2295-1@okicici" ? "kashinathgaikwad305-4@okhdfcbank" : company.upiId}
                  </p>
                  <div className="mt-2 relative w-24 h-24">
                    <img 
                      src={company.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=300x300&ecc=H&data=${encodeURIComponent(`upi://pay?pa=${company.upiId === "sureshgaikwad2295-1@okicici" ? "kashinathgaikwad305-4@okhdfcbank" : company.upiId}&pn=Webwork Studios LLP`)}`} 
                      alt="UPI QR Code" 
                      className="rounded-lg object-cover border border-slate-200 w-full h-full" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white rounded-full p-1 shadow-sm flex items-center justify-center">
                        <img src="/logo.png" alt="Webwork Studios Logo" className="w-5 h-5 object-contain rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mb-16">
            <div className="w-full sm:w-1/2 md:w-2/5">
              <div className="space-y-3 pt-4 border-t border-slate-200">
                {type !== "Receipt" && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-800">{formatCurrency(subtotal)}</span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-slate-500">Tax{taxRateStr}</span>
                        <span className="font-semibold text-slate-800">{formatCurrency(tax)}</span>
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex justify-between items-end pt-4 pb-2 border-b-2 border-slate-800">
                  <span className="text-sm font-bold text-primary uppercase">{totalLabel}</span>
                  <span className="text-2xl font-black text-primary" style={{ fontFamily: "var(--font-poppins)" }}>
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer: Notes & Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-auto">
            {data.notes && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Notes</p>
                <p className="text-sm text-slate-600 leading-relaxed">{data.notes}</p>
              </div>
            )}
            {data.terms && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Terms & Conditions</p>
                <p className="text-sm text-slate-600 leading-relaxed">{data.terms}</p>
              </div>
            )}
          </div>

        </div>

        {/* Brand Footer */}
        <div className="absolute bottom-0 left-0 w-full h-12 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
          <p className="text-xs font-medium text-slate-400 tracking-widest uppercase">
            Thank you for choosing {company?.companyName || "us"}
          </p>
        </div>
      </div>
    </div>
  </div>
  );
}
