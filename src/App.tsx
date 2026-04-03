import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useStore } from "./lib/store";
import { useSettingsStore } from "./lib/settingsStore";
import { supabase } from "./lib/supabase";
import { AppLayout } from "./components/Layout/AppLayout";
import { AuthPage } from "./pages/AuthPage";
import { Dashboard } from "./pages/Dashboard";
import { NotesPage } from "./pages/NotesPage";
import { NoteEditor } from "./pages/NoteEditor";
import { TasksPage } from "./pages/TasksPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { KnowledgeGraph } from "./pages/KnowledgeGraph";
import { BookmarksPage } from "./pages/BookmarksPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { TrashPage } from "./pages/TrashPage";
import { OnboardingTour } from "./components/OnboardingTour";
import { QuickCapture } from "./components/QuickCapture";
import { SearchOverlay } from "./components/SearchOverlay";
import { SyncStatus } from "./components/SyncStatus";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, authLoading } = useStore();
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-100 dark:bg-surface-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-surface-500 text-sm">Loading Neuron...</p>
        </div>
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

export default function App() {
  const {
    setSession,
    loadNotes,
    loadTasks,
    loadProjects,
    loadBookmarks,
    loadNoteLinks,
    loadTags,
    loadProfile,
    session,
  } = useStore();

  // Hydrate settings (theme, accent, density, etc.) on boot
  useEffect(() => {
    useSettingsStore.getState().hydrate();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [setSession]);

  useEffect(() => {
    if (session) {
      loadProfile();
      loadNotes();
      loadTasks();
      loadProjects();
      loadBookmarks();
      loadNoteLinks();
      loadTags();
    }
  }, [
    session,
    loadProfile,
    loadNotes,
    loadTasks,
    loadProjects,
    loadBookmarks,
    loadNoteLinks,
    loadTags,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "D") {
        useStore.getState().startTour();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          className:
            "!bg-white dark:!bg-surface-800 !text-surface-900 dark:!text-surface-100 !shadow-lg !rounded-xl !text-sm !border !border-surface-200/60 dark:!border-surface-700/30",
          duration: 3000,
          style: {
            padding: "12px 16px",
          },
          success: {
            iconTheme: {
              primary: "#4f7df3",
              secondary: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
          },
        }}
      />
      <OnboardingTour />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/notes" element={<NotesPage />} />
                  <Route path="/notes/:id" element={<NoteEditor />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/knowledge-graph" element={<KnowledgeGraph />} />
                  <Route path="/bookmarks" element={<BookmarksPage />} />
                  <Route path="/trash" element={<TrashPage />} />
                  <Route path="/settings/*" element={<SettingsPage />} />
                </Routes>
              </AppLayout>
              <QuickCapture />
              <SearchOverlay />
              <SyncStatus />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
