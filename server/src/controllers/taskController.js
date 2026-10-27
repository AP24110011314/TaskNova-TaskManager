import Task from '../models/Task.js'
import Category from '../models/Category.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { buildTaskQuery, getPrioritySortStage } from '../utils/buildTaskQuery.js'

export function formatTask(task) {
  if (!task) return null
  const now = new Date()
  const isOverdue = Boolean(task.dueDate && task.status !== 'done' && new Date(task.dueDate) < now)
  return { ...task, isOverdue }
}

export const getTasks = asyncHandler(async (req, res) => {
  const { filter, sort, page, limit } = buildTaskQuery(req.query)

  // Check if priority sort is needed
  const isPrioritySort = req.query.sort === '-priority' || req.query.sort === 'priority'

  let tasks
  let total

  if (isPrioritySort) {
    // Use aggregation for priority sorting
    const pipeline = [
      { $match: filter },
      getPrioritySortStage(req.query.sort === '-priority' ? -1 : 1),
      { $sort: { priorityRank: req.query.sort === '-priority' ? -1 : 1, dueDate: 1, createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          clientId: 1,
          title: 1,
          description: 1,
          category: { _id: 1, name: 1, color: 1 },
          priority: 1,
          status: 1,
          dueDate: 1,
          tags: 1,
          completedAt: 1,
          createdAt: 1,
          updatedAt: 1
        }
      }
    ]

    tasks = await Task.aggregate(pipeline)

    // Get total count
    const countResult = await Task.countDocuments(filter)
    total = countResult
  } else {
    // Regular query with population
    tasks = await Task.find(filter)
      .populate('category', 'name color')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    total = await Task.countDocuments(filter)
  }

  const pages = Math.ceil(total / limit)

  res.json({
    success: true,
    data: tasks.map(formatTask),
    meta: { total, page, limit, pages }
  })
})

export const getTaskById = asyncHandler(async (req, res) => {
  const { id } = req.params

  const task = await Task.findById(id).populate('category', 'name color').lean()

  if (!task) {
    return res.status(404).json({
      success: false,
      error: { message: 'Task not found', details: [{ field: 'id', msg: 'Task not found' }] }
    })
  }

  res.json({ success: true, data: formatTask(task) })
})

export const createTask = asyncHandler(async (req, res) => {
  const { clientId, ...taskData } = req.body

  // Check for existing task with same clientId (idempotent create)
  if (clientId) {
    const existingTask = await Task.findOne({ clientId }).populate('category', 'name color').lean()
    if (existingTask) {
      return res.status(200).json({ success: true, data: formatTask(existingTask) })
    }
  }

  // Validate category exists if provided
  if (taskData.category) {
    const category = await Category.findById(taskData.category)
    if (!category) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: [{ field: 'category', msg: 'Category not found' }] }
      })
    }
  }

  const task = await Task.create({ ...taskData, clientId })

  // Populate category for response
  const populatedTask = await Task.findById(task._id).populate('category', 'name color').lean()

  res.status(201).json({ success: true, data: formatTask(populatedTask) })
})

export const updateTask = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { clientId, ...updateData } = req.body

  // Validate category exists if provided
  if (updateData.category) {
    const category = await Category.findById(updateData.category)
    if (!category) {
      return res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: [{ field: 'category', msg: 'Category not found' }] }
      })
    }
  }

  const task = await Task.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('category', 'name color').lean()

  if (!task) {
    return res.status(404).json({
      success: false,
      error: { message: 'Task not found', details: [{ field: 'id', msg: 'Task not found' }] }
    })
  }

  res.json({ success: true, data: formatTask(task) })
})

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const task = await Task.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  ).populate('category', 'name color').lean()

  if (!task) {
    return res.status(404).json({
      success: false,
      error: { message: 'Task not found', details: [{ field: 'id', msg: 'Task not found' }] }
    })
  }

  res.json({ success: true, data: formatTask(task) })
})

export const deleteTask = asyncHandler(async (req, res) => {
  const { id } = req.params

  const task = await Task.findByIdAndDelete(id)

  if (!task) {
    return res.status(404).json({
      success: false,
      error: { message: 'Task not found', details: [{ field: 'id', msg: 'Task not found' }] }
    })
  }

  res.json({ success: true, data: { _id: id } })
})

export const bulkClearDone = asyncHandler(async (req, res) => {
  const { status } = req.query

  if (status !== 'done') {
    return res.status(400).json({
      success: false,
      error: { message: 'Invalid status', details: [{ field: 'status', msg: 'Only status=done is supported' }] }
    })
  }

  const result = await Task.deleteMany({ status: 'done' })

  res.json({ success: true, data: { deletedCount: result.deletedCount } })
})