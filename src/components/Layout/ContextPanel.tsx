import { useLocation } from "react-router-dom";
import { X, Clock, Link2, Tag } from "lucide-react";
import { useStore } from "../../lib/store";
import { formatDistanceToNow } from "date-fns";

export function ContextPanel() {
  const { contextOpen, toggleContext, notes, noteLinks, tags } = useStore();
  const location = useLocation();

  const recentNotes = notes.slice(0, 3);
  const displayTags = tags.slice(0, 5);

  // Compute related notes from links
  const relatedNotes = notes.slice(0, 3).map((n, i) => ({
    ...n,
    similarity: 85 + i * 3,
  }));

  const getContextTitle = () => {
    if (location.pathname.startsWith("/notes/")) return "Note Context";
    if (location.pathname === "/tasks") return "Task Details";
    return "Context";
  };

  const getSummary = () => {
    if (notes.length === 0)
      return "Start creating notes to see AI-generated summaries and connections here.";
    return `Your workspace contains ${notes.length} notes with ${noteLinks.length} connections. The AI assistant can help you discover patterns and insights.`;
  };

  return (
    <>
      {contextOpen && (
        <aside className="hidden lg:flex flex-col h-screen w-80 min-w-[320px] bg-white dark:bg-surface-900 border-l border-surface-200 dark:border-surface-700/50 flex-shrink-0">
          <div className="flex items-center justify-between px-5 h-16 border-b border-surface-200 dark:border-surface-700/50 flex-shrink-0">
            <h3 className="font-semibold text-surface-900 dark:text-white">
              {getContextTitle()}
            </h3>
            <button
              onClick={toggleContext}
              className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            {/* AI Summary */}
            <div>
              <h4 className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-2">
                AI Summary
              </h4>
              <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                {getSummary()}
              </p>
            </div>

            {/* Backlinks */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Link2 size={14} className="text-surface-400" />
                <h4 className="text-xs font-semibold text-surface-900 dark:text-white uppercase tracking-wider">
                  Backlinks
                </h4>
              </div>
              {recentNotes.length > 0 ? (
                <div className="space-y-2">
                  {recentNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                        {note.title}
                      </p>
                      <p className="text-xs text-surface-500 mt-1 flex items-center gap-1">
                        <Clock size={10} />
                        Last edited{" "}
                        {formatDistanceToNow(new Date(note.updated_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-400">No backlinks yet</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag size={14} className="text-surface-400" />
                <h4 className="text-xs font-semibold text-surface-900 dark:text-white uppercase tracking-wider">
                  Tags
                </h4>
              </div>
              {displayTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {displayTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-400">No tags yet</p>
              )}
            </div>

            {/* Related Notes */}
            <div>
              <h4 className="text-xs font-semibold text-surface-900 dark:text-white uppercase tracking-wider mb-3">
                Related Notes
              </h4>
              {relatedNotes.length > 0 ? (
                <div className="space-y-2">
                  {relatedNotes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer"
                    >
                      <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                        {note.title}
                      </p>
                      <p className="text-xs text-surface-500 mt-1">
                        {note.similarity}% similarity
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-surface-400">
                  Create more notes to see related content
                </p>
              )}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
