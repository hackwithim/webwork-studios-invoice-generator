import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createLead } from "@/actions/crm";

export default function CreateLeadPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <Link 
          href="/dashboard/crm"
          className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-500" />
        </Link>
        <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>
          Add New Lead
        </h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <form action={createLead} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contact Name *</label>
              <input 
                type="text" 
                name="name" 
                required
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Company Name</label>
              <input 
                type="text" 
                name="companyName" 
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                placeholder="Acme Corp"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input 
                type="email" 
                name="email" 
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input 
                type="tel" 
                name="phone" 
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                placeholder="+1 234 567 8900"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Source</label>
              <input 
                type="text" 
                name="source" 
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                placeholder="Website, LinkedIn, Referral..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              className="h-11 px-8 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              Save Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
