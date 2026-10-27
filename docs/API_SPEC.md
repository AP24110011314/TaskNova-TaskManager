# REST API Specification

Base URL: `http://localhost:5001/api` · JSON only · No auth in v1.

## Error format (all errors)
```json
{ "success": false, "error": { "message": "Validation failed", "details": [{ "field": "title", "msg": "Title is required" }] } }
```
Status codes: 400 validation, 404 not found, 409 duplicate, 500 server error.

## Success format
```json
{ "success": true, "data": { ... } }
```
List endpoints add `"meta": { "total": 42, "page": 1, "limit": 20, "pages": 3 }`.

## Health
`GET /api/health` -> `{ "success": true, "data": { "status": "ok" } }`

## Tasks

### POST /api/tasks
Body:
```json
{ "clientId": "uuid (optional)", "title": "Write report", "description": "", "category": "<categoryId|null>",
  "priority": "high", "status": "todo", "dueDate": "2026-11-01T00:00:00.000Z", "tags": ["work","report"] }
```
- If `clientId` already exists, return the existing task with 200 (idempotent replay).
- Returns 201 with the created task (category populated).

### GET /api/tasks
Query params (all optional, combined with AND):
| Param | Example | Meaning |
|---|---|---|
| `q` | `report` | Text search on title/description (text index) |
| `category` | `<id>` or `none` | Filter by category; `none` = uncategorized |
| `priority` | `high,urgent` | Comma-separated multi |
| `status` | `todo,in-progress` | Comma-separated multi |
| `tag` | `meeting` | Single tag |
| `dueFrom` / `dueTo` | `2026-10-26` | Due date range (inclusive) |
| `overdue` | `true` | Due date passed and not done |
| `group` | `today\|upcoming\|overdue\|nodate` | Smart group shortcut |
| `sort` | `-createdAt`, `createdAt`, `dueDate`, `-priority` | Default `-createdAt` |
| `page`, `limit` | `1`, `20` | Pagination (limit max 100) |

Returns tasks with `category` populated (`{_id, name, color}`) and `isOverdue` computed.

Implementation notes:
- Priority sort uses an aggregation `$addFields` rank, or a `$switch` expression.
- Escape regex characters if falling back to regex search for partial matches (`q` shorter than 3 chars may use a case-insensitive regex on title).
- `group=today`: dueDate within today's local day; `upcoming`: next 7 days excluding today; `overdue`: past due and not done; `nodate`: dueDate null.

### GET /api/tasks/:id
200 with task, 404 if missing, 400 for an invalid ObjectId.

### PUT /api/tasks/:id
Partial update allowed. Same validation as create. Returns updated task.

### PATCH /api/tasks/:id/status
Body `{ "status": "done" }`. Sets/clears `completedAt`.

### DELETE /api/tasks/:id
Returns `{ "success": true, "data": { "_id": "..." } }`.

### DELETE /api/tasks?status=done
Bulk-clear completed tasks. Returns `{ deletedCount }`.

## Categories

| Method | Path | Notes |
|---|---|---|
| GET | `/api/categories` | Each includes `taskCount` (use aggregation `$lookup` or count query) |
| POST | `/api/categories` | Body `{ name, color }`; 409 if name exists |
| PUT | `/api/categories/:id` | Rename or recolor |
| DELETE | `/api/categories/:id` | Un-assigns its tasks (sets `category: null`) |

## Stats

### GET /api/stats
```json
{ "success": true, "data": {
  "total": 30, "completed": 12, "completionRate": 40, "overdue": 3,
  "byPriority": { "low": 5, "medium": 12, "high": 9, "urgent": 4 },
  "byStatus": { "todo": 14, "in-progress": 4, "done": 12 },
  "byCategory": [{ "categoryId": "...", "name": "Work", "color": "#3b82f6", "count": 10 }],
  "groups": { "today": 3, "upcoming": 7, "overdue": 3, "nodate": 8 }
} }
```

## Validation rules (express-validator)
- `title`: required on create, trimmed, 1-120 chars
- `description`: max 1000
- `priority`: in enum; `status`: in enum
- `category`: valid ObjectId or null; must exist
- `dueDate`: ISO 8601 or null
- `tags`: array, max 10 items, each string max 20 chars
- Unknown fields are stripped.
