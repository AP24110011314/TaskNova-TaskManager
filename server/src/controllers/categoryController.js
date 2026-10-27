import Category from '../models/Category.js'
import Task from '../models/Task.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.aggregate([
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'category',
        as: 'tasks'
      }
    },
    {
      $addFields: {
        taskCount: { $size: '$tasks' }
      }
    },
    {
      $project: {
        tasks: 0
      }
    },
    { $sort: { name: 1 } }
  ])

  res.json({ success: true, data: categories })
})

export const createCategory = asyncHandler(async (req, res) => {
  const { name, color } = req.body

  const category = await Category.create({ name, color })

  res.status(201).json({ success: true, data: category })
})

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params
  const { name, color } = req.body

  const category = await Category.findByIdAndUpdate(
    id,
    { name, color },
    { new: true, runValidators: true }
  )

  if (!category) {
    return res.status(404).json({
      success: false,
      error: { message: 'Category not found', details: [{ field: 'id', msg: 'Category not found' }] }
    })
  }

  res.json({ success: true, data: category })
})

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params

  const category = await Category.findByIdAndDelete(id)

  if (!category) {
    return res.status(404).json({
      success: false,
      error: { message: 'Category not found', details: [{ field: 'id', msg: 'Category not found' }] }
    })
  }

  // Unassign tasks from this category
  await Task.updateMany({ category: id }, { $set: { category: null } })

  res.json({ success: true, data: { _id: id } })
})