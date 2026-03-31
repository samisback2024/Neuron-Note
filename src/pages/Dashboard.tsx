import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  FileText,
  CheckSquare,
  Zap,
  TrendingUp,
  Clock,
  Plus,
  PlayCircle,
  Pin,
  Search,
} from "lucide-react";
import { useStore } from "../lib/store";
import { format, isToday } from "date-fns";
import toast from "react-hot-toast";

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const {
    profile,
    notes,
    tasks,
    noteLinks,
    startTour,
    createNote,
    createTask,
    togglePin,
  } = useStore();
  const navigate = useNavigate();

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 18
        ? "Good afternoon"
        : "Good evening";

  const totalNotes = notes.length;
  const totalTasks = tasks.filter((t) => !t.completed).length;
  const totalConnections = noteLinks.length;

  const pinnedNotes = notes.filter((n) => n.is_pinned);
  const recentNotes = notes.filter((n) => !n.is_pinned).slice(0, 5);
  const todayTasks = tasks.filter(
    (t) => !t.completed && t.due_date && isToday(new Date(t.due_date)),
  );
  const pendingTasks =
    todayTasks.length > 0
      ? todayTasks
      : tasks.filter((t) => !t.completed).slice(0, 3);

  const tourDone = localStorage.getItem("neuron-tour-done");

  const handleQuickCapture = (val: string) => {
    if (!val.trim()) return;

    // Prefix support: #task creates a task
    if (val.startsWith("#task ")) {
      const title = val.slice(6).trim();
      if (title) {
        createTask({
          title,
          completed: false,
          priority: "medium",
          due_date: new Date().toISOString().split("T")[0],
          project_id: null,
          project_name: null,
        });
        toast.success("Task created");
      }
      return;
    }

    // Default: create note (strip optional #note prefix)
    const title = val.startsWith("#note ") ? val.slice(6).trim() : val.trim();
    createNote(title, "").then((note) => {
      if (note) toast.success("Note captured!");
    });
  };

  return (
    <div className="px-6 md:px-10 py-7 md:py-9">
      <div className="mx-auto max-w-[1080px]">
        {/* Welcome */}
        <motion.div {...fadeUp} transition={{ delay: 0, duration: 0.24 }}>
          <h1 className="text-[28px] md:text-[36px] font-semibold text-surface-900 dark:text-white/95 leading-[1.1] tracking-[-0.01em]">
            {greeting}, {profile?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-[14px] md:text-[15px] text-surface-500 dark:text-surface-400 mt-2">
            {format(today, "EEEE, MMMM d, yyyy")} · Your thinking workspace
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.06, duration: 0.24 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8"
        >
          {[
            {
              label: "Notes",
              value: totalNotes,
              trend: <TrendingUp size={16} className="text-primary-400" />,
            },
            {
              label: "Pending Tasks",
              value: totalTasks,
              trend: <Clock size={16} className="text-violet-400" />,
            },
            {
              label: "Connections",
              value: totalConnections,
              trend: <Zap size={16} className="text-green-400" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-surface-800/80 rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/30 shadow-sm card-hover"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[13px] text-surface-500 dark:text-surface-400 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-[26px] font-semibold text-surface-900 dark:text-white/95 leading-none mt-1.5">
                    {stat.value}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-surface-50 dark:bg-surface-700/50 flex items-center justify-center">
                  {stat.trend}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick capture */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.15 }}
          className="mt-5 bg-white dark:bg-surface-800/80 rounded-2xl py-3 px-4 border border-surface-200/60 dark:border-surface-700/30 shadow-sm flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-surface-100 dark:bg-surface-700/50 flex items-center justify-center flex-shrink-0">
            <Plus
              size={16}
              className="text-surface-500 dark:text-surface-400"
            />
          </div>
          <input
            type="text"
            placeholder="Quick capture — type an idea, or #task Buy groceries"
            className="flex-1 bg-transparent text-surface-900 dark:text-white/90 placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none text-[13.5px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                handleQuickCapture((e.target as HTMLInputElement).value);
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-100 dark:bg-surface-700 text-[10px] text-surface-400 font-mono">
              ⌘/
            </kbd>
            <span className="text-[10.5px] text-surface-400">search</span>
          </div>
        </motion.div>

        {/* Tour banner */}
        {!tourDone && (
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="mt-5 bg-gradient-to-r from-primary-500 via-violet-500 to-green-400 rounded-2xl p-6 md:p-7 text-white shadow-lg shadow-primary-500/10"
          >
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <PlayCircle size={14} />
                  <span className="text-[10.5px] font-semibold uppercase tracking-widest opacity-80">
                    Interactive Demo
                  </span>
                </div>
                <h3 className="text-[17px] font-semibold leading-snug">
                  Experience the Full Workflow
                </h3>
                <p className="text-[12.5px] text-white/65 mt-1">
                  Create a note → Link ideas → Visualize connections → Stay
                  organized
                </p>
              </div>
              <button
                onClick={startTour}
                className="px-5 py-2.5 bg-white text-primary-600 rounded-xl font-semibold text-[12.5px] hover:bg-white/90 transition-colors flex-shrink-0 shadow-sm"
              >
                Start Tour
              </button>
            </div>
          </motion.div>
        )}

        {/* Pinned Notes */}
        {pinnedNotes.length > 0 && (
          <motion.div {...fadeUp} transition={{ delay: 0.22 }} className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Pin size={14} className="text-primary-500" />
              <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white/90">
                Pinned
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pinnedNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24 + i * 0.04 }}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="group bg-white dark:bg-surface-800/80 rounded-2xl p-4 border border-primary-200/60 dark:border-primary-800/30 shadow-sm card-hover cursor-pointer relative"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePin(note.id);
                      toast.success("Unpinned");
                    }}
                    className="absolute top-3 right-3 p-1.5 rounded-lg text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Pin size={12} />
                  </button>
                  <h3 className="font-medium text-surface-900 dark:text-white/90 text-[13.5px] pr-6 truncate">
                    {note.title || "Untitled"}
                  </h3>
                  <p className="text-[12px] text-surface-500 dark:text-surface-400 mt-1 line-clamp-2 leading-relaxed">
                    {note.content?.replace(/<[^>]*>/g, "").substring(0, 100) ||
                      "Empty note"}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent Notes */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="mt-9">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white/90">
              Recent Notes
            </h2>
            <button
              onClick={() => navigate("/notes")}
              className="text-[12.5px] text-primary-500 hover:text-primary-600 font-medium"
            >
              View all
            </button>
          </div>
          {recentNotes.length === 0 ? (
            <div className="bg-white dark:bg-surface-800/80 rounded-2xl py-12 px-6 border border-surface-200/60 dark:border-surface-700/30 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700/50 flex items-center justify-center mx-auto mb-3">
                <FileText
                  size={22}
                  className="text-surface-400 dark:text-surface-500"
                />
              </div>
              <h3 className="text-[14px] font-semibold text-surface-900 dark:text-white/90 mb-1">
                No notes yet
              </h3>
              <p className="text-surface-500 dark:text-surface-400 text-[12.5px] mb-4 max-w-xs mx-auto">
                Start capturing your ideas and thoughts to see them here.
              </p>
              <button
                onClick={() => navigate("/notes")}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[12.5px] font-medium rounded-lg transition-colors"
              >
                Create your first note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recentNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="bg-white dark:bg-surface-800/80 rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/30 shadow-sm card-hover cursor-pointer"
                >
                  <h3 className="font-medium text-surface-900 dark:text-white/90 text-[13.5px]">
                    {note.title}
                  </h3>
                  <p className="text-[12px] text-surface-500 dark:text-surface-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {note.content?.replace(/<[^>]*>/g, "").substring(0, 120) ||
                      "Empty note"}
                  </p>
                  <div className="flex items-center gap-2 mt-3.5 flex-wrap">
                    {note.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-md text-[10.5px] bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[10.5px] text-surface-400 ml-auto">
                      {format(new Date(note.updated_at), "MMM d")}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Today's Tasks */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="mt-9">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-semibold text-surface-900 dark:text-white/90">
              {todayTasks.length > 0 ? "Today\u2019s Tasks" : "Pending Tasks"}
            </h2>
            <button
              onClick={() => navigate("/tasks")}
              className="text-[12.5px] text-primary-500 hover:text-primary-600 font-medium"
            >
              View all
            </button>
          </div>
          <div className="bg-white dark:bg-surface-800/80 rounded-2xl border border-surface-200/60 dark:border-surface-700/30 shadow-sm overflow-hidden">
            {pendingTasks.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700/50 flex items-center justify-center mx-auto mb-3">
                  <CheckSquare
                    size={22}
                    className="text-surface-400 dark:text-surface-500"
                  />
                </div>
                <h3 className="text-[14px] font-semibold text-surface-900 dark:text-white/90 mb-1">
                  All caught up!
                </h3>
                <p className="text-surface-500 dark:text-surface-400 text-[12.5px] mb-4 max-w-xs mx-auto">
                  No pending tasks. Create one to stay on track.
                </p>
                <button
                  onClick={() => navigate("/tasks")}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[12.5px] font-medium rounded-lg transition-colors"
                >
                  Create a task
                </button>
              </div>
            ) : (
              pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-100 dark:border-surface-700/20 last:border-0 hover:bg-surface-50/50 dark:hover:bg-surface-700/20 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() =>
                      useStore
                        .getState()
                        .updateTask(task.id, { completed: !task.completed })
                    }
                    className="w-4 h-4 rounded border-2 border-surface-300 dark:border-surface-600 accent-green-400"
                  />
                  <span
                    className={`text-[13.5px] flex-1 ${
                      task.completed
                        ? "line-through text-surface-400"
                        : "text-surface-900 dark:text-white/90"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-[10.5px] px-2 py-0.5 rounded font-medium ${
                      task.priority === "high"
                        ? "bg-red-50 dark:bg-red-900/15 text-red-500"
                        : task.priority === "medium"
                          ? "bg-yellow-50 dark:bg-yellow-900/15 text-yellow-600 dark:text-yellow-500"
                          : "bg-green-50 dark:bg-green-900/15 text-green-500"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
