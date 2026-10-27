import { useMemo } from 'react'
import { parseISO, startOfDay, endOfDay, addDays } from 'date-fns'
import { useTasks } from '../../hooks/useTasks'
import { useFilters } from '../../hooks/useFilters'
import { SMART_GROUPS } from '../../utils/constants'

function calculateGroupCounts(tasks) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekEnd = addDays(todayEnd, 7)

  return {
    all: tasks.length,
    today: tasks.filter(t => {
      if (!t.dueDate) return false
      const d = parseISO(t.dueDate)
      return d >= todayStart && d <= todayEnd
    }).length,
    upcoming: tasks.filter(t => {
      if (!t.dueDate) return false
      const d = parseISO(t.dueDate)
      return d > todayEnd && d <= weekEnd
    }).length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false
      const d = parseISO(t.dueDate)
      return d < todayStart
    }).length,
    nodate: tasks.filter(t => !t.dueDate).length
  }
}

export default function TaskGroups({ onSelectGroup }) {
  const { tasks } = useTasks()
  const { filters, setFilters } = useFilters()

  const counts = useMemo(() => calculateGroupCounts(tasks), [tasks])

  const handleGroupClick = (groupId) => {
    if (groupId === 'all') {
      setFilters({ group: '' })
    } else {
      setFilters({ group: groupId })
    }
    onSelectGroup?.(groupId)
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4" role="navigation" aria-label="Smart task groups">
      {SMART_GROUPS.filter(g => g.id !== 'all').map(g => {
        const isSelected = filters.group === g.id
        const count = counts[g.id] || 0
        const isOverdue = g.id === 'overdue'

        return (
          <button
            key={g.id}
            type="button"
            onClick={() => handleGroupClick(g.id)}
            className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
              isSelected
                ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                : isOverdue && count > 0
                ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}
          >
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider ${
                isSelected ? 'text-indigo-700' : isOverdue && count > 0 ? 'text-rose-700' : 'text-slate-500'
              }`}>
                {g.label}
              </p>
              <p className={`text-lg font-bold mt-0.5 ${
                isSelected ? 'text-indigo-900' : isOverdue && count > 0 ? 'text-rose-900' : 'text-slate-900'
              }`}>
                {count}
              </p>
            </div>
            {isOverdue && count > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        )
      })}
    </div>
  )
}
