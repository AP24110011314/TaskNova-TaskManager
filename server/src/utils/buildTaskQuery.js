export function buildTaskQuery(query) {
  const {
    q,
    category,
    priority,
    status,
    tag,
    dueFrom,
    dueTo,
    overdue,
    group,
    sort = '-createdAt',
    page = 1,
    limit = 20
  } = query

  const filter = {}
  const pageNum = Math.max(1, parseInt(page))
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)))

  // Text search
  if (q && q.trim()) {
    const searchTerm = q.trim()
    if (searchTerm.length >= 3) {
      filter.$text = { $search: searchTerm }
    } else {
      // For short queries, use regex on title with escaped special characters
      const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      filter.title = { $regex: escapedTerm, $options: 'i' }
    }
  }

  // Category filter
  if (category) {
    if (category === 'none') {
      filter.category = null
    } else {
      filter.category = category
    }
  }

  // Priority filter (multi-select)
  if (priority) {
    const priorities = priority.split(',').map(p => p.trim()).filter(Boolean)
    if (priorities.length > 0) {
      filter.priority = { $in: priorities }
    }
  }

  // Status filter (multi-select)
  if (status) {
    const statuses = status.split(',').map(s => s.trim()).filter(Boolean)
    if (statuses.length > 0) {
      filter.status = { $in: statuses }
    }
  }

  // Tag filter
  if (tag) {
    filter.tags = tag.trim().toLowerCase()
  }

  // Due date range
  if (dueFrom || dueTo) {
    filter.dueDate = {}
    if (dueFrom) {
      const fromDate = new Date(dueFrom)
      fromDate.setHours(0, 0, 0, 0)
      filter.dueDate.$gte = fromDate
    }
    if (dueTo) {
      const toDate = new Date(dueTo)
      toDate.setHours(23, 59, 59, 999)
      filter.dueDate.$lte = toDate
    }
  }

  // Overdue filter
  if (overdue === 'true') {
    const now = new Date()
    filter.dueDate = { $lt: now }
    filter.status = { $ne: 'done' }
  }

  // Smart groups
  if (group) {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1)
    const weekEnd = new Date(todayStart.getTime() + 7 * 24 * 60 * 60 * 1000)

    switch (group) {
      case 'today':
        filter.dueDate = { $gte: todayStart, $lte: todayEnd }
        break
      case 'upcoming':
        filter.dueDate = { $gt: todayEnd, $lte: weekEnd }
        break
      case 'overdue':
        filter.dueDate = { $lt: now }
        filter.status = { $ne: 'done' }
        break
      case 'nodate':
        filter.dueDate = null
        break
    }
  }

  // Build sort
  let sortObj = {}
  if (sort === '-priority' || sort === 'priority') {
    // Priority sorting will be handled in aggregation
    sortObj = { priority: sort === '-priority' ? -1 : 1, dueDate: 1, createdAt: -1 }
  } else {
    const sortField = sort.startsWith('-') ? sort.slice(1) : sort
    const sortOrder = sort.startsWith('-') ? -1 : 1
    sortObj = { [sortField]: sortOrder }
  }

  return { filter, sort: sortObj, page: pageNum, limit: limitNum }
}

export function getPrioritySortStage(sortOrder = -1) {
  return {
    $addFields: {
      priorityRank: {
        $switch: {
          branches: [
            { case: { $eq: ['$priority', 'urgent'] }, then: 4 },
            { case: { $eq: ['$priority', 'high'] }, then: 3 },
            { case: { $eq: ['$priority', 'medium'] }, then: 2 },
            { case: { $eq: ['$priority', 'low'] }, then: 1 }
          ],
          default: 2
        }
      }
    }
  }
}