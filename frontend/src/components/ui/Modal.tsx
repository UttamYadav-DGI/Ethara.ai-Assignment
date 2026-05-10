import { motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode } from "react";

export function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-4 backdrop-blur-sm sm:items-center">
      <motion.div initial={{ opacity: 0, scale: 0.97, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }} className="surface w-full max-w-lg rounded-lg p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">{title}</h2>
          <button className="icon-btn h-9 w-9" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}
