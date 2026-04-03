import { useNavigate, useLocation } from "react-router-dom";
import {
  Palette,
  User,
  Bell,
  Shield,
  Database,
  Accessibility,
  Info,
  LogOut,
} from "lucide-react";
import { useStore } from "../../../lib/store";

export const SETTINGS_SECTIONS = [
  { id: "appearance", icon: Palette, label: "Appearance" },
  { id: "account", icon: User, label: "Account" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "privacy", icon: Shield, label: "Privacy & Security" },
  { id: "data", icon: Database, label: "Data & Storage" },
  { id: "accessibility", icon: Accessibility, label: "Accessibility" },
  { id: "about", icon: Info, label: "About" },
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SettingsSidebar({ open, onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useStore();

  const activePath =
    location.pathname.replace("/settings/", "").replace("/settings", "") ||
    "appearance";

  const handleNav = (id: string) => {
    navigate(`/settings/${id}`);
    onClose();
  };

  return (
    <nav
      className={`${
        open ? "block" : "hidden"
      } md:block w-full md:w-[220px] shrink-0 absolute md:relative z-10 md:z-auto bg-white dark:bg-surface-800 md:bg-transparent md:dark:bg-transparent rounded-xl md:rounded-none p-3 md:p-0 border md:border-0 border-surface-200/60 dark:border-surface-700/30 shadow-lg md:shadow-none left-4 right-4 md:left-auto md:right-auto`}
      aria-label="Settings navigation"
    >
      <ul className="space-y-0.5" role="list">
        {SETTINGS_SECTIONS.map((item) => {
          const active = activePath === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => handleNav(item.id)}
                aria-current={active ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                  active
                    ? "bg-primary-50 dark:bg-primary-900/15 text-primary-600 dark:text-primary-400"
                    : "text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-700/40 hover:text-surface-900 dark:hover:text-white"
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 pt-4 border-t border-surface-200/60 dark:border-surface-700/30">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </nav>
  );
}
