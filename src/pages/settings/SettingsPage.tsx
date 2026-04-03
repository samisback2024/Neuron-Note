import { useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { motion } from "motion/react";
import { Menu } from "lucide-react";
import {
  SettingsSidebar,
  type SettingsSectionId,
} from "./components/SettingsSidebar";
import { AppearanceSection } from "./sections/AppearanceSection";
import { AccountSection } from "./sections/AccountSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { PrivacySection } from "./sections/PrivacySection";
import { DataStorageSection } from "./sections/DataStorageSection";
import { AccessibilitySection } from "./sections/AccessibilitySection";
import { AboutSection } from "./sections/AboutSection";

const SECTION_COMPONENTS: Record<SettingsSectionId, React.FC> = {
  appearance: AppearanceSection,
  account: AccountSection,
  notifications: NotificationsSection,
  privacy: PrivacySection,
  data: DataStorageSection,
  accessibility: AccessibilitySection,
  about: AboutSection,
};

const VALID_SECTIONS = new Set<string>(Object.keys(SECTION_COMPONENTS));

export function SettingsPage() {
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Parse section from URL path
  const pathSection = location.pathname
    .replace("/settings/", "")
    .replace("/settings", "");
  const activeSection = VALID_SECTIONS.has(pathSection)
    ? (pathSection as SettingsSectionId)
    : null;

  // Redirect /settings to /settings/appearance
  if (!activeSection) {
    return <Navigate to="/settings/appearance" replace />;
  }

  const ActiveComponent = SECTION_COMPONENTS[activeSection];

  return (
    <div className="px-4 md:px-10 py-7 md:py-9 h-full">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
        className="mx-auto max-w-[1080px] h-full"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-colors"
            aria-label="Toggle settings menu"
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
          <SettingsSidebar
            open={mobileSidebarOpen}
            onClose={() => setMobileSidebarOpen(false)}
          />

          <div className="flex-1 min-w-0 pb-12">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
            >
              <ActiveComponent />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
