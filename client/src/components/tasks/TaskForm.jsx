import { useState, useEffect, useRef } from 'react'
import { useTasks } from '../../context/TaskContext'
import { PRIORITIES, STATUS_OPTIONS } from '../../utils/constants'
import { formatDateForInput } from '../../utils/dates'
import Modal from '../common/Modal'
import ConfirmDialog from '../common/ConfirmDialog'

export default function TaskForm({
  initialTask = null,
  isOpen = true,
  onClose,
  onSuccess
}) {
  const { categories, createTask, updateTask, deleteTask } = useTasks()
  const [formData, setFormData] = useState(() => ({
    title: initialTask?.title || '',
    description: initialTask?.description || '',
    category: initialTask?.category?._id || initialTask?.category || '',
    priority: initialTask?.priority || 'medium',
    status: initialTask?.status || 'todo',
    dueDate: formatDateForInput(initialTask?.dueDate) || '',
    tags: ''
  }))
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState(() => initialTask?.tags || [])
  const [errors, setErrors] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const titleInputRef = useRef(null)

  const isEditing = !!initialTask

  useEffect(() => {
    const timer = setTimeout(() => titleInputRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  const validate = () => {
    const newErrors = {}
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length > 120) {
      newErrors.title = 'Title must be 120 characters or less'
    }
    if (formData.description.length > 1000) {
      newErrors.description = 'Description must be 1000 characters or less'
    }
    if (tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTagKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim().toLowerCase().slice(0, 20)
      if (!tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1))
    }
  }

  const handleTagBlur = () => {
    if (tagInput.trim()) {
      const newTag = tagInput.trim().toLowerCase().slice(0, 20)
      if (!tags.includes(newTag) && tags.length < 10) {
        setTags([...tags, newTag])
      }
      setTagInput('')
    }
  }

  const removeTag = (tag) => {
    setTags(tags.filter(t => t !== tag))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category || null,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate || null,
      tags
    }

    try {
      if (isEditing) {
        await updateTask(initialTask._id, taskData)
      } else {
        await createTask(taskData)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      if (err.response?.data?.error?.details) {
        const fieldErrors = {}
        err.response.data.error.details.forEach(d => {
          fieldErrors[d.field] = d.msg
        })
        setErrors(fieldErrors)
      }
    }
  }

  const handleDelete = async () => {
    if (isEditing) {
      await deleteTask(initialTask._id)
      onSuccess?.()
    }
    onClose()
  }

  const priorityColorMap = {
    low: 'slate',
    medium: 'blue',
    high: 'orange',
    urgent: 'red'
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Task' : 'New Task'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            ref={titleInputRef}
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className={`w-full px-3 py-2 bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.title ? 'border-red-500' : 'border-slate-300'
            } placeholder-slate-400`}
            maxLength={120}
            placeholder="Enter task title"
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          {errors.title && <p id="title-error" className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className={`w-full px-3 py-2 bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.description ? 'border-red-500' : 'border-slate-300'
            } placeholder-slate-400`}
            maxLength={1000}
            placeholder="Add a description (optional)"
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">None</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id} style={{ color: cat.color }}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Priority
          </label>
          <div className="flex gap-2" role="radiogroup" aria-label="Priority">
            {PRIORITIES.map(p => {
              const color = priorityColorMap[p.value]
              const isSelected = formData.priority === p.value
              return (
                <label
                  key={p.value}
                  className={`flex-1 px-3 py-2 text-center text-sm font-medium rounded-lg border-2 cursor-pointer transition-colors ${
                    isSelected
                      ? `border-${color}-500 bg-${color}-50`
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={isSelected}
                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                    className="sr-only"
                  />
                  {p.label}
                </label>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Status
          </label>
          <div className="flex gap-2" role="radiogroup" aria-label="Status">
            {STATUS_OPTIONS.map(s => (
              <label
                key={s.value}
                className={`flex-1 px-3 py-2 text-center text-sm font-medium rounded-lg border-2 cursor-pointer transition-colors ${
                  formData.status === s.value
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={formData.status === s.value}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  className="sr-only"
                />
                {s.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded text-sm"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-slate-400 hover:text-slate-600"
                  aria-label={`Remove tag ${tag}`}
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" x2="6" y1="6" y2="18"/>
                    <line x1="6" x2="18" y1="6" y2="18"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={handleTagBlur}
              className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-400"
              placeholder="Add tag (press Enter or comma)"
              maxLength={20}
            />
            {errors.tags && <p className="mt-1 text-sm text-red-500">{errors.tags}</p>}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Press Enter or comma to add tags. Max 10 tags, 20 characters each.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          {isEditing && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
          >
            {isEditing ? 'Save' : 'Create'}
          </button>
        </div>
      </form>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </Modal>
  )
}