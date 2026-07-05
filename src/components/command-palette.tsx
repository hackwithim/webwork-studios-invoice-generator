"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Search, FileText, Users, Package, Settings, Home, ClipboardList, Receipt, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Expose a global event to open it from buttons
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    document.addEventListener("open-command-palette", handleOpen);
    return () => document.removeEventListener("open-command-palette", handleOpen);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center pt-[10vh] px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2, type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl"
        >
          <Command 
            className="w-full bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            label="Global Command Menu"
          >
            <div className="flex items-center px-4 border-b border-slate-100">
              <Search size={18} className="text-slate-400 mr-2" />
              <Command.Input 
                autoFocus 
                placeholder="Search clients, create invoices, or jump to..."
                className="w-full h-14 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-[15px]"
              />
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium px-2 py-1 bg-slate-50 rounded-md border border-slate-100">
                ESC
              </div>
            </div>

            <Command.List className="max-h-[350px] overflow-y-auto p-2 scroll-smooth">
              <Command.Empty className="py-10 text-center text-sm text-slate-500">
                No results found.
              </Command.Empty>

              <Command.Group heading="Create New" className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                <Command.Item 
                  onSelect={() => runCommand(() => router.push("/dashboard/invoices/create"))}
                  className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl cursor-pointer text-sm text-slate-700 aria-selected:bg-accent aria-selected:text-white transition-colors"
                >
                  <Plus size={16} className="text-slate-400 group-aria-selected:text-white" />
                  <span>Create Invoice</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push("/dashboard/quotations/create"))}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-slate-700 aria-selected:bg-accent aria-selected:text-white transition-colors"
                >
                  <Plus size={16} className="text-slate-400 group-aria-selected:text-white" />
                  <span>Create Quotation</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push("/dashboard/clients/create"))}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-slate-700 aria-selected:bg-accent aria-selected:text-white transition-colors"
                >
                  <Plus size={16} className="text-slate-400 group-aria-selected:text-white" />
                  <span>Add New Client</span>
                </Command.Item>
              </Command.Group>

              <Command.Group heading="Navigation" className="px-2 py-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                <Command.Item 
                  onSelect={() => runCommand(() => router.push("/dashboard"))}
                  className="flex items-center gap-3 px-3 py-2.5 mt-1 rounded-xl cursor-pointer text-sm text-slate-700 aria-selected:bg-slate-100 aria-selected:text-primary transition-colors"
                >
                  <Home size={16} className="text-slate-400 group-aria-selected:text-primary" />
                  <span>Go to Dashboard</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push("/dashboard/invoices"))}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-slate-700 aria-selected:bg-slate-100 aria-selected:text-primary transition-colors"
                >
                  <FileText size={16} className="text-slate-400 group-aria-selected:text-primary" />
                  <span>View Invoices</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push("/dashboard/clients"))}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-slate-700 aria-selected:bg-slate-100 aria-selected:text-primary transition-colors"
                >
                  <Users size={16} className="text-slate-400 group-aria-selected:text-primary" />
                  <span>View Clients</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push("/dashboard/products"))}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-slate-700 aria-selected:bg-slate-100 aria-selected:text-primary transition-colors"
                >
                  <Package size={16} className="text-slate-400 group-aria-selected:text-primary" />
                  <span>View Products & Services</span>
                </Command.Item>
                <Command.Item 
                  onSelect={() => runCommand(() => router.push("/dashboard/settings"))}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm text-slate-700 aria-selected:bg-slate-100 aria-selected:text-primary transition-colors"
                >
                  <Settings size={16} className="text-slate-400 group-aria-selected:text-primary" />
                  <span>Settings</span>
                </Command.Item>
              </Command.Group>
            </Command.List>
            
            <div className="bg-slate-50 border-t border-slate-100 px-4 py-2.5 flex items-center justify-between text-xs text-slate-500">
               <span>Use <kbd className="font-sans px-1 py-0.5 bg-slate-200/50 rounded text-[10px]">↑</kbd> <kbd className="font-sans px-1 py-0.5 bg-slate-200/50 rounded text-[10px]">↓</kbd> to navigate</span>
               <span>Press <kbd className="font-sans px-1 py-0.5 bg-slate-200/50 rounded text-[10px]">Enter</kbd> to select</span>
            </div>
          </Command>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
