import Task from '../models/Task.js'
import Category from '../models/Category.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getStats = asyncHandler(async (req, res) => {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000)

  // Get all tasks for stats
  const tasks = await Task.find().lean()

  const total = tasks.length
  const completed = tasks.filter(t => t.status === 'done').length
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const overdue = tasks.filter(t =>
    t.dueDate && new Date(t.dueDate) < now && t.status !== 'done'
  ).length

  // By priority
  const byPriority = { low: 0, medium: 0, high: 0, urgent: 0 }
  tasks.forEach(t => {
    byPriority[t.priority] = (byPriority[t.priority] || 0) + 1
  })

  // By status
  const byStatus = { todo: 0, 'in-progress': 0, done: 0 }
  tasks.forEach(t => {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1
  })

  // By category
  const categories = await Category.find().lean()
  const byCategory = []
  for (const cat of categories) {
    const count = tasks.filter(t => t.category && t.category.toString() === cat._id.toString()).length
    byCategory.push({
      categoryId: cat._id,
      name: cat.name,
      color: cat.color,
      count
    })
  }

  // Smart groups
  const today = tasks.filter(t =>
    t.dueDate && new Date(t.dueDate) >= todayStart && new Date(t.dueDate) <= new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1)
  ).length

  const upcoming = tasks.filter(t =>
    t.dueDate && new Date(t.dueDate) > new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1) && new Date(t.dueDate) <= weekEnd
  ).length

  const nodate = tasks.filter(t => !t.dueDate).length

  res.json({
    success: true,
    data: {
      total,
      completed,
      completionRate,
      overdue,
      byPriority,
      byStatus,
      byCategory,
      groups: { today, upcoming, overdue, nodate }
    }
  })
})