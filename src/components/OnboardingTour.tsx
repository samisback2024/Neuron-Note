import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight } from "lucide-react";
import { useStore } from "../lib/store";

const TOUR_STEPS = [
  {
    title: "Welcome to the Interactive Demo",
    description:
      "Let's walk through Neuron's core features: creating notes, linking them, visualizing connections, and getting AI insights.",
  },
  {
    title: "Create Notes",
    description:
      "Capture your thoughts with our rich text editor. Format with markdown, add code blocks, and organize with tags.",
  },
  {
    title: "Link Ideas Together",
    description:
      "Use [[note-title]] to create bi-directional links between notes. Build a web of connected knowledge.",
  },
  {
    title: "Manage Tasks",
    description:
      "Track your tasks with priorities, due dates, and project associations. Stay organized and productive.",
  },
  {
    title: "Organize Projects",
    description:
      "Group related tasks and notes into projects. Track progress and collaborate with your team.",
  },
  {
    title: "Knowledge Graph",
    description:
      "Visualize how your notes connect. Discover patterns and explore your knowledge visually.",
  },
  {
    title: "Save Bookmarks",
    description:
      "Save links with tags and collections. Build a curated library of resources.",
  },
  {
    title: "AI Assistant",
    description:
      "Ask questions about your notes, get summaries, find connections, and generate ideas with AI.",
  },
  {
    title: "Quick Capture",
    description:
      "Press Cmd/Ctrl + K anywhere to quickly capture a note, task, or bookmark. Never lose an idea.",
  },
];

export function OnboardingTour() {
  const { tourActive, tourStep, nextTourStep, endTour } = useStore();

  return (
    <AnimatePresence>
      {tourActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div
            key={tourStep}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white dark:bg-surface-800 rounded-2xl p-7 w-full max-w-md shadow-2xl"
          >
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-5">
              {TOUR_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === tourStep
                      ? "w-6 bg-primary-500"
                      : i < tourStep
                        ? "w-3 bg-primary-300"
                        : "w-3 bg-surface-200 dark:bg-surface-700"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-surface-900 dark:text-white pr-8">
                {TOUR_STEPS[tourStep].title}
              </h3>
              <button
                onClick={endTour}
                className="p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 transition-colors flex-shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-6">
              {TOUR_STEPS[tourStep].description}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-400">
                Step {tourStep + 1} of {TOUR_STEPS.length}
              </span>
              <button
                onClick={nextTourStep}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                {tourStep === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
