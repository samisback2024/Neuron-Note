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
    toast.success("Moved to Trash");
  };

  if (notesLoading) {
    return (
      <div className="px-6 md:px-10 py-7 md:py-9">
        <div className="mx-auto max-w-[1080px]">
          <div className="skeleton h-7 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
              Notes
            </h1>
            <p className="text-[12.5px] text-surface-500 dark:text-surface-400 mt-0.5">
              {notes.length} notes
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[12.5px] font-medium rounded-lg transition-colors"
          >
            <Plus size={15} />
            New Note
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
          />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-white dark:bg-surface-800/80 text-surface-900 dark:text-white/90 placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40 text-[13px] transition-all shadow-sm"
          />
        </div>

        {filteredNotes.length === 0 ? (
          <div className="bg-white dark:bg-surface-800/80 rounded-2xl py-14 px-6 border border-surface-200/60 dark:border-surface-700/30 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700/50 flex items-center justify-center mx-auto mb-3">
              <FileText
                size={22}
                className="text-surface-400 dark:text-surface-500"
              />
            </div>
            <h3 className="text-[14px] font-semibold text-surface-900 dark:text-white/90 mb-1">
              {search ? "No notes found" : "No notes yet"}
            </h3>
            <p className="text-surface-500 dark:text-surface-400 text-[12.5px] mb-4 max-w-xs mx-auto">
              {search
                ? "Try a different search term"
                : "Create your first note to get started"}
            </p>
            {!search && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[12.5px] font-medium rounded-lg transition-colors"
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
                className="group bg-white dark:bg-surface-800/80 rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/30 shadow-sm hover:shadow-md hover:border-primary-200/60 dark:hover:border-primary-700/40 transition-all cursor-pointer"
              >
                <h3 className="font-medium text-surface-900 dark:text-white/90 text-[13.5px] mb-2 truncate">
                  {note.title || "Untitled"}
                </h3>
                <p className="text-[12px] text-surface-500 dark:text-surface-400 line-clamp-3 leading-relaxed mb-3">
                  {note.content?.replace(/<[^>]*>/g, "").substring(0, 200) ||
                    "Empty note..."}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10.5px] text-surface-400">
                    <Clock size={11} />
                    {format(new Date(note.updated_at), "MMM d, h:mm a")}
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/15 text-surface-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={13} />
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
