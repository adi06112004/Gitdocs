# GitDocs — Implementation Guide

This guide tracks what is **implemented and working** in the GitDocs stack (frontend + backend), how to test it, and sensible next enhancements.

---

## Completed and functional

### Core product

- **Authentication** — Register, login, JWT sessions, protected API routes, `GET /api/auth/me`.
- **Projects** — List (owned + collaborated), create, update, delete, rollback-related activity; branch metadata on projects.
- **Documents** — List (with optional `projectId` / `branch` query), create, update, delete; permissions tied to project access.
- **Commits / activity** — List and create; filtered by readable projects; shown on Dashboard, Activity page, and navbar notifications.
- **Versions (branches)** — List, create, delete; `POST /api/versions/sync` for push/pull document content between branches; permission checks on project.

### Collaboration and project permissions

- **Collaborators** — Stored on the project with roles `read`, `write`, `admin`. Owner and site `admin` have full access.
- **Backend APIs** — `GET /api/projects/:id/collaborators` returns `{ members, inviteHistory, owner }` (enriched with user display fields). `POST` invites by **registered email** or `userId`; `PUT` / `DELETE` on `/projects/:id/collaborators/:userId` for role updates and removal.
- **Invite history** — Append-only audit entries on the project for collaborator changes.
- **Project updates** — `isPublic` and `isArchived` require **project admin** (owner, collaborator `admin`, or site `admin`). **Archived** projects: only project admins may write (documents, branches, sync, etc.).
- **UI** — Project detail **Workspace** and **Settings** tabs; collaborators panel with roles, invite form, history; modal shortcut from **Collaborators** button; permission-aware controls (read-only vs write vs admin).

### Dashboard account settings (not per-project)

- **`GET/PATCH /api/users/me`** — Profile (name, email).
- **`PATCH /api/users/me/password`** — Change password with current password check.
- **`PATCH /api/users/me/preferences`** — Notification booleans (`commits`, `documents`, `projects`, `mentions`) persisted on the user model.
- **Settings page** (`/settings`) — Wired to these APIs; Redux `updateAuthUser` keeps `localStorage` auth in sync.

### Global search and notifications (navbar)

- **Search** — Debounced query (≥2 characters) over projects, documents, branch names, and commit messages; lazy-loads workspace data on first focus; desktop bar + mobile expand; navigation to editor (`?docId=`), project, versions, or activity.
- **Notifications** — Bell opens **recent activity** (latest commits); badge = items since last panel open (`localStorage` key `gitdocs-notif-last-opened`); refresh on open; links to project or Activity.

### Documentation (in-app)

- **`/docs` route** — **Documentation** page with onboarding copy, collaboration summary, search/notifications notes, and an **API reference** table. Linked from the sidebar, footer, and auth header. Uses the same **AppLayout** as the rest of the signed-in shell (sidebar + main).

### Responsive UI and mobile performance

- **AppLayout** — Mobile menu button; sidebar drawer; main content uses responsive padding instead of a fixed `ml-64` offset.
- **Navbar** — Solid background on small screens; backdrop blur from `md:` up; `touch-action: manipulation` where helpful.
- **Sidebar** — `React.memo`, shorter transform duration, `will-change: transform` only while the mobile drawer is open, lighter overlay.
- **Project detail** — Background refresh throttled (e.g. longer interval) and skipped when the document tab is hidden (`visibilityState`).

### Data flow

- Redux + Redux-Saga for API calls; slices for projects, documents, commits, versions, collaborators, auth, etc.

---

## Implemented pages (routes)

| Route | Purpose |
|-------|---------|
| `/` | Home / marketing |
| `/auth`, `/signin`, `/createaccount` | Auth flows |
| `/dashboard` | Stats and recent documents |
| `/projects` | Project list and CRUD modals |
| `/project/:id` | Project workspace + settings (collaborators, visibility, archived) |
| `/documents` | Document list, filters, create (branch filter uses branch **names**, not raw objects) |
| `/versions` | Global branches |
| `/activity` | Commit timeline, filters, stats, rollback where supported |
| `/settings` | Account profile, password, notification preferences (API-backed) |
| `/docs` | In-app documentation + API table |
| `/editor`, `/editor/:id`, `?docId=` | Editor entry points |

---

## API endpoints (summary)

Base: `http://localhost:5000/api` (configurable). Bearer token for protected routes.

**Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me` (protected)

**Users:** `GET /users/me`, `PATCH /users/me`, `PATCH /users/me/password`, `PATCH /users/me/preferences` (protected)

**Projects:** `GET/POST /projects`, `GET/PUT/DELETE /projects/:id`, `POST /projects/rollback/:commitId`,  
`GET/POST /projects/:id/collaborators`, `PUT/DELETE /projects/:id/collaborators/:userId`

**Documents:** `GET/POST /documents`, `GET/PUT/DELETE /documents/:id`

**Commits:** `GET/POST /commits`

**Versions:** `GET/POST /versions`, `GET/DELETE /versions/:id`, `POST /versions/sync`

CORS should include your Vite dev origin (e.g. `http://localhost:5174`).

---

## Testing checklist

1. **Docs** — Open `/docs` from the sidebar or footer; confirm sections and API table render; anchor `#api` from footer “API Reference”.
2. **Collaborators** — As project owner/admin, invite a user by email (must exist); change role; remove; confirm invite history and project list refresh.
3. **Archived / public** — In project Settings, toggle flags as admin; confirm non-admin cannot write on archived project (API + UI).
4. **Settings** — Update profile, password, notifications; reload and confirm persistence.
5. **Search** — Type ≥2 characters; open results for project, document, branch, commit.
6. **Notifications** — Open bell; badge clears after open; “View all” goes to Activity.
7. **Documents** — Branch filter dropdown shows branch names only (no React “object as child” error).
8. **Mobile** — Open sidebar menu, search expand, and scroll documentation without obvious jank.

---

## Bug fixes worth noting

- **User model** — Mongoose `pre("save")` hook: removed invalid callback `next()` usage with async (registration error `next is not a function`).
- **Documents branch filter** — Options must use string branch **names**; `versions.branches` entries are objects, not strings.

---

## Dependencies

No unusual additions required for the above: React Router, Redux, Redux-Saga, Tailwind, Lucide, Axios (via services), React Toastify, etc.

---

## Optional next enhancements

- **Real-time collaboration** — WebSockets for live collaborator presence and activity (today: polling / focus refresh on project page).
- **Notification preferences** — Filter navbar activity feed by user `preferences.notifications` toggles.
- **Server-side search** — Unified search endpoint for large workspaces.
- **Error boundaries / retries** — Per-route or per-feature error UI.
- **Bulk actions** — Multi-select delete on documents or branches.

---

## Local ports (typical)

- **Frontend:** `5174` (Vite; may vary)
- **Backend:** `5000`

---

**Status:** Core collaboration, account settings, search, notifications, documentation page, and responsive shell are **implemented and functional** as described above.
