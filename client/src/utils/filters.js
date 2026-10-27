import { parseISO, isPast, startOfDay, endOfDay, addDays } from 'date-fns'

export function applyFilters(tasks, filters) {
  let filtered = [...tasks]

  // Text search
  if (filters.q && filters.q.trim()) {
    const searchTerm = filters.q.trim().toLowerCase()
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(searchTerm) ||
      (task.description && task.description.toLowerCase().includes(searchTerm))
    )
  }

  // Category filter
  if (filters.category) {
    if (filters.category === 'none') {
      filtered = filtered.filter(task => !task.category)
    } else {
      filtered = filtered.filter(task => task.category?._id === filters.category)
    }
  }

  // Priority filter (multi-select)
  if (filters.priority) {
    const priorities = filters.priority.split(',').map(p => p.trim()).filter(Boolean)
    if (priorities.length > 0) {
      filtered = filtered.filter(task => priorities.includes(task.priority))
    }
  }

  // Status filter (multi-select)
  if (filters.status) {
    const statuses = filters.status.split(',').map(s => s.trim()).filter(Boolean)
    if (statuses.length > 0) {
      filtered = filtered.filter(task => statuses.includes(task.status))
    }
  }

  // Tag filter
  if (filters.tag) {
    const tag = filters.tag.trim().toLowerCase()
    filtered = filtered.filter(task =>
      (task.tags || []).some(t => t.toLowerCase() === tag)
    )
  }

  // Due date range
  if (filters.dueFrom || filters.dueTo) {
    filtered = filtered.filter(task => {
      if (!task.dueDate) return false
      const dueDate = parseISO(task.dueDate)
      if (filters.dueFrom) {
        const fromDate = parseISO(filters.dueFrom)
        if (dueDate < fromDate) return false
      }
      if (filters.dueTo) {
        const toDate = parseISO(filters.dueTo)
        if (dueDate > toDate) return false
      }
      return true
    })
  }

  // Overdue filter
  if (filters.overdue === 'true') {
    filtered = filtered.filter(task =>
      task.dueDate &&
      isPast(parseISO(task.dueDate)) &&
      task.status !== 'done'
    )
  }

  // Smart groups
  if (filters.group) {
    const now = new Date()
    const todayStart = startOfDay(now)
    const todayEnd = endOfDay(now)
    const weekEnd = addDays(todayEnd, 7)

    filtered = filtered.filter(task => {
      if (!task.dueDate) {
        return filters.group === 'nodate'
      }
      const dueDate = parseISO(task.dueDate)

      switch (filters.group) {
        case 'today':
          return dueDate >= todayStart && dueDate <= todayEnd
        case 'upcoming':
          return dueDate > todayEnd && dueDate <= weekEnd
        case 'overdue':
          return dueDate < now && task.status !== 'done'
        case 'nodate':
          return false
        default:
          return true
      }
    })
  }

  // Sort
  const sort = filters.sort || '-createdAt'
  filtered.sort((a, b) => {
    const field = sort.startsWith('-') ? sort.slice(1) : sort
    const order = sort.startsWith('-') ? -1 : 1

    let aVal = a[field]
    let bVal = b[field]

    if (field === 'priority') {
      const rank = { urgent: 4, high: 3, medium: 2, low: 1 }
      aVal = rank[a.priority] || 2
      bVal = rank[b.priority] || 2
    }

    if (aVal instanceof Date || (typeof aVal === 'string' && aVal.includes('T'))) {
      aVal = new Date(aVal).getTime()
      bVal = new Date(bVal).getTime()
    }

    if (aVal < bVal) return -1 * order
    if (aVal > bVal) return 1 * order
    return 0
  })

  return filtered
}

export function paginate(items, page = 1, limit = 20) {
  const start = (page - 1) * limit
  const end = start + limit
  return {
    data: items.slice(start, end),
    meta: {
      total: items.length,
      page,
      limit,
      pages: Math.max(1, Math.ceil(items.length / limit))
    }
  }
}