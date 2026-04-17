# GitDocs

A full-stack, real-time collaborative document editing platform — **Google Docs meets GitHub**. Create projects, organize documents, edit with a rich-text editor alongside collaborators with live cursors, and maintain a complete version history with commits, branches, and rollbacks.

## Features

- **Real-time Collaboration** — Multiple users can edit the same document simultaneously with live content sync via Socket.IO
- **Live Cursors & Presence** — See collaborator cursors and names inside the editor in real-time, with colored avatar indicators
- **Rich Text Editor** — Tiptap (ProseMirror-based) editor with full toolbar: Bold, Italic, Strikethrough, Code, Headings, Lists, Blockquote, Undo/Redo
- **Git-style Version Control** — Commit snapshots of documents with messages, view activity history, and rollback to any previous version
- **Branch Management** — Create, delete, and sync branches per project, with documents scoped to branches
- **Project & Collaborator Management** — Create projects, invite collaborators by email, assign role-based permissions (read / write / admin)
- **JWT Authentication** — Secure signup/login with hashed passwords, 7-day token expiry, and automatic session persistence
- **Redis-powered Performance** — Document caching (5–10 min TTL), cross-server pub/sub for horizontal scaling, and sliding-window rate limiting (100 req/min/IP)
- **User Preferences** — Profile editing, password changes, and notification preference settings
- **In-app Documentation** — Built-in API reference page at `/docs`

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, Tailwind CSS v4, Redux Toolkit, Redux Saga |
| Editor | Tiptap (ProseMirror) with custom Remote Cursors extension |
| Real-time | Socket.IO (client + server) |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose 9 |
| Caching & Pub/Sub | Redis |
| Auth | JWT + bcryptjs |
| UI | Lucide React icons, React Toastify |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│  React Router → Redux Toolkit + Saga → Axios Services   │
│  Tiptap Editor → Socket.IO Client → Remote Cursors      │
└────────────────────┬──────────────────┬─────────────────┘
                     │ HTTP (REST)      │ WebSocket
┌────────────────────▼──────────────────▼─────────────────┐
│                  Backend (Express + Socket.IO)           │
│  JWT Auth Middleware → Controllers → Permission System   │
│  Rate Limiter → Cache Layer → Pub/Sub Layer              │
└────────────┬──────────────────────────┬─────────────────┘
             │                          │
     ┌───────▼───────┐          ┌───────▼───────┐
     │   MongoDB     │          │    Redis      │
     │  (Mongoose)   │          │ Cache/PubSub  │
     └───────────────┘          └───────────────┘
```

### Data Models

- **User** — name, email, hashed password, role (user/admin), notification preferences
- **Project** — name, description, owner, branches, collaborators with permissions, invite history, public/archived flags
- **Document** — name, HTML content, linked to project and branch, created/edited-by tracking
- **Commit** — message, type (create/update/delete/commit/sync), full document snapshot for rollback, linked to project/document/branch
- **Branch** — name, linked to project, parent branch reference

### State Management (Frontend)

The frontend uses **7 Redux slices**, each paired with a Redux Saga and an API service:

| Slice | Purpose |
|-------|---------|
| `authSlice` | Login, signup, logout, session persistence |
| `projectSlice` | Project CRUD, rollback |
| `documentSlice` | Document CRUD |
| `commitSlice` | Create and fetch commits |
| `versionSlice` | Branch create, delete, sync |
| `userSlice` | Profile, password, preferences |
| `collaboratorSlice` | Invite, remove, update permissions |

### Redis Usage

| Role | Details |
|------|---------|
| **Caching** | Documents cached with 5–10 min TTL; invalidated on mutations |
| **Pub/Sub** | `document-updates` channel syncs edits across multiple server instances |
| **Rate Limiting** | Sliding window via sorted sets — 100 requests/min per IP+path |

> Redis is designed to degrade gracefully — if unavailable, the app continues without caching, cross-server sync, or rate limiting.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Redis](https://redis.io/) (local or cloud — optional but recommended)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/gitdocs.git
cd gitdocs
```

### 2. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment variables

Create `backend/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/gitdocs
JWT_SECRET=your_jwt_secret_here
PORT=5000
REDIS_URL=redis://127.0.0.1:6379
REDIS_PASSWORD=
REDIS_DB=0
```

### 4. Start Redis (optional)

```bash
redis-server
```

### 5. Run the application

**Backend** (Terminal 1):

```bash
cd backend
npm run dev
```

**Frontend** (Terminal 2):

```bash
cd frontend
npm run dev
```

### 6. Open in browser

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)

## Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Landing / marketing page |
| `/signin` | Sign In | Login form |
| `/createaccount` | Create Account | Registration form |
| `/dashboard` | Dashboard | Overview stats and recent activity |
| `/projects` | Projects | Project list with create, edit, delete |
| `/project/:id` | Project Detail | Documents, branches, and collaborators for a project |
| `/documents` | Documents | All documents with project/branch filters |
| `/editor/:id` | Editor | Full-screen rich text editor with live collaboration |
| `/versions` | Versions | Branch management |
| `/activity` | Activity | Commit and activity timeline |
| `/settings` | Settings | Profile, password, and notification preferences |
| `/docs` | Documentation | In-app API reference |

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `POST` | `/api/auth/register` | ✗ | Create a new account |
| `POST` | `/api/auth/login` | ✗ | Login and receive JWT |
| `GET` | `/api/auth/me` | ✓ | Get current authenticated user |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/users/me` | ✓ | Get user profile |
| `PATCH` | `/api/users/me` | ✓ | Update name or email |
| `PATCH` | `/api/users/me/password` | ✓ | Change password |
| `PATCH` | `/api/users/me/preferences` | ✓ | Update notification preferences |

### Projects

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/projects` | ✓ | List owned and collaborated projects |
| `POST` | `/api/projects` | ✓ | Create a new project |
| `PUT` | `/api/projects/:id` | ✓ | Update project details |
| `DELETE` | `/api/projects/:id` | ✓ | Delete project (owner only, cascading) |
| `POST` | `/api/projects/rollback/:commitId` | ✓ | Rollback to a previous state |

