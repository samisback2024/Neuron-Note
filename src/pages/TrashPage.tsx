import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Clock,
  FileText,
  FolderKanban,
} from "lucide-react";
import { useStore } from "../lib/store";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import toast from "react-hot-toast";

export function TrashPage() {
  const {
    trashedNotes,
    trashedLoading,
    loadTrashedNotes,
    restoreNote,
    permanentlyDeleteNote,
    trashedProjects,
    trashedProjectsLoading,
    loadTrashedProjects,
    restoreProject,
    permanentlyDeleteProject,
  } = useStore();
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmType, setConfirmType] = useState<"note" | "project">("note");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadTrashedNotes();
    loadTrashedProjects();
  }, [loadTrashedNotes, loadTrashedProjects]);

  const filteredNotes = trashedNotes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredProjects = trashedProjects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()),
  );

  const handleRestore = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await restoreNote(id);
    toast.success("Note restored");
  };

  const handleRestoreProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await restoreProject(id);
    toast.success("Project restored");
  };

  const handlePermanentDelete = async (id: string) => {
    if (confirmType === "project") {
      await permanentlyDeleteProject(id);
      toast.success("Project permanently deleted");
    } else {
      await permanentlyDeleteNote(id);
      toast.success("Note permanently deleted");
    }
    setConfirmId(null);
  };

  const getDaysRemaining = (trashedAt: string | null) => {
    if (!trashedAt) return 30;
    return Math.max(0, 30 - differenceInDays(new Date(), new Date(trashedAt)));
  };

  const totalItems = trashedNotes.length + trashedProjects.length;
  const isLoading = trashedLoading || trashedProjectsLoading;

  if (isLoading) {
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
              {totalItems} deleted {totalItems === 1 ? "item" : "items"} ·
              Auto-deletes after 30 days
            </p>
          </div>
        </div>

        {/* Search */}
        {totalItems > 0 && (
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
              className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-surface-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 text-surface-900 dark:text-zinc-50 placeholder-surface-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 text-[13px] transition-all shadow-sm"
            />
          </div>
        )}

        {totalItems === 0 ? (
          <div className="bg-white dark:bg-zinc-900/70 rounded-2xl py-14 px-6 border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} className="text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-[14px] font-semibold text-surface-900 dark:text-zinc-50 mb-1">
              Trash is empty
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-[12.5px] max-w-xs mx-auto">
              Deleted notes and projects will appear here for 30 days before
              being permanently removed.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* ── Projects section ── */}
            {filteredProjects.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FolderKanban size={14} className="text-zinc-400" />
                  <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Projects ({filteredProjects.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProjects.map((project, i) => {
                    const daysLeft = getDaysRemaining(project.trashed_at);
                    return (
                      <motion.div
                        key={project.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="group bg-white dark:bg-zinc-900/70 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm opacity-75 hover:opacity-100 transition-opacity"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          >
                            {project.title.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-medium text-surface-900 dark:text-zinc-50 text-[13.5px] truncate">
                              {project.title}
                            </h3>
                            <p className="text-[12px] text-zinc-500 dark:text-zinc-400 truncate">
                              {project.description || "No description"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10.5px] text-zinc-400 mb-3">
                          <Clock size={11} />
                          <span>
                            Deleted{" "}
                            {project.trashed_at
                              ? formatDistanceToNow(
                                  new Date(project.trashed_at),
                                  { addSuffix: true },
                                )
                              : "recently"}
                          </span>
                          <span className="text-red-400 dark:text-red-500 ml-auto">
                            {daysLeft}d left
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => handleRestoreProject(e, project.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[11.5px] font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                          >
                            <RotateCcw size={12} />
                            Restore
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmType("project");
                              setConfirmId(project.id);
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
              </div>
            )}

            {/* ── Notes section ── */}
            {filteredNotes.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-zinc-400" />
                  <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                    Notes ({filteredNotes.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map((note, i) => {
                    const daysLeft = getDaysRemaining(note.trashed_at);
                    return (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => navigate(`/notes/${note.id}`)}
                        className="group bg-white dark:bg-zinc-900/70 rounded-2xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm card-hover cursor-pointer opacity-75 hover:opacity-100"
                      >
                        <h3 className="font-medium text-surface-900 dark:text-zinc-50 text-[13.5px] mb-2 truncate">
                          {note.title || "Untitled"}
                        </h3>
                        <p className="text-[12px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">
                          {note.content
                            ?.replace(/<[^>]*>/g, "")
                            .substring(0, 200) || "Empty note..."}
                        </p>
                        <div className="flex items-center gap-2 text-[10.5px] text-zinc-400 mb-3">
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
                              setConfirmType("note");
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
              </div>
            )}

            {/* No search results */}
            {filteredNotes.length === 0 &&
              filteredProjects.length === 0 &&
              search && (
                <div className="bg-white dark:bg-zinc-900/70 rounded-2xl py-10 px-6 border border-zinc-200 dark:border-zinc-800 text-center">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    No results for "{search}"
                  </p>
                </div>
              )}
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
              className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={20} className="text-red-500" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-surface-900 dark:text-zinc-50">
                    Delete permanently?
                  </h3>
                </div>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  This {confirmType} will be permanently deleted and cannot be
                  recovered.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setConfirmId(null)}
                  className="px-4 py-2 rounded-lg text-[12.5px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
