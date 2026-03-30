import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Typography from "@tiptap/extension-typography";
import { motion } from "motion/react";
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
} from "lucide-react";
import { useStore } from "../lib/store";
import { format } from "date-fns";
import toast from "react-hot-toast";

export function NoteEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notes, updateNote, deleteNote } = useStore();
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const note = notes.find((n) => n.id === id);

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
    if (note) {
      setTitle(note.title);
      if (editor && note.content !== editor.getHTML()) {
        editor.commands.setContent(note.content);
      }
    }
  }, [note?.id]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Auto-save every 3 seconds if content changes
  useEffect(() => {
    const interval = setInterval(() => {
      if (editor?.isActive) {
        saveNote();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [saveNote, editor]);

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
            onClick={() => {
              saveNote();
              toast.success("Saved");
            }}
            disabled={saving}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 transition-colors"
          >
            <Save size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 max-w-3xl mx-auto w-full">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full text-3xl font-bold text-surface-900 dark:text-white bg-transparent border-none focus:outline-none placeholder-surface-300 dark:placeholder-surface-600 mb-6"
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
      </div>
    </motion.div>
  );
}
