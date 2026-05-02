# Neuron Note

A full-stack productivity workspace for notes, tasks, projects, bookmarks, and knowledge management — built with React 19, Supabase, and Tailwind CSS v4.

🔗 **Live:** [neuron-note.vercel.app](https://neuron-note.vercel.app)

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

---

## Features

### Core

- **Dashboard** — Pinned notes, today's tasks, quick capture with prefix shortcuts, recent activity
- **Notes** — Rich text editor (TipTap) with formatting toolbar, auto-save, word count, and reading time
- **Tasks** — Priorities (high/medium/low), due dates, project assignment, and filters
- **Projects** — Clickable color-coded cards with progress bars; slide-over detail panel with inline editing, per-project task management, and two-step delete confirmation
- **Knowledge Graph** — Interactive force-directed canvas visualization of note connections
- **Bookmarks** — Save links with tags, collections, list/grid view toggle
- **Trash** — Soft-delete for both notes and projects; 30-day countdown, one-click restore, permanent delete

### Productivity

- **Pinned Notes** — Pin important notes to the Dashboard and Notes page; toggle from the editor toolbar
- **Smart Search** — `Ctrl+/` opens a Spotlight-style overlay with live results and keyboard navigation
- **Quick Capture** — `Ctrl+K` for instant creation; prefix with `#task` to create a task or `#note` for a note
- **Offline Detection** — Status banner when disconnected; changes sync on reconnect
- **Auto-save** — 500 ms debounce with visual save indicator

### Platform

- **Authentication** — Email/password + Google One Tap (FedCM) via Supabase Auth
- **Real-time Sync** — Live updates across tabs using Supabase Realtime channels
- **Collaboration** — Share notes with other users with viewer/editor roles
- **Theming** — Light / Dark / System + 6 configurable accent colors + compact/comfortable/spacious density
- **Accessibility** — Reduce-motion toggle, keyboard navigation, ARIA labels throughout
- **Onboarding Tour** — Interactive walkthrough (`Shift+D`)
- **Responsive** — Collapsible desktop sidebar + mobile bottom navigation

---

## Tech Stack

| Layer      | Technology                                                |
| ---------- | --------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite                                |
| Styling    | Tailwind CSS v4, custom `zinc` design tokens              |
| State      | Zustand (global store + settings store with persistence)  |
| Editor     | TipTap (StarterKit, Highlight, TaskList, Typography)      |
| Animations | Motion / Framer Motion v12                                |
| Backend    | Supabase (Auth, PostgreSQL, RLS, Realtime)                |
| Icons      | Lucide React                                              |
| Routing    | React Router DOM v7                                       |
| Hosting    | Vercel (SPA rewrites via `vercel.json`)                   |

---

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

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id
```

Run the database schema in **Supabase SQL Editor**:

```
supabase/schema.sql
```

Then run any incremental migrations:

```
supabase/migration_trash.sql
supabase/migration_project_trash.sql
supabase/migration_user_settings.sql
supabase/migration_note_collaborators.sql
```

Start the dev server:

```bash
npm run dev
```

### Google OAuth Setup

If you see `Error 400: redirect_uri_mismatch`, follow these steps:

1. **Supabase** → Authentication → Providers → Google: enable and paste your Web Client ID + Secret.
2. **Google Cloud Console** → Credentials → your OAuth 2.0 Web Client → Authorized redirect URIs:
   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```
3. **Supabase** → Authentication → URL Configuration:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173`, `https://neuron-note.vercel.app`
4. **Google Cloud Console** → Authorized JavaScript origins:
   - `http://localhost:5173`
   - `https://neuron-note.vercel.app`

---

## Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   ├── AppLayout.tsx        # App shell — sidebar + animated page transitions
│   │   └── Sidebar.tsx          # Collapsible desktop sidebar + mobile bottom nav
│   ├── ui/
│   │   ├── PageShell.tsx        # Consistent page wrapper (title / description / action)
│   │   ├── SectionCard.tsx      # Card with optional header
│   │   └── EmptyState.tsx       # Empty state (icon + title + description + CTA)
│   ├── OnboardingTour.tsx       # Guided interactive tour
│   ├── QuickCapture.tsx         # Ctrl+K capture modal
│   ├── SearchOverlay.tsx        # Ctrl+/ smart search overlay
│   ├── ShareModal.tsx           # Note sharing modal
│   └── SyncStatus.tsx           # Offline/sync status banner
├── lib/
│   ├── config.ts                # Environment variable config
│   ├── settingsStore.ts         # Zustand settings store (theme, accent, density...)
│   ├── store.ts                 # Zustand global store + all CRUD operations
│   └── supabase.ts              # Supabase client
├── pages/
│   ├── AuthPage.tsx             # Sign in / Sign up + Google One Tap
│   ├── Dashboard.tsx            # Home dashboard
│   ├── NotesPage.tsx            # Notes grid with pinned section
│   ├── NoteEditor.tsx           # TipTap rich text editor
│   ├── TasksPage.tsx            # Task manager with filters
│   ├── ProjectsPage.tsx         # Clickable cards + slide-over detail panel + task management
│   ├── KnowledgeGraph.tsx       # Force-directed canvas graph
│   ├── BookmarksPage.tsx        # Bookmark manager (list + grid)
│   ├── TrashPage.tsx            # Trash for notes + projects with restore / permanent delete
│   └── settings/
│       ├── SettingsPage.tsx     # Settings shell with URL-based section routing
│       ├── components/          # SettingSection, SettingRow, ToggleRow, EditableField...
│       └── sections/            # Appearance, Account, Notifications, Privacy, Data...
├── App.tsx                      # Routes + auth state listener
├── main.tsx                     # Entry point
└── index.css                    # Tailwind v4 theme + custom utilities
supabase/
├── schema.sql                   # Full database schema with RLS policies
└── migration_*.sql              # Incremental migrations
```

---

## Database

PostgreSQL via Supabase with Row Level Security on every table:

`profiles` . `notes` . `tasks` . `projects` . `bookmarks` . `note_links` . `tags` . `note_tags` . `note_collaborators`

---

## Scripts

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # TypeScript check + production build
npm run preview   # Preview production build locally
```

---

## License

MIT
