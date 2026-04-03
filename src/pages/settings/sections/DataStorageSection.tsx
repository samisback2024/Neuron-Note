import { useState, useMemo } from "react";
import { Database, Download, Trash2, AlertTriangle } from "lucide-react";
import { SettingSection } from "../components/SettingSection";
import { SettingRow } from "../components/SettingRow";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useStore } from "../../../lib/store";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";

export function DataStorageSection() {
  const { notes, tasks, projects, bookmarks, signOut } = useStore();

  const [clearCacheOpen, setClearCacheOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  /* ── Approximate storage usage ── */
  const storageInfo = useMemo(() => {
    const items = [
      { label: "Notes", count: notes.length },
      { label: "Tasks", count: tasks.length },
      { label: "Projects", count: projects.length },
      { label: "Bookmarks", count: bookmarks.length },
    ];
    const total = items.reduce((sum, i) => sum + i.count, 0);
    return { items, total };
  }, [notes.length, tasks.length, projects.length, bookmarks.length]);

  /* ── Export data ── */
  const handleExport = async () => {
    setExporting(true);
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        notes: notes.map(
          ({
            id,
            title,
            content,
            tags,
            is_pinned,
            created_at,
            updated_at,
          }) => ({
            id,
            title,
            content,
            tags,
            is_pinned,
            created_at,
            updated_at,
          }),
        ),
        tasks: tasks.map(
          ({
            id,
            title,
            completed,
            priority,
            due_date,
            project_name,
            created_at,
          }) => ({
            id,
            title,
            completed,
            priority,
            due_date,
            project_name,
            created_at,
          }),
        ),
        projects: projects.map(
          ({ id, title, description, color, due_date, created_at }) => ({
            id,
            title,
            description,
            color,
            due_date,
            created_at,
          }),
        ),
        bookmarks: bookmarks.map(
          ({ id, url, title, description, tags, collection, created_at }) => ({
            id,
            url,
            title,
            description,
            tags,
            collection,
            created_at,
          }),
        ),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `neuron-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully");
    } catch {
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  /* ── Clear local cache ── */
  const handleClearCache = () => {
    // Keep auth-related keys
    const authKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("sb-")) {
        authKeys.push(key);
      }
    }
    const authData = authKeys.map((k) => [k, localStorage.getItem(k)!]);

    localStorage.clear();

    // Restore auth
    for (const [key, value] of authData) {
      localStorage.setItem(key, value);
    }

    toast.success("Local cache cleared");
    setClearCacheOpen(false);

    // Reload to re-hydrate
    setTimeout(() => window.location.reload(), 500);
  };

  /* ── Delete account ── */
  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      // Delete user data from all tables
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) {
        toast.error("Not authenticated");
        return;
      }

      // Delete in order to respect foreign keys
      await supabase.from("note_collaborators").delete().eq("user_id", user.id);
      await supabase.from("note_links").delete().eq("user_id", user.id);
      await supabase
        .from("note_tags")
        .delete()
        .in(
          "note_id",
          notes.map((n) => n.id),
        );
      await supabase.from("bookmarks").delete().eq("user_id", user.id);
      await supabase.from("tasks").delete().eq("user_id", user.id);
      await supabase.from("notes").delete().eq("user_id", user.id);
      await supabase.from("projects").delete().eq("user_id", user.id);
      await supabase.from("tags").delete().eq("user_id", user.id);
      await supabase.from("profiles").delete().eq("id", user.id);

      // Note: Deleting the auth user requires a server-side function.
      // For now, we sign out and inform the user.
      toast.success(
        "Your data has been deleted. Contact support to fully remove your auth account.",
        { duration: 8000 },
      );
      signOut();
    } catch {
      toast.error("Failed to delete account data");
    } finally {
      setDeleteLoading(false);
      setDeleteAccountOpen(false);
      setDeleteConfirmText("");
    }
  };

  return (
    <div className="space-y-6">
      <SettingSection
        icon={Database}
        title="Data & Storage"
        description="Manage your data and storage"
      >
        {/* Storage summary */}
        <div className="mb-5 pb-5 border-b border-surface-100 dark:border-surface-700/40">
          <p className="text-[12.5px] font-medium text-surface-600 dark:text-surface-400 mb-3">
            Your data
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {storageInfo.items.map((item) => (
              <div
                key={item.label}
                className="p-3 bg-surface-50 dark:bg-surface-700/30 rounded-xl text-center"
              >
                <p className="text-lg font-semibold text-surface-900 dark:text-white">
                  {item.count}
                </p>
                <p className="text-[11px] text-surface-500 dark:text-surface-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="divide-y divide-surface-100 dark:divide-surface-700/40">
          {/* Export */}
          <SettingRow
            label="Export my data"
            description="Download all your notes, tasks, projects, and bookmarks as JSON"
          >
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/15 hover:bg-primary-100 dark:hover:bg-primary-900/25 rounded-lg transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              {exporting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                  Exporting…
                </>
              ) : (
                <>
                  <Download size={14} />
                  Export
                </>
              )}
            </button>
          </SettingRow>

          {/* Clear cache */}
          <SettingRow
            label="Clear local cache"
            description="Remove cached data from this browser. Your cloud data is unaffected."
          >
            <button
              onClick={() => setClearCacheOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-700/50 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              Clear
            </button>
          </SettingRow>

          {/* Trash policy */}
          <SettingRow
            label="Trash retention"
            description="Deleted items are permanently removed after 30 days"
          >
            <span className="text-sm text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-700/50 px-3 py-1 rounded-lg">
              30 days
            </span>
          </SettingRow>
        </div>
      </SettingSection>

      {/* Danger zone */}
      <SettingSection
        icon={AlertTriangle}
        title="Danger zone"
        description="Irreversible actions"
      >
        <SettingRow
          label="Delete account"
          description="Permanently delete your account and all associated data. This cannot be undone."
        >
          <button
            onClick={() => setDeleteAccountOpen(true)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
          >
            Delete account
          </button>
        </SettingRow>
      </SettingSection>

      {/* Confirm dialogs */}
      <ConfirmDialog
        open={clearCacheOpen}
        title="Clear local cache?"
        description="This will clear all locally cached data and reload the app. Your cloud data will not be affected."
        confirmLabel="Clear cache"
        onConfirm={handleClearCache}
        onCancel={() => setClearCacheOpen(false)}
      />

      {/* Delete account modal (multi-step) */}
      {deleteAccountOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            onClick={() => {
              if (!deleteLoading) {
                setDeleteAccountOpen(false);
                setDeleteConfirmText("");
              }
            }}
          />
          <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-200/60 dark:border-surface-700/30 w-full max-w-md p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-surface-900 dark:text-white">
                  Delete your account?
                </h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1.5">
                  This will permanently delete all your notes, tasks, projects,
                  bookmarks, and account data. This action{" "}
                  <strong className="text-red-500">cannot be undone</strong>.
                </p>
              </div>
            </div>

            <div className="mb-5">
              <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5 block">
                Type <strong className="text-red-500">delete my account</strong>{" "}
                to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="delete my account"
                className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700/50 text-surface-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/20"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteAccountOpen(false);
                  setDeleteConfirmText("");
                }}
                disabled={deleteLoading}
                className="px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-700/50 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={
                  deleteLoading || deleteConfirmText !== "delete my account"
                }
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting…
                  </span>
                ) : (
                  "Permanently delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
