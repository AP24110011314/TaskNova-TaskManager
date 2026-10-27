import express from 'express'
import { body, param, query } from 'express-validator'
import { validate } from '../middleware/validate.js'
import * as taskController from '../controllers/taskController.js'

const router = express.Router()

const taskCreateValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }).withMessage('Title must be 120 characters or less'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be 1000 characters or less'),
  body('category').optional({ nullable: true }).isMongoId().withMessage('Invalid category ID'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid due date format').toDate(),
  body('tags').optional().isArray({ max: 10 }).withMessage('Maximum 10 tags allowed'),
  body('tags.*').optional().isString().isLength({ max: 20 }).withMessage('Each tag must be 20 characters or less'),
  body('clientId').optional().isString()
]

const taskUpdateValidation = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 120 }).withMessage('Title must be 120 characters or less'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description must be 1000 characters or less'),
  body('category').optional({ nullable: true }).isMongoId().withMessage('Invalid category ID'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
  body('status').optional().isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Invalid due date format').toDate(),
  body('tags').optional().isArray({ max: 10 }).withMessage('Maximum 10 tags allowed'),
  body('tags.*').optional().isString().isLength({ max: 20 }).withMessage('Each tag must be 20 characters or less')
]

const statusValidation = [
  body('status').isIn(['todo', 'in-progress', 'done']).withMessage('Invalid status')
]

router.get('/', taskController.getTasks)

router.post('/', taskCreateValidation, validate, taskController.createTask)

router.get('/:id',
  param('id').isMongoId().withMessage('Invalid task ID'),
  validate,
  taskController.getTaskById
)

router.put('/:id',
  param('id').isMongoId().withMessage('Invalid task ID'),
  taskUpdateValidation,
  validate,
  taskController.updateTask
)

router.patch('/:id/status',
  param('id').isMongoId().withMessage('Invalid task ID'),
  statusValidation,
  validate,
  taskController.updateTaskStatus
)

router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid task ID'),
  validate,
  taskController.deleteTask
)

router.delete('/',
  query('status').optional().isIn(['done']).withMessage('Only status=done is supported'),
  validate,
  taskController.bulkClearDone
)

export default router