### Collaborators

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/projects/:id/collaborators` | ✓ | List collaborators with details |
| `POST` | `/api/projects/:id/collaborators` | ✓ | Invite collaborator by email |
| `PUT` | `/api/projects/:id/collaborators/:userId` | ✓ | Update collaborator permission |
| `DELETE` | `/api/projects/:id/collaborators/:userId` | ✓ | Remove a collaborator |

### Documents

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/documents` | ✓ | List documents (filter by projectId, branch) |
| `GET` | `/api/documents/:id` | ✓ | Get a single document |
| `POST` | `/api/documents` | ✓ | Create a new document |
| `PUT` | `/api/documents/:id` | ✓ | Update document content |
| `DELETE` | `/api/documents/:id` | ✓ | Delete a document |

### Commits

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/commits` | ✓ | List commits (filter by projectId, branch) |
| `POST` | `/api/commits` | ✓ | Create a commit with snapshot |

### Versions (Branches)

| Method | Endpoint | Auth | Description |
|--------|----------|:----:|-------------|
| `GET` | `/api/versions` | ✓ | List branches |
| `POST` | `/api/versions` | ✓ | Create a new branch |
| `DELETE` | `/api/versions/:id` | ✓ | Delete a branch |
| `POST` | `/api/versions/sync` | ✓ | Sync documents between branches |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join-document` | Client → Server | Join a document editing room |
| `leave-document` | Client → Server | Leave a document editing room |
| `document-change` | Client → Server | Broadcast content edit to peers |
| `document-update` | Server → Client | Receive content edit from a peer |
| `save-document` | Client → Server | Persist document to database |
| `document-saved` | Server → Client | Save confirmation broadcast |
| `cursor-update` | Bidirectional | Live cursor position sync |
| `active-users-changed` | Server → Client | Presence indicator updates |

## Project Structure

```
gitdocs/
├── backend/
│   ├── server.js                    # HTTP + Socket.IO entry point
│   ├── package.json
│   └── src/
│       ├── app.js                   # Express app, middleware, routes
│       ├── config/
│       │   ├── db.js                # MongoDB connection
│       │   └── redis.js             # Redis connection (graceful fallback)
│       ├── controllers/
│       │   ├── authController.js    # Register, login, logout
│       │   ├── projectController.js # CRUD + rollback + collaborators
│       │   ├── documentController.js# CRUD with caching + permissions
│       │   ├── commitController.js  # Create and fetch commits
│       │   ├── versionController.js # Branch CRUD + sync
│       │   └── userController.js    # Profile and preferences
│       ├── middleware/
│       │   └── auth.js              # JWT verification
│       ├── models/
│       │   ├── User.js              # bcrypt hashing, toJSON transform
│       │   ├── Project.js           # Collaborators, invite history
│       │   ├── Document.js          # HTML content storage
│       │   ├── Commit.js            # Snapshot-based version history
│       │   └── Branch.js            # Per-project branching
│       ├── routes/                  # Express route definitions
│       └── utils/
│           ├── cache.js             # Redis cache wrapper
│           ├── pubsub.js            # Redis pub/sub for cross-server sync
│           ├── rateLimiter.js       # Sliding window rate limiter
│           └── projectPermissions.js# Read/write/admin checks
│
└── frontend/
    ├── vite.config.js               # Vite + React + Tailwind config
    ├── package.json
    └── src/
        ├── main.jsx                 # Entry point, store hydration
        ├── App.jsx                  # Route definitions
        ├── index.css                # Global styles + Tailwind
        ├── components/              # Shared UI components
        │   ├── Editor.jsx           # Tiptap editor with toolbar
        │   ├── Navbar.jsx           # Top navigation
        │   ├── Sidebar.jsx          # Dashboard sidebar
        │   └── ...                  # Modals, cards, layouts
        ├── extensions/
        │   └── RemoteCursors.js     # Custom Tiptap ProseMirror plugin
        ├── pages/                   # Route-level page components
        ├── routes/                  # Route & API path constants
        ├── services/                # Axios API service classes
        └── store/                   # Redux slices + sagas
```

## Permission System

| Level | Read | Write | Admin |
|-------|:----:|:-----:|:-----:|
| `read` | ✓ | ✗ | ✗ |
| `write` | ✓ | ✓ | ✗ |
| `admin` | ✓ | ✓ | ✓ |

- **Project owners** always have full access
- **System admins** (`role: "admin"`) bypass all permission checks
- **Archived projects** block write operations unless the user has admin access

## Notes

- The backend and frontend are **separate applications** — there is no shared root `package.json`
- `backend/.env` is **not committed** to source control and must be created locally
- The app **works without Redis** — caching, rate limiting, and pub/sub gracefully degrade to no-ops
- Real-time collaboration uses a **last-write-wins** strategy (full HTML content broadcast), which works well for small teams
- Commits store **full document snapshots** (not diffs) to simplify rollback logic
