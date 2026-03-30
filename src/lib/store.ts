import { create } from "zustand";
import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

/* ---- Types ---- */
export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  workspace: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  due_date: string | null;
  project_id: string | null;
  project_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  color: string;
  due_date: string | null;
  members: number;
  created_at: string;
  updated_at: string;
  tasks_total?: number;
  tasks_done?: number;
}

export interface Bookmark {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string;
  image: string | null;
  tags: string[];
  collection: string | null;
  created_at: string;
}

export interface NoteLink {
  id: string;
  source_id: string;
  target_id: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

/* ---- Store ---- */
interface AppState {
  // Auth
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  authLoading: boolean;
  setSession: (s: Session | null) => void;
  setProfile: (p: Profile | null) => void;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;

  // Theme
  theme: "light" | "dark";
  toggleTheme: () => void;

  // Sidebar
  sidebarOpen: boolean;
  contextOpen: boolean;
  toggleSidebar: () => void;
  toggleContext: () => void;

  // Notes
  notes: Note[];
  notesLoading: boolean;
  loadNotes: () => Promise<void>;
  createNote: (title: string, content: string) => Promise<Note | null>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;

  // Tasks
  tasks: Task[];
  tasksLoading: boolean;
  loadTasks: () => Promise<void>;
  createTask: (
    task: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">,
  ) => Promise<Task | null>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Projects
  projects: Project[];
  projectsLoading: boolean;
  loadProjects: () => Promise<void>;
  createProject: (
    project: Omit<
      Project,
      | "id"
      | "user_id"
      | "created_at"
      | "updated_at"
      | "tasks_total"
      | "tasks_done"
    >,
  ) => Promise<Project | null>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;

  // Bookmarks
  bookmarks: Bookmark[];
  bookmarksLoading: boolean;
  loadBookmarks: () => Promise<void>;
  createBookmark: (
    bookmark: Omit<Bookmark, "id" | "user_id" | "created_at">,
  ) => Promise<Bookmark | null>;
  deleteBookmark: (id: string) => Promise<void>;

  // Note Links (Knowledge Graph)
  noteLinks: NoteLink[];
  loadNoteLinks: () => Promise<void>;
  createNoteLink: (sourceId: string, targetId: string) => Promise<void>;

  // Tags
  tags: Tag[];
  loadTags: () => Promise<void>;

  // Chat
  chatMessages: ChatMessage[];
  chatLoading: boolean;
  loadChatMessages: () => Promise<void>;
  sendChatMessage: (content: string) => Promise<void>;

  // Onboarding
  tourActive: boolean;
  tourStep: number;
  startTour: () => void;
  nextTourStep: () => void;
  endTour: () => void;

