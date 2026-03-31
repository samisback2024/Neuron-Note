# Neuron Note

A full-stack productivity workspace for notes, tasks, projects, and knowledge management.

🔗 **Live:** [neuron-note.vercel.app](https://neuron-note.vercel.app)

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

## Features

### Core

- **Dashboard** — Pinned notes, today's tasks, quick capture with prefix shortcuts, recent activity
- **Notes** — Rich text editor (TipTap) with formatting toolbar, auto-save, word count, and reading time
- **Tasks** — Priorities (high/medium/low), due dates, project assignment, and filters
- **Projects** — Color-coded projects with progress tracking
- **Knowledge Graph** — Interactive force-directed visualization of note connections
- **Bookmarks** — Web bookmarks with tags and collections
- **Trash** — Soft-delete with 30-day auto-cleanup and restore

### Productivity

- **Pinned Notes** — Pin important notes to the top of Dashboard and Notes page; toggle from editor toolbar
- **Smart Search** — `Ctrl+/` opens a Spotlight-style overlay with live results and keyboard navigation
- **Quick Capture** — `Ctrl+K` for instant creation; prefix with `#task` to create a task or `#note` for a note
- **Offline Detection** — Status banner when disconnected; changes sync on reconnect
- **Auto-save** — 500ms debounce saves with visual indicator

### Platform

- **Authentication** — Email/password via Supabase Auth
- **Real-time Sync** — Live data sync across tabs using Supabase Realtime
- **Collaboration** — Share notes with other users
- **Dark Mode** — System-aware theme toggle
- **Onboarding Tour** — Interactive walkthrough (`Shift+D`)
- **Responsive** — 3-panel desktop layout with collapsible sidebar + mobile navigation

## Tech Stack

| Layer      | Technology                                           |
| ---------- | ---------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite 8                         |
| Styling    | Tailwind CSS v4 with custom design tokens            |
| State      | Zustand                                              |
| Editor     | TipTap (StarterKit, Highlight, TaskList, Typography) |
| Animations | Motion (framer-motion)                               |
| Backend    | Supabase (Auth, PostgreSQL, RLS, Realtime)           |
| Icons      | Lucide React                                         |
| Routing    | React Router DOM v7                                  |
| Hosting    | Vercel                                               |

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

### Setup

```bash
git clone https://github.com/samisback2024/Neuron-Note.git
cd Neuron-Note
npm install
```

Create a `.env` file:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Run the database schema in **Supabase SQL Editor** → `supabase/schema.sql`

```bash
npm run dev
```

## Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── AppLayout.tsx        # 3-panel layout wrapper
│   │   └── Sidebar.tsx          # Collapsible sidebar + mobile nav
│   ├── OnboardingTour.tsx       # Guided tour
│   ├── QuickCapture.tsx         # Ctrl+K capture modal
│   ├── SearchOverlay.tsx        # Ctrl+/ smart search
│   ├── ShareModal.tsx           # Note sharing
│   └── SyncStatus.tsx           # Offline status banner
├── lib/
│   ├── config.ts                # Environment config
│   ├── store.ts                 # Zustand global state + CRUD
│   └── supabase.ts              # Supabase client
├── pages/
│   ├── AuthPage.tsx             # Sign in / Sign up
│   ├── Dashboard.tsx            # Home dashboard
│   ├── NotesPage.tsx            # Notes grid with pinned section
│   ├── NoteEditor.tsx           # TipTap editor with pin toggle
│   ├── TasksPage.tsx            # Task manager
│   ├── ProjectsPage.tsx         # Project cards
│   ├── KnowledgeGraph.tsx       # Force-directed graph
│   ├── BookmarksPage.tsx        # Bookmark manager
│   ├── TrashPage.tsx            # Trash with restore
│   └── SettingsPage.tsx         # App settings
├── App.tsx                      # Routes + auth listener
├── main.tsx                     # Entry point
└── index.css                    # Tailwind + custom theme
```

## Database

PostgreSQL via Supabase with Row Level Security:

`profiles` · `notes` · `tasks` · `projects` · `bookmarks` · `note_links` · `tags` · `note_tags`

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # TypeScript check + production build
npm run preview   # Preview production build
```

## License

MIT
