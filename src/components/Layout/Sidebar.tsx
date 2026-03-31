import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Inbox,
  FileText,
  CheckSquare,
  FolderKanban,
  Share2,
  Bookmark,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useStore } from "../../lib/store";

const navItems = [
  { to: "/", icon: Inbox, label: "Inbox" },
  { to: "/notes", icon: FileText, label: "Notes" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/projects", icon: FolderKanban, label: "Projects" },
  { to: "/knowledge-graph", icon: Share2, label: "Knowledge Graph" },
  { to: "/bookmarks", icon: Bookmark, label: "Bookmarks" },
  { to: "/ai-assistant", icon: Sparkles, label: "AI Assistant" },
  { to: "/trash", icon: Trash2, label: "Trash" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, profile } = useStore();
  const location = useLocation();

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 flex justify-around items-center h-14 px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] transition-colors ${
                isActive
                  ? "text-primary-500"
                  : "text-surface-500 dark:text-surface-400"
              }`}
            >
              <item.icon size={18} />
              <span className="truncate max-w-[56px]">{item.label}</span>
            </NavLink>
          );
        })}
        <NavLink
          to="/settings"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] transition-colors ${
            location.pathname === "/settings"
              ? "text-primary-500"
              : "text-surface-500 dark:text-surface-400"
          }`}
        >
          <Settings size={18} />
          <span>More</span>
        </NavLink>
      </nav>

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 272 : 72 }}
        transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
        className="hidden md:flex flex-col h-screen bg-white dark:bg-surface-900 border-r border-surface-200/80 dark:border-surface-700/40 overflow-hidden flex-shrink-0"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 h-[60px] flex-shrink-0">
          <img
            src="/favicon.svg"
            alt="Neuron Note"
            className="w-8 h-8 flex-shrink-0"
          />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-semibold text-surface-900 dark:text-white text-[17px] whitespace-nowrap tracking-tight"
              >
                Neuron Note
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="ml-auto p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 transition-colors flex-shrink-0"
          >
            {sidebarOpen ? (
              <ChevronLeft size={15} />
            ) : (
              <ChevronRight size={15} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`relative flex items-center gap-3 px-3.5 h-[44px] rounded-2xl text-[14px] font-medium transition-all duration-[180ms] ease-out group ${
                  isActive
                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                    : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                }`}
              >
                {/* Active left accent */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-2 bottom-2 w-[3px] rounded-full bg-white/60"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <item.icon size={18} className="flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.12 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-surface-200/80 dark:border-surface-700/40 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
              {profile?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="min-w-0"
                >
                  <p className="text-[13px] font-medium text-surface-900 dark:text-white truncate">
                    {profile?.name || "User"}
                  </p>
                  <p className="text-[11px] text-surface-500 truncate">
                    {profile?.workspace || "Personal"} Workspace
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