  // Settings
  notifications: {
    email: boolean;
    desktop: boolean;
    dailySummary: boolean;
  };
  updateNotifications: (n: Partial<AppState["notifications"]>) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Auth
  session: null,
  user: null,
  profile: null,
  authLoading: true,
  setSession: (session) =>
    set({ session, user: session?.user ?? null, authLoading: false }),
  setProfile: (profile) => set({ profile }),

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message ?? null };
  },

  signUp: async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (!error && data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        email,
        workspace: "Personal",
      });
    }
    return { error: error?.message ?? null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null, profile: null });
  },

  loadProfile: async () => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) set({ profile: data as Profile });
  },

  updateProfile: async (updates) => {
    const user = get().user;
    if (!user) return;
    await supabase.from("profiles").update(updates).eq("id", user.id);
    set({ profile: { ...get().profile!, ...updates } });
  },

  // Theme
  theme:
    (typeof window !== "undefined" &&
      (localStorage.getItem("neuron-theme") as "light" | "dark")) ||
    "light",
  toggleTheme: () => {
    const next = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("neuron-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    set({ theme: next });
  },

  // Sidebar
  sidebarOpen: true,
  contextOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleContext: () => set((s) => ({ contextOpen: !s.contextOpen })),

  // Notes
  notes: [],
  notesLoading: false,
  loadNotes: async () => {
    const user = get().user;
    if (!user) return;
    set({ notesLoading: true });
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    set({ notes: (data as Note[]) ?? [], notesLoading: false });
  },

  createNote: async (title, content) => {
    const user = get().user;
    if (!user) return null;
    const { data, error } = await supabase
      .from("notes")
      .insert({ user_id: user.id, title, content })
      .select()
      .single();
    if (error) return null;
    const note = data as Note;
    set((s) => ({ notes: [note, ...s.notes] }));
    return note;
  },

  updateNote: async (id, updates) => {
    await supabase
      .from("notes")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
    set((s) => ({
      notes: s.notes.map((n) =>
        n.id === id
          ? { ...n, ...updates, updated_at: new Date().toISOString() }
          : n,
      ),
    }));
  },

  deleteNote: async (id) => {
    await supabase.from("notes").delete().eq("id", id);
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  // Tasks
  tasks: [],
  tasksLoading: false,
  loadTasks: async () => {
    const user = get().user;
    if (!user) return;
    set({ tasksLoading: true });
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    set({ tasks: (data as Task[]) ?? [], tasksLoading: false });
  },

  createTask: async (task) => {
    const user = get().user;
    if (!user) return null;
    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...task, user_id: user.id })
      .select()
      .single();
    if (error) return null;
    const t = data as Task;
    set((s) => ({ tasks: [t, ...s.tasks] }));
    return t;
  },

  updateTask: async (id, updates) => {
    await supabase.from("tasks").update(updates).eq("id", id);
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  },

  deleteTask: async (id) => {
    await supabase.from("tasks").delete().eq("id", id);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  // Projects
  projects: [],
  projectsLoading: false,
  loadProjects: async () => {
    const user = get().user;
    if (!user) return;
    set({ projectsLoading: true });
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) {
      const projects = data as Project[];
      const tasks = get().tasks;
      const enriched = projects.map((p) => {
        const projectTasks = tasks.filter((t) => t.project_id === p.id);
        return {
          ...p,
          tasks_total: projectTasks.length,
          tasks_done: projectTasks.filter((t) => t.completed).length,
        };
      });
      set({ projects: enriched, projectsLoading: false });
    } else {
      set({ projectsLoading: false });
    }
  },

  createProject: async (project) => {
    const user = get().user;
    if (!user) return null;
    const { data, error } = await supabase
      .from("projects")
      .insert({ ...project, user_id: user.id })
      .select()
      .single();
    if (error) return null;
    const p = { ...(data as Project), tasks_total: 0, tasks_done: 0 };
    set((s) => ({ projects: [p, ...s.projects] }));
    return p;
  },

  updateProject: async (id, updates) => {
    await supabase.from("projects").update(updates).eq("id", id);
    set((s) => ({
      projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  deleteProject: async (id) => {
    await supabase.from("projects").delete().eq("id", id);
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
  },

  // Bookmarks
  bookmarks: [],
  bookmarksLoading: false,
  loadBookmarks: async () => {
    const user = get().user;
    if (!user) return;
    set({ bookmarksLoading: true });
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    set({ bookmarks: (data as Bookmark[]) ?? [], bookmarksLoading: false });
  },

  createBookmark: async (bookmark) => {
    const user = get().user;
    if (!user) return null;
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({ ...bookmark, user_id: user.id })
      .select()
      .single();
    if (error) return null;
    const b = data as Bookmark;
    set((s) => ({ bookmarks: [b, ...s.bookmarks] }));
    return b;
  },

  deleteBookmark: async (id) => {
    await supabase.from("bookmarks").delete().eq("id", id);
    set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) }));
  },

  // Note Links
  noteLinks: [],
  loadNoteLinks: async () => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase
      .from("note_links")
      .select("*")
      .eq("user_id", user.id);
    set({ noteLinks: (data as NoteLink[]) ?? [] });
  },

  createNoteLink: async (sourceId, targetId) => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase
      .from("note_links")
      .insert({ source_id: sourceId, target_id: targetId, user_id: user.id })
      .select()
      .single();
    if (data) {
      set((s) => ({ noteLinks: [...s.noteLinks, data as NoteLink] }));
    }
  },

  // Tags
  tags: [],
  loadTags: async () => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id);
    set({ tags: (data as Tag[]) ?? [] });
  },

  // Chat
  chatMessages: [],
  chatLoading: false,
  loadChatMessages: async () => {
    const user = get().user;
    if (!user) return;
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    set({ chatMessages: (data as ChatMessage[]) ?? [] });
  },

  sendChatMessage: async (content) => {
    const user = get().user;
    if (!user) return;
    set({ chatLoading: true });

    // Save user message
    const { data: userMsg } = await supabase
      .from("chat_messages")
      .insert({ user_id: user.id, role: "user" as const, content })
      .select()
      .single();

    if (userMsg) {
      set((s) => ({
        chatMessages: [...s.chatMessages, userMsg as ChatMessage],
      }));
    }

    // Call edge function for AI response
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message: content, userId: user.id },
      });

      const reply = error
        ? "I'm sorry, I couldn't process your request. Please check your Supabase Edge Function configuration."
        : (data?.reply ?? "I'm thinking...");

      const { data: assistantMsg } = await supabase
        .from("chat_messages")
        .insert({
          user_id: user.id,
          role: "assistant" as const,
          content: reply,
        })
        .select()
        .single();

      if (assistantMsg) {
        set((s) => ({
          chatMessages: [...s.chatMessages, assistantMsg as ChatMessage],
        }));
      }
    } catch {
      const fallback: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I'm having trouble connecting right now. Please ensure your Supabase Edge Function for AI chat is configured.",
        created_at: new Date().toISOString(),
      };
      set((s) => ({ chatMessages: [...s.chatMessages, fallback] }));
    }

    set({ chatLoading: false });
  },

  // Onboarding
  tourActive: false,
  tourStep: 0,
  startTour: () => set({ tourActive: true, tourStep: 0 }),
  nextTourStep: () =>
    set((s) => {
      if (s.tourStep >= 8) return { tourActive: false, tourStep: 0 };
      return { tourStep: s.tourStep + 1 };
    }),
  endTour: () => {
    localStorage.setItem("neuron-tour-done", "true");
    set({ tourActive: false, tourStep: 0 });
  },

  // Settings
  notifications: {
    email: true,
    desktop: false,
    dailySummary: true,
  },
  updateNotifications: (n) =>
    set((s) => ({ notifications: { ...s.notifications, ...n } })),
}));
