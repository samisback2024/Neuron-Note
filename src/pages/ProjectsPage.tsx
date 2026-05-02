import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus,
  Calendar,
  X,
  Trash2,
  ChevronRight,
  Target,
  CheckCircle2,
  Circle,
  FolderKanban,
} from "lucide-react";
import { useStore } from "../lib/store";
import { format } from "date-fns";
import { PageShell } from "../components/ui/PageShell";
import { EmptyState } from "../components/ui/EmptyState";
import toast from "react-hot-toast";

const PROJECT_COLORS = [
  "#4F7DF3",
  "#8B7CF6",
  "#3DDC97",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
  "#06B6D4",
];

export function ProjectsPage() {
  const {
    projects,
    projectsLoading,
    tasks,
    createProject,
    updateProject,
    deleteProject,
    createTask,
    updateTask,
    deleteTask,
  } = useStore();

  // New project form
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [dueDate, setDueDate] = useState("");

  // Detail panel
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editColor, setEditColor] = useState(PROJECT_COLORS[0]);
  const [editDue, setEditDue] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const selectedProject = projects.find((p) => p.id === selectedId) ?? null;
  const projectTasks = selectedProject
    ? tasks.filter((t) => t.project_id === selectedProject.id)
    : [];

  // Open panel
  const openProject = (id: string) => {
    const p = projects.find((proj) => proj.id === id);
    if (!p) return;
    setSelectedId(id);
    setEditTitle(p.title);
    setEditDesc(p.description ?? "");
    setEditColor(p.color);
    setEditDue(p.due_date ?? "");
    setConfirmDelete(false);
    setNewTaskTitle("");
  };

  // Close panel
  const closePanel = () => {
    setSelectedId(null);
    setConfirmDelete(false);
  };

  // Auto-save title/description on blur
  const saveField = async (field: "title" | "description" | "color" | "due_date") => {
    if (!selectedId) return;
    const updates: Record<string, string> = {
      title: editTitle,
      description: editDesc,
      color: editColor,
      due_date: editDue,
    };
    await updateProject(selectedId, { [field]: updates[field] });
  };

  // Sync editColor whenever it changes (immediate)
  useEffect(() => {
    if (!selectedId) return;
    updateProject(selectedId, { color: editColor });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editColor]);

  // Sync editDue whenever it changes
  useEffect(() => {
    if (!selectedId) return;
    updateProject(selectedId, { due_date: editDue || null });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDue]);

  const handleCreateProject = async () => {
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

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !selectedId) return;
    await createTask({
      title: newTaskTitle,
      completed: false,
      priority: "medium",
      due_date: null,
      project_id: selectedId,
      project_name: selectedProject?.title ?? null,
    });
    setNewTaskTitle("");
  };

  const handleDeleteProject = async () => {
    if (!selectedId) return;
    await deleteProject(selectedId);
    closePanel();
    toast.success("Project deleted");
  };

  if (projectsLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="skeleton h-8 w-32 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-48 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <PageShell
        title="Projects"
        description={`${projects.length} active project${projects.length !== 1 ? "s" : ""}`}
        action={
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors btn-press"
          >
            <Plus size={15} />
            New Project
          </button>
        }
      >
        {projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No projects yet"
            description="Organise your work into projects and track progress across tasks."
            action={
              <button
                onClick={() => setShowNew(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-xl transition-colors btn-press"
              >
                <Plus size={14} />
                Create your first project
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => {
              const pts = tasks.filter((t) => t.project_id === project.id);
              const done = pts.filter((t) => t.completed).length;
              const total = pts.length;
              const progress = total > 0 ? Math.round((done / total) * 100) : 0;

              return (
                <motion.button
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openProject(project.id)}
                  className="group text-left rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md transition-all p-5"
                >
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: project.color }}
                    >
                      {project.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-surface-900 dark:text-zinc-50 text-sm truncate">
                        {project.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                        {project.description || "No description"}
                      </p>
                    </div>
                    <ChevronRight
                      size={14}
                      className="text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 transition-colors flex-shrink-0 mt-1"
                    />
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-zinc-500 dark:text-zinc-400">Progress</span>
                      <span className="font-semibold text-surface-900 dark:text-zinc-50">
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.04 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                    <span className="flex items-center gap-1">
                      <Target size={11} />
                      {done}/{total} tasks
                    </span>
                    {project.due_date && (
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {format(new Date(project.due_date), "MMM d")}
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}

            {/* Add project tile */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              onClick={() => setShowNew(true)}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 hover:border-primary-400 dark:hover:border-primary-600 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-all min-h-[190px] text-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Plus size={18} className="text-zinc-400" />
              </div>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">New Project</p>
            </motion.button>
          </div>
        )}
      </PageShell>

      {/* ── New Project Modal ── */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setShowNew(false)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ duration: 0.18, ease: [0.2, 0, 0, 1] }}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-surface-900 dark:text-zinc-50">
                  New Project
                </h3>
                <button
                  onClick={() => setShowNew(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                  placeholder="Project name"
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-surface-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition"
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description (optional)"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-surface-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition resize-none"
                />
                <div>
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Color</p>
                  <div className="flex gap-2">
                    {PROJECT_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-zinc-900 scale-110" : "hover:scale-105"}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-surface-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition"
                />
                <button
                  onClick={handleCreateProject}
                  disabled={!title.trim()}
                  className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors btn-press"
                >
                  Create Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Project Detail Panel ── */}
      <AnimatePresence>
        {selectedProject && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={closePanel}
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col"
            >
              {/* Panel header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: editColor }}
                >
                  {editTitle.charAt(0)?.toUpperCase() || "P"}
                </div>
                <input
                  ref={titleRef}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => saveField("title")}
                  className="flex-1 text-base font-semibold text-surface-900 dark:text-zinc-50 bg-transparent focus:outline-none border-b-2 border-transparent focus:border-primary-500/50 transition-colors"
                  placeholder="Project name"
                />
                <button
                  onClick={closePanel}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                {/* Description */}
                <div>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Description</p>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    onBlur={() => saveField("description")}
                    placeholder="Add a description…"
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-surface-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition resize-none"
                  />
                </div>

                {/* Color & Due date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_COLORS.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEditColor(c)}
                          className={`w-6 h-6 rounded-full transition-all ${editColor === c ? "ring-2 ring-offset-2 ring-primary-500 dark:ring-offset-zinc-900 scale-110" : "hover:scale-105"}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Due date</p>
                    <input
                      type="date"
                      value={editDue}
                      onChange={(e) => setEditDue(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-surface-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition"
                    />
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Progress</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${projectTasks.length > 0 ? Math.round((projectTasks.filter((t) => t.completed).length / projectTasks.length) * 100) : 0}%`,
                          backgroundColor: editColor,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-surface-900 dark:text-zinc-50 w-10 text-right">
                      {projectTasks.length > 0
                        ? Math.round((projectTasks.filter((t) => t.completed).length / projectTasks.length) * 100)
                        : 0}%
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    {projectTasks.filter((t) => t.completed).length} of {projectTasks.length} tasks completed
                  </p>
                </div>

                {/* Tasks */}
                <div>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Tasks</p>

                  {/* Add task input */}
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                      placeholder="Add a task… (Enter)"
                      className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-surface-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition"
                    />
                    <button
                      onClick={handleAddTask}
                      disabled={!newTaskTitle.trim()}
                      className="p-2 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  {/* Task list */}
                  <div className="space-y-1">
                    {projectTasks.length === 0 && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 py-3 text-center">
                        No tasks yet — add one above
                      </p>
                    )}
                    {projectTasks.map((task) => (
                      <div
                        key={task.id}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
                      >
                        <button
                          onClick={() => updateTask(task.id, { completed: !task.completed })}
                          className="flex-shrink-0 text-zinc-300 dark:text-zinc-600 hover:text-primary-500 transition-colors"
                        >
                          {task.completed ? (
                            <CheckCircle2 size={17} className="text-primary-500" />
                          ) : (
                            <Circle size={17} />
                          )}
                        </button>
                        <span
                          className={`flex-1 text-sm ${task.completed ? "line-through text-zinc-400 dark:text-zinc-500" : "text-surface-900 dark:text-zinc-50"}`}
                        >
                          {task.title}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span
                            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                              task.priority === "high"
                                ? "bg-red-50 dark:bg-red-900/20 text-red-500"
                                : task.priority === "medium"
                                  ? "bg-amber-50 dark:bg-amber-900/20 text-amber-500"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {task.priority}
                          </span>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-300 dark:text-zinc-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel footer — danger zone */}
              <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-800 flex-shrink-0">
                {confirmDelete ? (
                  <div className="flex items-center gap-3">
                    <p className="text-xs text-red-500 flex-1">Delete this project?</p>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteProject}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete project
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}


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
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-[12.5px] font-medium rounded-lg btn-press shadow-sm"
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
                className="group bg-white dark:bg-surface-800/80 rounded-2xl p-5 border border-surface-200/60 dark:border-surface-700/30 shadow-sm card-hover"
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
