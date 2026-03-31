import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  FileText,
  X,
} from "lucide-react";
import { useStore } from "../lib/store";
import { format, formatDistanceToNow, differenceInDays } from "date-fns";
import toast from "react-hot-toast";

export function TrashPage() {
  const {
    trashedNotes,
    trashedLoading,
    loadTrashedNotes,
    restoreNote,
    permanentlyDeleteNote,
  } = useStore();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTrashedNotes();
  }, [loadTrashedNotes]);

  const filtered = trashedNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRestore = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await restoreNote(id);
    toast.success("Note restored");
  };

  const handlePermanentDelete = async (id: string) => {
    await permanentlyDeleteNote(id);
    setConfirmId(null);
    toast.success("Note permanently deleted");
  };

  const getDaysRemaining = (trashedAt: string | null) => {
    if (!trashedAt) return 30;
    return Math.max(0, 30 - differenceInDays(new Date(), new Date(trashedAt)));
  };

  if (trashedLoading) {
    return (
      <div className="px-6 md:px-10 py-7 md:py-9">
        <div className="mx-auto max-w-[1080px]">
          <div className="skeleton h-7 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-7 md:py-9">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[20px] font-semibold text-surface-900 dark:text-white/95">
              Trash
            </h1>
            <p className="text-[12.5px] text-surface-500 dark:text-surface-400 mt-0.5">
              {trashedNotes.length} deleted{" "}
              {trashedNotes.length === 1 ? "note" : "notes"} · Auto-deletes
              after 30 days
            </p>
          </div>
        </div>

        {/* Search */}
        {trashedNotes.length > 0 && (
          <div className="relative mb-6">
            <FileText
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
            />
            <input
              type="text"
              placeholder="Search trash..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-white dark:bg-surface-800/80 text-surface-900 dark:text-white/90 placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 text-[13px] transition-all shadow-sm"
            />
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-surface-800/80 rounded-2xl py-14 px-6 border border-surface-200/60 dark:border-surface-700/30 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700/50 flex items-center justify-center mx-auto mb-3">
              <Trash2
                size={22}
                className="text-surface-400 dark:text-surface-500"
              />
            </div>
            <h3 className="text-[14px] font-semibold text-surface-900 dark:text-white/90 mb-1">
              {search ? "No notes found" : "No recently deleted notes"}
            </h3>
            <p className="text-surface-500 dark:text-surface-400 text-[12.5px] max-w-xs mx-auto">
              {search
                ? "Try a different search term"
                : "Notes you delete will appear here for 30 days before being permanently removed."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((note, i) => {
              const daysLeft = getDaysRemaining(note.trashed_at);
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="group bg-white dark:bg-surface-800/80 rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/30 shadow-sm card-hover cursor-pointer opacity-75 hover:opacity-100"
                >
                  <h3 className="font-medium text-surface-900 dark:text-white/90 text-[13.5px] mb-2 truncate">
                    {note.title || "Untitled"}
                  </h3>
                  <p className="text-[12px] text-surface-500 dark:text-surface-400 line-clamp-2 leading-relaxed mb-3">
                    {note.content?.replace(/<[^>]*>/g, "").substring(0, 200) ||
                      "Empty note..."}
                  </p>
                  <div className="flex items-center gap-2 text-[10.5px] text-surface-400 mb-3">
                    <Clock size={11} />
                    <span>
                      Deleted{" "}
                      {note.trashed_at
                        ? formatDistanceToNow(new Date(note.trashed_at), {
                            addSuffix: true,
                          })
                        : "recently"}
                    </span>
                    <span className="text-red-400 dark:text-red-500 ml-auto">
                      {daysLeft}d left
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleRestore(e, note.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[11.5px] font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <RotateCcw size={12} />
                      Restore
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmId(note.id);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/15 text-red-500 text-[11.5px] font-medium hover:bg-red-100 dark:hover:bg-red-900/25 transition-colors"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Permanent Delete Confirmation Modal */}
      <AnimatePresence>
        {confirmId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
              className="bg-white dark:bg-surface-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-surface-200/60 dark:border-surface-700/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-surface-900 dark:text-white/95">
                    Delete permanently?
                  </h3>
                </div>
                <p className="text-[13px] text-surface-500 dark:text-surface-400 leading-relaxed">
                  This note will be permanently deleted. This action cannot be
                  undone — all content, links, and collaborator access will be
                  removed.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-surface-200/60 dark:border-surface-700/30">
                <button
                  onClick={() => setConfirmId(null)}
                  className="px-4 py-2 rounded-lg text-[12.5px] font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePermanentDelete(confirmId)}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[12.5px] font-medium transition-colors"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
