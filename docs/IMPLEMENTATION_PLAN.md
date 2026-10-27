# Implementation Plan

Work phase by phase. Do not start a phase until the previous phase's "Done when" checks pass. Reference the other docs for details.

## Phase 0: Scaffold (SETUP.md)
- [x] Create `server/` and `client/`, install dependencies, add `.env` files and `.gitignore`
- [x] Root `package.json` with scripts: `dev` (runs both via `concurrently`), `seed`
- **Done when:** `GET http://localhost:5001/api/health` returns ok and the Vite app loads on 5173.

## Phase 1: Backend foundation
- [x] `config/db.js` (Mongoose connect, log success, exit on failure)
- [x] `app.js`: helmet, cors (`CLIENT_ORIGIN`), `express.json()`, morgan, routes under `/api`, `notFound`, `errorHandler`
- [x] `server.js`: connect DB, then listen on `PORT` (default 5001)
- **Done when:** server starts, handles 404 and errors in the standard JSON format.

## Phase 2: Models and seed (DATABASE.md)
- [x] `Category` and `Task` models with validation, hooks, indexes
- [x] `seed.js` with sample data
- **Done when:** `npm run seed` populates data visible in `mongosh`.

## Phase 3: Category API
- [x] CRUD controller and routes with validation, 409 on duplicate name, `taskCount`
- [x] Delete un-assigns tasks
- **Done when:** all category endpoints work in curl/Postman and deletion keeps tasks.

## Phase 4: Task API (API_SPEC.md)
- [x] Create (idempotent via `clientId`), get one, update, status patch, delete, bulk-clear done
- [x] `buildTaskQuery` supporting `q`, `category`, `priority`, `status`, `tag`, `dueFrom/dueTo`, `overdue`, `group`, `sort`, pagination
- [x] Priority-rank sorting
- **Done when:** every filter works alone and combined; pagination `meta` is correct.

## Phase 5: Stats API
- [x] `GET /api/stats` via aggregation (counts, rate, by priority/status/category, groups)
- **Done when:** numbers match the seed data.

## Phase 6: Backend tests (optional but recommended)
- [x] Automated test suite via Node test runner covering task filters, idempotent create, category delete behavior, health, status patch, bulk clear

## Phase 7: Frontend foundation
- [x] Tailwind, router, axios client, constants (priorities, colors), date utils
- [x] `TaskContext`, `useFilters` (URL sync), `useDebounce`, `useOnlineStatus`
- [x] Layout: Sidebar, Header, main area

## Phase 8: Tasks UI
- [x] `TaskList`, `TaskCard`, `PriorityBadge`, `QuickAdd`, `TaskForm` in a modal (create and edit)
- [x] Toggle status, delete with `ConfirmDialog`
- **Done when:** full task CRUD works through the UI against the API.

## Phase 9: Categories UI
- [x] Sidebar category list with counts, create/rename/recolor/delete
- [x] Category select in the task form; clicking a sidebar category sets the filter
- **Done when:** category changes are reflected on all cards.

## Phase 10: Search and filters UI
- [x] `SearchBar` (debounced), `FilterBar`, `FilterChips`, `SortSelect`, smart groups in the sidebar, pagination or "Load more"
- [x] URL query sync; refresh preserves the view
- **Done when:** all combinations from PRD F4 work and the URL is shareable.

## Phase 11: Local persistence and offline sync (ARCHITECTURE.md)
- [x] `cache.js` and `syncQueue.js`; boot from the cache, then refresh from the API
- [x] Optimistic mutations with rollback; `clientId`, temp IDs, queue merge rules
- [x] Replay on `online`, app start, and a 30 s interval; `SyncStatus` pill; offline client-side `applyFilters`
- **Done when:** with DevTools set to Offline you can create, edit, delete, and toggle tasks, and going online syncs everything with no duplicates.

## Phase 12: Stats and polish
- [x] `StatsPanel` with Recharts
- [x] Overdue highlighting, empty states, skeletons, toasts, dark mode, keyboard shortcuts, responsive drawer
- **Done when:** the whole PRD checklist passes.

## Phase 13: Final QA checklist
- [x] Create/edit/delete task, 120-char title limit, tag limits
- [x] Category delete leaves tasks uncategorized
- [x] Every filter and sort works; URL restores state
- [x] Offline create + reload + online sync works
- [x] No console errors; API never runs on port 5000
- [x] README has run instructions and screenshots
