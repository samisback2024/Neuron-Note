import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  X,
  FileText,
  CheckSquare,
  Bookmark,
  Sparkles,
} from "lucide-react";
import { useStore } from "../lib/store";
import toast from "react-hot-toast";

type CaptureType = "note" | "task" | "bookmark";

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CaptureType>("note");
  const [value, setValue] = useState("");
  const { createNote, createTask, createBookmark } = useStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = async () => {
    if (!value.trim()) return;

    if (type === "note") {
      await createNote(value, "");
      toast.success("Note captured");
    } else if (type === "task") {
      await createTask({
        title: value,
        completed: false,
        priority: "medium",
        due_date: null,
        project_id: null,
        project_name: null,
      });
      toast.success("Task created");
    } else {
      await createBookmark({
        url: value,
        title: value,
        description: "",
        image: null,
        tags: [],
        collection: null,
      });
      toast.success("Bookmark saved");
    }

    setValue("");
    setOpen(false);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 transition-all flex items-center justify-center"
      >
        <Sparkles size={22} />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-white dark:bg-surface-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              {/* Type selector */}
              <div className="flex border-b border-surface-200 dark:border-surface-700">
                {(
                  [
                    {
                      type: "note" as CaptureType,
                      icon: FileText,
                      label: "Note",
                    },
                    {
                      type: "task" as CaptureType,
                      icon: CheckSquare,
                      label: "Task",
                    },
                    {
                      type: "bookmark" as CaptureType,
                      icon: Bookmark,
                      label: "Bookmark",
                    },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.type}
                    onClick={() => setType(tab.type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                      type === tab.type
                        ? "text-primary-500 border-b-2 border-primary-500 bg-primary-50/50 dark:bg-primary-900/10"
                        : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <Plus size={18} className="text-surface-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    placeholder={
                      type === "note"
                        ? "What's on your mind?"
                        : type === "task"
                          ? "Add a task..."
                          : "Paste a URL..."
                    }
                    autoFocus
                    className="flex-1 bg-transparent text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none text-sm py-2"
                  />
                  <button
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between px-4 py-3 bg-surface-50 dark:bg-surface-900/50 border-t border-surface-200 dark:border-surface-700">
                <span className="text-xs text-surface-400">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 text-xs font-mono">
                    ⌘K
                  </kbd>{" "}
                  to toggle
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!value.trim()}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  Capture
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
