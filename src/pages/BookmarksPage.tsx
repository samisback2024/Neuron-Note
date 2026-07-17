import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Search,
  ExternalLink,
  Trash2,
  Grid3X3,
  List,
  X,
  Globe,
} from "lucide-react";
import { useStore } from "../lib/store";
import { formatDistanceToNow } from "date-fns";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import toast from "react-hot-toast";

export function BookmarksPage() {
  const { bookmarks, bookmarksLoading, createBookmark, deleteBookmark } =
    useStore();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showNew, setShowNew] = useState(false);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [collection, setCollection] = useState("");
  const [newTags, setNewTags] = useState("");

  const filtered = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase()) ||
      b.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  const collections = [
    ...new Set(bookmarks.map((b) => b.collection).filter(Boolean)),
  ];

  const handleCreate = async () => {
    if (!url.trim()) return;
    // Basic URL validation
    let normalizedUrl = url.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    try {
      new URL(normalizedUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    await createBookmark({
      url: normalizedUrl,
      title: title || normalizedUrl,
      description,
      image: null,
      tags: newTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      collection: collection || null,
    });
    setUrl("");
    setTitle("");
    setDescription("");
    setCollection("");
    setNewTags("");
    setShowNew(false);
    toast.success("Bookmark saved");
  };

  if (bookmarksLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="skeleton h-8 w-40 rounded-lg" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageShell
      title="Bookmarks"
      description={`${bookmarks.length} saved link${bookmarks.length !== 1 ? "s" : ""}`}
      action={
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors btn-press"
        >
          <Plus size={15} />
          Add Bookmark
        </button>
      }
    >
      {/* Search & View toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bookmarks by title, URL, or tag…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition shadow-sm"
          />
        </div>
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 rounded-xl p-1 gap-0.5">
          <button
            onClick={() => setViewMode("list")}
            title="List view"
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "list"
                ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            <List size={15} />
          </button>
          <button
            onClick={() => setViewMode("grid")}
            title="Grid view"
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "grid"
                ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50"
                : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            }`}
          >
            <Grid3X3 size={15} />
          </button>
        </div>
      </div>

      {/* Add Bookmark Modal */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowNew(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
                  Add Bookmark
                </h3>
                <button
                  onClick={() => setShowNew(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="URL *"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition"
                />
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition resize-none"
                />
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="Tags (comma-separated)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition"
                />
                <input
                  type="text"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  placeholder="Collection (optional)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition"
                />
                <button
                  onClick={handleCreate}
                  disabled={!url.trim()}
                  className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors btn-press"
                >
                  Save Bookmark
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Globe}
          title={search ? "No bookmarks found" : "No bookmarks yet"}
          description={
            search
              ? `No results for "${search}". Try a different search term.`
              : "Save your favorite links, articles, and resources here."
          }
          action={
            !search ? (
              <button
                onClick={() => setShowNew(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors btn-press"
              >
                <Plus size={14} />
                Add your first bookmark
              </button>
            ) : undefined
          }
        />
      ) : viewMode === "list" ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 overflow-hidden shadow-sm">
          {filtered.map((bookmark, i) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.02 }}
              className={`group flex items-start gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors ${
                i < filtered.length - 1
                  ? "border-b border-zinc-100 dark:border-zinc-800"
                  : ""
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden mt-0.5">
                {bookmark.image ? (
                  <img
                    src={bookmark.image}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <Globe size={18} className="text-zinc-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                  {bookmark.title}
                </p>
                {bookmark.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                    {bookmark.description}
                  </p>
                )}
                <div className="flex items-center flex-wrap gap-2 mt-1.5">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={10} />
                    {(() => {
                      try {
                        return new URL(bookmark.url).hostname;
                      } catch {
                        return bookmark.url;
                      }
                    })()}
                  </a>
                  {bookmark.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="text-xs text-zinc-400 ml-auto">
                    {formatDistanceToNow(new Date(bookmark.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  deleteBookmark(bookmark.id);
                  toast.success("Bookmark deleted");
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-all shrink-0 mt-0.5"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((bookmark, i) => (
            <motion.div
              key={bookmark.id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm overflow-hidden"
            >
              <div className="h-28 bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
                {bookmark.image ? (
                  <img
                    src={bookmark.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Globe
                    size={28}
                    className="text-zinc-300 dark:text-zinc-600"
                  />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">
                    {bookmark.title}
                  </h3>
                  <button
                    onClick={() => {
                      deleteBookmark(bookmark.id);
                      toast.success("Bookmark deleted");
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-all shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {bookmark.description && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                    {bookmark.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={10} />
                    {(() => {
                      try {
                        return new URL(bookmark.url).hostname;
                      } catch {
                        return bookmark.url;
                      }
                    })()}
                  </a>
                  {bookmark.tags?.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Collections */}
      {collections.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
            Collections
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {collections.map((col, i) => {
              const count = bookmarks.filter(
                (b) => b.collection === col,
              ).length;
              const colors = [
                "bg-primary-500",
                "bg-violet-500",
                "bg-green-400",
                "bg-amber-400",
              ];
              return (
                <div
                  key={col}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-sm cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${colors[i % 4]} mb-3 opacity-80`}
                  />
                  <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm">
                    {col}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {count} bookmark{count !== 1 ? "s" : ""}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </PageShell>
  );
}
