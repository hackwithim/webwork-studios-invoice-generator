"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SendManualEmail({ lead }: { lead: any }) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.email) {
      toast.error("This lead does not have an email address.");
      return;
    }

    setIsSending(true);
    toast.loading("Sending email...", { id: "sending-manual" });
    
    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: lead.email,
          subject,
          text: message,
          leadId: lead.id
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Email sent successfully!", { id: "sending-manual" });
        setSubject("");
        setMessage("");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to send email.", { id: "sending-manual" });
      }
    } catch (error) {
      toast.error("Network error sending email.", { id: "sending-manual" });
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm text-slate-600 font-medium hover:bg-slate-50 transition-colors"
      >
        <Mail size={18} />
        Compose Individual Email
      </button>
    );
  }

  return (
    <form onSubmit={handleSendEmail} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <Mail size={18} className="text-violet-600" />
          <h2>Compose Email to {lead.name}</h2>
        </div>
        <button 
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-sm text-slate-400 hover:text-slate-600"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
          <input
            required
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email Subject"
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Message</label>
          <textarea
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/20 bg-white resize-y"
          />
        </div>
        
        <div className="flex justify-end pt-2">
          <button 
            type="submit"
            disabled={isSending || !lead.email}
            className="px-5 h-10 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
            {isSending ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </form>
  );
}
