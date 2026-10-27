# Database (MongoDB + Mongoose)

Database name: `smart-todo`. Connection: `mongodb://127.0.0.1:27017/smart-todo`

## Category schema (`server/src/models/Category.js`)
```js
const categorySchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true, minlength: 1, maxlength: 40, unique: true },
  color: { type: String, default: '#6366f1', match: /^#([0-9a-fA-F]{6})$/ },
}, { timestamps: true });
```

## Task schema (`server/src/models/Task.js`)
```js
const taskSchema = new mongoose.Schema({
  clientId:    { type: String, index: { unique: true, sparse: true } },
  title:       { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status:      { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  dueDate:     { type: Date, default: null },
  tags:        { type: [String], default: [], validate: v => v.length <= 10 },
  completedAt: { type: Date, default: null },
}, { timestamps: true });
```
Behavior:
- Pre-save/update hook: set `completedAt = now` when status becomes `done`; clear it otherwise.
- Normalize tags: lowercase, trim, dedupe, each max 20 chars.
- Virtual `isOverdue`: `dueDate < now && status !== 'done'`.
- Add a numeric helper `priorityRank` in aggregation for sorting (`urgent=4, high=3, medium=2, low=1`).

## Indexes
```js
taskSchema.index({ title: 'text', description: 'text' }, { weights: { title: 5, description: 1 } });
taskSchema.index({ status: 1, priority: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ createdAt: -1 });
```

## Category deletion rule
In `categoryController.remove`: after deleting the category, run `Task.updateMany({ category: id }, { $set: { category: null } })`.

## Seed script (`server/src/seed.js`, `npm run seed`)
Clears both collections, then inserts:
- Categories: Work (#3b82f6), Personal (#10b981), Study (#f59e0b), Health (#ef4444)
- 12-15 tasks spread across categories, all four priorities, all statuses, due dates covering overdue, today, next 7 days, and none, plus tags like `urgent`, `meeting`, `exam`.
