import { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  Sun,
  Moon,
  User,
  Bell,
  Shield,
  Zap,
  LogOut,
  Palette,
  CreditCard,
  Menu,
} from "lucide-react";
import { useStore } from "../lib/store";
import toast from "react-hot-toast";

/* ── Reusable components ─────────────────────────────────── */

function SettingsCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-surface-800/80 rounded-2xl p-5 md:p-6 border border-surface-200/60 dark:border-surface-700/30 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description?: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-surface-900 dark:text-white">
          {label}
        </p>
        {description && (
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
            {description}
          </p>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          enabled ? "bg-primary-500" : "bg-surface-300 dark:bg-surface-600"
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            enabled ? "translate-x-5.5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/* ── Sidebar items ───────────────────────────────────────── */

const sidebarItems = [
  { id: "appearance", icon: Palette, label: "Appearance" },
  { id: "account", icon: User, label: "Account" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "privacy", icon: Shield, label: "Privacy & Security" },
  { id: "billing", icon: CreditCard, label: "Billing" },
];

/* ── Page ─────────────────────────────────────────────────── */

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

  const [activeSection, setActiveSection] = useState("appearance");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    setMobileSidebarOpen(false);
  };

  const handleNameChange = (name: string) => {
    updateProfile({ name });
    toast.success("Name updated");
  };

  return (
    <div className="px-4 md:px-10 py-7 md:py-9 h-full">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-[1080px] h-full"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700/50"
          >
            <Menu
              size={18}
              className="text-surface-600 dark:text-surface-400"
            />
          </button>
          <div>
            <h1 className="text-[20px] font-semibold text-surface-900 dark:text-white/95">
              Settings
            </h1>
            <p className="text-[12.5px] text-surface-500 dark:text-surface-400">
              Manage your account and preferences
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex gap-8">
          {/* ── Sidebar ── */}
          <nav
            className={`${
              mobileSidebarOpen ? "block" : "hidden"
            } md:block w-full md:w-[220px] shrink-0 absolute md:relative z-10 md:z-auto bg-white dark:bg-surface-800 md:bg-transparent md:dark:bg-transparent rounded-xl md:rounded-none p-3 md:p-0 border md:border-0 border-surface-200/60 dark:border-surface-700/30 shadow-lg md:shadow-none left-4 right-4 md:left-auto md:right-auto`}
          >
            <ul className="space-y-1">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-primary-50 dark:bg-primary-900/15 text-primary-600 dark:text-primary-400"
                        : "text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700/40 hover:text-surface-900 dark:hover:text-white"
                    }`}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Sign-out in sidebar */}
            <div className="mt-6 pt-4 border-t border-surface-200/60 dark:border-surface-700/30">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </nav>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0 space-y-6 pb-12">
            {/* Appearance */}
            <section
              ref={(el) => {
                sectionRefs.current.appearance = el;
              }}
            >
              <SettingsCard>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Palette size={16} className="text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white">
                      Appearance
                    </h2>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      Customize the look and feel
                    </p>
                  </div>
                </div>

                <p className="text-[12.5px] font-medium text-surface-600 dark:text-surface-400 mb-3">
                  Theme
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => theme === "dark" && toggleTheme()}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      theme === "light"
                        ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 shadow-sm"
                        : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        theme === "light"
                          ? "bg-primary-100 dark:bg-primary-900/20"
                          : "bg-surface-100 dark:bg-surface-700"
                      }`}
                    >
                      <Sun
                        size={18}
                        className={
                          theme === "light"
                            ? "text-primary-500"
                            : "text-surface-500 dark:text-surface-400"
                        }
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">
                        Light
                      </p>
                      <p className="text-xs text-surface-500">Clean & bright</p>
                    </div>
                  </button>

                  <button
                    onClick={() => theme === "light" && toggleTheme()}
                    className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      theme === "dark"
                        ? "border-primary-500 bg-primary-50/50 dark:bg-primary-900/10 shadow-sm"
                        : "border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        theme === "dark"
                          ? "bg-primary-100 dark:bg-primary-900/20"
                          : "bg-surface-100 dark:bg-surface-700"
                      }`}
                    >
                      <Moon
                        size={18}
                        className={
                          theme === "dark"
                            ? "text-primary-500"
                            : "text-surface-500 dark:text-surface-400"
                        }
                      />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-surface-900 dark:text-white">
                        Dark
                      </p>
                      <p className="text-xs text-surface-500">
                        Easy on the eyes
                      </p>
                    </div>
                  </button>
                </div>
              </SettingsCard>
            </section>

            {/* Account */}
            <section
              ref={(el) => {
                sectionRefs.current.account = el;
              }}
            >
              <SettingsCard>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <User size={16} className="text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white">
                      Account
                    </h2>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      Manage your profile information
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">
                        Name
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        Your display name
                      </p>
                    </div>
                    <input
                      type="text"
                      defaultValue={profile?.name || ""}
                      onBlur={(e) => handleNameChange(e.target.value)}
                      className="text-sm text-right text-surface-900 dark:text-white bg-surface-50 dark:bg-surface-700/50 rounded-lg px-3 py-1.5 border border-surface-200 dark:border-surface-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 w-48"
                    />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">
                        Email
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        Your account email
                      </p>
                    </div>
                    <span className="text-sm text-surface-500 dark:text-surface-400">
                      {profile?.email || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">
                        Workspace
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        Your current workspace
                      </p>
                    </div>
                    <span className="text-sm text-surface-500 dark:text-surface-400 bg-surface-50 dark:bg-surface-700/50 px-3 py-1 rounded-lg">
                      {profile?.workspace || "Personal"}
                    </span>
                  </div>
                </div>
              </SettingsCard>
            </section>

            {/* Notifications */}
            <section
              ref={(el) => {
                sectionRefs.current.notifications = el;
              }}
            >
              <SettingsCard>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Bell size={16} className="text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white">
                      Notifications
                    </h2>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      Choose what you want to be notified about
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
                  <ToggleRow
                    label="Email notifications"
                    description="Receive updates and alerts via email"
                    enabled={notifications.email}
                    onChange={() =>
                      updateNotifications({ email: !notifications.email })
                    }
                  />
                  <ToggleRow
                    label="Desktop notifications"
                    description="Get push notifications on your device"
                    enabled={notifications.desktop}
                    onChange={() =>
                      updateNotifications({ desktop: !notifications.desktop })
                    }
                  />
                  <ToggleRow
                    label="Daily summary"
                    description="Receive a daily digest of your activity"
                    enabled={notifications.dailySummary}
                    onChange={() =>
                      updateNotifications({
                        dailySummary: !notifications.dailySummary,
                      })
                    }
                  />
                </div>
              </SettingsCard>
            </section>

            {/* Privacy & Security */}
            <section
              ref={(el) => {
                sectionRefs.current.privacy = el;
              }}
            >
              <SettingsCard>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                    <Shield size={16} className="text-primary-500" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white">
                      Privacy & Security
                    </h2>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      Protect your data and account
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
                  <div className="flex items-center justify-between py-3 first:pt-0">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">
                        Two-factor authentication
                      </p>
                      <p className="text-xs text-surface-500 dark:text-surface-400">
                        Add an extra layer of security
                      </p>
                    </div>
                    <span className="text-xs font-medium text-surface-400 dark:text-surface-500 bg-surface-100 dark:bg-surface-700/50 px-2.5 py-1 rounded-full">
                      Coming soon
                    </span>
                  </div>
                  <ToggleRow
                    label="Data encryption"
                    description="End-to-end encryption for your notes"
                    enabled={true}
                    onChange={() => {}}
                  />
                </div>
              </SettingsCard>
            </section>

            {/* Billing / Upgrade */}
            <section
              ref={(el) => {
                sectionRefs.current.billing = el;
              }}
            >
              <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold">Neuron Pro</h2>
                    <p className="text-xs text-white/60">Upgrade your plan</p>
                  </div>
                </div>
                <p className="text-sm text-white/75 mb-5 leading-relaxed">
                  Unlock unlimited notes, advanced AI features, real-time
                  collaboration, and priority support.
                </p>
                <div className="flex items-center gap-3">
                  <button className="px-5 py-2.5 bg-white text-primary-600 rounded-xl font-semibold text-[12.5px] hover:bg-white/90 transition-colors shadow-sm">
                    Upgrade now
                  </button>
                  <button className="px-5 py-2.5 bg-white/10 text-white rounded-xl font-medium text-[12.5px] hover:bg-white/20 transition-colors">
                    Learn more
                  </button>
                </div>
              </div>
            </section>

            {/* Danger zone – mobile only (desktop uses sidebar sign-out) */}
            <section className="md:hidden">
              <SettingsCard className="border-red-200/60 dark:border-red-900/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <LogOut size={16} className="text-red-500" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white">
                      Danger Zone
                    </h2>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      Irreversible actions
                    </p>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[12.5px] font-medium transition-colors"
                >
                  Sign out
                </button>
              </SettingsCard>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
