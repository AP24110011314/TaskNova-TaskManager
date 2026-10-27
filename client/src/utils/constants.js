export const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-700' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-50 text-blue-700' },
  { value: 'high', label: 'High', color: 'bg-orange-50 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-50 text-red-700' }
]

export const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
]

export const PRIORITY_RANK = { urgent: 4, high: 3, medium: 2, low: 1 }

export const SMART_GROUPS = [
  { id: 'all', label: 'All Tasks' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'nodate', label: 'No Date' }
]

export const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
]

export const CACHE_KEYS = {
  TASKS: 'std:tasks:v1',
  CATEGORIES: 'std:categories:v1',
  QUEUE: 'std:queue:v1',
  THEME: 'std:theme'
}

export const QUEUE_TYPES = {
  CREATE_TASK: 'CREATE_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  TOGGLE_STATUS: 'TOGGLE_STATUS',
  CREATE_CATEGORY: 'CREATE_CATEGORY',
  UPDATE_CATEGORY: 'UPDATE_CATEGORY',
  DELETE_CATEGORY: 'DELETE_CATEGORY'
}