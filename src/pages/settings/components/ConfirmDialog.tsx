import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  loading,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      // Focus the cancel button by default for destructive actions
      const target =
        variant === "danger" ? cancelRef.current : confirmRef.current;
      setTimeout(() => target?.focus(), 50);
    }
  }, [open, variant]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-desc"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            onClick={onCancel}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-200/60 dark:border-surface-700/30 w-full max-w-md p-6"
          >
            <div className="flex items-start gap-4">
              {variant === "danger" && (
                <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                  <AlertTriangle size={18} className="text-red-500" />
                </div>
              )}
              <div className="min-w-0">
                <h3
                  id="confirm-dialog-title"
                  className="text-[15px] font-semibold text-surface-900 dark:text-white"
                >
                  {title}
                </h3>
                <p
                  id="confirm-dialog-desc"
                  className="text-sm text-surface-500 dark:text-surface-400 mt-1.5"
                >
                  {description}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                ref={cancelRef}
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-700/50 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-50"
              >
                {cancelLabel}
              </button>
              <button
                ref={confirmRef}
                onClick={onConfirm}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${
                  variant === "danger"
                    ? "bg-red-500 hover:bg-red-600 focus-visible:outline-red-500"
                    : "bg-primary-500 hover:bg-primary-600 focus-visible:outline-primary-500"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : (
                  confirmLabel
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
