"use client";

import { QrCode, Smartphone, Info, RefreshCw, LogOut, CheckCircle2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";

export default function WhatsAppSettingsPage() {
  const [status, setStatus] = useState<"disconnected" | "generating_qr" | "connected">("disconnected");
  const [qrString, setQrString] = useState<string | null>(null);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp/status");
      if (res.ok) {
        const data = await res.json();
        
        setStatus((prevStatus) => {
          // Handle unexpected errors from the backend initialization
          if (data.error && prevStatus === "generating_qr") {
            toast.error(data.error);
            setLoading(false);
            return "disconnected";
          }
          return data.status;
        });

        if (data.qr && data.qr !== qrString) {
          setQrString(data.qr);
          const url = await QRCode.toDataURL(data.qr, {
            width: 500,
            margin: 2,
            color: { dark: '#0f172a', light: '#ffffff' }
          });
          setQrImageUrl(url);
        }
      }
    } catch (e) {
      console.error("Failed to fetch WhatsApp status", e);
    }
  };

  useEffect(() => {
    // Poll every 3 seconds
    intervalRef.current = setInterval(fetchStatus, 3000);
    fetchStatus(); // Initial fetch

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [qrString]);

  const handleConnect = async () => {
    setLoading(true);
    setStatus("generating_qr");
    setQrImageUrl(null);
    try {
      const res = await fetch("/api/whatsapp/connect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to initialize");
      toast.success("WhatsApp client initializing...");
    } catch (e: any) {
      toast.error(e.message);
      setStatus("disconnected");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/whatsapp/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      setStatus("disconnected");
      setQrImageUrl(null);
      setQrString(null);
      toast.success("Disconnected from WhatsApp");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      await fetch("/api/whatsapp/disconnect", { method: "POST" });
      await fetch("/api/whatsapp/connect", { method: "POST" });
      setStatus("generating_qr");
      setQrImageUrl(null);
      setQrString(null);
      toast.success("Regenerating QR Code...");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>
          WhatsApp Integrations
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-emerald-600 font-semibold text-lg">
              <Smartphone size={24} />
              <h2>Connect WhatsApp Web</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                Sessions: {status === "connected" ? "1" : "0"}
              </span>
              {status === "connected" && (
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={14} /> Active
                </span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-slate-600 leading-relaxed">
            Scan the QR code below using your WhatsApp mobile app to link your account. 
            Once linked, the CRM can send messages directly to your leads.
          </p>

          <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 bg-slate-50 min-h-[300px]">
            {status === "disconnected" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                  <QrCode size={40} />
                </div>
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                  {loading ? "Starting Client..." : "Generate QR Code"}
                </button>
              </div>
            )}

            {status === "generating_qr" && !qrImageUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-48 h-48 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center">
                  <RefreshCw size={32} className="animate-spin text-emerald-600" />
                </div>
                <p className="text-sm font-medium text-slate-500 animate-pulse">Launching WhatsApp Web engine...</p>
              </div>
            )}

            {status === "generating_qr" && qrImageUrl && (
              <div className="flex flex-col items-center gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-2 overflow-hidden">
                  <img src={qrImageUrl} alt="WhatsApp QR Code" className="w-48 h-48 object-contain" />
                </div>
                <p className="text-sm font-medium text-slate-500">Scan this QR Code with your phone</p>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="mt-2 px-4 py-2 bg-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-300 transition flex items-center gap-2 disabled:opacity-50 text-sm"
                >
                  <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                  Regenerate QR Code
                </button>
              </div>
            )}

            {status === "connected" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                  <CheckCircle2 size={48} />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-800">WhatsApp is Connected!</p>
                  <p className="text-xs text-slate-500 mt-1">You can now send messages from the CRM.</p>
                </div>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="mt-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg text-sm transition flex items-center gap-2 disabled:opacity-50"
                >
                  <LogOut size={16} />
                  Disconnect Device
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-blue-800">
            <div className="flex items-start gap-3">
              <Info size={20} className="mt-0.5 shrink-0" />
              <div className="space-y-2 text-sm">
                <h3 className="font-semibold">How it works</h3>
                <p className="text-blue-700/80">
                  When you connect your WhatsApp, we run a headless Chromium browser in the background that keeps your session active. 
                  This allows you to seamlessly send messages from the CRM without needing to pick up your phone.
                </p>
                <div className="pt-2 border-t border-blue-200 mt-2">
                  <strong>Note for Production:</strong> To deploy this fully, you will need to host a dedicated Node.js WhatsApp worker since serverless platforms like Vercel do not support persistent Chromium instances.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
