# Neuron Note

**Your intelligent productivity workspace** — a full-stack note-taking and knowledge management app with AI-powered insights, task management, project tracking, and a visual knowledge graph.

🔗 **Live:** [neuron-note.vercel.app](https://neuron-note.vercel.app)

![Neuron Note](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

## Features

- **Dashboard** — Personalized greeting, stats overview, quick capture, recent notes, and today's tasks
- **Notes** — Rich text editor (TipTap) with formatting toolbar, auto-save, word count, and reading time
- **Tasks** — Create and manage tasks with priorities (high/medium/low), due dates, project assignment, and filters
- **Projects** — Organize work into color-coded projects with progress tracking
- **Knowledge Graph** — Interactive force-directed canvas visualization of note connections with zoom/pan
- **Bookmarks** — Save and organize web bookmarks with tags and collections
- **AI Assistant** — Chat interface powered by OpenAI (via Supabase Edge Functions)
- **Settings** — Theme toggle (light/dark), profile editing, notification preferences
- **Quick Capture** — Global floating action button + `Cmd+K` shortcut for instant note/task/bookmark creation
- **Onboarding Tour** — 9-step interactive walkthrough (`Shift+D`)
- **Authentication** — Email/password sign-up and sign-in via Supabase Auth
- **Real-time** — Live data sync across tabs using Supabase Realtime
- **Responsive** — Desktop 3-panel layout with collapsible sidebar + mobile bottom navigation

## Tech Stack

| Layer      | Technology                                           |
| ---------- | ---------------------------------------------------- |
| Frontend   | React 18, TypeScript, Vite 8                         |
| Styling    | Tailwind CSS v4 with custom design system            |
| State      | Zustand                                              |
| Editor     | TipTap (StarterKit, Highlight, TaskList, Typography) |
| Animations | Motion (framer-motion successor)                     |
| Backend    | Supabase (Auth, PostgreSQL, RLS, Realtime)           |
| AI         | Supabase Edge Functions + OpenAI GPT-4o-mini         |
| Icons      | Lucide React                                         |
| Routing    | React Router DOM v6                                  |
| Hosting    | Vercel                                               |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone & Install

```bash
git clone https://github.com/samisback2024/Neuron-Note.git
cd Neuron-Note
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your **Project URL** and **anon key** from **Settings → API**

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

### 5. (Optional) Deploy AI Chat Edge Function

```bash
supabase functions deploy ai-chat
supabase secrets set OPENAI_API_KEY=your-openai-key
```

## Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── AppLayout.tsx        # 3-panel layout wrapper
│   │   ├── Sidebar.tsx          # Collapsible sidebar + mobile nav
│   │   └── ContextPanel.tsx     # Right panel (AI summary, backlinks, tags)
│   ├── OnboardingTour.tsx       # 9-step guided tour
│   └── QuickCapture.tsx         # FAB + Cmd+K modal
├── lib/
│   ├── config.ts                # Environment config
│   ├── store.ts                 # Zustand global state + CRUD
│   └── supabase.ts              # Supabase client + DB types
├── pages/
│   ├── AuthPage.tsx             # Sign in / Sign up
│   ├── Dashboard.tsx            # Home dashboard
│   ├── NotesPage.tsx            # Notes grid
│   ├── NoteEditor.tsx           # TipTap rich text editor
│   ├── TasksPage.tsx            # Task manager
│   ├── ProjectsPage.tsx         # Project cards
│   ├── KnowledgeGraph.tsx       # Canvas force-directed graph
│   ├── BookmarksPage.tsx        # Bookmark manager
│   ├── AIAssistant.tsx          # Chat interface
│   └── SettingsPage.tsx         # App settings
├── App.tsx                      # Routes + auth listener
├── main.tsx                     # Entry point
└── index.css                    # Tailwind + custom theme
supabase/
├── schema.sql                   # Full database schema with RLS
└── functions/ai-chat/index.ts   # Deno edge function for AI
```

## Database Schema

9 tables with Row Level Security:

- `profiles` — User profiles (auto-created on signup)
- `notes` — Rich text notes
- `tasks` — Tasks with priority, due date, project assignment
- `projects` — Projects with color and progress
- `bookmarks` — Web bookmarks with tags and collections
- `note_links` — Connections between notes (for knowledge graph)
- `tags` — User-defined tags
- `note_tags` — Many-to-many note-tag associations
- `chat_messages` — AI chat history

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # TypeScript check + production build
npm run preview   # Preview production build locally
```

## License

MIT
