"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, FileText, ClipboardList, Receipt, Users, Package,
  CreditCard, BarChart3, Settings, LogOut, ChevronRight, Menu, X,
  Wallet, Building2, ArrowLeft, Send, MessageCircle, Mail, Bot, ListOrdered
} from "lucide-react";
import { useState } from "react";
import { logoutUser } from "@/actions/auth";

const invoiceNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/invoices", label: "Invoices", icon: FileText },
  { href: "/dashboard/quotations", label: "Quotations", icon: ClipboardList },
  { href: "/dashboard/receipts", label: "Receipts", icon: Receipt },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/payments", label: "Payments", icon: Wallet },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

const crmNavItems = [
  { href: "/dashboard/crm", label: "CRM & Leads", icon: Users },
  { href: "/dashboard/settings/whatsapp", label: "WhatsApp Setup", icon: MessageCircle },
  { href: "/dashboard/crm/whatsapp-logs", label: "WhatsApp Logs", icon: ListOrdered },
  { href: "/dashboard/crm/ai", label: "AI Assistant", icon: Bot },
];

const emailNavItems = [
  { href: "/dashboard/email", label: "Campaigns", icon: Send },
  { href: "/dashboard/email/direct", label: "Direct Mail", icon: Mail },
  { href: "/dashboard/email/logs", label: "Email Logs", icon: ListOrdered },
  { href: "/dashboard/email/ai", label: "AI Assistant", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  let currentNavItems = invoiceNavItems;
  if (pathname.startsWith("/dashboard/crm") || pathname.startsWith("/dashboard/settings/whatsapp")) {
    currentNavItems = crmNavItems;
  } else if (pathname.startsWith("/dashboard/email")) {
    currentNavItems = emailNavItems;
  }

  const itemsToRender = [
    { href: "/", label: "Back to Apps", icon: ArrowLeft },
    ...currentNavItems
  ];

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
            <Image src="/logo.png" alt="WEBWORK STUDIOS" width={36} height={36} className="object-contain w-full h-full" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase leading-none">Webwork</p>
            <p className="text-sm font-bold text-primary leading-tight" style={{ fontFamily: "var(--font-poppins)" }}>Studios</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {itemsToRender.map(({ href, label, icon: Icon }) => {
          const activeItem = [...itemsToRender]
            .sort((a, b) => b.href.length - a.href.length)
            .find(item => item.href !== "/" && (pathname === item.href || pathname.startsWith(item.href + "/")));
          
          const isActive = href !== "/" && activeItem?.href === href;

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group relative ${
                isActive
                  ? "bg-accent text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-primary"
              }`}
            >
              <Icon size={17} className={isActive ? "text-white" : "text-slate-400 group-hover:text-accent transition-colors"} />
              <span className="flex-1">{label}</span>
              {isActive && <ChevronRight size={14} className="text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Company badge */}
      <div className="px-3 pb-4 space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <Building2 size={14} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-primary truncate">WEBWORK STUDIOS</p>
            <p className="text-[10px] text-slate-400 truncate">Web · Design · Digital</p>
          </div>
        </div>
        <button onClick={() => logoutUser()} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all w-full">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-100 min-h-screen flex-shrink-0">
        {renderSidebarContent()}
      </aside>

      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-premium border border-slate-100 text-primary"
        id="sidebar-toggle"
      >
        <Menu size={20} />
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-64 bg-white z-50 shadow-2xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X size={18} />
              </button>
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
