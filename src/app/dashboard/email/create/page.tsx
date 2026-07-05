"use client";

import { useState } from "react";
import { ArrowLeft, Send, Users, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    audience: "all_leads"
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleGenerateAI = async () => {
    if (!formData.name) {
      toast.error("Please enter a Campaign Name first so the AI knows what to write about!");
      return;
    }

    setIsGeneratingAI(true);
    const loadingToast = toast.loading("AI is crafting your email...");

    try {
      const res = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name, 
          audience: formData.audience 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI draft");

      setFormData(prev => ({
        ...prev,
        subject: data.subject,
        content: data.content
      }));

      toast.success("AI draft generated successfully!", { id: loadingToast });
    } catch (error: any) {
      toast.error(error.message, { id: loadingToast });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // In a real implementation, this would save to the DB and schedule the campaign
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Campaign created and scheduled successfully!");
      router.push("/dashboard/email");
    } catch (error) {
      toast.error("Failed to create campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/dashboard/email" 
          className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Create Campaign</h1>
          <p className="text-slate-500 text-sm mt-1">Design your new email marketing campaign</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Campaign Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Summer Discount Offer"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Subject Line</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Exclusive 20% off for our best clients!"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Target Audience</label>
                <select 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm bg-white"
                  value={formData.audience}
                  onChange={(e) => setFormData({...formData, audience: e.target.value})}
                >
                  <option value="all_leads">All CRM Leads</option>
                  <option value="new_leads">New Leads (Added in last 30 days)</option>
                  <option value="qualified_leads">Qualified Leads Only</option>
                  <option value="all_clients">All Existing Clients</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between items-center">
                  <span>Email Content</span>
                  <button 
                    type="button" 
                    onClick={handleGenerateAI}
                    disabled={isGeneratingAI}
                    className="text-xs text-violet-600 font-medium hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    {isGeneratingAI ? (
                      <span className="w-3 h-3 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
                    ) : (
                      <FileText size={12} />
                    )}
                    {isGeneratingAI ? "Generating..." : "Use AI Draft"}
                  </button>
                </label>
                <textarea 
                  required
                  rows={8}
                  placeholder="Write your email content here..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all text-sm resize-y"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
                <p className="text-xs text-slate-400 mt-2">
                  You can use variables like {'{first_name}'} or {'{company_name}'} to personalize your emails.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <Link 
                href="/dashboard/email"
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </Link>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {isSubmitting ? "Scheduling..." : "Schedule Campaign"}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-violet-500 to-violet-700 rounded-2xl p-6 text-white shadow-md">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <Users size={18} />
              Estimated Reach
            </h3>
            <p className="text-violet-100 text-sm mb-4">
              Based on your selected audience, this campaign will be sent to approximately:
            </p>
            <div className="text-4xl font-bold font-mono bg-white/20 px-4 py-2 rounded-xl inline-block">
              {formData.audience === 'all_leads' ? '124' : formData.audience === 'all_clients' ? '45' : '82'}
            </div>
            <p className="text-xs text-violet-200 mt-3">
              Recipients
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">Campaign Tips</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                <span>Keep your subject line under 50 characters for best open rates.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                <span>Always include a clear Call-To-Action (CTA) in your content.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 flex-shrink-0" />
                <span>Personalized emails perform 26% better on average.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
