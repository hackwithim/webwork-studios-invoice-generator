"use client";

import { motion } from "framer-motion";
import { Building2, FileText, QrCode, PenTool, Save, Upload, CheckCircle2, Image as ImageIcon, Loader2, Cloud, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { getCompany, updateCompany } from "@/actions/company";
import { uploadImage } from "@/actions/upload";
import SettingsForm from "@/components/settings-form";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploadingQR, setIsUploadingQR] = useState(false);
  const [isUploadingSig, setIsUploadingSig] = useState(false);
  
  const qrInputRef = useRef<HTMLInputElement>(null);
  const sigInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm();

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>, 
    setUploading: (val: boolean) => void, 
    field: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadImage(formData);
      setValue(field, url, { shouldDirty: true });
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    getCompany().then((company) => {
      if (company) {
        reset(company);
      }
      setIsLoading(false);
    });
  }, [reset]);

  const onSubmit = async (data: any) => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await updateCompany(data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to update company", error);
      alert("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "company", label: "Company Details", icon: Building2 },
    { id: "prefixes", label: "Document Prefixes", icon: FileText },
    { id: "payment", label: "Payment & UPI", icon: QrCode },
    { id: "signature", label: "Signatures", icon: PenTool },
    { id: "integrations", label: "Integrations", icon: Cloud },
    { id: "security", label: "Security & Login", icon: ShieldCheck },
  ];

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-96 mb-8"></div>
        <div className="flex gap-8">
          <div className="w-64 space-y-2">
            {[1,2,3,4].map(i => <div key={i} className="h-12 bg-slate-200 rounded-xl w-full"></div>)}
          </div>
          <div className="flex-1 h-[500px] bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-poppins)" }}>Settings</h1>
        <p className="text-sm text-slate-500">Manage your company profile, invoice defaults, and payment integrations.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Settings Navigation */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-primary shadow-sm border border-slate-100"
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary border border-transparent"
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? "text-accent" : "text-slate-400"} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {activeTab !== "security" ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Company Tab */}
                {activeTab === "company" && (
              <div>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Company Details</h3>
                  <p className="text-sm text-slate-500">This information will appear on all your invoices and receipts.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Company Name</label>
                      <input {...register("name")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Support Email</label>
                      <input {...register("email")} type="email" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Phone</label>
                      <input {...register("phone")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Website</label>
                      <input {...register("website")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-sm font-semibold text-slate-700">Registered Address</label>
                      <textarea {...register("address")} className="w-full min-h-[80px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">GSTIN / Tax ID</label>
                      <input {...register("gstin")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">PAN</label>
                      <input {...register("pan")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Prefixes Tab */}
            {activeTab === "prefixes" && (
              <div>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Document Prefixes</h3>
                  <p className="text-sm text-slate-500">Customize the numbering formats for your documents.</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Invoice Prefix</label>
                      <input {...register("invoicePrefix")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Quotation Prefix</label>
                      <input {...register("quotationPrefix")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Receipt Prefix</label>
                      <input {...register("receiptPrefix")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700">Next Auto Number</label>
                      <input {...register("autoNumber")} type="number" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment & UPI Tab */}
            {activeTab === "payment" && (
              <div>
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Payment Options</h3>
                    <p className="text-sm text-slate-500">Configure bank details and UPI QR code to get paid faster.</p>
                  </div>
                </div>
                <div className="p-6 space-y-8">
                  
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Bank Transfer Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Bank Name</label>
                        <input {...register("bankName")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Account Name</label>
                        <input {...register("accountName")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">Account Number</label>
                        <input {...register("accountNumber")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-mono" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">IFSC Code</label>
                        <input {...register("ifscCode")} type="text" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-mono" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-8">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">UPI Integration</h4>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">UPI ID (VPA)</label>
                          <input {...register("upiId")} type="text" className="w-full max-w-sm h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-semibold text-slate-700">QR Code Image URL</label>
                          <div className="flex items-center gap-2 max-w-md">
                            <input {...register("qrCodeUrl")} type="text" className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" placeholder="https://..." />
                            
                            <input 
                              type="file" 
                              accept="image/*" 
                              ref={qrInputRef}
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, setIsUploadingQR, "qrCodeUrl")} 
                            />
                            <button 
                              type="button" 
                              onClick={() => qrInputRef.current?.click()}
                              disabled={isUploadingQR}
                              className="h-11 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2 flex-shrink-0"
                            >
                              {isUploadingQR ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                              Upload
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">This UPI ID and QR code will be dynamically attached to your invoices for seamless payments.</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Signatures Tab */}
            {activeTab === "signature" && (
              <div>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Digital Signatures</h3>
                  <p className="text-sm text-slate-500">Upload authorized signatures to automatically append to documents.</p>
                </div>
                <div className="p-6">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">Signature Image URL</p>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <div className="flex items-center gap-2 w-full max-w-md">
                        <input {...register("signatureUrl")} type="text" className="flex-1 h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" placeholder="https://..." />
                        
                        <input 
                          type="file" 
                          accept="image/*" 
                          ref={sigInputRef}
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, setIsUploadingSig, "signatureUrl")} 
                        />
                        <button 
                          type="button" 
                          onClick={() => sigInputRef.current?.click()}
                          disabled={isUploadingSig}
                          className="h-11 px-4 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2 flex-shrink-0"
                        >
                          {isUploadingSig ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                          Upload
                        </button>
                      </div>
                      
                      {watch("signatureUrl") && (
                        <div className="h-12 border border-slate-200 rounded-lg p-1 bg-white overflow-hidden shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={watch("signatureUrl")} alt="Signature preview" className="h-full object-contain" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 max-w-xs">A transparent PNG is recommended. This will be stamped at the bottom of official invoices.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === "integrations" && (
              <div>
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Integrations</h3>
                    <p className="text-sm text-slate-500">Connect Google Drive and configure SMTP email settings.</p>
                  </div>
                </div>
                <div className="p-6 space-y-8">
                  {/* Google Drive Section */}
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">Google Drive Backup</h4>
                  <div className="space-y-4">
                    <p className="text-sm text-slate-700">
                      Upload your Google Cloud Service Account <strong>JSON Key file</strong> below. This gives the application permission to save PDFs directly into your shared Drive folder.
                    </p>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".json,application/json"
                        id="driveKeyUpload"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const jsonText = event.target?.result as string;
                              // Verify it's valid JSON
                              JSON.parse(jsonText);
                              setValue("googleDriveKey", jsonText, { shouldDirty: true });
                              alert("Key file loaded successfully! Don't forget to click 'Save Changes'.");
                            } catch (err) {
                              alert("Invalid JSON file uploaded.");
                            }
                          };
                          reader.readAsText(file);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById("driveKeyUpload")?.click()}
                        className="h-11 px-6 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-200 transition-colors flex items-center gap-2"
                      >
                        <Upload size={16} />
                        Upload JSON Key
                      </button>
                      {watch("googleDriveKey") && (
                        <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 size={16} /> Key Loaded
                        </span>
                      )}
                    </div>
                    {watch("googleDriveKey") && (
                      <div className="space-y-3 mt-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-xs text-slate-500 font-mono break-all line-clamp-3">
                            {watch("googleDriveKey")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setValue("googleDriveKey", null, { shouldDirty: true });
                          }}
                          className="text-sm font-medium text-red-600 hover:text-red-700 underline underline-offset-4"
                        >
                          Remove Key & Disable Google Drive Sync
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* SMTP Settings Section */}
                <div className="border-t border-slate-100 pt-8">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-4">SMTP Email Settings</h4>
                    <p className="text-sm text-slate-500 mb-6">Configure your own SMTP server to send campaigns and direct emails from your custom domain.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">SMTP Host</label>
                        <input {...register("smtpHost")} type="text" placeholder="e.g., smtp.gmail.com" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">SMTP Port</label>
                        <input {...register("smtpPort")} type="number" placeholder="e.g., 587 or 465" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">SMTP Username</label>
                        <input {...register("smtpUser")} type="text" placeholder="e.g., your_email@gmail.com" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">SMTP Password (or App Password)</label>
                        <input {...register("smtpPassword")} type="password" placeholder="••••••••••••••••" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Action */}
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end items-center gap-4">
                  {saveSuccess && (
                    <span className="text-sm font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={16} /> Saved successfully
                    </span>
                  )}
                  <button disabled={isSaving} className="h-10 px-6 rounded-xl bg-primary text-white text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50">
                    <Save size={16} />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            ) : (
              <SettingsForm />
            )}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
