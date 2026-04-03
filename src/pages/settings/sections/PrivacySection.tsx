import { useState, useEffect } from "react";
import { Shield, Lock, Monitor, ShieldCheck } from "lucide-react";
import { SettingSection } from "../components/SettingSection";
import { SettingRow } from "../components/SettingRow";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useStore } from "../../../lib/store";
import { supabase } from "../../../lib/supabase";
import toast from "react-hot-toast";

interface SessionInfo {
  current: boolean;
  browser: string;
  lastActive: string;
}

function getBrowserName(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg")) return "Microsoft Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown browser";
}

export function PrivacySection() {
  const { signOut } = useStore();
  const [signOutAllOpen, setSignOutAllOpen] = useState(false);
  const [signOutAllLoading, setSignOutAllLoading] = useState(false);
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(
    null,
  );

  useEffect(() => {
    // Get current session info
    setCurrentSession({
      current: true,
      browser: `${getBrowserName()} on ${navigator.platform}`,
      lastActive: "Active now",
    });
  }, []);

  const handleSignOutAll = async () => {
    setSignOutAllLoading(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) {
        toast.error("Failed to sign out from all devices");
      } else {
        toast.success("Signed out from all devices");
        signOut();
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSignOutAllLoading(false);
      setSignOutAllOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <SettingSection
        icon={Shield}
        title="Privacy & Security"
        description="Protect your data and account"
      >
        <div className="divide-y divide-surface-100 dark:divide-surface-700/40">
          {/* Active session */}
          <div className="py-3.5 first:pt-0">
            <p className="text-[12.5px] font-medium text-surface-600 dark:text-surface-400 mb-3">
              Active session
            </p>
            {currentSession && (
              <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-700/30 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                  <Monitor size={16} className="text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    {currentSession.browser}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {currentSession.lastActive}
                  </p>
                </div>
                <span className="ml-auto text-[11px] font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                  Current
                </span>
              </div>
            )}
          </div>

          {/* Sign out all devices */}
          <SettingRow
            label="Sign out everywhere"
            description="End all sessions including this device"
          >
            <button
              onClick={() => setSignOutAllOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/15 hover:bg-red-100 dark:hover:bg-red-900/25 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              Sign out all
            </button>
          </SettingRow>

          {/* Two-factor auth */}
          <SettingRow
            label="Two-factor authentication"
            description="Add an extra layer of security to your account"
            comingSoon
          />

          {/* Data encryption info */}
          <div className="py-3.5">
            <div className="flex items-start gap-3 p-3 bg-surface-50 dark:bg-surface-700/30 rounded-xl">
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={14} className="text-primary-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-white">
                  Data encryption
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                  Your data is encrypted in transit (TLS) and at rest on our
                  servers. All connections to the database use encrypted
                  channels.
                </p>
              </div>
              <ShieldCheck size={16} className="text-green-500 shrink-0 mt-1" />
            </div>
          </div>
        </div>
      </SettingSection>

      <ConfirmDialog
        open={signOutAllOpen}
        title="Sign out from all devices?"
        description="This will end all active sessions, including the one you're using now. You'll need to sign in again."
        confirmLabel="Sign out everywhere"
        variant="danger"
        loading={signOutAllLoading}
        onConfirm={handleSignOutAll}
        onCancel={() => setSignOutAllOpen(false)}
      />
    </div>
  );
}
