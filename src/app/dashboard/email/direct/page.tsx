"use client";

import { useState } from "react";
import { Mail, Send, User } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DirectMailPage() {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    message: ""
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    toast.loading("Sending direct email...", { id: "direct-mail" });

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          text: formData.message,
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Email sent successfully!", { id: "direct-mail" });
        setFormData({ to: "", subject: "", message: "" });
        router.refresh();
      } else {
        toast.error(data.error || "Failed to send email.", { id: "direct-mail" });
      }
    } catch (error) {
      toast.error("Network error sending email.", { id: "direct-mail" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Direct Mail</h1>
        <p className="text-slate-500 text-sm mt-1">Send a quick, individual email to any client or lead.</p>
      </div>

      <form onSubmit={handleSend} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
              <User size={16} className="text-slate-400" />
              Recipient Email Address
            </label>
            <input 
              type="email" 
              required
              placeholder="e.g., client@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm bg-slate-50"
              value={formData.to}
              onChange={(e) => setFormData({...formData, to: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Subject Line</label>
            <input 
              type="text" 
              required
              placeholder="What is this email about?"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm bg-slate-50"
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Content</label>
            <textarea 
              required
              rows={12}
              placeholder="Write your email here..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm resize-y bg-slate-50"
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button 
            type="submit"
            disabled={isSending}
            className="px-6 h-11 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
            {isSending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {isSending ? "Sending Email..." : "Send Direct Email"}
          </button>
        </div>
      </form>
    </div>
  );
}
