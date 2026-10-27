import { useState } from 'react'
import { useTasks } from '../../context/TaskContext'
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

  const handleStatusToggle = async () => {
    await toggleStatus(task._id)
  }

  const handleEdit = () => {
    setShowEditForm(true)
  }

  const handleDelete = async () => {
    await deleteTask(task._id)
    setShowDeleteConfirm(false)
  }

  return (
    <>
      <div
        className={`flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all ${
          isOverdue
            ? 'border-red-300 bg-red-50/40'
            : 'border-slate-200'
        }`}
      >
        {/* Top row: Checkbox + Title on the left (min-w-0, title break-words), and Priority + Category + Actions on the right (shrink-0) */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleStatusToggle}
              className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
                task.status === 'done'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-slate-300 hover:border-indigo-500 text-transparent bg-white'
              } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
              aria-label={task.status === 'done' ? 'Mark as todo' : 'Mark as done'}
              aria-pressed={task.status === 'done'}
            >
              {task.status === 'done' && (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>

            <h3
              className={`font-semibold text-slate-900 break-words min-w-0 text-sm sm:text-base ${
                task.status === 'done' ? 'line-through text-slate-400' : ''
              }`}
            >
              {task.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            <PriorityBadge priority={task.priority} />
            {task.category && (
              <span
                className="px-2.5 py-0.5 text-xs font-medium rounded-full truncate max-w-[120px] bg-slate-100 text-slate-600"
                style={{
                  backgroundColor: task.category.color + '1F',
                  color: task.category.color
                }}
              >
                {task.category.name}
              </span>
            )}
            <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
              <button
                type="button"
                onClick={handleEdit}
                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                aria-label="Edit task"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                aria-label="Delete task"
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
          <p className="text-sm text-slate-500 line-clamp-2 pl-8">
            {task.description}
          </p>
        )}

        {/* Footer meta: Due date, tags */}
        {(task.dueDate || (task.tags && task.tags.length > 0)) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pl-8 pt-0.5">
            {task.dueDate && (
              <span className={`flex items-center gap-1 font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                {dueDateInfo.label}
              </span>
            )}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-medium"
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