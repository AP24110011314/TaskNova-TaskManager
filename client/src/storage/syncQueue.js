import { CACHE_KEYS, QUEUE_TYPES } from '../utils/constants'

export { QUEUE_TYPES }

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function getQueue() {
  try {
    const data = localStorage.getItem(CACHE_KEYS.QUEUE)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function setQueue(queue) {
  try {
    localStorage.setItem(CACHE_KEYS.QUEUE, JSON.stringify(queue))
  } catch (error) {
    console.error('Failed to save queue:', error)
  }
}

export function addToQueue(type, payload) {
  const queue = getQueue()
  const item = {
    id: generateId(),
    type,
    payload,
    ts: Date.now()
  }
  queue.push(item)
  setQueue(queue)
  return item
}

export function removeFromQueue(id) {
  const queue = getQueue()
  const filtered = queue.filter(item => item.id !== id)
  setQueue(filtered)
}

export function clearQueue() {
  setQueue([])
}

export function getPendingCount() {
  return getQueue().length
}

export function createTaskQueueItem(task, clientId) {
  return addToQueue(QUEUE_TYPES.CREATE_TASK, { task, clientId })
}

export function updateTaskQueueItem(taskId, updates, clientId) {
  return addToQueue(QUEUE_TYPES.UPDATE_TASK, { taskId, updates, clientId })
}

export function deleteTaskQueueItem(taskId) {
  return addToQueue(QUEUE_TYPES.DELETE_TASK, { taskId })
}

export function toggleStatusQueueItem(taskId, status) {
  return addToQueue(QUEUE_TYPES.TOGGLE_STATUS, { taskId, status })
}

export function createCategoryQueueItem(category) {
  return addToQueue(QUEUE_TYPES.CREATE_CATEGORY, { category })
}

export function updateCategoryQueueItem(categoryId, updates) {
  return addToQueue(QUEUE_TYPES.UPDATE_CATEGORY, { categoryId, updates })
}

export function deleteCategoryQueueItem(categoryId) {
  return addToQueue(QUEUE_TYPES.DELETE_CATEGORY, { categoryId })
}