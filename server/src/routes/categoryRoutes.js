import express from 'express'
import { body, param } from 'express-validator'
import { validate } from '../middleware/validate.js'
import * as categoryController from '../controllers/categoryController.js'

const router = express.Router()

const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 40 }).withMessage('Name must be 40 characters or less'),
  body('color').optional().matches(/^#([0-9a-fA-F]{6})$/).withMessage('Color must be a valid hex color')
]

router.get('/', categoryController.getCategories)

router.post('/', categoryValidation, validate, categoryController.createCategory)

router.put('/:id',
  param('id').isMongoId().withMessage('Invalid category ID'),
  categoryValidation,
  validate,
  categoryController.updateCategory
)

router.delete('/:id',
  param('id').isMongoId().withMessage('Invalid category ID'),
  validate,
  categoryController.deleteCategory
)

export default router