import { ArrowLeft, Save, Building2, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import Link from "next/link";
import { updateClient } from "@/actions/client";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await prisma.client.findUnique({
    where: { id }
  });

  if (!client) {
    notFound();
  }

  // We need to bind the updateClient action with the ID
  const updateClientWithId = updateClient.bind(null, client.id);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <form action={updateClientWithId}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/clients" className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors bg-white shadow-sm">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Edit Client</h1>
              <p className="text-sm text-slate-500">Update client profile for billing and invoicing.</p>
            </div>
          </div>
          
          <button type="submit" className="w-full sm:w-auto h-10 px-6 rounded-xl bg-primary text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-sm">
            <Save size={16} />
            Save Changes
          </button>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Building2 size={16} className="text-accent" />
              Company Information
            </h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Company / Client Name <span className="text-red-500">*</span></label>
                <input name="companyName" defaultValue={client.companyName} type="text" required placeholder="e.g. Acme Corporation" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Primary Contact Name <span className="text-red-500">*</span></label>
                <input name="clientName" defaultValue={client.clientName} type="text" required placeholder="e.g. John Doe" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Briefcase size={14} className="text-slate-400" /> GSTIN / Tax ID
                </label>
                <input name="gstNumber" defaultValue={client.gstNumber || ""} type="text" placeholder="e.g. 27AADCB2230M1Z2" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">PAN Number</label>
                <input name="pan" defaultValue={client.pan || ""} type="text" placeholder="e.g. ABCDE1234F" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase" />
              </div>
            </div>
          </div>

          <div className="p-6 border-y border-slate-100 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <MapPin size={16} className="text-accent" />
              Contact & Location
            </h3>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Mail size={14} className="text-slate-400" /> Billing Email <span className="text-red-500">*</span>
                </label>
                <input name="email" defaultValue={client.email} type="email" required placeholder="billing@company.com" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" /> Phone Number
                </label>
                <input name="phone" defaultValue={client.phone || ""} type="tel" placeholder="+91 98765 43210" className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700">Billing Address <span className="text-red-500">*</span></label>
                <textarea name="billingAddress" defaultValue={client.billingAddress} required placeholder="Complete registered address for invoices..." className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none" />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
