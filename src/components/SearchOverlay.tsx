import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Search, FileText, X } from "lucide-react";
import { useStore } from "../lib/store";

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { notes } = useStore();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setSelected(0);
  }, []);

  // Cmd/Ctrl + / to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return notes
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content?.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, notes]);

  // Reset selection when results change — done inline in the onChange handler

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") close();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter" && results[selected]) {
      navigate(`/notes/${results[selected].id}`);
      close();
    }
  };

  // Highlight matching text in a string
  const highlight = (text: string, q: string) => {
    if (!q.trim()) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className="bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded px-0.5">
          {text.slice(idx, idx + q.length)}
        </mark>
        {text.slice(idx + q.length)}
      </>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[16vh] bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            initial={{ scale: 0.96, y: -8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: -8, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            className="bg-white dark:bg-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200 dark:border-zinc-800">
              <Search size={18} className="text-zinc-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelected(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search notes by title or content…"
                className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none text-[14px]"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400"
                >
                  <X size={14} />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-[10px] text-zinc-400 font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[340px] overflow-y-auto">
              {query && results.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-zinc-500">
                    No notes matching &ldquo;{query}&rdquo;
                  </p>
                </div>
              )}
              {results.map((note, i) => {
                const plain =
                  note.content?.replace(/<[^>]*>/g, "").substring(0, 120) || "";
                return (
                  <button
                    key={note.id}
                    onClick={() => {
                      navigate(`/notes/${note.id}`);
                      close();
                    }}
                    onMouseEnter={() => setSelected(i)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors duration-75 ${
                      selected === i
                        ? "bg-primary-50 dark:bg-primary-900/15"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    }`}
                  >
                    <FileText
                      size={15}
                      className="text-zinc-400 mt-0.5 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p
                        className={`text-[13px] font-medium truncate ${
                          selected === i
                            ? "text-primary-600 dark:text-primary-400"
                            : "text-zinc-900 dark:text-white"
                        }`}
                      >
                        {highlight(note.title || "Untitled", query)}
                      </p>
                      <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {highlight(plain, query)}
                      </p>
                    </div>
                  </button>
                );
              })}
              {!query && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm text-zinc-400">
                    Start typing to search your notes
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
              <div className="flex items-center gap-3 text-[10.5px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-[10px]">
                    ↑↓
                  </kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-[10px]">
                    ↵
                  </kbd>
                  open
                </span>
              </div>
              <span className="text-[10.5px] text-zinc-400">
                {results.length > 0 && (
                  <span>
                    {results.length} result{results.length !== 1 && "s"}
                  </span>
                )}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
