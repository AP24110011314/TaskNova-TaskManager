# Frontend Specification (React + Vite + Tailwind)

## Layout
- **Sidebar** (collapsible on mobile): smart groups (All, Today, Upcoming, Overdue, No date) with counts, category list with colored dots and counts, "+ New category", Stats link.
- **Header:** SearchBar, SortSelect, dark-mode toggle, `SyncStatus` pill.
- **Main:** QuickAdd, FilterBar + FilterChips, TaskList (paginated or "Load more"), floating "+" button that opens `TaskForm` in a Modal.

## Components
| Component | Responsibilities |
|---|---|
| `QuickAdd` | One input; Enter creates a task with defaults and the currently selected category |
| `TaskForm` | Create/edit: title, description, category select, priority segmented control, status, due date picker, tag input (Enter or comma adds chip). Inline validation. |
| `TaskCard` | Checkbox toggle, title (strikethrough if done), PriorityBadge, category pill, tag chips, due date (red if overdue, "Today", "Tomorrow" labels), edit and delete actions |
| `TaskList` | Renders cards, loading skeletons, `EmptyState` variants (no tasks / no results for filters) |
| `FilterBar` | Category select, priority multi-select, status multi-select, tag input, due date range, overdue toggle |
| `FilterChips` | One removable chip per active filter, plus "Clear all" |
| `SearchBar` | Debounced (300 ms) input that updates the `q` filter |
| `CategoryList/Form` | Create, rename, recolor (preset palette of 8 colors), delete with confirm |
| `StatsPanel` | Cards: total, completed, rate, overdue; Recharts pie (by priority), bar (by category) |
| `SyncStatus` | `Synced`, `Syncing...`, `Offline (N pending)` with colored dot |
| `PriorityBadge` | low=gray, medium=blue, high=orange, urgent=red |

## State and data
- `TaskContext` holds `tasks`, `categories`, `filters`, `meta`, `loading`, `pendingCount` and exposes actions: `createTask`, `updateTask`, `deleteTask`, `toggleStatus`, `createCategory`, etc.
- **Filters live in the URL** (`useFilters` uses `useSearchParams`); changing the URL triggers a refetch. Param names match the API query params.
- All mutations are **optimistic**: update state, write cache, call API (or queue), reconcile on response, roll back and toast on 4xx.
- Persistence layer details are in `ARCHITECTURE.md` (cache keys `std:tasks:v1`, `std:categories:v1`, `std:queue:v1`).

## Behavior details
- When filters are active and the cache is the only source (offline), apply the same filters client-side with a shared `applyFilters(tasks, filters)` helper so offline search still works.
- Due date labels via `date-fns`: Today, Tomorrow, `MMM d`, "Overdue by N days".
- Debounce hook for search; abort in-flight requests when filters change (`AbortController`).
- Toasts for success, error, and "Back online, synced N changes".
- Confirm dialog before deleting tasks and categories.

## Accessibility and UX
- Semantic buttons, labels on all inputs, focus trap in modals, `Esc` closes modals.
- Keyboard: `/` focuses search, `n` opens the new task form.
- Dark mode via Tailwind `dark:` class, persisted in `localStorage` (`std:theme`).
- Mobile: sidebar becomes a drawer; cards stack; filter bar collapses behind a "Filters" button.

## Vite config
```js
server: { port: 5173, proxy: { '/api': 'http://localhost:5001' } }
```
