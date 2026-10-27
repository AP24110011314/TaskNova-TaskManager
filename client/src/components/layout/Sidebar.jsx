import { NavLink, useLocation, useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import { parseISO, startOfDay, endOfDay, addDays } from 'date-fns'
import { useTasks } from '../../hooks/useTasks'
import { SMART_GROUPS, PRESET_COLORS } from '../../utils/constants'
import Modal from '../common/Modal'

function calculateGroupCounts(tasks) {
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekEnd = addDays(todayEnd, 7)

  return {
    all: tasks.length,
    today: tasks.filter(t => {
      if (!t.dueDate) return false
      const d = parseISO(t.dueDate)
      return d >= todayStart && d <= todayEnd
    }).length,
    upcoming: tasks.filter(t => {
      if (!t.dueDate) return false
      const d = parseISO(t.dueDate)
      return d > todayEnd && d <= weekEnd
    }).length,
    overdue: tasks.filter(t => {
      if (!t.dueDate || t.status === 'done') return false
      const d = parseISO(t.dueDate)
      return d < todayStart
    }).length,
    nodate: tasks.filter(t => !t.dueDate).length
  }
}

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [categoryName, setCategoryName] = useState('')
  const [categoryColor, setCategoryColor] = useState('#3b82f6')
  const [categoryError, setCategoryError] = useState('')

  const location = useLocation()
  const [searchParams] = useSearchParams()
  const currentGroup = searchParams.get('group') || (location.pathname === '/' && !searchParams.get('category') && !searchParams.get('q') ? 'all' : '')
  const currentCategory = searchParams.get('category')

  const { tasks, categories, createCategory, refreshStats } = useTasks()
  const groupCounts = calculateGroupCounts(tasks)

  const handleCreateCategory = async (e) => {
    e.preventDefault()
    if (!categoryName.trim()) {
      setCategoryError('Category name is required')
      return
    }

    try {
      await createCategory({ name: categoryName.trim(), color: categoryColor })
      refreshStats()
      setShowCategoryModal(false)
      setCategoryName('')
      setCategoryColor('#3b82f6')
      setCategoryError('')
    } catch (err) {
      setCategoryError(err.response?.data?.error?.message || 'Failed to create category')
    }
  }

  // Consistent inline SVG icons (w-4 h-4)
  const groupIcons = {
    all: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
        <path d="m9 14 2 2 4-4"/>
      </svg>
    ),
    today: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
      </svg>
    ),
    upcoming: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
        <line x1="16" x2="16" y1="2" y2="6"/>
        <line x1="8" x2="8" y1="2" y2="6"/>
        <line x1="3" x2="21" y1="10" y2="10"/>
        <path d="m9 16 2 2 4-4"/>
      </svg>
    ),
    overdue: (
      <svg className="w-4 h-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    nodate: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
        <line x1="16" x2="16" y1="2" y2="6"/>
        <line x1="8" x2="8" y1="2" y2="6"/>
        <line x1="3" x2="21" y1="10" y2="10"/>
        <line x1="3" x2="21" y1="3" y2="21"/>
      </svg>
    )
  }

  return (
    <>
      {/* Backdrop overlay for mobile (z-30) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar navigation:
          - Desktop (md+): normal document flow, w-64, shrink-0, h-full, border-r
          - Mobile: off-canvas drawer fixed inset-y-0 left-0 z-40 w-64
      */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 md:static md:z-auto w-64 shrink-0 h-full overflow-y-auto border-r bg-white text-slate-700 border-slate-200 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col h-full px-3 py-4">
          {/* Brand header */}
          <div className="flex items-center justify-between px-3 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-lg shadow-sm shadow-indigo-200 shrink-0">
                T
              </span>
              <div className="min-w-0">
                <h1 className="text-base font-bold text-slate-900 leading-tight truncate">TaskNova</h1>
                <p className="text-xs text-slate-400 font-normal truncate">Smart Task Manager</p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" x2="6" y1="6" y2="18"/>
                <line x1="6" x2="18" y1="6" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Smart Groups */}
          <div className="mb-6">
            <div className="px-3 mb-2">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                Views
              </h2>
            </div>
            <nav className="space-y-1">
              {SMART_GROUPS.map(group => {
                const isActive = currentGroup === group.id && location.pathname === '/'
                const count = groupCounts[group.id] || 0
                return (
                  <NavLink
                    key={group.id}
                    to={group.id === 'all' ? '/' : `/?group=${group.id}`}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      {groupIcons[group.id]}
                      <span className="truncate">{group.label}</span>
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ml-2 shrink-0 ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {count}
                    </span>
                  </NavLink>
                )
              })}
            </nav>
          </div>

          {/* Categories */}
          <div className="border-t border-slate-200 pt-5 mb-6 mt-6">
            <div className="flex items-center justify-between px-3 mb-1">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider truncate">
                Categories
              </h2>
              <button
                type="button"
                onClick={() => setShowCategoryModal(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline font-semibold shrink-0 ml-2"
                aria-label="Add new category"
              >
                + Add
              </button>
            </div>

            <div className="space-y-1">
              {categories.length === 0 ? (
                <p className="px-3 py-2 text-xs text-slate-400">No categories yet</p>
              ) : (
                categories.map(category => {
                  const isActive = currentCategory === category._id && location.pathname === '/'
                  const catCount = tasks.filter(t => t.category?._id === category._id || t.category === category._id).length
                  return (
                    <NavLink
                      key={category._id}
                      to={`/?category=${category._id}`}
                      onClick={onClose}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="truncate">{category.name}</span>
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium ml-2 shrink-0">
                        {catCount}
                      </span>
                    </NavLink>
                  )
                })
              )}
            </div>
          </div>

          {/* Secondary links */}
          <div className="mt-auto border-t border-slate-200 pt-4 space-y-1">
            <NavLink
              to="/stats"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" x2="18" y1="20" y2="10"/>
                <line x1="12" x2="12" y1="20" y2="4"/>
                <line x1="6" x2="6" y1="20" y2="14"/>
              </svg>
              <span className="truncate">Statistics</span>
            </NavLink>

            <NavLink
              to="/categories"
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
                <path d="M7 7h.01"/>
              </svg>
              <span className="truncate">Manage Categories</span>
            </NavLink>
          </div>
        </div>
      </aside>

      {/* New Category Modal */}
      {showCategoryModal && (
        <Modal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false)
            setCategoryName('')
            setCategoryError('')
          }}
          title="New Category"
          size="sm"
        >
          <form onSubmit={handleCreateCategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={e => {
                  setCategoryName(e.target.value)
                  if (categoryError) setCategoryError('')
                }}
                className={`w-full px-3 py-2 bg-white border rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  categoryError ? 'border-red-500' : 'border-slate-300'
                } placeholder-slate-400`}
                maxLength={40}
                placeholder="e.g. Work, Personal, Fitness"
                autoFocus
              />
              {categoryError && <p className="mt-1 text-xs text-red-500">{categoryError}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCategoryColor(color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      categoryColor === color
                        ? 'scale-110 border-indigo-600 ring-2 ring-indigo-400'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false)
                  setCategoryName('')
                  setCategoryError('')
                }}
                className="px-3.5 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Create
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}