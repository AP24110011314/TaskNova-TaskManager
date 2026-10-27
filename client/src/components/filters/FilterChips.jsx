import { useTasks } from '../../hooks/useTasks'
import { useFilters } from '../../hooks/useFilters'
import { PRIORITIES, STATUS_OPTIONS } from '../../utils/constants'

export default function FilterChips() {
  const { filters, setFilters, clearFilter, clearFilters } = useFilters()
  const { categories } = useTasks()

  const activeFilters = []

  if (filters.q) {
    activeFilters.push({
      key: 'q',
      label: 'Search',
      value: `"${filters.q}"`,
      onRemove: () => clearFilter('q')
    })
  }

  if (filters.category) {
    const cat = categories.find(c => c._id === filters.category)
    activeFilters.push({
      key: 'category',
      label: 'Category',
      value: filters.category === 'none' ? 'Uncategorized' : (cat ? cat.name : filters.category),
      onRemove: () => clearFilter('category')
    })
  }

  if (filters.priority) {
    filters.priority.split(',').map(p => p.trim()).filter(Boolean).forEach(p => {
      const priority = PRIORITIES.find(pr => pr.value === p)
      activeFilters.push({
        key: `priority-${p}`,
        label: 'Priority',
        value: priority?.label || p,
        onRemove: () => {
          const remaining = filters.priority.split(',').map(x => x.trim()).filter(x => x && x !== p)
          setFilters({ priority: remaining.join(',') })
        }
      })
    })
  }

  if (filters.status) {
    filters.status.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
      const status = STATUS_OPTIONS.find(st => st.value === s)
      activeFilters.push({
        key: `status-${s}`,
        label: 'Status',
        value: status?.label || s,
        onRemove: () => {
          const remaining = filters.status.split(',').map(x => x.trim()).filter(x => x && x !== s)
          setFilters({ status: remaining.join(',') })
        }
      })
    })
  }

  if (filters.tag) {
    activeFilters.push({
      key: 'tag',
      label: 'Tag',
      value: `#${filters.tag}`,
      onRemove: () => clearFilter('tag')
    })
  }

  if (filters.dueFrom) {
    activeFilters.push({
      key: 'dueFrom',
      label: 'Due from',
      value: filters.dueFrom,
      onRemove: () => clearFilter('dueFrom')
    })
  }

  if (filters.dueTo) {
    activeFilters.push({
      key: 'dueTo',
      label: 'Due to',
      value: filters.dueTo,
      onRemove: () => clearFilter('dueTo')
    })
  }

  if (filters.overdue === 'true') {
    activeFilters.push({
      key: 'overdue',
      label: 'Filter',
      value: 'Overdue only',
      onRemove: () => clearFilter('overdue')
    })
  }

  if (filters.group && filters.group !== 'all') {
    const groupLabels = { today: 'Today', upcoming: 'Upcoming', overdue: 'Overdue', nodate: 'No date' }
    activeFilters.push({
      key: 'group',
      label: 'Smart Group',
      value: groupLabels[filters.group] || filters.group,
      onRemove: () => clearFilter('group')
    })
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200"
        >
          <span className="text-indigo-500">{filter.label}:</span>
          <span className="font-semibold">{filter.value}</span>
          <button
            onClick={filter.onRemove}
            className="ml-1 p-0.5 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 rounded-full transition-colors"
            aria-label={`Remove ${filter.label} ${filter.value} filter`}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" x2="6" y1="6" y2="18"/>
              <line x1="6" x2="18" y1="6" y2="18"/>
            </svg>
          </button>
        </span>
      ))}
      <button
        onClick={clearFilters}
        className="px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-red-600 transition-colors"
      >
        Clear all
      </button>
    </div>
  )
}