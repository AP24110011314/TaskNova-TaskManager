import { useState } from 'react'
import { PRESET_COLORS } from '../../utils/constants'

export default function CategoryForm({
  initialData = null,
  onSubmit,
  onCancel,
  isSubmitting = false
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    color: initialData?.color || '#3b82f6'
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }
    if (formData.name.trim().length > 40) {
      setError('Category name must be 40 characters or less')
      return
    }

    try {
      await onSubmit({ name: formData.name.trim(), color: formData.color })
    } catch (err) {
      setError(err.response?.data?.error?.message || err.message || 'Failed to save category')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={e => {
            setFormData({ ...formData, name: e.target.value })
            if (error) setError('')
          }}
          className={`w-full px-3 py-2 bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            error ? 'border-red-500' : 'border-slate-300'
          } placeholder-slate-400`}
          maxLength={40}
          placeholder="e.g. Work, Personal, Study"
          required
          autoFocus
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Color
        </label>
        <div className="flex flex-wrap gap-2.5">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-8 h-8 rounded-full border-2 transition-all ${
                formData.color === color
                  ? 'scale-110 border-indigo-600 ring-2 ring-indigo-400'
                  : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Select color ${color}`}
              aria-pressed={formData.color === color}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {initialData ? 'Save Changes' : 'Create Category'}
        </button>
      </div>
    </form>
  )
}
