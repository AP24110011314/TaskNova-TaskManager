import { useFilters } from '../../hooks/useFilters'

export default function SortSelect() {
  const { filters, setFilters } = useFilters()

  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'dueDate', label: 'Due Date' },
    { value: '-priority', label: 'Priority' }
  ]

  return (
    <select
      value={filters.sort}
      onChange={e => setFilters({ sort: e.target.value })}
      className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-2xs transition-colors"
      aria-label="Sort by"
    >
      {sortOptions.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}