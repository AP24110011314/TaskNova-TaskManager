import { useState, useEffect, useCallback, useRef } from 'react'
import { TaskContext } from './TaskContextCore'
import { tasksApi, categoriesApi, statsApi } from '../api'
import {
  getCachedTasks, setCachedTasks, updateCachedTasks,
  getCachedCategories, setCachedCategories, updateCachedCategories,
} from '../storage/cache'
import {
  getQueue, removeFromQueue, getPendingCount,
  createTaskQueueItem, updateTaskQueueItem, deleteTaskQueueItem,
  createCategoryQueueItem, updateCategoryQueueItem, deleteCategoryQueueItem,
  QUEUE_TYPES
} from '../storage/syncQueue'
import { applyFilters, paginate } from '../utils/filters'
import { generateClientId } from '../utils/helpers'
import { useToast } from '../hooks/useToast'

export function TaskProvider({ children }) {
  const toast = useToast()
  const [tasks, setTasks] = useState(() => getCachedTasks() || [])
  const [categories, setCategories] = useState(() => getCachedCategories() || [])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pendingCount, setPendingCount] = useState(() => getPendingCount())
  const [syncStatus, setSyncStatus] = useState(() => {
    const count = getPendingCount()
    return count > 0 ? `Offline (${count} pending)` : 'Synced'
  })

  const isMounted = useRef(true)
  const syncIntervalRef = useRef(null)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  // Sync status update defined first to avoid TDZ / lint warnings
  const updateSyncStatus = useCallback(() => {
    const count = getPendingCount()
    setPendingCount(count)
    if (count > 0) {
      setSyncStatus(`Offline (${count} pending)`)
    } else {
      setSyncStatus('Synced')
    }
  }, [])

  // Fetch from API and update cache
  const refreshFromAPI = useCallback(async () => {
    try {
      const [tasksRes, categoriesRes, statsRes] = await Promise.all([
        tasksApi.getAll({ limit: 1000 }),
        categoriesApi.getAll(),
        statsApi.getAll()
      ])

      if (isMounted.current) {
        setTasks(tasksRes.data.data)
        setCategories(categoriesRes.data.data)
        setStats(statsRes.data.data)
        setCachedTasks(tasksRes.data.data)
        setCachedCategories(categoriesRes.data.data)
        setLoading(false)
        setError(null)
      }
    } catch (err) {
      if (isMounted.current) {
        console.error('Failed to refresh from API:', err)
        setError(err.message)
        setLoading(false)
      }
    }
  }, [])

  // Load from API on mount
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        await refreshFromAPI()
      } catch (err) {
        if (mounted) console.error(err)
      }
    }
    init()
    return () => { mounted = false }
  }, [refreshFromAPI])

  // Process queue
  const processQueue = useCallback(async () => {
    const queue = getQueue()
    if (queue.length === 0) return

    setSyncStatus('Syncing...')
    let syncedCount = 0

    for (const item of queue) {
      try {
        let result

        switch (item.type) {
          case QUEUE_TYPES.CREATE_TASK:
            result = await tasksApi.create({ ...item.payload.task, clientId: item.payload.clientId })
            // Replace temp ID with real ID in local state and cache
            setTasks(prev => prev.map(t =>
              t._id === `tmp_${item.payload.clientId}` ? result.data.data : t
            ))
            updateCachedTasks(prev => prev.map(t =>
              t._id === `tmp_${item.payload.clientId}` ? result.data.data : t
            ))
            break

          case QUEUE_TYPES.UPDATE_TASK:
            result = await tasksApi.update(item.payload.taskId, item.payload.updates)
            setTasks(prev => prev.map(t =>
              t._id === item.payload.taskId ? result.data.data : t
            ))
            updateCachedTasks(prev => prev.map(t =>
              t._id === item.payload.taskId ? result.data.data : t
            ))
            break

          case QUEUE_TYPES.DELETE_TASK:
            await tasksApi.delete(item.payload.taskId)
            setTasks(prev => prev.filter(t => t._id !== item.payload.taskId))
            updateCachedTasks(prev => prev.filter(t => t._id !== item.payload.taskId))
            break

          case QUEUE_TYPES.TOGGLE_STATUS:
            result = await tasksApi.updateStatus(item.payload.taskId, item.payload.status)
            setTasks(prev => prev.map(t =>
              t._id === item.payload.taskId ? result.data.data : t
            ))
            updateCachedTasks(prev => prev.map(t =>
              t._id === item.payload.taskId ? result.data.data : t
            ))
            break

          case QUEUE_TYPES.CREATE_CATEGORY:
            result = await categoriesApi.create(item.payload.category)
            setCategories(prev => [...prev, result.data.data])
            updateCachedCategories(prev => [...prev, result.data.data])
            break

          case QUEUE_TYPES.UPDATE_CATEGORY:
            result = await categoriesApi.update(item.payload.categoryId, item.payload.updates)
            setCategories(prev => prev.map(c =>
              c._id === item.payload.categoryId ? result.data.data : c
            ))
            updateCachedCategories(prev => prev.map(c =>
              c._id === item.payload.categoryId ? result.data.data : c
            ))
            break

          case QUEUE_TYPES.DELETE_CATEGORY:
            await categoriesApi.delete(item.payload.categoryId)
            setCategories(prev => prev.filter(c => c._id !== item.payload.categoryId))
            updateCachedCategories(prev => prev.filter(c => c._id !== item.payload.categoryId))
            // Unassign tasks
            setTasks(prev => prev.map(t =>
              t.category?._id === item.payload.categoryId ? { ...t, category: null } : t
            ))
            updateCachedTasks(prev => prev.map(t =>
              t.category?._id === item.payload.categoryId ? { ...t, category: null } : t
            ))
            break
        }

        removeFromQueue(item.id)
        syncedCount++
        updateSyncStatus()
      } catch (err) {
        if (err.response?.status === 409 || err.response?.status === 400) {
          // Validation error or duplicate - remove from queue and toast error
          console.warn('Queue item failed validation, removing:', item, err.response?.data)
          toast?.error?.(err.response?.data?.error?.message || 'Queued change failed validation')
          removeFromQueue(item.id)
          updateSyncStatus()
        } else if (err.isNetworkError || err.response?.status >= 500) {
          // Network or server error - stop and retry later
          console.warn('Queue processing stopped due to error:', err.message)
          break
        } else {
          // Other error - remove from queue
          console.error('Queue item failed:', item, err)
          removeFromQueue(item.id)
          updateSyncStatus()
        }
      }
    }

    if (syncedCount > 0) {
      toast?.success?.(`Back online, synced ${syncedCount} change${syncedCount > 1 ? 's' : ''}`)
    }

    // Refresh stats & fresh data after sync
    try {
      const [tasksRes, statsRes] = await Promise.all([
        tasksApi.getAll({ limit: 1000 }),
        statsApi.getAll()
      ])
      if (isMounted.current) {
        setTasks(tasksRes.data.data)
        setCachedTasks(tasksRes.data.data)
        setStats(statsRes.data.data)
      }
    } catch (err) {
      console.error('Failed to refresh data after sync:', err)
    }
  }, [updateSyncStatus, toast])

  // Queue processing on online, start, and interval
  useEffect(() => {
    const processOnStart = async () => {
      await processQueue()
    }
    processOnStart()

    // Process queue every 30 seconds
    syncIntervalRef.current = setInterval(() => {
      if (navigator.onLine) processQueue()
    }, 30000)

    return () => {
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current)
    }
  }, [processQueue])

  // Listen for online event
  useEffect(() => {
    const handleOnline = () => {
      processQueue()
    }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [processQueue])

  // Optimistic task mutations
  const createTask = useCallback(async (taskData) => {
    const clientId = generateClientId()
    const tempId = `tmp_${clientId}`

    const optimisticTask = {
      _id: tempId,
      clientId,
      ...taskData,
      category: taskData.category ? categories.find(c => c._id === taskData.category) : null,
      status: taskData.status || 'todo',
      completedAt: taskData.status === 'done' ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Optimistic update
    setTasks(prev => [optimisticTask, ...prev])
    updateCachedTasks(prev => [optimisticTask, ...(prev || [])])

    if (navigator.onLine) {
      try {
        const result = await tasksApi.create({ ...taskData, clientId })
        setTasks(prev => prev.map(t => t._id === tempId ? result.data.data : t))
        updateCachedTasks(prev => prev.map(t => t._id === tempId ? result.data.data : t))
        toast?.success?.('Task created')
      } catch (err) {
        if (err.isNetworkError || err.response?.status >= 500) {
          createTaskQueueItem(taskData, clientId)
          updateSyncStatus()
          toast?.info?.('Saved locally. Will sync when back online.')
        } else {
          // Rollback on validation error
          setTasks(prev => prev.filter(t => t._id !== tempId))
          updateCachedTasks(prev => prev.filter(t => t._id !== tempId))
          toast?.error?.(err.response?.data?.error?.message || 'Failed to create task')
          throw err
        }
      }
    } else {
      createTaskQueueItem(taskData, clientId)
      updateSyncStatus()
      toast?.info?.('Saved locally. Will sync when back online.')
    }

    return optimisticTask
  }, [categories, updateSyncStatus, toast])

  const updateTask = useCallback(async (taskId, updates) => {
    const originalTask = tasks.find(t => t._id === taskId)
    if (!originalTask) return

    const optimisticTask = { ...originalTask, ...updates, updatedAt: new Date().toISOString() }
    if (updates.status === 'done') optimisticTask.completedAt = new Date().toISOString()
    if (updates.status && updates.status !== 'done') optimisticTask.completedAt = null

    // Optimistically update category object if category ID is changing
    if ('category' in updates) {
      optimisticTask.category = updates.category ? categories.find(c => c._id === updates.category) : null
    }

    setTasks(prev => prev.map(t => t._id === taskId ? optimisticTask : t))
    updateCachedTasks(prev => prev.map(t => t._id === taskId ? optimisticTask : t))

    // If it's a temp task created offline, merge updates into the pending CREATE item
    if (taskId.startsWith('tmp_')) {
      const queue = getQueue()
      const item = queue.find(q => q.type === QUEUE_TYPES.CREATE_TASK && `tmp_${q.payload.clientId}` === taskId)
      if (item) {
        item.payload.task = { ...item.payload.task, ...updates }
        setQueue(queue)
        updateSyncStatus()
        return
      }
    }

    if (navigator.onLine) {
      try {
        const result = await tasksApi.update(taskId, updates)
        setTasks(prev => prev.map(t => t._id === taskId ? result.data.data : t))
        updateCachedTasks(prev => prev.map(t => t._id === taskId ? result.data.data : t))
      } catch (err) {
        if (err.isNetworkError || err.response?.status >= 500) {
          updateTaskQueueItem(taskId, updates, originalTask.clientId)
          updateSyncStatus()
        } else {
          // Rollback
          setTasks(prev => prev.map(t => t._id === taskId ? originalTask : t))
          updateCachedTasks(prev => prev.map(t => t._id === taskId ? originalTask : t))
          toast?.error?.(err.response?.data?.error?.message || 'Failed to update task')
          throw err
        }
      }
    } else {
      updateTaskQueueItem(taskId, updates, originalTask.clientId)
      updateSyncStatus()
    }
  }, [tasks, categories, updateSyncStatus, toast])

  const deleteTask = useCallback(async (taskId) => {
    const originalTask = tasks.find(t => t._id === taskId)
    if (!originalTask) return

    setTasks(prev => prev.filter(t => t._id !== taskId))
    updateCachedTasks(prev => prev.filter(t => t._id !== taskId))

    // If it's a temp-id task created offline, remove its pending create item from queue
    if (taskId.startsWith('tmp_')) {
      const queue = getQueue()
      const item = queue.find(q => q.type === QUEUE_TYPES.CREATE_TASK && `tmp_${q.payload.clientId}` === taskId)
      if (item) {
        removeFromQueue(item.id)
        updateSyncStatus()
      }
      toast?.info?.('Task removed')
      return
    }

    if (navigator.onLine) {
      try {
        await tasksApi.delete(taskId)
        toast?.success?.('Task deleted')
      } catch (err) {
        if (err.isNetworkError || err.response?.status >= 500) {
          deleteTaskQueueItem(taskId)
          updateSyncStatus()
        } else {
          // Rollback
          setTasks(prev => [...prev, originalTask])
          updateCachedTasks(prev => [...prev, originalTask])
          toast?.error?.('Failed to delete task')
          throw err
        }
      }
    } else {
      deleteTaskQueueItem(taskId)
      updateSyncStatus()
    }
  }, [tasks, updateSyncStatus, toast])

  const toggleStatus = useCallback(async (taskId, explicitStatus) => {
    const task = tasks.find(t => t._id === taskId)
    if (!task) return

    let newStatus = explicitStatus
    if (!newStatus) {
      const cycle = {
        'todo': 'in-progress',
        'in-progress': 'done',
        'done': 'todo'
      }
      newStatus = cycle[task.status] || 'done'
    }
    await updateTask(taskId, { status: newStatus })
  }, [tasks, updateTask])

  const refreshStats = useCallback(async () => {
    try {
      const statsRes = await statsApi.getAll()
      if (isMounted.current) setStats(statsRes.data.data)
    } catch (err) {
      console.error('Failed to refresh stats:', err)
    }
  }, [])

  // Bulk clear completed tasks
  const bulkClearDone = useCallback(async () => {
    const doneTasks = tasks.filter(t => t.status === 'done')
    if (doneTasks.length === 0) return

    // Optimistically remove done tasks
    setTasks(prev => prev.filter(t => t.status !== 'done'))
    updateCachedTasks(prev => prev.filter(t => t.status !== 'done'))

    if (navigator.onLine) {
      try {
        await tasksApi.bulkClearDone()
        toast?.success?.(`Cleared ${doneTasks.length} completed task${doneTasks.length !== 1 ? 's' : ''}`)
        refreshStats()
      } catch (err) {
        console.error('Failed to clear completed tasks:', err)
        // Rollback
        setTasks(prev => [...prev, ...doneTasks])
        updateCachedTasks(prev => [...prev, ...doneTasks])
        toast?.error?.('Failed to clear completed tasks')
      }
    } else {
      doneTasks.forEach(t => {
        if (!t._id.startsWith('tmp_')) {
          deleteTaskQueueItem(t._id)
        }
      })
      updateSyncStatus()
      toast?.info?.(`Offline: ${doneTasks.length} task(s) marked for deletion upon sync`)
    }
  }, [tasks, refreshStats, updateSyncStatus, toast])

  // Category mutations
  const createCategory = useCallback(async (categoryData) => {
    const optimisticCategory = {
      _id: `tmp_${Date.now()}`,
      ...categoryData,
      taskCount: 0
    }

    setCategories(prev => [...prev, optimisticCategory])
    updateCachedCategories(prev => [...prev, optimisticCategory])

    if (navigator.onLine) {
      try {
        const result = await categoriesApi.create(categoryData)
        setCategories(prev => prev.map(c => c._id === optimisticCategory._id ? result.data.data : c))
        updateCachedCategories(prev => prev.map(c => c._id === optimisticCategory._id ? result.data.data : c))
        toast?.success?.('Category created')
      } catch (err) {
        if (err.isNetworkError || err.response?.status >= 500) {
          createCategoryQueueItem(categoryData)
          updateSyncStatus()
        } else {
          setCategories(prev => prev.filter(c => c._id !== optimisticCategory._id))
          updateCachedCategories(prev => prev.filter(c => c._id !== optimisticCategory._id))
          toast?.error?.(err.response?.data?.error?.message || 'Failed to create category')
          throw err
        }
      }
    } else {
      createCategoryQueueItem(categoryData)
      updateSyncStatus()
    }
  }, [updateSyncStatus, toast])

  const updateCategory = useCallback(async (categoryId, updates) => {
    const originalCategory = categories.find(c => c._id === categoryId)
    if (!originalCategory) return

    const optimisticCategory = { ...originalCategory, ...updates }
    setCategories(prev => prev.map(c => c._id === categoryId ? optimisticCategory : c))
    updateCachedCategories(prev => prev.map(c => c._id === categoryId ? optimisticCategory : c))

    if (navigator.onLine) {
      try {
        const result = await categoriesApi.update(categoryId, updates)
        setCategories(prev => prev.map(c => c._id === categoryId ? result.data.data : c))
        updateCachedCategories(prev => prev.map(c => c._id === categoryId ? result.data.data : c))
        toast?.success?.('Category updated')
      } catch (err) {
        if (err.isNetworkError || err.response?.status >= 500) {
          updateCategoryQueueItem(categoryId, updates)
          updateSyncStatus()
        } else {
          setCategories(prev => prev.map(c => c._id === categoryId ? originalCategory : c))
          updateCachedCategories(prev => prev.map(c => c._id === categoryId ? originalCategory : c))
          toast?.error?.(err.response?.data?.error?.message || 'Failed to update category')
          throw err
        }
      }
    } else {
      updateCategoryQueueItem(categoryId, updates)
      updateSyncStatus()
    }
  }, [categories, updateSyncStatus, toast])

  const deleteCategory = useCallback(async (categoryId) => {
    const originalCategory = categories.find(c => c._id === categoryId)
    if (!originalCategory) return

    setCategories(prev => prev.filter(c => c._id !== categoryId))
    updateCachedCategories(prev => prev.filter(c => c._id !== categoryId))

    // Unassign tasks locally
    setTasks(prev => prev.map(t =>
      t.category?._id === categoryId ? { ...t, category: null } : t
    ))
    updateCachedTasks(prev => prev.map(t =>
      t.category?._id === categoryId ? { ...t, category: null } : t
    ))

    if (navigator.onLine) {
      try {
        await categoriesApi.delete(categoryId)
        toast?.success?.('Category deleted')
      } catch (err) {
        if (err.isNetworkError || err.response?.status >= 500) {
          deleteCategoryQueueItem(categoryId)
          updateSyncStatus()
        } else {
          setCategories(prev => [...prev, originalCategory])
          updateCachedCategories(prev => [...prev, originalCategory])
          toast?.error?.('Failed to delete category')
          throw err
        }
      }
    } else {
      deleteCategoryQueueItem(categoryId)
      updateSyncStatus()
    }
  }, [categories, updateSyncStatus, toast])

  // Get filtered and paginated tasks
  const getFilteredTasks = useCallback((filters, page = 1, limit = 20) => {
    const filtered = applyFilters(tasks, filters)
    return paginate(filtered, page, limit)
  }, [tasks])

  const value = {
    tasks,
    categories,
    stats,
    loading,
    error,
    pendingCount,
    syncStatus,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
    bulkClearDone,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshStats,
    getFilteredTasks,
    refreshFromAPI
  }

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  )
}