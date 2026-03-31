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
  Clock,
  Save,
  Trash2,
  Users,
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
    updateNote,
    deleteNote,
    user,
    noteCollaborators,
    loadNoteCollaborators,
    subscribeToNote,
  } = useStore();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const note = notes.find((n) => n.id === id);
  const noteContent = note?.content;
  const [title, setTitle] = useState(note?.title ?? "");

  const isOwner = note?.user_id === user?.id;
  const canEdit =
    isOwner ||
    noteCollaborators.some(
      (c) => c.user_id === user?.id && c.role === "editor",
    );

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
    const unsubscribe = subscribeToNote(id);
    return () => unsubscribe();
  }, [id, loadNoteCollaborators, subscribeToNote]);

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

  // Also debounce-save on title change
  useEffect(() => {
    if (!canEdit || !id) return;
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
    toast.success("Note deleted");
    navigate("/notes");
  };

  if (!note) {
    return (
      <div className="p-8 text-center">
        <p className="text-surface-500">Note not found</p>
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 md:px-8 py-3 border-b border-surface-200 dark:border-surface-700/50 bg-white dark:bg-surface-900 flex-shrink-0 overflow-x-auto">
        <button
          onClick={() => {
            saveNote();
            navigate("/notes");
          }}
          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="h-6 w-px bg-surface-200 dark:bg-surface-700 mx-1" />

        {editor && (
          <>
            {[
              {
                icon: Bold,
                action: () => editor.chain().focus().toggleBold().run(),
                active: editor.isActive("bold"),
              },
              {
                icon: Italic,
                action: () => editor.chain().focus().toggleItalic().run(),
                active: editor.isActive("italic"),
              },
              {
                icon: Heading1,
                action: () =>
                  editor.chain().focus().toggleHeading({ level: 1 }).run(),
                active: editor.isActive("heading", { level: 1 }),
              },
              {
                icon: Heading2,
                action: () =>
                  editor.chain().focus().toggleHeading({ level: 2 }).run(),
                active: editor.isActive("heading", { level: 2 }),
              },
              {
                icon: List,
                action: () => editor.chain().focus().toggleBulletList().run(),
                active: editor.isActive("bulletList"),
              },
              {
                icon: ListOrdered,
                action: () => editor.chain().focus().toggleOrderedList().run(),
                active: editor.isActive("orderedList"),
              },
              {
                icon: CheckSquare,
                action: () => editor.chain().focus().toggleTaskList().run(),
                active: editor.isActive("taskList"),
              },
              {
                icon: Code,
                action: () => editor.chain().focus().toggleCodeBlock().run(),
                active: editor.isActive("codeBlock"),
              },
              {
                icon: Quote,
                action: () => editor.chain().focus().toggleBlockquote().run(),
                active: editor.isActive("blockquote"),
              },
            ].map(({ icon: Icon, action, active }, i) => (
              <button
                key={i}
                onClick={action}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                  active
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-500"
                    : "hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500"
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
                    className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 border-2 border-white dark:border-surface-900 flex items-center justify-center text-[10px] font-semibold text-primary-600 dark:text-primary-400"
                  >
                    {initials}
                  </div>
                );
              })}
              {noteCollaborators.length > 4 && (
                <div className="w-7 h-7 rounded-full bg-surface-200 dark:bg-surface-700 border-2 border-white dark:border-surface-900 flex items-center justify-center text-[10px] font-medium text-surface-500">
                  +{noteCollaborators.length - 4}
                </div>
              )}
            </div>
          )}

          {saving && (
            <span className="text-xs text-primary-500 font-medium animate-pulse">
              Saving...
            </span>
          )}
          <span className="text-xs text-surface-400">
            {wordCount} words · {readingTime} min read
          </span>
          {lastSaved && (
            <span className="text-xs text-surface-400 flex items-center gap-1">
              <Clock size={12} />
              {format(lastSaved, "h:mm a")}
            </span>
          )}
          <button
            onClick={() => setShareOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
            title="Share note"
          >
            <Users size={16} />
          </button>
          <button
            onClick={() => {
              saveNote();
              toast.success("Saved");
            }}
            disabled={saving || !canEdit}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors disabled:opacity-40"
          >
            <Save size={16} />
          </button>
          {isOwner && (
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-3xl mx-auto w-full">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          disabled={!canEdit}
          className="w-full text-3xl font-bold text-surface-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-surface-300 dark:placeholder-surface-600 mb-6 disabled:opacity-60"
        />
        <div className="text-xs text-surface-400 mb-6 flex items-center gap-3">
          <span>
            Last edited{" "}
            {format(new Date(note.updated_at), "MMM d, yyyy h:mm a")}
          </span>
        </div>
        <EditorContent
          editor={editor}
          className="text-surface-800 dark:text-surface-200"
        />
        {!canEdit && (
          <div className="mt-6 text-xs text-surface-400 italic">
            You have view-only access to this note.
          </div>
        )}
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
    </motion.div>
  );
}
