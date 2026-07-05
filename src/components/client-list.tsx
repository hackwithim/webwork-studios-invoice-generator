"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, MoreVertical, Edit2, Trash2, Mail, Phone, MapPin } from "lucide-react";
import { Client } from "@prisma/client";
import Link from "next/link";
import { deleteClient } from "@/actions/client";
import toast from "react-hot-toast";

export default function ClientList({ initialClients }: { initialClients: Client[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredClients = initialClients.filter(client => 
    client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.clientName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this client?")) {
      toast.promise(
        deleteClient(id),
        {
          loading: 'Deleting client...',
          success: 'Client deleted successfully!',
          error: (err) => `Failed to delete client: ${err.message}`,
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative w-full sm:w-72 mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Clients Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client, i) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative"
          >
            {/* Context Menu Button */}
            <button className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-primary transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
              <MoreVertical size={16} />
            </button>

            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent font-bold text-lg flex items-center justify-center flex-shrink-0" style={{ fontFamily: "var(--font-poppins)" }}>
                {client.companyName.charAt(0)}
              </div>
              <div className="pr-6">
                <h3 className="text-base font-bold text-primary mb-0.5 line-clamp-1" style={{ fontFamily: "var(--font-poppins)" }}>{client.companyName}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border bg-green-50 text-green-600 border-green-200`}>
                    Active
                  </span>
                  {client.gstNumber && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-slate-50 text-slate-500 border-slate-200">
                      GST: {client.gstNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm text-slate-500">
                <Mail size={14} className="text-slate-400" />
                <span className="truncate">{client.email}</span>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Phone size={14} className="text-slate-400" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.billingAddress && (
                <div className="flex items-center gap-2.5 text-sm text-slate-500">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="truncate">{client.billingAddress}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Link href={`/dashboard/clients/${client.id}/edit`} className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-accent transition-colors" title="Edit">
                <Edit2 size={16} />
              </Link>
              <button onClick={() => handleDelete(client.id)} className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors" title="Delete">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
        {filteredClients.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500">
            No clients found.
          </div>
        )}
      </div>
    </div>
  );
}
