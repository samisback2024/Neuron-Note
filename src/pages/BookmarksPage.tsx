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
    await createBookmark({
      url,
      title: title || url,
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
      <div className="px-6 md:px-10 py-7 md:py-9">
        <div className="mx-auto max-w-[1080px]">
          <div className="skeleton h-7 w-36 mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-20 rounded-xl mb-3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-7 md:py-9">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[20px] font-semibold text-surface-900 dark:text-white/95">
            Bookmarks
          </h1>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[12.5px] font-medium rounded-lg btn-press"
          >
            <Plus size={15} />
            Add Bookmark
          </button>
        </div>
        <p className="text-[12.5px] text-surface-500 dark:text-surface-400 mb-6">
          {bookmarks.length} saved links
        </p>

        {/* Search & View Toggle */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookmarks..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200/60 dark:border-surface-700/30 bg-white dark:bg-surface-800/80 text-surface-900 dark:text-white/90 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm placeholder-surface-400 dark:placeholder-surface-500"
            />
          </div>
          <div className="flex bg-surface-100 dark:bg-surface-800/80 rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-white dark:bg-surface-700 shadow-sm" : "text-surface-400"}`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${viewMode === "grid" ? "bg-white dark:bg-surface-700 shadow-sm" : "text-surface-400"}`}
            >
              <Grid3X3 size={15} />
            </button>
          </div>
        </div>

        {/* New Bookmark Modal */}
        <AnimatePresence>
          {showNew && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={(e) => e.target === e.currentTarget && setShowNew(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                    Add Bookmark
                  </h3>
                  <button
                    onClick={() => setShowNew(false)}
                    className="text-surface-400 hover:text-surface-600"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="URL"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title"
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                  />
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="Tags (comma-separated)"
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <input
                    type="text"
                    value={collection}
                    onChange={(e) => setCollection(e.target.value)}
                    placeholder="Collection (optional)"
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <button
                    onClick={handleCreate}
                    className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl btn-press"
                  >
                    Save Bookmark
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bookmarks */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-surface-800/80 rounded-2xl py-14 px-6 border border-surface-200/60 dark:border-surface-700/30 shadow-sm text-center">
            <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700/50 flex items-center justify-center mx-auto mb-3">
              <Globe
                size={22}
                className="text-surface-400 dark:text-surface-500"
              />
            </div>
            <h3 className="text-[14px] font-semibold text-surface-900 dark:text-white/90 mb-1">
              {search ? "No bookmarks found" : "No bookmarks yet"}
            </h3>
            <p className="text-surface-500 dark:text-surface-400 text-[12.5px] max-w-xs mx-auto">
              {search
                ? "Try a different search"
                : "Save your favorite links here"}
            </p>
          </div>
        ) : viewMode === "list" ? (
          <div className="space-y-3">
            {filtered.map((bookmark, i) => (
              <motion.div
                key={bookmark.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group bg-white dark:bg-surface-800/80 rounded-xl p-4 border border-surface-200/60 dark:border-surface-700/30 shadow-sm card-hover flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {bookmark.image ? (
                    <img
                      src={bookmark.image}
                      alt=""
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Globe size={20} className="text-surface-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                    {bookmark.title}
                  </h3>
                  <p className="text-xs text-surface-500 truncate mt-0.5">
                    {bookmark.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={10} />
                      {new URL(bookmark.url).hostname}
                    </a>
                    {bookmark.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                      >
                        #{tag}
                      </span>
                    ))}
                    <span className="text-xs text-surface-400 ml-auto">
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
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-all"
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="group bg-white dark:bg-surface-800/80 rounded-xl border border-surface-200/60 dark:border-surface-700/30 shadow-sm card-hover overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-surface-100 to-surface-200 dark:from-surface-700 dark:to-surface-800 flex items-center justify-center">
                  {bookmark.image ? (
                    <img
                      src={bookmark.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Globe
                      size={32}
                      className="text-surface-300 dark:text-surface-600"
                    />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                    {bookmark.title}
                  </h3>
                  <p className="text-xs text-surface-500 mt-1 line-clamp-2">
                    {bookmark.description}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    {bookmark.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-xs bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
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
          <div className="mt-10">
            <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white/90 mb-4">
              Collections
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {collections.map((col, i) => {
                const count = bookmarks.filter(
                  (b) => b.collection === col,
                ).length;
                const colors = [
                  "bg-primary-500",
                  "bg-violet-500",
                  "bg-green-400",
                ];
                return (
                  <div
                    key={col}
                    className="bg-white dark:bg-surface-800/80 rounded-xl p-5 border border-surface-200/60 dark:border-surface-700/30 shadow-sm card-hover cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${colors[i % 3]} mb-3`}
                    />
                    <h3 className="font-medium text-surface-900 dark:text-white text-sm">
                      {col}
                    </h3>
                    <p className="text-xs text-surface-500 mt-0.5">
                      {count} bookmarks
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
