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
} from "lucide-react";
import { useStore } from "../lib/store";
import { format } from "date-fns";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function Dashboard() {
  const { profile, notes, tasks, noteLinks, startTour } = useStore();
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

  const recentNotes = notes.slice(0, 3);
  const todayTasks = tasks.filter((t) => !t.completed).slice(0, 3);

  const tourDone = localStorage.getItem("neuron-tour-done");

  return (
    <div className="px-6 md:px-8 py-6 md:py-8">
      <div className="mx-auto max-w-[1100px]">
        {/* Welcome */}
        <motion.div {...fadeUp} transition={{ delay: 0 }}>
          <h1 className="text-[32px] md:text-[44px] font-semibold text-surface-900 dark:text-white leading-[1.05] tracking-tight">
            {greeting}, {profile?.name?.split(" ")[0] || "there"}
          </h1>
          <p className="text-[15px] md:text-[17px] text-surface-500 mt-1.5">
            {format(today, "EEEE, MMMM d, yyyy")} · Your thinking workspace
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-8"
        >
          {[
            {
              label: "Notes",
              value: totalNotes,
              trend: <TrendingUp size={18} className="text-primary-400" />,
            },
            {
              label: "Tasks",
              value: totalTasks,
              trend: <Clock size={18} className="text-violet-400" />,
            },
            {
              label: "Ideas",
              value: totalConnections,
              trend: <Zap size={18} className="text-green-400" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white dark:bg-surface-800 rounded-3xl p-6 border border-surface-200/80 dark:border-surface-700/40 hover:shadow-lg hover:shadow-surface-200/50 dark:hover:shadow-surface-900/50 transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[28px] font-bold text-surface-900 dark:text-white leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[13px] text-surface-500 mt-2">
                    {stat.label}
                  </p>
                </div>
                {stat.trend}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick capture */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.15 }}
          className="mt-6 bg-white dark:bg-surface-800 rounded-3xl p-4 px-5 border border-surface-200/80 dark:border-surface-700/40 flex items-center gap-4"
        >
          <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-700 flex items-center justify-center flex-shrink-0">
            <Plus size={16} className="text-surface-500" />
          </div>
          <input
            type="text"
            placeholder="Quick capture: What's on your mind?"
            className="flex-1 bg-transparent text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none text-[14px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.target as HTMLInputElement).value) {
                const val = (e.target as HTMLInputElement).value;
                useStore.getState().createNote(val, "");
                (e.target as HTMLInputElement).value = "";
                import("react-hot-toast").then(({ default: toast }) =>
                  toast.success("Note captured!"),
                );
              }
            }}
          />
          <button
            onClick={() => navigate("/notes")}
            className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[13px] font-medium rounded-xl transition-colors"
          >
            Capture
          </button>
        </motion.div>

        {/* Tour banner */}
        {!tourDone && (
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-gradient-to-r from-primary-500 via-violet-500 to-green-400 rounded-3xl p-7 text-white"
          >
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <PlayCircle size={16} />
                  <span className="text-[11px] font-semibold uppercase tracking-wider opacity-80">
                    Interactive Demo
                  </span>
                </div>
                <h3 className="text-[20px] font-bold leading-snug">
                  Experience Neuron Note&apos;s Full Workflow
                </h3>
                <p className="text-[13px] text-white/70 mt-1.5">
                  Take a guided tour: Create a note → Link ideas → Visualize
                  connections → Get AI insights
                </p>
              </div>
              <button
                onClick={startTour}
                className="px-6 py-2.5 bg-white text-primary-600 rounded-xl font-semibold text-[13px] hover:bg-white/90 transition-colors flex-shrink-0"
              >
                Start Tour
              </button>
            </div>
          </motion.div>
        )}

        {/* Recent Notes */}
        <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-semibold text-surface-900 dark:text-white">
              Recent Notes
            </h2>
            <button
              onClick={() => navigate("/notes")}
              className="text-[13px] text-primary-500 hover:text-primary-600 font-medium"
            >
              View all
            </button>
          </div>
          {recentNotes.length === 0 ? (
            <div className="bg-white dark:bg-surface-800 rounded-3xl p-10 border border-surface-200/80 dark:border-surface-700/40 text-center">
              <FileText
                size={36}
                className="mx-auto text-surface-300 dark:text-surface-600 mb-3"
              />
              <p className="text-surface-500 text-[14px]">
                No notes yet. Start capturing your ideas!
              </p>
              <button
                onClick={() => navigate("/notes")}
                className="mt-3 text-[13px] text-primary-500 hover:text-primary-600 font-medium"
              >
                Create your first note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {recentNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  onClick={() => navigate(`/notes/${note.id}`)}
                  className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200/80 dark:border-surface-700/40 hover:shadow-lg hover:shadow-surface-200/50 dark:hover:shadow-surface-900/50 hover:border-primary-200 dark:hover:border-primary-700 transition-all cursor-pointer"
                >
                  <h3 className="font-semibold text-surface-900 dark:text-white text-[14px]">
                    {note.title}
                  </h3>
                  <p className="text-[12px] text-surface-500 mt-2 line-clamp-2 leading-relaxed">
                    {note.content?.replace(/<[^>]*>/g, "").substring(0, 120) ||
                      "Empty note"}
                  </p>
                  <div className="flex items-center gap-2 mt-4 flex-wrap">
                    {note.tags?.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded-full text-[11px] bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[11px] text-surface-400 ml-auto">
                      {format(new Date(note.updated_at), "MMM d")}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Today's Tasks */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[17px] font-semibold text-surface-900 dark:text-white">
              Today&apos;s Tasks
            </h2>
            <button
              onClick={() => navigate("/tasks")}
              className="text-[13px] text-primary-500 hover:text-primary-600 font-medium"
            >
              View all
            </button>
          </div>
          <div className="bg-white dark:bg-surface-800 rounded-3xl border border-surface-200/80 dark:border-surface-700/40 overflow-hidden">
            {todayTasks.length === 0 ? (
              <div className="p-10 text-center">
                <CheckSquare
                  size={36}
                  className="mx-auto text-surface-300 dark:text-surface-600 mb-3"
                />
                <p className="text-surface-500 text-[14px]">
                  All caught up! No pending tasks.
                </p>
                <button
                  onClick={() => navigate("/tasks")}
                  className="mt-3 text-[13px] text-primary-500 hover:text-primary-600 font-medium"
                >
                  Create a task
                </button>
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-100 dark:border-surface-700/30 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() =>
                      useStore
                        .getState()
                        .updateTask(task.id, { completed: !task.completed })
                    }
                    className="w-4 h-4 rounded-md border-2 border-surface-300 dark:border-surface-600 accent-green-400"
                  />
                  <span
                    className={`text-[14px] flex-1 ${
                      task.completed
                        ? "line-through text-surface-400"
                        : "text-surface-900 dark:text-white"
                    }`}
                  >
                    {task.title}
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md font-medium ${
                      task.priority === "high"
                        ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                        : task.priority === "medium"
                          ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600"
                          : "bg-green-50 dark:bg-green-900/20 text-green-500"
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
