"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical, Edit2, Trash2, Package, Filter, IndianRupee } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { deleteProduct } from "@/actions/product";
import toast from "react-hot-toast";

export default function ProductList({ initialProducts }: { initialProducts: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = initialProducts.filter(prod => 
    prod.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prod.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      toast.promise(
        deleteProduct(id),
        {
          loading: 'Deleting product...',
          success: 'Product deleted successfully!',
          error: (err) => `Failed to delete product: ${err.message}`,
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products & services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
            />
          </div>
          <button className="h-10 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-100 hover:text-primary transition-colors focus:ring-2 focus:ring-accent/20">
            <Filter size={16} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Product / Service</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product, i) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center flex-shrink-0 group-hover:bg-accent group-hover:text-white transition-colors">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary mb-0.5">{product.serviceName}</p>
                        {product.description && <p className="text-xs text-slate-500 truncate max-w-[200px]">{product.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">{product.category || "Uncategorized"}</span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                      <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                        <IndianRupee size={12} />
                      </div>
                      {formatCurrency(product.price).replace('₹', '')}
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className="text-sm text-slate-600">{product.unit}</span>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border inline-block ${product.status === 'active' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                      {product.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 align-middle text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <Link href={`/dashboard/products/${product.id}/edit`} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredProducts.length === 0 && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Package size={24} />
              </div>
              <h3 className="text-base font-bold text-primary mb-1">No products found</h3>
              <p className="text-sm text-slate-500 mb-6">Get started by creating your first product or service.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
