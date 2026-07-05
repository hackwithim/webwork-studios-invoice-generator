import Link from "next/link";
import Image from "next/image";
import { FileText, LogOut, ArrowRight, AppWindow, Settings, Users, Send } from "lucide-react";
import { logoutUser } from "@/actions/auth";

export default function AppLauncherPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-slate-100">
            <Image src="/logo.png" alt="WEBWORK STUDIOS" width={32} height={32} className="object-contain w-full h-full bg-white" />
          </div>
          <div className="font-bold text-primary tracking-tight" style={{ fontFamily: "var(--font-poppins)" }}>
            WEBWORK <span className="text-accent">STUDIOS</span>
          </div>
        </div>
        <form action={logoutUser}>
          <button type="submit" className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors">
            <LogOut size={16} />
            Logout
          </button>
        </form>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-8 pt-16">
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-primary mb-3" style={{ fontFamily: "var(--font-poppins)" }}>
            Welcome back, Admin 👋
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl">
            Select an application below to manage your business operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* App 1: Invoice Generator */}
          <Link href="/dashboard" className="group block bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-accent/30 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6 group-hover:scale-110 transition-transform">
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-poppins)" }}>Invoice Generator</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Create, manage, and track professional invoices, quotations, and receipts for your clients.
            </p>
            <div className="flex items-center text-accent font-semibold text-sm">
              Launch App <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* App 2: Clients CRM */}
          <Link href="/dashboard/crm" className="group block bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/30 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-poppins)" }}>Clients CRM</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Manage client relationships, track leads, and monitor interactions seamlessly.
            </p>
            <div className="flex items-center text-emerald-600 font-semibold text-sm">
              Launch App <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* App 3: Email Campaigns */}
          <Link href="/dashboard/email" className="group block bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-violet-500/30 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-bl-full transition-transform group-hover:scale-110" />
            <div className="w-14 h-14 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 transition-transform">
              <Send size={28} />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2" style={{ fontFamily: "var(--font-poppins)" }}>Email Campaigns</h3>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Design, schedule, and send professional email campaigns and notifications to your clients.
            </p>
            <div className="flex items-center text-violet-600 font-semibold text-sm">
              Launch App <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Future App Placeholder */}
          <div className="group block bg-slate-50/50 rounded-3xl p-6 border border-slate-200 border-dashed relative overflow-hidden opacity-70">
            <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
              <AppWindow size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2" style={{ fontFamily: "var(--font-poppins)" }}>Project Manager</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Coming soon. Manage internal tasks, timelines, and team collaboration.
            </p>
            <div className="flex items-center text-slate-400 font-semibold text-sm">
              Coming Soon
            </div>
          </div>

          {/* Settings Placeholder */}
          <div className="group block bg-slate-50/50 rounded-3xl p-6 border border-slate-200 border-dashed relative overflow-hidden opacity-70">
            <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center text-slate-400 mb-6">
              <Settings size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-400 mb-2" style={{ fontFamily: "var(--font-poppins)" }}>Workspace Settings</h3>
            <p className="text-slate-400 text-sm mb-8 leading-relaxed">
              Coming soon. Configure global company settings and team member access.
            </p>
            <div className="flex items-center text-slate-400 font-semibold text-sm">
              Coming Soon
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
