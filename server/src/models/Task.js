import mongoose from 'mongoose'

const taskSchema = new mongoose.Schema({
  clientId: { type: String, index: { unique: true, sparse: true } },
  title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
  description: { type: String, trim: true, maxlength: 1000, default: '' },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['todo', 'in-progress', 'done'], default: 'todo' },
  dueDate: { type: Date, default: null },
  tags: { type: [String], default: [], validate: v => v.length <= 10 },
  completedAt: { type: Date, default: null }
}, { timestamps: true })

// Pre-save hook: set/clear completedAt when status changes to/from 'done'
taskSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('status')) {
    if (this.status === 'done') {
      this.completedAt = new Date()
    } else {
      this.completedAt = null
    }
  }
  next()
})

// Pre-update hook for findOneAndUpdate
taskSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate()
  if (update.status) {
    if (update.status === 'done') {
      update.completedAt = new Date()
    } else {
      update.completedAt = null
    }
  }
  next()
})

// Normalize tags: lowercase, trim, dedupe, each max 20 chars
taskSchema.path('tags').set(function(tags) {
  if (!Array.isArray(tags)) return tags
  return [...new Set(tags
    .map(t => t.trim().toLowerCase().slice(0, 20))
    .filter(t => t.length > 0)
  )]
})

// Virtual isOverdue
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'done') return false
  return new Date(this.dueDate) < new Date()
})

// Indexes
taskSchema.index({ title: 'text', description: 'text' }, { weights: { title: 5, description: 1 } })
taskSchema.index({ status: 1, priority: 1 })
taskSchema.index({ category: 1 })
taskSchema.index({ dueDate: 1 })
taskSchema.index({ tags: 1 })
taskSchema.index({ createdAt: -1 })

// Priority rank for sorting
taskSchema.virtual('priorityRank').get(function() {
  const ranks = { urgent: 4, high: 3, medium: 2, low: 1 }
  return ranks[this.priority] || 2
})

// Ensure virtuals are included in JSON
taskSchema.set('toJSON', { virtuals: true })
taskSchema.set('toObject', { virtuals: true })

export default mongoose.model('Task', taskSchema)