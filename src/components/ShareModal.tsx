import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, UserPlus, Trash2, Shield, Edit3 } from "lucide-react";
import { useStore, type NoteCollaborator } from "../lib/store";
import toast from "react-hot-toast";

interface ShareModalProps {
  noteId: string;
  isOwner: boolean;
  onClose: () => void;
}

export function ShareModal({ noteId, isOwner, onClose }: ShareModalProps) {
  const { noteCollaborators, shareNote, removeCollaborator } = useStore();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"viewer" | "editor">("editor");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await shareNote(noteId, email.trim(), role);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success(`Shared with ${email}`);
      setEmail("");
    }
  };

  const handleRemove = async (collab: NoteCollaborator) => {
    await removeCollaborator(collab.id);
    toast.success("Collaborator removed");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-surface-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200/60 dark:border-surface-700/30">
          <h3 className="text-[16px] font-semibold text-surface-900 dark:text-white/95">
            Share Note
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Invite form (owner only) */}
          {isOwner && (
            <div className="space-y-3">
              <label className="text-[12.5px] font-medium text-surface-600 dark:text-surface-400">
                Invite by email
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@example.com"
                  onKeyDown={(e) => e.key === "Enter" && handleShare()}
                  className="flex-1 px-3 py-2 rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-[13px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "viewer" | "editor")
                  }
                  className="px-3 py-2 rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-[12.5px] shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
              <button
                onClick={handleShare}
                disabled={loading || !email.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[12.5px] font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus size={14} />
                {loading ? "Sharing..." : "Invite"}
              </button>
            </div>
          )}

          {/* Collaborators list */}
          <div>
            <label className="text-[12.5px] font-medium text-surface-600 dark:text-surface-400 mb-3 block">
              {noteCollaborators.length > 0
                ? `Collaborators (${noteCollaborators.length})`
                : "No collaborators yet"}
            </label>
            <div className="space-y-2">
              <AnimatePresence>
                {noteCollaborators.map((collab) => (
                  <motion.div
                    key={collab.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-200/40 dark:border-surface-700/20"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400">
                        {(collab.profile?.name || collab.profile?.email || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-surface-900 dark:text-white/90 truncate">
                        {collab.profile?.name || "Unknown"}
                      </p>
                      <p className="text-[11px] text-surface-500 truncate">
                        {collab.profile?.email}
                      </p>
                    </div>
                    {/* Role badge */}
                    <span className="flex items-center gap-1 text-[11px] font-medium text-surface-500 dark:text-surface-400 px-2 py-1 rounded-md bg-surface-100 dark:bg-surface-800">
                      {collab.role === "editor" ? (
                        <Edit3 size={10} />
                      ) : (
                        <Shield size={10} />
                      )}
                      {collab.role}
                    </span>
                    {/* Remove button (owner only) */}
                    {isOwner && (
                      <button
                        onClick={() => handleRemove(collab)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
