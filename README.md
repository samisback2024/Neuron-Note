<div align="center">

# Neuron

**A unified productivity workspace for notes, tasks, projects, bookmarks, and knowledge — built with React 19, Supabase, and Tailwind CSS v4.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-neuron--note.vercel.app-black?style=for-the-badge&logo=vercel)](https://neuron-note.vercel.app)

![React](https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8?logo=tailwindcss&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ecf8e?logo=supabase&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white) ![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)

</div>

---

## Overview

Neuron is a full-stack personal knowledge management app. Everything — notes, tasks, projects, bookmarks — lives in one cohesive workspace, connected through a visual knowledge graph and surfaced instantly via keyboard-first search.

---

## Features

### Core Workspace

| Feature             | Description                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| **Dashboard**       | Pinned notes, today's tasks, quick capture, and recent activity at a glance                         |
| **Notes**           | TipTap rich-text editor with formatting toolbar, auto-save, word count, and reading time            |
| **Tasks**           | Priority levels (high / medium / low), due dates, project assignment, and filters                   |
| **Projects**        | Color-coded cards with progress bars; slide-over panel with inline editing and task management      |
| **Visual Workspace** | Infinite canvas (pan / zoom / minimap) for sticky notes, text, and shapes — Phase 1 of a planned Miro-style workspace, see [roadmap](#visual-workspace-roadmap) |
| **Knowledge Graph** | Interactive force-directed canvas that visualizes connections between notes                         |
| **Bookmarks**       | Save links with tags and collections; toggle between list and grid view                             |
| **Trash**           | Soft-delete for notes and projects with a 30-day countdown, one-click restore, and permanent delete |

### Keyboard-First Productivity

| Shortcut  | Action                                                                           |
| --------- | -------------------------------------------------------------------------------- |
| `Ctrl+K`  | Quick Capture — create a note or task instantly (prefix with `#note` or `#task`) |
| `Ctrl+/`  | Smart Search — Spotlight-style overlay with live results and keyboard navigation |
| `Shift+D` | Onboarding Tour — interactive feature walkthrough                                |

### Platform

- **Authentication** — Email/password sign-in and Google One Tap (FedCM) via Supabase Auth
- **Real-time Sync** — Live updates across browser tabs using Supabase Realtime channels
- **Collaboration** — Share individual notes with viewer or editor permissions
- **Theming** — Light, Dark, and System modes; 6 accent colors; compact / comfortable / spacious density
- **Accessibility** — Reduce-motion toggle, full keyboard navigation, ARIA labels throughout
- **Offline Detection** — Status banner when disconnected; changes sync automatically on reconnect
- **Responsive** — Collapsible sidebar on desktop, bottom navigation on mobile

---

## Visual Workspace Roadmap

An infinite canvas for visually organizing notes, tasks, and ideas — inspired by Miro/FigJam/Lucidchart, built incrementally. Full scope is large (realtime multiplayer, AI diagram generation, etc.), so it's tracked here phase by phase rather than promised all at once.

| Phase | Scope | Status |
| ----- | ----- | ------ |
| 1 | Canvas foundation — infinite pan/zoom, minimap, controls; basic node system (Sticky Note, Text, Shape) with drag/resize/inline-edit/delete; Supabase persistence (`canvas_nodes` table) | ✅ Shipped |
| 2 | Full node system — remaining node types (Note, Task, Project, Bookmark, Image, Database, Code Block, Website Link) | Planned |
| 3 | Connections — straight/curved/orthogonal connectors, arrows, labels, styles | Planned |
| 4 | Full shape library — circle, diamond, hexagon, cylinder, cloud, document, decision, database, container, swimlane, frame | Planned |
| 5 | Templates — flowchart, mind map, kanban, system design, ER diagram, org chart, SWOT, roadmap, etc. | Planned |
| 6 | AI generation — natural-language prompt → diagram (needs a new LLM API integration + server-side function) | Planned |
| 7 | Realtime collaboration — live cursors, presence, comments, conflict resolution (Supabase Realtime) | Planned |
| 8 | Import/export — PNG, SVG, PDF, JSON, Mermaid, Draw.io | Planned |
| 9 | Performance — virtualization, memoization, support for thousands of nodes | Planned |

Also planned, cutting across phases: deep Neuron integration (drag a note/task/project onto the canvas as a live-synced node), Knowledge Graph sync, auto-layout algorithms, and mind-map mode (Tab/Enter to branch).

---

## Tech Stack

| Layer      | Technology                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Frontend   | React 19, TypeScript, Vite                                                                      |
| Styling    | Tailwind CSS v4, custom `zinc` design tokens                                                    |
| State      | Zustand v5 — global store and persisted settings store                                          |
| Editor     | TipTap v3 (StarterKit, Highlight, TaskList, Typography, Link, CodeBlock w/ syntax highlighting) |
| Animations | Motion v12                                                                                      |
| Canvas     | React Flow (`@xyflow/react`) — Visual Workspace's infinite canvas                                |
| Backend    | Supabase v2 — Auth, PostgreSQL, Row Level Security, Realtime                                    |
| Icons      | Lucide React                                                                                    |
| Routing    | React Router DOM v7                                                                             |
| Hosting    | Vercel (SPA rewrites via `vercel.json`)                                                         |

---

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- A [Supabase](https://supabase.com) project (free tier works fine)

### 1. Clone and install

```bash
git clone https://github.com/samisback2024/Neuron-Note.git
cd Neuron-Note
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GOOGLE_CLIENT_ID=your-google-web-client-id   # optional — only needed for Google OAuth
```

### 3. Initialize the database

Open the **Supabase SQL Editor** and run the files in this order:

```
supabase/schema.sql
supabase/migration_trash.sql
supabase/migration_project_trash.sql
supabase/migration_user_settings.sql
supabase/migration_note_collaborators.sql
supabase/migration_canvas.sql
```

### 4. Start the dev server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Google OAuth Setup

> Skip this section if you are not using Google sign-in.

If you see **`Error 400: redirect_uri_mismatch`**, complete the following:

1. **Supabase Dashboard** → Authentication → Providers → Google  
   Enable the provider and enter your Web Client ID and Secret.

2. **Google Cloud Console** → Credentials → your OAuth 2.0 Web Client → Authorized redirect URIs  
   Add:

   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

3. **Supabase Dashboard** → Authentication → URL Configuration
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173`, `https://neuron-note.vercel.app`

4. **Google Cloud Console** → Authorized JavaScript origins  
   Add:
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
│   ├── canvas/                  # Visual Workspace node components
│   │   ├── StickyNoteNode.tsx   # Sticky note (6 colors, inline edit)
│   │   ├── TextNode.tsx         # Floating text node
│   │   ├── ShapeNode.tsx        # Shape node (rectangle/rounded/circle/diamond)
│   │   ├── CanvasToolbar.tsx    # Floating add-node toolbar
│   │   └── stickyColors.ts      # Sticky note color palette
│   ├── OnboardingTour.tsx       # Guided interactive tour
│   ├── QuickCapture.tsx         # Ctrl+K capture modal
│   ├── SearchOverlay.tsx        # Ctrl+/ smart search overlay
│   ├── ShareModal.tsx           # Note sharing modal
│   └── SyncStatus.tsx           # Offline / sync status banner
├── lib/
│   ├── config.ts                # Environment variable configuration
│   ├── settingsStore.ts         # Zustand settings store (theme, accent, density)
│   ├── store.ts                 # Zustand global store + all CRUD operations
│   └── supabase.ts              # Supabase client
├── pages/
│   ├── AuthPage.tsx             # Sign in / sign up + Google One Tap
│   ├── Dashboard.tsx            # Home dashboard
│   ├── NotesPage.tsx            # Notes grid with pinned section
│   ├── NoteEditor.tsx           # TipTap rich text editor
│   ├── TasksPage.tsx            # Task manager with filters
│   ├── ProjectsPage.tsx         # Cards + slide-over panel + per-project tasks
│   ├── VisualWorkspace.tsx      # Infinite canvas (React Flow) — Phase 1
│   ├── KnowledgeGraph.tsx       # Force-directed canvas graph
│   ├── BookmarksPage.tsx        # Bookmark manager (list + grid)
│   ├── TrashPage.tsx            # Trash with restore and permanent delete
│   └── settings/
│       ├── SettingsPage.tsx     # Settings shell with URL-based section routing
│       ├── components/          # SettingSection, SettingRow, ToggleRow, EditableField
│       └── sections/            # Appearance, Account, Notifications, Privacy, Data
├── App.tsx                      # Routes + auth state listener
├── main.tsx                     # Entry point
└── index.css                    # Tailwind v4 theme + custom utilities
supabase/
├── schema.sql                   # Full database schema with RLS policies
└── migration_*.sql              # Incremental migrations
```

---

## Database

PostgreSQL via Supabase with Row Level Security enforced on every table:

`profiles` · `notes` · `tasks` · `projects` · `bookmarks` · `note_links` · `tags` · `note_tags` · `note_collaborators` · `canvas_nodes`

---

## Scripts

```bash
npm run dev       # Start the dev server at localhost:5173
npm run build     # Type-check and build for production
npm run preview   # Preview the production build locally
```

---

## License

MIT
