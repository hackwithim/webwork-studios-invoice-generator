import { ArrowLeft, Save, Package, IndianRupee, Tag, Info } from "lucide-react";
import Link from "next/link";
import { updateProduct } from "@/actions/product";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import AiAssistButton from "@/components/ai-assist-button";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    notFound();
  }

  // Wrapper to satisfy TypeScript for form action
  const submitAction = async (formData: FormData) => {
    "use server";
    await updateProduct(product.id, formData);
  };

  return (
    <form action={submitAction} className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/products" className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-primary transition-colors bg-white shadow-sm">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary" style={{ fontFamily: "var(--font-poppins)" }}>Edit Product/Service</h1>
            <p className="text-sm text-slate-500">Update catalog item details.</p>
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
            <Package size={16} className="text-accent" />
            Item Details
          </h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            
            <div className="flex gap-6">
              <label className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="category" 
                  value="Service"
                  className="peer sr-only"
                  defaultChecked={product.category === "Service" || !product.category}
                />
                <div className="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white text-slate-500 font-bold uppercase tracking-wider text-xs peer-checked:border-accent peer-checked:bg-accent/5 peer-checked:text-accent transition-all">
                  <Tag size={16} /> Service
                </div>
              </label>
              <label className="flex-1 cursor-pointer">
                <input 
                  type="radio" 
                  name="category" 
                  value="Product"
                  className="peer sr-only"
                  defaultChecked={product.category === "Product"}
                />
                <div className="h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white text-slate-500 font-bold uppercase tracking-wider text-xs peer-checked:border-accent peer-checked:bg-accent/5 peer-checked:text-accent transition-all">
                  <Package size={16} /> Product
                </div>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Item Name <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                name="serviceName"
                required
                defaultValue={product.serviceName}
                placeholder="e.g. Website Maintenance (Monthly)" 
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all" 
              />
            </div>
            
            <div className="space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700">Description</label>
              </div>
              <textarea 
                name="description"
                defaultValue={product.description || ""}
                placeholder="Detailed description to appear on the invoice..." 
                className="w-full min-h-[100px] p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all resize-none mt-1" 
              />
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Info size={12} /> Can be overridden while creating an invoice.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Base Price (Rate) <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <IndianRupee size={16} />
                </div>
                <input 
                  type="number" 
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  defaultValue={product.price}
                  placeholder="0.00" 
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-medium text-slate-800" 
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </form>
  );
}
