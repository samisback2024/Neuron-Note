import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Filter,
  CheckCircle2,
  Circle,
  Flag,
  Calendar,
  Trash2,
  X,
} from "lucide-react";
import { useStore } from "../lib/store";
import { format } from "date-fns";
import toast from "react-hot-toast";

type FilterType = "all" | "today" | "upcoming" | "completed";

export function TasksPage() {
  const { tasks, tasksLoading, projects, createTask, updateTask, deleteTask } =
    useStore();
  const [filter, setFilter] = useState<FilterType>("all");
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">(
    "medium",
  );
  const [newDueDate, setNewDueDate] = useState("");
  const [newProjectId, setNewProjectId] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const filteredTasks = tasks.filter((t) => {
    if (filter === "completed") return t.completed;
    if (filter === "today")
      return t.due_date?.startsWith(today) && !t.completed;
    if (filter === "upcoming")
      return t.due_date && t.due_date > today && !t.completed;
    return true;
  });

  const remaining = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const highPriority = tasks.filter(
    (t) => !t.completed && t.priority === "high",
  ).length;
  const dueToday = tasks.filter(
    (t) => !t.completed && t.due_date?.startsWith(today),
  ).length;

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    const project = projects.find((p) => p.id === newProjectId);
    await createTask({
      title: newTitle,
      completed: false,
      priority: newPriority,
      due_date: newDueDate || null,
      project_id: newProjectId || null,
      project_name: project?.title || null,
    });
    setNewTitle("");
    setNewPriority("medium");
    setNewDueDate("");
    setNewProjectId("");
    setShowNewTask(false);
    toast.success("Task created");
  };

  const priorityColor = (p: string) =>
    p === "high"
      ? "text-red-500 bg-red-50 dark:bg-red-900/20"
      : p === "medium"
        ? "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20"
        : "text-green-500 bg-green-50 dark:bg-green-900/20";

  if (tasksLoading) {
    return (
      <div className="px-6 md:px-10 py-7 md:py-9">
        <div className="mx-auto max-w-[1080px]">
          <div className="skeleton h-7 w-24 mb-6" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-14 rounded-xl mb-3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-7 md:py-9">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[20px] font-semibold text-surface-900 dark:text-white/95">
            Tasks
          </h1>
          <button
            onClick={() => setShowNewTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[12.5px] font-medium rounded-lg btn-press"
          >
            <Plus size={15} />
            New Task
          </button>
        </div>
        <p className="text-[12.5px] text-surface-500 dark:text-surface-400 mb-6">
          {remaining} tasks remaining
        </p>

        {/* Filters */}
        <div className="flex items-center gap-1.5 mb-6">
          <Filter size={14} className="text-surface-400 mr-1.5" />
          {(["all", "today", "upcoming", "completed"] as FilterType[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors capitalize ${
                  filter === f
                    ? "bg-primary-500 text-white shadow-sm"
                    : "bg-surface-100 dark:bg-surface-800/80 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700/60"
                }`}
              >
                {f}
              </button>
            ),
          )}
        </div>

        {/* New Task Form */}
        <AnimatePresence>
          {showNewTask && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-primary-200 dark:border-primary-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white">
                    New Task
                  </h3>
                  <button
                    onClick={() => setShowNewTask(false)}
                    className="text-surface-400 hover:text-surface-600"
                  >
                    <X size={16} />
                  </button>
                </div>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Task title..."
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Flag size={14} className="text-surface-400" />
                    <select
                      value={newPriority}
                      onChange={(e) =>
                        setNewPriority(
                          e.target.value as "high" | "medium" | "low",
                        )
                      }
                      className="text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white px-2 py-1.5 focus:outline-none"
                    >
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-surface-400" />
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white px-2 py-1.5 focus:outline-none"
                    />
                  </div>
                  {projects.length > 0 && (
                    <select
                      value={newProjectId}
                      onChange={(e) => setNewProjectId(e.target.value)}
                      className="text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white px-2 py-1.5 focus:outline-none"
                    >
                      <option value="">No project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Add Task
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Task List */}
        <div className="space-y-2">
          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-surface-800/80 rounded-2xl py-14 px-6 border border-surface-200/60 dark:border-surface-700/30 shadow-sm text-center">
              <div className="w-12 h-12 rounded-xl bg-surface-100 dark:bg-surface-700/50 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2
                  size={22}
                  className="text-surface-400 dark:text-surface-500"
                />
              </div>
              <h3 className="text-[14px] font-semibold text-surface-900 dark:text-white/90 mb-1">
                {filter === "completed"
                  ? "No completed tasks"
                  : "You're all caught up"}
              </h3>
              <p className="text-surface-500 dark:text-surface-400 text-[12.5px] max-w-xs mx-auto">
                {filter === "all"
                  ? "Create your first task to stay on track"
                  : "Try a different filter"}
              </p>
            </div>
          ) : (
            filteredTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group bg-white dark:bg-surface-800/80 rounded-xl p-4 border border-surface-200/60 dark:border-surface-700/30 shadow-sm card-hover flex items-center gap-4"
              >
                <button
                  onClick={() =>
                    updateTask(task.id, { completed: !task.completed })
                  }
                  className="flex-shrink-0"
                >
                  {task.completed ? (
                    <CheckCircle2 size={22} className="text-green-400" />
                  ) : (
                    <Circle
                      size={22}
                      className="text-surface-300 dark:text-surface-600 hover:text-primary-400 transition-colors"
                    />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      task.completed
                        ? "line-through text-surface-400"
                        : "text-surface-900 dark:text-white"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    {task.project_name && (
                      <span className="text-xs text-surface-500">
                        {task.project_name}
                      </span>
                    )}
                    {task.due_date && (
                      <span className="text-xs text-surface-400 flex items-center gap-1">
                        <Calendar size={10} />
                        {format(new Date(task.due_date), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1 ${priorityColor(task.priority)}`}
                >
                  <Flag size={10} />
                  {task.priority}
                </span>
                <button
                  onClick={() => {
                    deleteTask(task.id);
                    toast.success("Task deleted");
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-500 transition-all flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </motion.div>
            ))
          )}
        </div>

        {/* Stats */}
        {tasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-3 gap-4"
          >
            {[
              { label: "Completed", value: completedCount },
              { label: "Due Today", value: dueToday },
              { label: "High Priority", value: highPriority },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white dark:bg-surface-800/80 rounded-2xl p-4 border border-surface-200/60 dark:border-surface-700/30 shadow-sm text-center"
              >
                <p className="text-[20px] font-semibold text-surface-900 dark:text-white/95">
                  {stat.value}
                </p>
                <p className="text-[10.5px] text-surface-500 dark:text-surface-400 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
