"use client";

import { useState } from "react";
import { Sparkles, Send, MessageSquare } from "lucide-react";
import { draftOutreachMessage } from "@/actions/ai";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AICraftMessage({ lead }: { lead: any }) {
  const [context, setContext] = useState("");
  const [draft, setDraft] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const router = useRouter();

  const handleDraft = async (type: "email" | "whatsapp") => {
    setIsDrafting(true);
    toast.loading(`Drafting ${type}...`, { id: "drafting" });
    try {
      const response = await draftOutreachMessage(lead, context, type);
      if (response.success && response.text) {
        setDraft(response.text);
        toast.success("Draft created successfully!", { id: "drafting" });
      } else {
        toast.error(response.error || "Failed to generate draft.", { id: "drafting" });
      }
    } catch (error: any) {
      toast.error("Error generating draft.", { id: "drafting" });
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!draft) return;
    setIsSending(true);
    toast.loading("Sending email...", { id: "sending" });
    
    // Extract subject if generated (assuming format "Subject: [Text]")
    const subjectMatch = draft.match(/Subject:\s*(.*)/i);
    const subject = subjectMatch ? subjectMatch[1] : `Outreach to ${lead.name}`;
    const body = draft.replace(/Subject:\s*(.*)\n?/i, "");

    try {
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: lead.email,
          subject,
          text: body,
          leadId: lead.id
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Email sent successfully!", { id: "sending" });
        setDraft("");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to send email.", { id: "sending" });
      }
    } catch (error) {
      toast.error("Network error sending email.", { id: "sending" });
    } finally {
      setIsSending(false);
    }
  };

  const handleSendWhatsApp = async () => {
    if (!draft) return;
    setIsSending(true);
    toast.loading("Sending WhatsApp message...", { id: "sending" });
    
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: lead.phone,
          text: draft,
          leadId: lead.id
        })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("WhatsApp message sent successfully!", { id: "sending" });
        setDraft("");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to send WhatsApp message.", { id: "sending" });
      }
    } catch (error) {
      toast.error("Network error sending WhatsApp message.", { id: "sending" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden p-6 space-y-4">
      <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
        <Sparkles size={20} />
        <h2>AI Outreach Assistant</h2>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">What do you want to tell them?</label>
        <textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="e.g. Mention our new 20% discount on B2B services, and ask if they are free for a quick call next Tuesday."
          className="w-full min-h-20 p-3 text-sm rounded-xl border border-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
        />
        <div className="flex gap-2">
          <button 
            onClick={() => handleDraft("email")}
            disabled={isDrafting}
            className="flex-1 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            Draft Email
          </button>
          <button 
            onClick={() => handleDraft("whatsapp")}
            disabled={isDrafting}
            className="flex-1 h-10 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Draft WhatsApp
          </button>
        </div>
      </div>

      {draft && (
        <div className="mt-6 space-y-3 pt-6 border-t border-indigo-100">
          <label className="text-sm font-medium text-slate-700">Generated Draft (Edit as needed)</label>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full min-h-40 p-3 text-sm rounded-xl border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-indigo-50/30"
          />
          <div className="flex gap-2 justify-end">
            <button 
              onClick={handleSendWhatsApp}
              disabled={isSending || !lead.phone}
              className="px-4 h-10 rounded-xl bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 flex items-center gap-2 disabled:opacity-50"
            >
              <MessageSquare size={16} />
              Send WhatsApp
            </button>
            <button 
              onClick={handleSendEmail}
              disabled={isSending || !lead.email}
              className="px-4 h-10 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              Send Email
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
