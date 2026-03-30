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
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const { sidebarOpen, toggleSidebar, profile } = useStore();
  const location = useLocation();

  return (
    <>
      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 flex justify-around items-center h-16 px-2">
        {navItems.slice(0, 5).map((item) => {
          const isActive =
            location.pathname === item.to ||
            (item.to !== "/" && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                isActive
                  ? "text-primary-500"
                  : "text-surface-500 dark:text-surface-400"
              }`}
            >
              <item.icon size={20} />
              <span className="truncate max-w-[56px]">{item.label}</span>
            </NavLink>
          );
        })}
        <NavLink
          to="/settings"
          className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${
            location.pathname === "/settings"
              ? "text-primary-500"
              : "text-surface-500 dark:text-surface-400"
          }`}
        >
          <Settings size={20} />
          <span>More</span>
        </NavLink>
      </nav>

      {/* Desktop sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex flex-col h-screen bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700/50 overflow-hidden flex-shrink-0"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 h-16 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-white" />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-semibold text-surface-900 dark:text-white text-lg whitespace-nowrap"
              >
                Neuron
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={toggleSidebar}
            className="ml-auto p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400 transition-colors flex-shrink-0"
          >
            {sidebarOpen ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.to ||
              (item.to !== "/" && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? "bg-primary-500 text-white shadow-md shadow-primary-500/20"
                    : "text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800"
                }`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-surface-200 dark:border-surface-700/50 flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-violet-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
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
                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                    {profile?.name || "User"}
                  </p>
                  <p className="text-xs text-surface-500 truncate">
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
