import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Category from './models/Category.js'
import Task from './models/Task.js'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart-todo'

const categories = [
  { name: 'Work', color: '#3b82f6' },
  { name: 'Personal', color: '#10b981' },
  { name: 'Study', color: '#f59e0b' },
  { name: 'Health', color: '#ef4444' }
]

const now = new Date()
const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

const tasks = [
  // Work tasks
  {
    title: 'Finish quarterly report',
    description: 'Complete the Q4 financial report and send to manager',
    category: 'Work',
    priority: 'high',
    status: 'in-progress',
    dueDate: tomorrow,
    tags: ['report', 'finance', 'urgent']
  },
  {
    title: 'Team meeting preparation',
    description: 'Prepare slides for weekly team sync',
    category: 'Work',
    priority: 'medium',
    status: 'todo',
    dueDate: today,
    tags: ['meeting', 'slides']
  },
  {
    title: 'Code review for PR #234',
    description: 'Review the new authentication module',
    category: 'Work',
    priority: 'urgent',
    status: 'todo',
    dueDate: today,
    tags: ['code-review', 'auth']
  },
  {
    title: 'Update documentation',
    description: 'Update API docs with new endpoints',
    category: 'Work',
    priority: 'low',
    status: 'done',
    dueDate: lastWeek,
    tags: ['docs', 'api']
  },
  {
    title: 'Deploy to staging',
    description: 'Deploy latest build to staging environment',
    category: 'Work',
    priority: 'high',
    status: 'done',
    dueDate: yesterday,
    tags: ['deploy', 'staging']
  },

  // Personal tasks
  {
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, fruits, vegetables',
    category: 'Personal',
    priority: 'medium',
    status: 'todo',
    dueDate: today,
    tags: ['shopping', 'home']
  },
  {
    title: 'Call dentist for appointment',
    description: 'Schedule annual checkup',
    category: 'Personal',
    priority: 'low',
    status: 'todo',
    dueDate: nextWeek,
    tags: ['health', 'appointment']
  },
  {
    title: 'Pay electricity bill',
    description: 'Due date is tomorrow',
    category: 'Personal',
    priority: 'urgent',
    status: 'in-progress',
    dueDate: tomorrow,
    tags: ['bills', 'urgent']
  },
  {
    title: 'Plan weekend trip',
    description: 'Research destinations and book accommodation',
    category: 'Personal',
    priority: 'medium',
    status: 'todo',
    dueDate: nextWeek,
    tags: ['travel', 'planning']
  },

  // Study tasks
  {
    title: 'Complete React course module 3',
    description: 'Learn about hooks and context',
    category: 'Study',
    priority: 'high',
    status: 'in-progress',
    dueDate: today,
    tags: ['react', 'learning', 'course']
  },
  {
    title: 'Read "Clean Code" chapter 5',
    description: 'Focus on error handling patterns',
    category: 'Study',
    priority: 'medium',
    status: 'todo',
    dueDate: nextWeek,
    tags: ['reading', 'clean-code']
  },
  {
    title: 'Practice algorithm problems',
    description: 'Solve 3 medium LeetCode problems',
    category: 'Study',
    priority: 'high',
    status: 'todo',
    dueDate: tomorrow,
    tags: ['algorithms', 'leetcode', 'practice']
  },

  // Health tasks
  {
    title: 'Morning run - 5km',
    description: 'Interval training',
    category: 'Health',
    priority: 'medium',
    status: 'done',
    dueDate: yesterday,
    tags: ['exercise', 'running']
  },
  {
    title: 'Meal prep for the week',
    description: 'Cook healthy lunches for work',
    category: 'Health',
    priority: 'high',
    status: 'todo',
    dueDate: today,
    tags: ['nutrition', 'meal-prep']
  },
  {
    title: 'Meditation - 20 minutes',
    description: 'Guided mindfulness session',
    category: 'Health',
    priority: 'low',
    status: 'todo',
    dueDate: null,
    tags: ['mindfulness', 'mental-health']
  }
]

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await Task.deleteMany({})
    await Category.deleteMany({})
    console.log('Cleared existing data')

    // Insert categories
    const createdCategories = await Category.insertMany(categories)
    console.log(`Created ${createdCategories.length} categories`)

    // Map category names to IDs
    const categoryMap = {}
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id
    })

    // Prepare tasks with category IDs and completedAt for done tasks
    const tasksWithCategoryIds = tasks.map(task => ({
      ...task,
      category: categoryMap[task.category] || null,
      completedAt: task.status === 'done' ? new Date() : null
    }))

    // Insert tasks
    const createdTasks = await Task.insertMany(tasksWithCategoryIds)
    console.log(`Created ${createdTasks.length} tasks`)

    console.log('Seed completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seed()