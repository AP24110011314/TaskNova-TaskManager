import { useState, useMemo, useEffect } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useFilters } from '../hooks/useFilters'
import { SMART_GROUPS } from '../utils/constants'
import QuickAdd from '../components/tasks/QuickAdd'
import TaskGroups from '../components/tasks/TaskGroups'
import FilterBar from '../components/filters/FilterBar'
import FilterChips from '../components/filters/FilterChips'
import TaskList from '../components/tasks/TaskList'
import TaskForm from '../components/tasks/TaskForm'
import ConfirmDialog from '../components/common/ConfirmDialog'

export default function Dashboard() {
  const {
    tasks,
    categories,
    getFilteredTasks,
    bulkClearDone,
    loading,
    error,
    refreshFromAPI
  } = useTasks()
  const { filters, clearFilters } = useFilters()

  const limit = 20
  const [currentPage, setCurrentPage] = useState(1)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showClearDoneConfirm, setShowClearDoneConfirm] = useState(false)
  const filteredResult = useMemo(() => {
    return getFilteredTasks(filters, currentPage, limit)
  }, [getFilteredTasks, filters, currentPage])

  const handleLoadMore = () => {
    if (currentPage < filteredResult.meta.pages) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const openCreateForm = () => {
    setEditingTask(null)
    setShowTaskForm(true)
  }

  // Open task form modal when 'n' shortcut is pressed
  useEffect(() => {
    const handleOpenForm = () => {
      setEditingTask(null)
      setShowTaskForm(true)
    }
    window.addEventListener('open-task-form', handleOpenForm)
    return () => window.removeEventListener('open-task-form', handleOpenForm)
  }, [])

  const completedCount = tasks.filter(t => t.status === 'done').length
  const isFiltered = Object.keys(filters).some(
    k => filters[k] && filters[k] !== '' && k !== 'sort' && k !== 'page' && k !== 'limit'
  )
  const hasMore = currentPage < filteredResult.meta.pages

  const pageTitle = useMemo(() => {
    if (filters.group) {
      const g = SMART_GROUPS.find(item => item.id === filters.group)
      if (g) return g.label
    }
    if (filters.category && filters.category !== 'none') {
      const c = categories.find(item => item._id === filters.category)
      if (c) return `${c.name} Tasks`
    }
    if (filters.category === 'none') {
      return 'Uncategorized Tasks'
    }
    return 'All Tasks'
  }, [filters.group, filters.category, categories])

  return (
    <div className="w-full space-y-4 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{pageTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {filteredResult.meta.total} task{filteredResult.meta.total !== 1 ? 's' : ''}
            {completedCount > 0 ? ` · ${completedCount} completed` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          {completedCount > 0 && (
            <button
              type="button"
              onClick={() => setShowClearDoneConfirm(true)}
              className="flex-1 sm:flex-none justify-center rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm cursor-pointer"
            >
              Clear completed ({completedCount})
            </button>
          )}

          <button
            type="button"
            onClick={openCreateForm}
            className="flex-1 sm:flex-none justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" x2="12" y1="5" y2="19"/>
              <line x1="5" x2="19" y1="12" y2="12"/>
            </svg>
            <span>New task</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm" role="alert">
          <p>Could not reach the server. Showing saved tasks while you are offline.</p>
          <button onClick={refreshFromAPI} className="font-semibold text-amber-900 hover:underline">
            Retry
          </button>
        </div>
      )}

      <TaskGroups />

      <QuickAdd />

      <FilterBar />

      <FilterChips />

      <div className="flex items-center justify-between pt-1">
        {filteredResult.meta.pages > 1 && (
          <div className="text-xs text-slate-500">
            Page {filteredResult.meta.page} of {filteredResult.meta.pages}
          </div>
        )}
      </div>

      <TaskList
        tasks={filteredResult.data}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        isFiltered={isFiltered}
        onAction={isFiltered ? clearFilters : openCreateForm}
      />

      {showTaskForm && (
        <TaskForm
          initialTask={editingTask}
          onClose={() => { setShowTaskForm(false); setEditingTask(null) }}
          onSuccess={() => { setShowTaskForm(false); setEditingTask(null) }}
        />
      )}

      <ConfirmDialog
        isOpen={showClearDoneConfirm}
        onClose={() => setShowClearDoneConfirm(false)}
        onConfirm={async () => {
          await bulkClearDone()
          setShowClearDoneConfirm(false)
        }}
        title="Clear completed tasks"
        message={`Are you sure you want to delete all ${completedCount} completed task(s)? This cannot be undone.`}
        confirmLabel="Clear tasks"
        variant="danger"
      />

      {/* Floating Action Button for mobile & quick access */}
      <button
        type="button"
        onClick={openCreateForm}
        className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-indigo-300"
        aria-label="Create new task"
        title="New task (press n)"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" x2="12" y1="5" y2="19"/>
          <line x1="5" x2="19" y1="12" y2="12"/>
        </svg>
      </button>
    </div>
  )
}