# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**TaskNova** - A full-stack MERN application for managing tasks with categories, priorities, smart groups, statistics, and offline support.

- **Backend**: Node.js 18+, Express, MongoDB (Mongoose)
- **Frontend**: React 18, Vite, React Router v6
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Date handling**: date-fns
- **HTTP client**: Axios
- **Validation**: express-validator

## Common Development Commands

### Root Level
```bash
npm run dev              # Start both client and server concurrently
npm run dev:server       # Start server only (port 5001)
npm run dev:client       # Start client only (port 5173/5174)
npm run install:all      # Install all dependencies
npm run build            # Build client for production
npm run start            # Start production server
npm run seed             # Seed database with sample data
npm run test             # Run server tests
```

### Server (cd server)
```bash
npm run dev              # Start with nodemon
npm start                # Start production server
npm run seed             # Seed database (4 categories, 15 sample tasks)
npm run test             # Run API tests (node --test)
```

### Client (cd client)
```bash
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run lint             # Run oxlint
npm run preview          # Preview production build
```

## Architecture

### Monorepo Structure
```
├── client/                 # React frontend (Vite + React 19)
│   ├── src/
│   │   ├── api/           # Axios API clients (tasks, categories, stats)
│   │   ├── components/    # Reusable UI components
│   │   │   ├── common/    # Modal, ConfirmDialog, Spinner, Toast, PriorityBadge
│   │   │   ├── filters/   # FilterBar, FilterChips, SearchBar, SortSelect
│   │   │   ├── layout/    # Layout, Sidebar, Header
│   │   │   ├── stats/     # StatsPanel with Recharts
│   │   │   └── tasks/     # TaskForm, TaskList, TaskCard, QuickAdd
│   │   ├── context/       # TaskContext (global state + offline sync)
│   │   ├── hooks/         # Custom hooks (useFilters, useTheme, useDebounce, etc.)
│   │   ├── pages/         # Dashboard, Stats, Categories
│   │   ├── storage/       # localStorage cache & sync queue
│   │   ├── utils/         # Filters, dates, constants, helpers
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/        # MongoDB connection
│   │   ├── controllers/   # Task, Category, Stats controllers
│   │   ├── middleware/    # Validation, error handling, notFound
│   │   ├── models/        # Task, Category Mongoose models
│   │   ├── routes/        # Express routes
│   │   ├── utils/         # Query builder, asyncHandler
│   │   ├── app.js         # Express app setup
│   │   ├── server.js      # Entry point
│   │   └── seed.js        # Database seeding
│   └── package.json
└── package.json            # Root package.json with concurrently scripts
```

### Key Architectural Patterns

1. **Global State via React Context** (`client/src/context/TaskContext.jsx`)
   - Single source of truth for tasks, categories, stats
   - Handles optimistic updates with automatic rollback on error
   - Manages offline queue processing (FIFO replay on reconnect)
   - Background sync every 30 seconds when online
   - Sync status indicator: "Synced" / "Offline (N pending)" / "Syncing..."

2. **Offline-First Design**
   - localStorage cache for instant load on refresh
   - Queue mutations (create/update/delete tasks & categories, toggle status) when offline
   - Idempotent creation via `clientId` to prevent duplicates on retry
   - Temp IDs (`tmp_${clientId}`) for optimistic tasks before server confirmation

3. **API Layer** (`client/src/api/`)
   - Axios instance with network error detection
   - Separate modules for tasks, categories, stats
   - Consistent response format: `{ success: true, data: ..., meta: ... }`

4. **Server Query Builder** (`server/src/utils/buildTaskQuery.js`)
   - Builds MongoDB filter from URL query params
   - Supports: text search, category, priority (multi), status (multi), tag, due date range, overdue, smart groups
   - Smart groups: today, upcoming (7 days), overdue, nodate
   - Priority sorting via aggregation pipeline with computed `priorityRank`

5. **Task Model** (`server/src/models/Task.js`)
   - Fields: clientId (unique sparse), title, description, category (ref), priority, status, dueDate, tags, completedAt
   - Pre-save hooks for `completedAt` auto-management
   - Tags normalization: lowercase, trim, dedupe, max 20 chars each, max 10 tags
   - Text index on title/description, indexes on status, category, dueDate, tags
   - Virtual `priorityRank` for sorting, `isOverdue` for overdue detection

## Environment Variables

### Server (.env)
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/tasknova
CLIENT_ORIGIN=http://localhost:5173
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5001/api
```

## API Endpoints

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List with filters, pagination, sorting |
| POST | `/api/tasks` | Create task (idempotent via clientId) |
| GET | `/api/tasks/:id` | Get task by ID |
| PUT | `/api/tasks/:id` | Update task |
| PATCH | `/api/tasks/:id/status` | Update task status |
| DELETE | `/api/tasks/:id` | Delete task |
| DELETE | `/api/tasks?status=done` | Bulk clear done tasks |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List with task counts |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category (unassigns from tasks) |

### Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Aggregated statistics |

### Task Query Parameters
| Param | Type | Description |
|-------|------|-------------|
| q | string | Search in title/description (min 3 chars for text search) |
| category | string | Category ID or "none" for uncategorized |
| priority | string | Comma-separated: low,medium,high,urgent |
| status | string | Comma-separated: todo,in-progress,done |
| tag | string | Exact tag match |
| dueFrom | date | Due date >= (ISO 8601) |
| dueTo | date | Due date <= (ISO 8601) |
| overdue | boolean | "true" for overdue only |
| group | string | today/upcoming/overdue/nodate/all |
| sort | string | -createdAt/createdAt/dueDate/-priority/priority |
| page | number | Page number (default 1) |
| limit | number | Items per page (default 20, max 100) |

## Key Files to Know

- **Client entry**: `client/src/main.jsx` → `App.jsx` → `TaskProvider` wraps app
- **Global state**: `client/src/context/TaskContext.jsx` (500+ lines - core logic)
- **API client**: `client/src/api/client.js` (axios with network error interceptor)
- **Offline queue**: `client/src/storage/syncQueue.js` + `cache.js`
- **Server entry**: `server/src/server.js` → `app.js`
- **Query building**: `server/src/utils/buildTaskQuery.js`
- **Task model**: `server/src/models/Task.js` (includes virtuals, hooks, indexes)

## Testing

- Server tests: `server/src/tests/api.test.js` (uses Node.js built-in test runner)
- Run with: `npm run test` from root or `cd server && npm run test`

## Linting

- Client: `oxlint` (configured in client package.json)
- Run with: `cd client && npm run lint`

## Keyboard Shortcuts (Frontend)

- `/` — Focus search input (when not in input/textarea/select)
- `n` — Open Quick Add task form
- `Escape` — Close modals/forms

## Responsive Breakpoints

- **Mobile**: < 768px (collapsible sidebar, hamburger menu)
- **Desktop**: ≥ 768px (persistent left sidebar)
- Tailwind breakpoints: sm (640px), md (768px), lg (1024px)

## Dark Mode

- Tailwind CSS v4 `class` strategy
- Persisted in localStorage
- System preference detection on first load
- Toggle in header with emoji icons (🌙/☀️)