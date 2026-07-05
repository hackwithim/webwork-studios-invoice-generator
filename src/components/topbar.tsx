"use client";

import { Bell, Search, Plus, Command, Cloud, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/invoices": "Invoices",
  "/dashboard/invoices/create": "New Invoice",
  "/dashboard/quotations": "Quotations",
  "/dashboard/quotations/create": "New Quotation",
  "/dashboard/receipts": "Receipts",
  "/dashboard/receipts/create": "New Receipt",
  "/dashboard/clients": "Clients",
  "/dashboard/clients/create": "New Client",
  "/dashboard/products": "Products & Services",
  "/dashboard/products/create": "New Product/Service",
  "/dashboard/payments": "Payments",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
};

const quickCreateLinks: Record<string, string> = {
  "/dashboard/invoices": "/dashboard/invoices/create",
  "/dashboard/quotations": "/dashboard/quotations/create",
  "/dashboard/clients": "/dashboard/clients/create",
  "/dashboard/products": "/dashboard/products/create",
};

export default function TopBar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "WEBWORK STUDIOS";
  const createLink = quickCreateLinks[pathname];
  const [isBackingUp, setIsBackingUp] = useState(false);
  
  const [backupQueue, setBackupQueue] = useState<{type: string, id: string, num: string}[]>([]);
  const [currentBackupIndex, setCurrentBackupIndex] = useState(-1);
  const [toastId, setToastId] = useState<string | null>(null);

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "System Ready", message: "Webwork Studios Invoice Generator is running.", time: "Just now", unread: true },
    { id: 2, title: "Google Drive Connected", message: "Your backup system is ready to use.", time: "1 hr ago", unread: false }
  ]);
  const unreadCount = notifications.filter(n => n.unread).length;

  const handleBackupAll = async () => {
    if (isBackingUp) return;
    setIsBackingUp(true);
    const tId = toast.loading("Initializing backup process...");
    setToastId(tId);
    
    try {
      const response = await fetch("/api/drive/get-all-docs");
      const docs = await response.json();
      
      if (!response.ok) throw new Error(docs.error || "Failed to fetch documents");
      
      if (docs.length === 0) {
        toast.success("No documents to backup!", { id: tId });
        setIsBackingUp(false);
        return;
      }

      setBackupQueue(docs);
      setCurrentBackupIndex(0);
      toast.loading(`Backing up 1 of ${docs.length}...`, { id: tId });
    } catch (error: any) {
      console.error("Backup error:", error);
      toast.error(`Failed to start backup: ${error.message}`, { id: tId });
      setIsBackingUp(false);
    }
  };

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const moveToNext = () => {
      const nextIndex = currentBackupIndex + 1;
      if (nextIndex < backupQueue.length) {
        setCurrentBackupIndex(nextIndex);
        if (toastId) toast.loading(`Backing up ${nextIndex + 1} of ${backupQueue.length}...`, { id: toastId });
      } else {
        if (toastId) toast.success(`Backup complete! ${backupQueue.length} files processed.`, { id: toastId });
        setNotifications(prev => [
          {
            id: Date.now(),
            title: "Backup Complete",
            message: `Successfully backed up ${backupQueue.length} documents to Google Drive.`,
            time: "Just now",
            unread: true
          },
          ...prev
        ]);
        setIsBackingUp(false);
        setCurrentBackupIndex(-1);
        setBackupQueue([]);
      }
    };

    const handler = (e: MessageEvent) => {
      if (e.data && e.data.type === 'backup-complete') {
        clearTimeout(timeoutId);
        moveToNext();
      }
    };

    if (currentBackupIndex >= 0 && currentBackupIndex < backupQueue.length) {
      window.addEventListener('message', handler);
      // Fallback timeout in case html-to-image hangs (15 seconds)
      timeoutId = setTimeout(() => {
        console.warn(`Backup timed out for index ${currentBackupIndex}`);
        moveToNext();
      }, 15000);
    }

    return () => {
      window.removeEventListener('message', handler);
      clearTimeout(timeoutId);
    };
  }, [currentBackupIndex, backupQueue, toastId]);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center gap-4 px-6 flex-shrink-0 sticky top-0 z-30">
      {/* Page title */}
      <div className="flex-1 min-w-0 pl-10 lg:pl-0">
        <h1 className="text-base font-semibold text-primary truncate" style={{ fontFamily: "var(--font-poppins)" }}>
          {title}
        </h1>
      </div>

      {/* Search bar */}
      <button
        onClick={() => document.dispatchEvent(new CustomEvent("open-command-palette"))}
        className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-400 text-sm hover:border-accent/40 hover:text-slate-600 transition-all bg-slate-50 w-52"
        id="global-search-btn"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search…</span>
        <span className="flex items-center gap-0.5 text-[10px] bg-white border border-slate-200 rounded-md px-1 py-0.5">
          <Command size={9} />K
        </span>
      </button>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={handleBackupAll} 
          disabled={isBackingUp}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
          title="Backup all documents to Google Drive"
        >
          {isBackingUp ? <Loader2 size={15} className="animate-spin text-accent" /> : <Cloud size={15} className="text-accent" />}
          <span>{isBackingUp ? "Starting..." : "Backup All"}</span>
        </button>

        {createLink && (
          <a
            href={createLink}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors shadow-sm"
            id="topbar-create-btn"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New</span>
          </a>
        )}
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-primary transition-colors" 
            id="notifications-btn"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
            )}
          </button>
          
          {showNotifications && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowNotifications(false)} 
              />
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/50">
                  <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))}
                      className="text-[11px] text-accent font-medium hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-slate-50">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id} 
                          className={`p-4 transition-colors hover:bg-slate-50 cursor-pointer ${notif.unread ? 'bg-blue-50/30' : ''}`}
                          onClick={() => {
                            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
                          }}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-sm ${notif.unread ? 'font-semibold text-slate-800' : 'font-medium text-slate-700'}`}>
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                              {notif.time}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400">
                      <Bell size={24} className="mb-2 opacity-20" />
                      <p className="text-sm">No notifications yet</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <button className="w-8 h-8 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm" id="user-avatar-btn">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain bg-white" />
        </button>
      </div>

      {/* Hidden iframe for backup processing */}
      {currentBackupIndex >= 0 && backupQueue[currentBackupIndex] && (
        <iframe 
          key={backupQueue[currentBackupIndex].id}
          src={`/preview/${backupQueue[currentBackupIndex].type}/${backupQueue[currentBackupIndex].id}?autoBackup=true`} 
          className="fixed z-[-50] w-[1200px] h-[1600px] top-0 left-0 opacity-[0.01] pointer-events-none" 
        />
      )}
    </header>
  );
}
