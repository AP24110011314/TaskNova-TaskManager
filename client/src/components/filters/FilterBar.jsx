import { useState } from 'react'
import { useTasks } from '../../context/TaskContext'
import { useFilters } from '../../hooks/useFilters'
import { PRIORITIES, STATUS_OPTIONS } from '../../utils/constants'

export default function FilterBar() {
  const { categories } = useTasks()
  const { filters, setFilters, clearFilters } = useFilters()
  const [showFilters, setShowFilters] = useState(false)

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== '' && key !== 'sort' && key !== 'page' && key !== 'limit'
  ).length

  const handlePriorityChange = (priority) => {
    const current = filters.priority ? filters.priority.split(',').map(p => p.trim()).filter(Boolean) : []
    const updated = current.includes(priority)
      ? current.filter(p => p !== priority)
      : [...current, priority]
    setFilters({ priority: updated.join(',') })
  }

  const handleStatusChange = (status) => {
    const current = filters.status ? filters.status.split(',').map(s => s.trim()).filter(Boolean) : []
    const updated = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status]
    setFilters({ status: updated.join(',') })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900 text-sm">Filters</h3>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          {showFilters ? 'Hide' : 'Show'} filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
        </button>
      </div>

      {showFilters && (
        <div className="space-y-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
              <select
                value={filters.category}
                onChange={e => setFilters({ category: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 hover:border-slate-400 transition-colors"
              >
                <option value="">All Categories</option>
                <option value="none">Uncategorized</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Priority</label>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {PRIORITIES.map(p => {
                  const isSelected = filters.priority?.split(',').includes(p.value)
                  return (
                    <label
                      key={p.value}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? `${p.color} ring-2 ring-indigo-500 ring-offset-1`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handlePriorityChange(p.value)}
                        className="sr-only"
                      />
                      {p.label}
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Status</label>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {STATUS_OPTIONS.map(s => {
                  const isSelected = filters.status?.split(',').includes(s.value)
                  return (
                    <label
                      key={s.value}
                      className={`px-2.5 py-1 text-xs font-medium rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500 ring-offset-1 font-semibold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleStatusChange(s.value)}
                        className="sr-only"
                      />
                      {s.label}
                    </label>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Tag</label>
              <input
                type="text"
                value={filters.tag}
                onChange={e => setFilters({ tag: e.target.value })}
                placeholder="e.g. urgent, design"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 hover:border-slate-400 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Due Date From</label>
              <input
                type="date"
                value={filters.dueFrom}
                onChange={e => setFilters({ dueFrom: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 hover:border-slate-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Due Date To</label>
              <input
                type="date"
                value={filters.dueTo}
                onChange={e => setFilters({ dueTo: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 hover:border-slate-400 transition-colors"
              />
            </div>

            <div className="flex items-end">
              <label className="h-10 flex items-center gap-2 cursor-pointer px-3 rounded-lg bg-slate-100 hover:bg-slate-200/60 border border-slate-300 transition-colors w-full">
                <input
                  type="checkbox"
                  checked={filters.overdue === 'true'}
                  onChange={e => setFilters({ overdue: e.target.checked ? 'true' : '' })}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700">Overdue only</span>
              </label>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="px-4 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}