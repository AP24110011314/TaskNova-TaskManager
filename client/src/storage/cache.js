import { CACHE_KEYS } from '../utils/constants'

export function getCachedTasks() {
  try {
    const data = localStorage.getItem(CACHE_KEYS.TASKS)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setCachedTasks(tasks) {
  try {
    localStorage.setItem(CACHE_KEYS.TASKS, JSON.stringify(tasks))
  } catch (error) {
    console.error('Failed to cache tasks:', error)
  }
}

export function updateCachedTasks(updater) {
  const tasks = getCachedTasks() || []
  setCachedTasks(updater(tasks))
}

export function getCachedCategories() {
  try {
    const data = localStorage.getItem(CACHE_KEYS.CATEGORIES)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setCachedCategories(categories) {
  try {
    localStorage.setItem(CACHE_KEYS.CATEGORIES, JSON.stringify(categories))
  } catch (error) {
    console.error('Failed to cache categories:', error)
  }
}

export function updateCachedCategories(updater) {
  const categories = getCachedCategories() || []
  setCachedCategories(updater(categories))
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEYS.TASKS)
  localStorage.removeItem(CACHE_KEYS.CATEGORIES)
}