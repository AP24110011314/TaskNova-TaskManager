import { useState } from 'react'
import { useTasks } from '../../hooks/useTasks'
import PriorityBadge from '../common/PriorityBadge'
import { getDueDateLabel } from '../../utils/dates'
import TaskForm from './TaskForm'
import ConfirmDialog from '../common/ConfirmDialog'

export default function TaskCard({ task }) {
  const { deleteTask, toggleStatus } = useTasks()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const dueDateInfo = getDueDateLabel(task.dueDate, task.status)
  const isOverdue = dueDateInfo.isOverdue

  const handleCheckboxToggle = async (e) => {
    e.stopPropagation()
    const targetStatus = task.status === 'done' ? 'todo' : 'done'
    await toggleStatus(task._id, targetStatus)
  }

  const handleCycleStatus = async (e) => {
    e.stopPropagation()
    // Cycle: todo -> in-progress -> done -> todo
    const cycle = {
      'todo': 'in-progress',
      'in-progress': 'done',
      'done': 'todo'
    }
    const next = cycle[task.status] || 'todo'
    await toggleStatus(task._id, next)
  }

  const handleEdit = (e) => {
    e?.stopPropagation()
    setShowEditForm(true)
  }

  const handleDelete = async () => {
    await deleteTask(task._id)
    setShowDeleteConfirm(false)
  }

  const getStatusBadge = () => {
    if (task.status === 'done') {
      return {
        label: 'Done',
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
        dot: 'bg-emerald-500'
      }
    }
    if (task.status === 'in-progress') {
      return {
        label: 'In Progress',
        classes: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
        dot: 'bg-amber-500 animate-pulse'
      }
    }
    return {
      label: 'To Do',
      classes: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70',
      dot: 'bg-slate-400'
    }
  }

  const statusStyle = getStatusBadge()

  return (
    <>
      <div
        className={`group relative flex flex-col gap-2.5 rounded-xl border bg-white p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all duration-150 ${
          isOverdue
            ? 'border-rose-300 bg-rose-50/40 hover:border-rose-400'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        {/* Main Header Row: Checkbox, Title, and Desktop Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">
          {/* Left: Checkbox + Title */}
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleCheckboxToggle}
              className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                task.status === 'done'
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                  : 'border-slate-300 bg-white hover:border-indigo-500 text-transparent'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/30`}
              aria-label={task.status === 'done' ? 'Mark as todo' : 'Mark as done'}
              aria-pressed={task.status === 'done'}
            >
              {task.status === 'done' && (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>

            <div className="min-w-0 flex-1">
              <h3
                onClick={handleEdit}
                className={`font-semibold text-slate-900 break-words text-sm sm:text-base leading-snug cursor-pointer hover:text-indigo-600 transition-colors ${
                  task.status === 'done' ? 'line-through text-slate-400 hover:text-slate-500' : ''
                }`}
                title="Click to edit task"
              >
                {task.title}
              </h3>
            </div>
          </div>

          {/* Right on Desktop / Wrapped on Mobile: Status, Priority, Category, Actions */}
          <div className="flex items-center flex-wrap gap-2 shrink-0 sm:ml-2 pl-8 sm:pl-0">
            {/* Status cycling pill */}
            <button
              type="button"
              onClick={handleCycleStatus}
              title="Click to toggle status (To Do → In Progress → Done)"
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border transition-all cursor-pointer ${statusStyle.classes}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusStyle.dot}`} />
              <span>{statusStyle.label}</span>
            </button>

            {/* Priority Badge */}
            <PriorityBadge priority={task.priority} />

            {/* Category Pill */}
            {task.category && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full truncate max-w-[130px] border border-slate-200/70"
                style={{
                  backgroundColor: `${task.category.color}15`,
                  color: task.category.color
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: task.category.color }}
                />
                <span className="truncate">{task.category.name}</span>
              </span>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-1 sm:border-l sm:border-slate-200 sm:pl-2 ml-auto sm:ml-0">
              <button
                type="button"
                onClick={handleEdit}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Edit task"
                title="Edit task"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true) }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                aria-label="Delete task"
                title="Delete task"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 pl-8 pr-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Footer meta: Due date, tags */}
        {(task.dueDate || (task.tags && task.tags.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-8 pt-0.5">
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-medium ${
                  isOverdue
                    ? 'bg-rose-100/70 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                <span>{dueDateInfo.label}</span>
              </span>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 rounded-md text-xs font-medium border border-slate-200/50 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showEditForm && (
        <TaskForm
          initialTask={task}
          onClose={() => setShowEditForm(false)}
          onSuccess={() => setShowEditForm(false)}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
      />
    </>
  )
}