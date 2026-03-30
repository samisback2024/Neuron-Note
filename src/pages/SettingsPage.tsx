import { motion } from "motion/react";
import { Sun, Moon, User, Bell, Shield, Zap, LogOut } from "lucide-react";
import { useStore } from "../lib/store";
import toast from "react-hot-toast";

export function SettingsPage() {
  const {
    profile,
    theme,
    toggleTheme,
    notifications,
    updateNotifications,
    updateProfile,
    signOut,
  } = useStore();

  const handleNameChange = (name: string) => {
    updateProfile({ name });
    toast.success("Name updated");
  };

  return (
    <div className="px-6 md:px-10 py-7 md:py-9">
      <div className="mx-auto max-w-[800px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-[20px] font-semibold text-surface-900 dark:text-white/95 mb-1">
            Settings
          </h1>
          <p className="text-[12.5px] text-surface-500 dark:text-surface-400 mb-8">
            Manage your account and preferences
          </p>

          {/* Appearance */}
          <section className="bg-white dark:bg-surface-800/80 rounded-2xl p-6 border border-surface-200/60 dark:border-surface-700/30 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Sun size={18} className="text-primary-500" />
              <div>
                <h2 className="text-base font-semibold text-surface-900 dark:text-white">
                  Appearance
                </h2>
                <p className="text-xs text-surface-500">
                  Customize the look and feel
                </p>
              </div>
            </div>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
              Theme
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => theme === "dark" && toggleTheme()}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  theme === "light"
                    ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10"
                    : "border-surface-200 dark:border-surface-700 hover:border-surface-300"
                }`}
              >
                <Sun
                  size={20}
                  className="text-surface-600 dark:text-surface-400"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    Light
                  </p>
                  <p className="text-xs text-surface-500">Clean and bright</p>
                </div>
              </button>
              <button
                onClick={() => theme === "light" && toggleTheme()}
                className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  theme === "dark"
                    ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10"
                    : "border-surface-200 dark:border-surface-700 hover:border-surface-300"
                }`}
              >
                <Moon
                  size={20}
                  className="text-surface-600 dark:text-surface-400"
                />
                <div className="text-left">
                  <p className="text-sm font-medium text-surface-900 dark:text-white">
                    Dark
                  </p>
                  <p className="text-xs text-surface-500">Easy on the eyes</p>
                </div>
              </button>
            </div>
          </section>

          {/* Profile */}
          <section className="bg-white dark:bg-surface-800/80 rounded-2xl p-6 border border-surface-200/60 dark:border-surface-700/30 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <User size={18} className="text-primary-500" />
              <h2 className="text-base font-semibold text-surface-900 dark:text-white">
                Profile
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Name
                </span>
                <input
                  type="text"
                  defaultValue={profile?.name || ""}
                  onBlur={(e) => handleNameChange(e.target.value)}
                  className="text-sm text-right text-surface-900 dark:text-white bg-transparent focus:outline-none focus:underline"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-surface-100 dark:border-surface-700/50">
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Email
                </span>
                <span className="text-sm text-surface-900 dark:text-white">
                  {profile?.email || "Not set"}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-surface-100 dark:border-surface-700/50">
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Workspace
                </span>
                <span className="text-sm text-surface-900 dark:text-white">
                  {profile?.workspace || "Personal"}
                </span>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white dark:bg-surface-800/80 rounded-2xl p-6 border border-surface-200/60 dark:border-surface-700/30 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell size={18} className="text-primary-500" />
              <h2 className="text-base font-semibold text-surface-900 dark:text-white">
                Notifications
              </h2>
            </div>
            <div className="space-y-4">
              {[
                { key: "email" as const, label: "Email notifications" },
                { key: "desktop" as const, label: "Desktop notifications" },
                { key: "dailySummary" as const, label: "Daily summary" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-2 border-t border-surface-100 dark:border-surface-700/50 first:border-0"
                >
                  <span className="text-sm text-surface-600 dark:text-surface-400">
                    {item.label}
                  </span>
                  <button
                    onClick={() =>
                      updateNotifications({
                        [item.key]: !notifications[item.key],
                      })
                    }
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      notifications[item.key]
                        ? "bg-primary-500"
                        : "bg-surface-300 dark:bg-surface-600"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        notifications[item.key]
                          ? "translate-x-5.5"
                          : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Privacy & Security */}
          <section className="bg-white dark:bg-surface-800/80 rounded-2xl p-6 border border-surface-200/60 dark:border-surface-700/30 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={18} className="text-primary-500" />
              <h2 className="text-base font-semibold text-surface-900 dark:text-white">
                Privacy & Security
              </h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Two-factor authentication
                </span>
                <span className="text-xs text-surface-400">Coming soon</span>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-surface-100 dark:border-surface-700/50">
                <span className="text-sm text-surface-600 dark:text-surface-400">
                  Data encryption
                </span>
                <div className="relative w-11 h-6 rounded-full bg-primary-500">
                  <div className="absolute top-0.5 translate-x-5.5 w-5 h-5 bg-white rounded-full shadow" />
                </div>
              </div>
            </div>
          </section>

          {/* Upgrade */}
          <section className="bg-gradient-to-r from-primary-500 to-violet-500 rounded-2xl p-6 mb-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Zap size={18} />
              <h2 className="text-base font-semibold">Upgrade to Neuron Pro</h2>
            </div>
            <p className="text-sm text-white/70 mb-4">
              Unlock unlimited notes, advanced AI features, and priority
              support.
            </p>
            <button className="px-5 py-2 bg-white text-primary-600 rounded-lg font-medium text-[12.5px] hover:bg-white/90 transition-colors shadow-sm">
              Learn more
            </button>
          </section>

          {/* Sign out */}
          <button
            onClick={signOut}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </motion.div>
      </div>
    </div>
  );
}
