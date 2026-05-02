# Neuron Note

A full-stack productivity workspace for notes, tasks, projects, bookmarks, and knowledge management — built with React 19, Supabase, and Tailwind CSS v4.

🔗 **Live:** [neuron-note.vercel.app](https://neuron-note.vercel.app)

![React](https://img.shields.io/badge/React-19-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8) ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e) ![Vercel](https://img.shields.io/badge/Deployed-Vercel-black)

## Features

### Core

- **Dashboard** — Pinned notes, today's tasks, quick capture with prefix shortcuts, recent activity
- **Notes** — Rich text editor (TipTap) with formatting toolbar, auto-save, word count, and reading time
- **Tasks** — Priorities (high/medium/low), due dates, project assignment, and filters
- **Projects** — Color-coded projects with progress tracking
- **Knowledge Graph** — Interactive force-directed canvas visualization of note connections
- **Bookmarks** — Save links with tags, collections, list/grid view toggle
- **Trash** — Soft-delete with 30-day auto-cleanup and one-click restore

### Productivity

- **Pinned Notes** — Pin important notes to Dashboard and Notes page; toggle from the editor toolbar
- **Smart Search** — `Ctrl+/` opens a Spotlight-style overlay with live results and keyboard navigation
- **Quick Capture** — `Ctrl+K` for instant creation; prefix with `#task` or `#note`
- **Offline Detection** — Status banner when disconnected; changes sync on reconnect
- **Auto-save** — 500 ms debounce with visual save indicator

### Platform

- **Authentication** — Email/password + Google One Tap (FedCM) via Supabase Auth
- **Real-time Sync** — Live updates across tabs using Supabase Realtime channels
- **Collaboration** — Share notes with other users with role-based access
- **Theming** — Light / Dark / System theme + 6 configurable accent colors
- **Accessibility** — Reduce-motion toggle, keyboard navigation, ARIA labels throughout
- **Onboarding Tour** — Interactive walkthrough (`Shift+D`)
- **Responsive** — Collapsible desktop sidebar + mobile bottom navigation

## Tech Stack

| Layer      | Technology                                               |
| ---------- | -------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite                               |
| Styling    | Tailwind CSS v4, custom `zinc` design tokens             |
| State      | Zustand (global store + settings store with persistence) |
| Editor     | TipTap (StarterKit, Highlight, TaskList, Typography)     |
| Animations | Motion / Framer Motion v12                               |
| Backend    | Supabase (Auth, PostgreSQL, RLS, Realtime)               |
| Icons      | Lucide React                                             |
| Routing    | React Router DOM v7                                      |
| Hosting    | Vercel (SPA rewrites via `vercel.json`)                  |

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

Then start the dev server:

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
│   ├── settingsStore.ts         # Zustand settings store (theme, accent, density…)
│   ├── store.ts                 # Zustand global store + all CRUD operations
│   └── supabase.ts              # Supabase client
├── pages/
│   ├── AuthPage.tsx             # Sign in / Sign up + Google One Tap
│   ├── Dashboard.tsx            # Home dashboard
│   ├── NotesPage.tsx            # Notes grid with pinned section
│   ├── NoteEditor.tsx           # TipTap rich text editor
│   ├── TasksPage.tsx            # Task manager with filters
│   ├── ProjectsPage.tsx         # Project cards with progress
│   ├── KnowledgeGraph.tsx       # Force-directed canvas graph
│   ├── BookmarksPage.tsx        # Bookmark manager (list + grid)
│   ├── TrashPage.tsx            # Trash with restore / permanent delete
│   └── settings/
│       ├── SettingsPage.tsx     # Settings shell with URL-based section routing
│       ├── components/          # SettingSection, SettingRow, ToggleRow, EditableField…
│       └── sections/            # Appearance, Account, Notifications, Privacy, Data…
├── App.tsx                      # Routes + auth state listener
├── main.tsx                     # Entry point
└── index.css                    # Tailwind v4 theme + custom utilities
supabase/
├── schema.sql                   # Full database schema with RLS policies
└── migration_*.sql              # Incremental migrations
```

## Database

PostgreSQL via Supabase with Row Level Security on every table:

`profiles` · `notes` · `tasks` · `projects` · `bookmarks` · `note_links` · `tags` · `note_tags` · `note_collaborators`

## Scripts

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # TypeScript check + production build
npm run preview   # Preview production build locally
```

## License

MIT

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

- **Authentication** — Email/password + Google One Tap via Supabase Auth
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
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id
```

For Google One Tap, enable the **Google** provider in Supabase Auth and use a Web OAuth client ID from Google Cloud Console.

### Google OAuth Setup (Required)

If you see `Error 400: redirect_uri_mismatch`, configure Google and Supabase with these exact values:

1. In **Supabase** → Authentication → Providers → Google:

- Enable Google
- Paste your Google Web **Client ID** and **Client Secret**

2. In **Google Cloud Console** → APIs & Services → Credentials → your OAuth 2.0 Web Client:

- Authorized redirect URIs must include:

```
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

Replace `YOUR_PROJECT_REF` with your Supabase project ref.

3. In **Supabase** → Authentication → URL Configuration:

- Set Site URL (for local dev): `http://localhost:5173`
- Add Redirect URLs:
  - `http://localhost:5173`
  - your production URL (for example `https://neuron-note.vercel.app`)

4. In **Google Cloud Console** Authorized JavaScript origins:

- `http://localhost:5173`
- your production origin

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
