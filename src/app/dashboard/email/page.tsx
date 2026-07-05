import { Send, Plus, Users, BarChart } from "lucide-react";
import Link from "next/link";

export default function EmailCampaignsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Email Campaigns</h1>
          <p className="text-sm text-slate-500 mt-1">Design, schedule, and send professional email campaigns to your clients.</p>
        </div>
        
        <Link
          href="/dashboard/email/create"
          className="w-full sm:w-auto h-10 px-4 rounded-xl bg-violet-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create Campaign
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
            <Send size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Sent</p>
            <h3 className="text-2xl font-bold text-slate-800">0</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
            <Users size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Subscribers</p>
            <h3 className="text-2xl font-bold text-slate-800">0</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <BarChart size={20} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 mb-1">Average Open Rate</p>
            <h3 className="text-2xl font-bold text-slate-800">0%</h3>
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-12 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <Send size={32} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2">No campaigns yet</h2>
        <p className="text-slate-500 max-w-sm mb-6">
          You haven't created any email campaigns yet. Click the button below to start your first campaign.
        </p>
        <Link 
          href="/dashboard/email/create"
          className="h-10 px-6 rounded-xl bg-violet-600 text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create First Campaign
        </Link>
      </div>
    </div>
  );
}
