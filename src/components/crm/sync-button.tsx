"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import SyncContactsModal from "./sync-contacts-modal";

export default function SyncButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full sm:w-auto h-10 px-4 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-sm"
      >
        <UploadCloud size={16} />
        Sync Contacts
      </button>
      <SyncContactsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
