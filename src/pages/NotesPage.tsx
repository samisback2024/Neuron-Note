import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Plus, Search, FileText, Clock, Trash2 } from "lucide-react";
import { useStore } from "../lib/store";
import { format } from "date-fns";
import toast from "react-hot-toast";

export function NotesPage() {
  const { notes, notesLoading, createNote, deleteNote } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCreate = async () => {
    const note = await createNote("Untitled Note", "");
    if (note) {
      navigate(`/notes/${note.id}`);
      toast.success("Note created");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNote(id);
    toast.success("Note deleted");
  };

  if (notesLoading) {
    return (
      <div className="px-6 md:px-8 py-6 md:py-8">
        <div className="mx-auto max-w-[1100px]">
          <div className="skeleton h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-40 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-8 py-6 md:py-8">
      <div className="mx-auto max-w-[1100px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-semibold text-surface-900 dark:text-white">
              Notes
            </h1>
            <p className="text-[13px] text-surface-500 mt-0.5">
              {notes.length} notes
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-[13px] font-medium rounded-xl transition-colors"
          >
            <Plus size={16} />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-surface-200/80 dark:border-surface-700/40 bg-white dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 text-[14px] transition-all"
          />
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <FileText
              size={56}
              className="mx-auto text-surface-300 dark:text-surface-600 mb-4"
            />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              {search ? "No notes found" : "No notes yet"}
            </h3>
            <p className="text-surface-500 text-sm mb-4">
              {search
                ? "Try a different search term"
                : "Create your first note to get started"}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors"
              >
                Create Note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/notes/${note.id}`)}
                className="group bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200/80 dark:border-surface-700/40 hover:shadow-lg hover:shadow-surface-200/50 dark:hover:shadow-surface-900/50 hover:border-primary-200 dark:hover:border-primary-700 transition-all cursor-pointer"
              >
                <h3 className="font-semibold text-surface-900 dark:text-white text-[14px] mb-2 truncate">
                  {note.title || "Untitled"}
                </h3>
                <p className="text-[12px] text-surface-500 line-clamp-4 leading-relaxed mb-4">
                  {note.content?.replace(/<[^>]*>/g, "").substring(0, 200) ||
                    "Empty note..."}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-surface-400">
                    <Clock size={12} />
                    {format(new Date(note.updated_at), "MMM d, h:mm a")}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
