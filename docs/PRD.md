# Product Requirements: Smart To-Do & Task Manager

## 1. Goal
A fast, simple task manager where users create tasks, organize them by category, tag them by priority, find them through search and filters, and never lose data, even offline.

## 2. Users
Single user (no auth in v1). Auth is listed under Future Work.

## 3. Core features and acceptance criteria

### F1. Task creation and management
- Create a task with: title (required, 1-120 chars), description (optional, max 1000), category, priority, due date, tags.
- Edit any field; delete with confirmation; toggle status (`todo` -> `in-progress` -> `done`).
- Quick-add input: type a title, press Enter, task is created with defaults (priority `medium`, no category).
- **AC:** Creating a task shows it in the list immediately (optimistic) and it persists in MongoDB after refresh.

### F2. Categories
- Full CRUD on categories (name unique, color picker from a preset palette).
- Assign a task to one category; deleting a category sets its tasks' category to `null` (tasks are NOT deleted).
- Sidebar lists categories with task counts.
- **AC:** Renaming or recoloring a category updates every task card that uses it.

### F3. Priority tags
- Priorities: `low`, `medium`, `high`, `urgent`, each with a distinct color badge.
- Free-form `tags` (lowercased, max 10 per task, max 20 chars each).
- Sort by priority (urgent first) or by due date.
- **AC:** Priority badge is visible on every card and sortable.

### F4. Search and filters
- Text search across title and description (debounced 300 ms).
- Filters combine with AND: category, priority (multi), status (multi), tag, due date range, overdue-only.
- Sort: newest, oldest, due date, priority.
- Pagination: `page`, `limit` (default 20).
- Active filters are shown as removable chips; "Clear all" resets.
- **AC:** Any combination of filters returns correct results from the server and updates the URL query string so views are shareable and survive refresh.

### F5. Local persistence (backed by MongoDB)
- MongoDB is the source of truth via REST.
- Client caches tasks and categories in `localStorage` for instant load.
- Offline: create/edit/delete/toggle are queued locally and replayed in order when the connection returns.
- A status indicator shows `Synced`, `Syncing...`, `Offline (N pending)`.
- **AC:** With the network off, the user can create and edit tasks; going back online syncs them with no duplicates.

### F6. "Smart" extras
- Smart groups on the dashboard: **Today**, **Upcoming (7 days)**, **Overdue**, **No date**.
- Overdue tasks are highlighted in red.
- Stats panel: total, completed, completion rate, count by priority, count by category.

## 4. Non-functional requirements
- API responses under 200 ms locally for lists up to 1,000 tasks.
- All inputs validated server-side; consistent error format.
- Responsive layout (mobile and desktop); keyboard accessible; dark mode.

## 5. Out of scope (v1)
Authentication, multi-user sharing, notifications, recurring tasks, file attachments.

## 6. Future work
JWT auth with per-user data, recurring tasks, reminders, drag-and-drop reorder, subtasks.
