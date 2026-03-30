import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Calendar, Users, X } from "lucide-react";
import { useStore } from "../lib/store";
import { format } from "date-fns";
import toast from "react-hot-toast";

const PROJECT_COLORS = [
  "#4F7DF3",
  "#8B7CF6",
  "#3DDC97",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];

export function ProjectsPage() {
  const { projects, projectsLoading, tasks, createProject } = useStore();
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [dueDate, setDueDate] = useState("");

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createProject({
      title,
      description,
      color,
      due_date: dueDate || null,
      members: 1,
    });
    setTitle("");
    setDescription("");
    setColor(PROJECT_COLORS[0]);
    setDueDate("");
    setShowNew(false);
    toast.success("Project created");
  };

  if (projectsLoading) {
    return (
      <div className="px-6 md:px-10 py-7 md:py-9">
        <div className="mx-auto max-w-[1080px]">
          <div className="skeleton h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-52 rounded-3xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 md:px-10 py-7 md:py-9">
      <div className="mx-auto max-w-[1080px]">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-[20px] font-semibold text-surface-900 dark:text-white/95">
            Projects
          </h1>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[12.5px] font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus size={16} />
            New Project
          </button>
        </div>
        <p className="text-[12.5px] text-surface-500 dark:text-surface-400 mb-6">
          {projects.length} active projects
        </p>

        {/* New Project Modal */}
        <AnimatePresence>
          {showNew && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
              onClick={(e) => e.target === e.currentTarget && setShowNew(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-surface-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                    New Project
                  </h3>
                  <button
                    onClick={() => setShowNew(false)}
                    className="text-surface-400 hover:text-surface-600"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Project name"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                  />
                  <div>
                    <label className="text-xs font-medium text-surface-500 mb-2 block">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {PROJECT_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className={`w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-surface-800" : ""}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  />
                  <button
                    onClick={handleCreate}
                    className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
                  >
                    Create Project
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project, i) => {
            const projectTasks = tasks.filter(
              (t) => t.project_id === project.id,
            );
            const done = projectTasks.filter((t) => t.completed).length;
            const total = projectTasks.length;
            const progress = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group bg-white dark:bg-surface-800/80 rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/30 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.title.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-surface-900 dark:text-white text-sm truncate">
                      {project.title}
                    </h3>
                    <p className="text-xs text-surface-500 line-clamp-2 mt-0.5">
                      {project.description || "No description"}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-surface-500">Progress</span>
                    <span className="font-medium text-surface-700 dark:text-surface-300">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs text-surface-500 mb-4">
                  <span>Tasks</span>
                  <span>
                    {done}/{total}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-surface-400 pt-3 border-t border-surface-100 dark:border-surface-700/50">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {project.members}
                  </span>
                  {project.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {format(new Date(project.due_date), "MMM d")}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}

          {/* Create Project Card */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setShowNew(true)}
            className="flex flex-col items-center justify-center bg-surface-50 dark:bg-surface-800/50 rounded-2xl p-8 border-2 border-dashed border-surface-300 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center mb-3">
              <Plus size={24} className="text-surface-400" />
            </div>
            <p className="font-medium text-surface-600 dark:text-surface-400 text-sm">
              Create Project
            </p>
            <p className="text-xs text-surface-400 mt-1">Start a new project</p>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
