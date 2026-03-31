import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  X,
  FileText,
  CheckSquare,
  Bookmark,
  Search,
  Settings,
  Inbox,
  FolderKanban,
  Share2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useStore } from "../lib/store";
import toast from "react-hot-toast";

type Mode = "command" | "note" | "task" | "bookmark";

interface CommandItem {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  section: string;
}

export function QuickCapture() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("command");
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notes, createNote, createTask, createBookmark } = useStore();

  const close = useCallback(() => {
    setOpen(false);
    setMode("command");
    setQuery("");
    setSelectedIndex(0);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (open) {
          close();
        } else {
          setOpen(true);
        }
      }
      // Cmd/Ctrl + N → new note
      if ((e.metaKey || e.ctrlKey) && e.key === "n" && !open) {
        e.preventDefault();
        createNote("Untitled Note", "").then((note) => {
          if (note) {
            navigate(`/notes/${note.id}`);
            toast.success("Note created");
          }
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, close, createNote, navigate]);

  // Focus input when palette opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, mode]);

  // Navigation commands
  const navCommands: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-home",
        label: "Go to Inbox",
        icon: Inbox,
        action: () => {
          navigate("/");
          close();
        },
        section: "Navigation",
      },
      {
        id: "nav-notes",
        label: "Go to Notes",
        icon: FileText,
        action: () => {
          navigate("/notes");
          close();
        },
        section: "Navigation",
      },
      {
        id: "nav-tasks",
        label: "Go to Tasks",
        icon: CheckSquare,
        action: () => {
          navigate("/tasks");
          close();
        },
        section: "Navigation",
      },
      {
        id: "nav-projects",
        label: "Go to Projects",
        icon: FolderKanban,
        action: () => {
          navigate("/projects");
          close();
        },
        section: "Navigation",
      },
      {
        id: "nav-graph",
        label: "Go to Knowledge Graph",
        icon: Share2,
        action: () => {
          navigate("/knowledge-graph");
          close();
        },
        section: "Navigation",
      },
      {
        id: "nav-bookmarks",
        label: "Go to Bookmarks",
        icon: Bookmark,
        action: () => {
          navigate("/bookmarks");
          close();
        },
        section: "Navigation",
      },
      {
        id: "nav-trash",
        label: "Go to Trash",
        icon: Trash2,
        action: () => {
          navigate("/trash");
          close();
        },
        section: "Navigation",
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        icon: Settings,
        action: () => {
          navigate("/settings");
          close();
        },
        section: "Navigation",
      },
    ],
    [navigate, close],
  );

  const actionCommands: CommandItem[] = useMemo(
    () => [
      {
        id: "create-note",
        label: "Create new note",
        icon: Plus,
        action: () => {
          setMode("note");
          setQuery("");
          setSelectedIndex(0);
        },
        section: "Actions",
      },
      {
        id: "create-task",
        label: "Create new task",
        icon: CheckSquare,
        action: () => {
          setMode("task");
          setQuery("");
          setSelectedIndex(0);
        },
        section: "Actions",
      },
      {
        id: "create-bookmark",
        label: "Save bookmark",
        icon: Bookmark,
        action: () => {
          setMode("bookmark");
          setQuery("");
          setSelectedIndex(0);
        },
        section: "Actions",
      },
    ],
    [],
  );

  // Note search results
  const noteResults: CommandItem[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q),
      )
      .slice(0, 6)
      .map((n) => ({
        id: `note-${n.id}`,
        label: n.title || "Untitled",
        icon: FileText,
        action: () => {
          navigate(`/notes/${n.id}`);
          close();
        },
        section: "Notes",
      }));
  }, [query, notes, navigate, close]);

  const allItems = useMemo(() => {
    if (mode !== "command") return [];
    const q = query.toLowerCase();
    const filtered = [...actionCommands, ...navCommands].filter((c) =>
      c.label.toLowerCase().includes(q),
    );
    return [...noteResults, ...filtered];
  }, [mode, query, actionCommands, navCommands, noteResults]);

  // Keep selected index in bounds
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, mode]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (mode !== "command") {
        setMode("command");
        setQuery("");
      } else {
        close();
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (mode === "command" && allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      } else if (mode === "note" && query.trim()) {
        createNote(query, "").then((note) => {
          if (note) {
            navigate(`/notes/${note.id}`);
            toast.success("Note created");
          }
        });
        close();
      } else if (mode === "task" && query.trim()) {
        createTask({
          title: query,
          completed: false,
          priority: "medium",
          due_date: null,
          project_id: null,
          project_name: null,
        });
        toast.success("Task created");
        close();
      } else if (mode === "bookmark" && query.trim()) {
        createBookmark({
          url: query,
          title: query,
          description: "",
          image: null,
          tags: [],
          collection: null,
        });
        toast.success("Bookmark saved");
        close();
      }
    }
  };

  const placeholders: Record<Mode, string> = {
    command: "Search commands, notes, or pages\u2026",
    note: "Note title\u2026",
    task: "Task title\u2026",
    bookmark: "Paste URL\u2026",
  };

  // Group items by section for rendering
  const sections = useMemo(() => {
    const map = new Map<string, { item: CommandItem; globalIndex: number }[]>();
    allItems.forEach((item, i) => {
      if (!map.has(item.section)) map.set(item.section, []);
      map.get(item.section)!.push({ item, globalIndex: i });
    });
    return map;
  }, [allItems]);

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 md:bottom-8 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-white shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 btn-press flex items-center justify-center"
      >
        <img src="/favicon.svg" alt="Quick Capture" className="w-8 h-8" />
      </button>

      {/* Command Palette */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && close()}
          >
            <motion.div
              initial={{ scale: 0.96, y: -8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, y: -8, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
              className="bg-white dark:bg-surface-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-surface-200/60 dark:border-surface-700/30"
            >
              {/* Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-200/60 dark:border-surface-700/30">
                <Search size={18} className="text-surface-400 flex-shrink-0" />
                {mode !== "command" && (
                  <button
                    onClick={() => {
                      setMode("command");
                      setQuery("");
                    }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[11px] font-medium flex-shrink-0"
                  >
                    {mode === "note"
                      ? "Note"
                      : mode === "task"
                        ? "Task"
                        : "Bookmark"}
                    <X size={10} />
                  </button>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholders[mode]}
                  className="flex-1 bg-transparent text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none text-[14px]"
                />
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-[10px] text-surface-400 font-mono">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              {mode === "command" && (
                <div
                  ref={listRef}
                  className="max-h-[320px] overflow-y-auto py-2"
                >
                  {allItems.length === 0 && query && (
                    <div className="px-4 py-8 text-center">
                      <p className="text-sm text-surface-500">
                        No results for &ldquo;{query}&rdquo;
                      </p>
                    </div>
                  )}
                  {[...sections.entries()].map(([section, items]) => (
                    <div key={section}>
                      <p className="px-4 py-1.5 text-[10.5px] font-semibold text-surface-400 uppercase tracking-wider">
                        {section}
                      </p>
                      {items.map(({ item, globalIndex }) => (
                        <button
                          key={item.id}
                          data-index={globalIndex}
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(globalIndex)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-75 ${
                            selectedIndex === globalIndex
                              ? "bg-primary-50 dark:bg-primary-900/15 text-primary-600 dark:text-primary-400"
                              : "text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/40"
                          }`}
                        >
                          <item.icon
                            size={16}
                            className="flex-shrink-0 opacity-60"
                          />
                          <span className="text-[13px] font-medium flex-1 truncate">
                            {item.label}
                          </span>
                          <ArrowRight
                            size={12}
                            className="opacity-30 flex-shrink-0"
                          />
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}

              {/* Create mode hint */}
              {mode !== "command" && (
                <div className="px-4 py-6 text-center">
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    Type and press{" "}
                    <kbd className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-[11px] font-mono">
                      Enter
                    </kbd>{" "}
                    to create
                  </p>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-surface-200/60 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-900/30">
                <div className="flex items-center gap-3 text-[10.5px] text-surface-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-surface-200 dark:bg-surface-700 font-mono text-[10px]">
                      ↑↓
                    </kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1 py-0.5 rounded bg-surface-200 dark:bg-surface-700 font-mono text-[10px]">
                      ↵
                    </kbd>
                    select
                  </span>
                </div>
                <span className="text-[10.5px] text-surface-400">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-200 dark:bg-surface-700 font-mono text-[10px]">
                    ⌘K
                  </kbd>
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
