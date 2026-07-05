"use client";

import { useState, useRef } from "react";
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Papa from "papaparse";
import { syncContacts } from "@/actions/sync";
import { useRouter } from "next/navigation";

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SyncContactsModal({ isOpen, onClose }: SyncModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [parsedContacts, setParsedContacts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
        setError("Please upload a valid CSV file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
      setSuccess(null);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (csvFile: File) => {
    setIsParsing(true);
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[];
        
        // Map common Google/Outlook contact CSV headers
        const contacts = data.map(row => {
          const name = row["Name"] || row["Given Name"] || row["First Name"] || "";
          // Look for Email headers
          const email = row["E-mail 1 - Value"] || row["E-mail Address"] || row["Email"] || row["email"] || "";
          // Look for Phone headers
          const phone = row["Phone 1 - Value"] || row["Primary Phone"] || row["Phone"] || row["Mobile Phone"] || row["Mobile"] || "";
          
          return { name: name.trim(), email: email.trim(), phone: phone.trim() };
        }).filter(c => c.name && (c.email || c.phone));

        setParsedContacts(contacts);
        setIsParsing(false);
        if (contacts.length === 0) {
          setError("No valid contacts found. Please ensure the CSV has Name and Email/Phone columns.");
        }
      },
      error: (err: any) => {
        setError("Failed to parse CSV file: " + err.message);
        setIsParsing(false);
      }
    });
  };

  const handleSync = async () => {
    if (parsedContacts.length === 0) return;
    
    setIsSyncing(true);
    setError(null);
    
    try {
      const result = await syncContacts(parsedContacts);
      if (result.success) {
        setSuccess(`Successfully imported ${result.count} new contacts!`);
        setTimeout(() => {
          onClose();
          router.refresh();
        }, 2000);
      } else {
        setError(result.error || "Failed to sync contacts.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedContacts([]);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100"
          >
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "var(--font-poppins)" }}>
                Sync Contacts
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8">
              {!file ? (
                <div 
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:border-accent hover:bg-accent/5 transition-colors cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-slate-100 group-hover:bg-accent/10 rounded-full flex items-center justify-center mb-4 transition-colors">
                    <UploadCloud size={32} className="text-slate-400 group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-slate-800 font-semibold mb-2">Upload Google Contacts CSV</h3>
                  <p className="text-slate-500 text-sm max-w-[250px]">
                    Export your contacts from Google Contacts or Outlook as a CSV and upload here.
                  </p>
                  <input 
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                  <button className="mt-6 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
                    Select File
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center shrink-0">
                      <FileText size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-slate-800 font-medium truncate">{file.name}</h4>
                      <p className="text-slate-500 text-sm">
                        {isParsing ? "Analyzing file..." : `${parsedContacts.length} valid contacts found`}
                      </p>
                    </div>
                    {!isSyncing && !success && (
                      <button 
                        onClick={handleReset}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-start gap-3">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl text-sm border border-emerald-100 flex items-start gap-3">
                      <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                      <span>{success}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={onClose}
                      disabled={isSyncing}
                      className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSync}
                      disabled={isParsing || isSyncing || parsedContacts.length === 0 || !!success}
                      className="px-6 py-2.5 bg-accent text-white font-medium hover:bg-accent/90 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSyncing ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Importing...
                        </>
                      ) : success ? (
                        <>
                          <CheckCircle2 size={18} />
                          Done
                        </>
                      ) : (
                        `Import ${parsedContacts.length} Contacts`
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
