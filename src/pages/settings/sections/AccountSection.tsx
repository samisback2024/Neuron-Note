import { useState } from "react";
import { User, KeyRound, LogOut } from "lucide-react";
import { SettingSection } from "../components/SettingSection";
import { SettingRow } from "../components/SettingRow";
import { EditableField } from "../components/EditableField";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useStore } from "../../../lib/store";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";

export function AccountSection() {
  const { profile, updateProfile, signOut } = useStore();

  /* ── Password change state ── */
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const handleNameSave = async (name: string) => {
    await updateProfile({ name });
    toast.success("Display name updated");
  };

  const handlePasswordChange = async () => {
    setPwError(null);
    if (newPw.length < 8) {
      setPwError("Password must be at least 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match");
      return;
    }
    setPwLoading(true);
    try {
      // Verify current password by re-authenticating
      const email = profile?.email;
      if (email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPw,
        });
        if (signInError) {
          setPwError("Current password is incorrect");
          setPwLoading(false);
          return;
        }
      }
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) {
        setPwError(error.message);
      } else {
        toast.success("Password updated successfully");
        setPwModalOpen(false);
        setCurrentPw("");
        setNewPw("");
        setConfirmPw("");
      }
    } catch {
      setPwError("Something went wrong. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  /* ── Avatar ── */
  const initials =
    profile?.name
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <div className="space-y-6">
      <SettingSection
        icon={User}
        title="Account"
        description="Manage your profile and credentials"
      >
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-surface-100 dark:border-surface-700/40">
          <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold text-lg shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
              {profile?.name || "User"}
            </p>
            <p className="text-xs text-surface-500 dark:text-surface-400 truncate">
              {profile?.email || "—"}
            </p>
          </div>
        </div>

        <div className="divide-y divide-surface-100 dark:divide-surface-700/40">
          <EditableField
            label="Display name"
            description="How others see you"
            value={profile?.name || ""}
            placeholder="Enter your name"
            onSave={handleNameSave}
            validate={(v) =>
              v.length < 2 ? "Name must be at least 2 characters" : null
            }
          />

          <EditableField
            label="Email"
            description="Your account email address"
            value={profile?.email || ""}
            readOnly
          />

          <EditableField
            label="Workspace"
            description="Your current workspace"
            value={profile?.workspace || "Personal"}
            readOnly
          />

          {/* Password */}
          <SettingRow
            label="Password"
            description="Change your account password"
          >
            <button
              onClick={() => setPwModalOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/15 hover:bg-primary-100 dark:hover:bg-primary-900/25 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              Change
            </button>
          </SettingRow>
        </div>

        {/* Mobile sign-out */}
        <div className="mt-5 pt-5 border-t border-surface-100 dark:border-surface-700/40 md:hidden">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </SettingSection>

      {/* ── Password change modal ── */}
      {pwModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            onClick={() => {
              if (!pwLoading) {
                setPwModalOpen(false);
                setPwError(null);
              }
            }}
          />
          <div className="relative bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-surface-200/60 dark:border-surface-700/30 w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <KeyRound size={16} className="text-primary-500" />
              </div>
              <h3 className="text-[15px] font-semibold text-surface-900 dark:text-white">
                Change password
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 block">
                  Current password
                </label>
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  autoComplete="current-password"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700/50 text-surface-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 block">
                  New password
                </label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700/50 text-surface-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-1 block">
                  Confirm new password
                </label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700/50 text-surface-900 dark:text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
                />
              </div>
              {pwError && (
                <p role="alert" className="text-xs text-red-500">
                  {pwError}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setPwModalOpen(false);
                  setPwError(null);
                  setCurrentPw("");
                  setNewPw("");
                  setConfirmPw("");
                }}
                disabled={pwLoading}
                className="px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-700/50 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pwLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Updating…
                  </span>
                ) : (
                  "Update password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
