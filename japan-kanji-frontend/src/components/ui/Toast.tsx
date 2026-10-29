import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => {
        removeToast(id);
      }, 3600);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((item) => {
            const Icon =
              item.type === "success"
                ? CheckCircle2
                : item.type === "error"
                  ? AlertCircle
                  : Info;

            const accentColor =
              item.type === "success"
                ? "text-[var(--color-emerald-1)] border-l-[var(--color-emerald-1)]"
                : item.type === "error"
                  ? "text-[var(--color-accent-1)] border-l-[var(--color-accent-1)]"
                  : "text-[var(--color-ink-1)] border-l-[var(--color-ink-1)]";

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.94 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className={`pointer-events-auto glass-panel bg-[var(--color-paper-1)]/95 border border-[var(--color-border-subtle)] border-l-4 ${accentColor} rounded-xl px-4 py-3.5 shadow-[var(--shadow-elevated)] flex items-center gap-3`}
              >
                <Icon size={20} className="shrink-0" />
                <p className="text-sm font-semibold text-[var(--color-ink-1)] flex-1 leading-snug">
                  {item.message}
                </p>
                <button
                  onClick={() => removeToast(item.id)}
                  className="text-[var(--color-ink-3)] hover:text-[var(--color-ink-1)] p-1 rounded-md transition-colors cursor-pointer"
                  aria-label="Đóng thông báo"
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
