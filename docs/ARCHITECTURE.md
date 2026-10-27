# Architecture

## Stack
| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Axios, Tailwind CSS, React Router (URL query state), date-fns, Recharts (stats) |
| Backend | Node.js 18+, Express 4, Mongoose 8, express-validator, cors, morgan, helmet, dotenv |
| Database | MongoDB (local, Homebrew) |
| Dev tooling | nodemon, concurrently (optional), ESLint |

No Docker anywhere. Everything runs natively.

## Ports
- API: **5001**
- Client (Vite): **5173**
- MongoDB: 27017

## Folder structure
```
smart-todo/
├── CLAUDE.md
├── README.md
├── docs/                      (the other .md files)
├── package.json               (root scripts: dev, install:all)
├── server/
│   ├── package.json
│   ├── .env                   (PORT=5001, MONGO_URI=...)
│   └── src/
│       ├── server.js          (connect DB, start listening)
│       ├── app.js             (express app, middleware, routes)
│       ├── config/db.js
│       ├── models/
│       │   ├── Task.js
│       │   └── Category.js
│       ├── controllers/
│       │   ├── taskController.js
│       │   ├── categoryController.js
│       │   └── statsController.js
│       ├── routes/
│       │   ├── taskRoutes.js
│       │   ├── categoryRoutes.js
│       │   └── statsRoutes.js
│       ├── middleware/
│       │   ├── validate.js
│       │   ├── errorHandler.js
│       │   └── notFound.js
│       ├── utils/buildTaskQuery.js
│       └── seed.js
└── client/
    ├── package.json
    ├── vite.config.js         (proxy /api -> http://localhost:5001)
    ├── .env                   (VITE_API_URL=/api)
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/
        │   ├── client.js      (axios instance)
        │   ├── tasks.js
        │   ├── categories.js
        │   └── stats.js
        ├── storage/
        │   ├── cache.js       (localStorage read/write with versioning)
        │   └── syncQueue.js   (pending operations queue)
        ├── hooks/
        │   ├── useTasks.js
        │   ├── useCategories.js
        │   ├── useFilters.js  (URL query <-> filter state)
        │   ├── useDebounce.js
        │   └── useOnlineStatus.js
        ├── context/TaskContext.jsx
        ├── components/
        │   ├── layout/ (Sidebar, Header, SyncStatus)
        │   ├── tasks/ (TaskForm, TaskList, TaskCard, QuickAdd, TaskGroups)
        │   ├── filters/ (SearchBar, FilterBar, FilterChips, SortSelect)
        │   ├── categories/ (CategoryList, CategoryForm)
        │   ├── common/ (PriorityBadge, ConfirmDialog, EmptyState, Modal, Spinner)
        │   └── stats/StatsPanel.jsx
        └── utils/ (dates.js, constants.js)
```

## Request flow
`Component -> hook (useTasks) -> optimistic state update + cache write -> API call -> reconcile with server response`

## Local persistence and sync design
1. **Cache:** after every successful fetch or mutation, write `tasks`, `categories` to `localStorage` under keys `std:tasks:v1`, `std:categories:v1`.
2. **Boot:** render from cache immediately, then fetch from the API and replace the cache.
3. **Client IDs:** every new task gets a `clientId` (UUID via `crypto.randomUUID()`). The server stores `clientId` with a unique sparse index so replays are idempotent (no duplicates).
4. **Queue:** when offline or a request fails with a network error, push `{ id, type, payload, ts }` to `std:queue:v1`. Types: `CREATE_TASK`, `UPDATE_TASK`, `DELETE_TASK`, `TOGGLE_STATUS`.
5. **Replay:** on the `online` event, on app start, and every 30 s while items are pending, process the queue in FIFO order. Remove an item only after a 2xx. On 4xx validation errors, drop the item and surface a toast. On 5xx or network error, stop and retry later.
6. **Temp IDs:** tasks created offline use `_id = "tmp_" + clientId` until the server responds, then the temp id is replaced. Updates to a temp-id task are merged into its pending `CREATE_TASK` item.
7. **Conflict rule:** last write wins using `updatedAt`; the server response is authoritative after replay.

## Backend conventions
- Controllers are thin; query building lives in `utils/buildTaskQuery.js`.
- Errors use the format in `API_SPEC.md`; all async handlers are wrapped to forward errors to `errorHandler`.
- Use `lean()` for read queries, and `runValidators: true` on updates.
- CORS allows `http://localhost:5173`.
