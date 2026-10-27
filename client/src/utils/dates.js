import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns'

export function formatDueDate(dateString) {
  if (!dateString) return null
  const date = parseISO(dateString)

  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isPast(date)) {
    const daysOverdue = Math.ceil((new Date() - date) / (1000 * 60 * 60 * 24))
    return `Overdue by ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`
  }
  return format(date, 'MMM d')
}

export function getDueDateLabel(dateString) {
  if (!dateString) return { label: 'No date', isOverdue: false, variant: 'default' }

  const date = parseISO(dateString)
  const now = new Date()

  if (isToday(date)) {
    return { label: 'Today', isOverdue: false, variant: 'today' }
  }
  if (isTomorrow(date)) {
    return { label: 'Tomorrow', isOverdue: false, variant: 'upcoming' }
  }
  if (isPast(date)) {
    const daysOverdue = Math.ceil((now - date) / (1000 * 60 * 60 * 24))
    return {
      label: `Overdue ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''}`,
      isOverdue: true,
      variant: 'overdue'
    }
  }
  return { label: format(date, 'MMM d'), isOverdue: false, variant: 'upcoming' }
}

export function isOverdue(dateString, status) {
  if (!dateString || status === 'done') return false
  return isPast(parseISO(dateString))
}

export function formatDateForInput(dateString) {
  if (!dateString) return ''
  return format(parseISO(dateString), 'yyyy-MM-dd')
}