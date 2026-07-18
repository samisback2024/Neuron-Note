import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Code,
  Quote,
  CheckSquare,
  Save,
  Trash2,
  Users,
  RotateCcw,
  AlertTriangle,
  Pin,
  Link2,
  Plus,
  X,
  Search,
} from "lucide-react";
import { useStore } from "../lib/store";
import { ShareModal } from "../components/ShareModal";
import { format } from "date-fns";
import toast from "react-hot-toast";

export function NoteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    notes,
    notesLoading,
    updateNote,
    deleteNote,
    togglePin,
    user,
    noteCollaborators,
    loadNoteCollaborators,
    subscribeToNote,
    trashedNotes,
    loadTrashedNotes,
    restoreNote,
    permanentlyDeleteNote,
    noteLinks,
    createNoteLink,
    deleteNoteLink,
  } = useStore();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState(false);
  const [linkPickerOpen, setLinkPickerOpen] = useState(false);
  const [linkSearch, setLinkSearch] = useState("");
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether the title has changed since the note was first loaded
  const titleInitializedRef = useRef(false);

  const note =
    notes.find((n) => n.id === id) || trashedNotes.find((n) => n.id === id);
  const isTrashed = note?.is_trashed ?? false;
  const noteContent = note?.content;
  const [title, setTitle] = useState(note?.title ?? "");

  const isOwner = note?.user_id === user?.id;
  const canEdit =
    !isTrashed &&
    (isOwner ||
      noteCollaborators.some(
        (c) => c.user_id === user?.id && c.role === "editor",
      ));

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Start writing... Press "/" for commands',
      }),
      Highlight,
      TaskList,
      TaskItem.configure({ nested: true }),
      Typography,
    ],
    content: note?.content || "",
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none dark:prose-invert focus:outline-none",
      },
    },
  });

  useEffect(() => {
    if (note?.id) {
      setTitle(note.title);
      if (editor && noteContent !== editor.getHTML()) {
        editor.commands.setContent(noteContent || "");
      }
    }
    // Only sync when navigating to a different note
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note?.id]);

  // Load collaborators and subscribe to real-time updates
  useEffect(() => {
    if (!id) return;
    loadNoteCollaborators(id);
    loadTrashedNotes();
    const unsubscribe = subscribeToNote(id);
    return () => unsubscribe();
  }, [id, loadNoteCollaborators, subscribeToNote, loadTrashedNotes]);

  // Auto-focus editor on mount
  useEffect(() => {
    if (editor && !editor.isDestroyed && canEdit) {
      setTimeout(() => editor.commands.focus("end"), 100);
    }
  }, [editor?.isDestroyed, canEdit]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set editor editability based on permissions
  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      editor.setEditable(canEdit);
    }
  }, [editor, canEdit]);

  const saveNote = useCallback(async () => {
    if (!id || !editor) return;
    setSaving(true);
    await updateNote(id, {
      title: title || "Untitled Note",
      content: editor.getHTML(),
    });
    setLastSaved(new Date());
    setSaving(false);
  }, [id, title, editor, updateNote]);

  // Debounced auto-save (500ms for responsive collaboration)
  useEffect(() => {
    if (!editor || editor.isDestroyed || !canEdit) return;

    const handler = () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveNote();
      }, 500);
    };

    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [saveNote, editor, canEdit]);

  // Also debounce-save on title change (skip the very first render/load)
  useEffect(() => {
    if (!canEdit || !id) return;
    // Skip the initial population of the title from the loaded note
    if (!titleInitializedRef.current) {
      titleInitializedRef.current = true;
      return;
    }
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveNote();
    }, 500);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  // Keyboard save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveNote();
        toast.success("Saved");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveNote]);

  const handleDelete = async () => {
    if (!id) return;
    await deleteNote(id);
    toast.success("Moved to Trash");
    navigate("/notes");
  };

  const handleRestore = async () => {
    if (!id) return;
    await restoreNote(id);
    toast.success("Note restored");
    navigate(`/notes/${id}`);
  };

  const handlePermanentDelete = async () => {
    if (!id) return;
    await permanentlyDeleteNote(id);
    setConfirmPermanentDelete(false);
    toast.success("Note permanently deleted");
    navigate("/trash");
  };

  if (!note) {
    if (notesLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-zinc-500">Loading note…</p>
          </div>
        </div>
      );
    }
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-500">Note not found</p>
        <button
          onClick={() => navigate("/notes")}
          className="mt-4 text-primary-500 hover:text-primary-600 text-sm font-medium"
        >
          Back to Notes
        </button>
      </div>
    );
  }

  const wordCount =
    editor
      ?.getText()
      .split(/\s+/)
      .filter((w) => w).length ?? 0;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const linkedNotes = id
    ? noteLinks
        .filter((l) => l.source_id === id || l.target_id === id)
        .map((l) => {
          const otherId = l.source_id === id ? l.target_id : l.source_id;
          return { linkId: l.id, note: notes.find((n) => n.id === otherId) };
        })
        .filter(
          (l): l is { linkId: string; note: (typeof notes)[number] } =>
            !!l.note,
        )
    : [];

  const linkableNotes = notes
    .filter(
      (n) =>
        n.id !== id &&
        !n.is_trashed &&
        !linkedNotes.some((l) => l.note.id === n.id) &&
        n.title.toLowerCase().includes(linkSearch.toLowerCase()),
    )
    .slice(0, 8);

  const handleLinkNote = async (targetId: string) => {
    if (!id) return;
    await createNoteLink(id, targetId);
    setLinkSearch("");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 md:px-8 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex-shrink-0 overflow-x-auto">
        <button
          onClick={() => {
            saveNote();
            navigate("/notes");
          }}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

        {editor && (
          <>
            {[
              {
                icon: Bold,
                label: "Bold",
                action: () => editor.chain().focus().toggleBold().run(),
                active: editor.isActive("bold"),
              },
              {
                icon: Italic,
                label: "Italic",
                action: () => editor.chain().focus().toggleItalic().run(),
                active: editor.isActive("italic"),
              },
              {
                icon: Heading1,
                label: "Heading 1",
                action: () =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run(),
                active: editor.isActive("heading", { level: 1 }),
              },
              {
                icon: Heading2,
                label: "Heading 2",
                action: () =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run(),
                active: editor.isActive("heading", { level: 2 }),
              },
              {
                icon: List,
                label: "Bullet List",
                action: () => editor.chain().focus().toggleBulletList().run(),
                active: editor.isActive("bulletList"),
              },
              {
                icon: ListOrdered,
                label: "Ordered List",
                action: () => editor.chain().focus().toggleOrderedList().run(),
                active: editor.isActive("orderedList"),
              },
              {
                icon: CheckSquare,
                label: "Task List",
                action: () => editor.chain().focus().toggleTaskList().run(),
                active: editor.isActive("taskList"),
              },
              {
                icon: Code,
                label: "Code Block",
                action: () => editor.chain().focus().toggleCodeBlock().run(),
                active: editor.isActive("codeBlock"),
              },
              {
                icon: Quote,
                label: "Blockquote",
                action: () => editor.chain().focus().toggleBlockquote().run(),
                active: editor.isActive("blockquote"),
              },
            ].map(({ icon: Icon, label, action, active }, i) => (
              <button
                key={i}
                onClick={action}
                aria-label={label}
                title={label}
                className={`p-2 rounded-lg transition-all duration-[120ms] ease-out flex-shrink-0 btn-press ${
                  active
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-500"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                }`}
              >
                <Icon size={16} />
              </button>
            ))}
          </>
        )}

        <div className="ml-auto flex items-center gap-3 flex-shrink-0">
          {/* Collaborator avatars */}
          {noteCollaborators.length > 0 && (
            <div className="flex -space-x-2">
              {noteCollaborators.slice(0, 4).map((c) => {
                const initials = (c.profile?.name || c.profile?.email || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div
                    key={c.id}
                    title={c.profile?.name || c.profile?.email}
                    className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[10px] font-semibold text-primary-600 dark:text-primary-400"
                  >
                    {initials}
                  </div>
                );
              })}
              {noteCollaborators.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950 flex items-center justify-center text-[10px] font-medium text-zinc-500">
                  +{noteCollaborators.length - 4}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs">
            {saving ? (
              <span className="text-primary-500 font-medium save-pulse flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                Saving…
              </span>
            ) : lastSaved ? (
              <span className="text-green-500 font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Saved
              </span>
            ) : null}
          </div>
          <span className="text-xs text-zinc-400">
            {wordCount} words · {readingTime} min read
          </span>
          <button
            onClick={() => setShareOpen(true)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            title="Share note"
          >
            <Users size={16} />
          </button>
          <button
            onClick={() => {
              if (!id) return;
              togglePin(id);
              toast.success(note?.is_pinned ? "Unpinned" : "Pinned");
            }}
            className={`p-2 rounded-lg transition-colors ${
              note?.is_pinned
                ? "bg-primary-50 dark:bg-primary-900/30 text-primary-500"
                : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
            }`}
            title={note?.is_pinned ? "Unpin note" : "Pin note"}
          >
            <Pin size={16} />
          </button>
          <button
            onClick={() => {
              saveNote();
              toast.success("Saved");
            }}
            disabled={saving || !canEdit}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors disabled:opacity-40"
          >
            <Save size={16} />
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Trashed banner */}
      {isTrashed && (
        <div className="flex items-center gap-3 px-4 md:px-8 py-3 bg-red-50 dark:bg-red-900/15 border-b border-red-200/60 dark:border-red-800/30">
          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
          <span className="text-[13px] text-red-600 dark:text-red-400 font-medium">
            This note is in Trash
          </span>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleRestore}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-[12px] font-medium transition-colors"
            >
              <RotateCcw size={13} />
              Restore
            </button>
            <button
              onClick={() => setConfirmPermanentDelete(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[12px] font-medium transition-colors"
            >
              <Trash2 size={13} />
              Delete Forever
            </button>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-3xl mx-auto w-full">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          disabled={!canEdit}
          className="w-full text-3xl font-bold text-zinc-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-zinc-300 dark:placeholder-zinc-500 mb-6 disabled:opacity-60"
        />
        <div className="text-xs text-zinc-400 mb-6 flex items-center gap-3">
          <span>
            Last edited{" "}
            {format(new Date(note.updated_at), "MMM d, yyyy h:mm a")}
          </span>
        </div>
        <EditorContent
          editor={editor}
          className="text-zinc-800 dark:text-zinc-200"
        />
        {!canEdit && (
          <div className="mt-6 text-xs text-zinc-400 italic">
            You have view-only access to this note.
          </div>
        )}

        {/* Linked Notes */}
        <div className="mt-10 pt-6 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
              <Link2 size={14} />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Linked Notes
                {linkedNotes.length > 0 && ` (${linkedNotes.length})`}
              </span>
            </div>
            {canEdit && (
              <button
                onClick={() => {
                  setLinkPickerOpen((v) => !v);
                  setLinkSearch("");
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-colors ${
                  linkPickerOpen
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-500"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                }`}
              >
                {linkPickerOpen ? <X size={13} /> : <Plus size={13} />}
                {linkPickerOpen ? "Close" : "Link a note"}
              </button>
            )}
          </div>

          {linkPickerOpen && (
            <div className="mb-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-3">
              <div className="relative mb-2">
                <Search
                  size={13}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"
                />
                <input
                  autoFocus
                  type="text"
                  value={linkSearch}
                  onChange={(e) => setLinkSearch(e.target.value)}
                  placeholder="Search your notes..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              {linkableNotes.length > 0 ? (
                <ul className="space-y-0.5 max-h-48 overflow-y-auto">
                  {linkableNotes.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => handleLinkNote(n.id)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-zinc-700 dark:text-zinc-300 hover:bg-white dark:hover:bg-zinc-800 transition-colors truncate"
                      >
                        {n.title || "Untitled"}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-400 px-1 py-1.5">
                  {notes.length <= 1
                    ? "Create another note first to link it here."
                    : "No matching notes."}
                </p>
              )}
            </div>
          )}

          {linkedNotes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {linkedNotes.map(({ linkId, note: linked }) => (
                <div
                  key={linkId}
                  className="group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                >
                  <button
                    onClick={() => navigate(`/notes/${linked.id}`)}
                    className="hover:text-primary-500 transition-colors max-w-[160px] truncate"
                  >
                    {linked.title || "Untitled"}
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => deleteNoteLink(linkId)}
                      aria-label={`Unlink ${linked.title || "Untitled"}`}
                      className="p-0.5 rounded-full text-zinc-400 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-red-500 transition-all"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            !linkPickerOpen && (
              <p className="text-xs text-zinc-400">
                No linked notes yet. Link related notes to map connections in
                the{" "}
                <button
                  onClick={() => navigate("/knowledge-graph")}
                  className="text-primary-500 hover:text-primary-600 font-medium"
                >
                  Knowledge Graph
                </button>
                .
              </p>
            )
          )}
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareOpen && id && (
          <ShareModal
            noteId={id}
            isOwner={isOwner}
            onClose={() => setShareOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Permanent Delete Confirmation */}
      <AnimatePresence>
        {confirmPermanentDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setConfirmPermanentDelete(false)}
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
                  <h3 className="text-[16px] font-semibold text-zinc-900 dark:text-zinc-50">
                    Delete permanently?
                  </h3>
                </div>
                <p className="text-[13px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  This note will be permanently deleted. This action cannot be
                  undone.
                </p>
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => setConfirmPermanentDelete(false)}
                  className="px-4 py-2 rounded-lg text-[12.5px] font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePermanentDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[12.5px] font-medium transition-colors"
                >
                  Delete Forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
