import { useState, useRef, useEffect } from 'react'
import { useTasks } from '../../context/TaskContext'
import { useFilters } from '../../hooks/useFilters'

export default function QuickAdd() {
  const [title, setTitle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const inputRef = useRef(null)
  const { createTask } = useTasks()
  const { filters } = useFilters()

  useEffect(() => {
    const handleQuickAddFocus = () => {
      setShowForm(true)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
    window.addEventListener('quick-add-focus', handleQuickAddFocus)
    return () => window.removeEventListener('quick-add-focus', handleQuickAddFocus)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createTask({
        title: title.trim(),
        category: filters.category && filters.category !== 'none' ? filters.category : null,
        priority: 'medium',
        status: 'todo',
        tags: []
      })
      setTitle('')
      setShowForm(false)
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowForm(false)
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onFocus={() => setShowForm(true)}
          onKeyDown={handleKeyDown}
          placeholder={showForm ? "Add a new task... (press Enter)" : "Quick add a new task... (press n)"}
          className="w-full flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 shadow-sm transition-colors hover:border-slate-400"
          maxLength={120}
          aria-label="Quick add task"
        />
        {showForm && (
          <>
            <button
              type="submit"
              disabled={!title.trim()}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm shadow-sm"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setTitle(''); }}
              className="px-3 py-3 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors text-sm"
              aria-label="Cancel"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" x2="6" y1="6" y2="18"/>
                <line x1="6" x2="18" y1="6" y2="18"/>
              </svg>
            </button>
          </>
        )}
      </form>
    </div>
  )
}