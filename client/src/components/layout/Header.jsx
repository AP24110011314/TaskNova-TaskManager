import { useState, useEffect, useRef } from 'react'
import { useTasks } from '../../hooks/useTasks'
import { useDebounce } from '../../hooks/useDebounce'
import { useFilters } from '../../hooks/useFilters'
import ConfirmDialog from '../common/ConfirmDialog'

export default function Header({ onToggleSidebar }) {
  const { filters, setFilters, clearFilters } = useFilters()
  const { syncStatus } = useTasks()
  const [search, setSearch] = useState(filters.q || '')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const searchInputRef = useRef(null)

  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      setFilters({ q: debouncedSearch || '' })
    }
  }, [debouncedSearch, filters.q, setFilters])

  // Synchronize input if query reset from external action
  useEffect(() => {
    if ((filters.q || '') !== search) {
      setSearch(filters.q || '')
    }
  }, [filters.q]) // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('quick-add-focus'))
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && value !== '' && key !== 'sort' && key !== 'page' && key !== 'limit'
  )

  const getSyncStatusVariant = () => {
    if (syncStatus.startsWith('Offline')) {
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500'
      }
    }
    if (syncStatus === 'Syncing...') {
      return {
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-600 animate-pulse'
      }
    }
    return {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500'
    }
  }

  const syncVariant = getSyncStatusVariant()

  return (
    <header className="h-14 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="flex items-center justify-between px-4 md:px-6 gap-3 h-full">
        {/* Left side: Mobile menu toggle + Search bar (flex-1 max-w-xl) */}
        <div className="flex items-center gap-3 flex-1 max-w-xl min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" x2="21" y1="6" y2="6"/>
              <line x1="3" x2="21" y1="12" y2="12"/>
              <line x1="3" x2="21" y1="18" y2="18"/>
            </svg>
          </button>

          <div className="relative flex-1 min-w-0">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search tasks... (press /)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 hover:border-slate-400 transition-colors"
              aria-label="Search tasks"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" x2="6" y1="6" y2="18"/>
                  <line x1="6" x2="18" y1="6" y2="18"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Right side: Sort and Sync Status with gap-3 */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="hidden sm:block">
            <select
              value={filters.sort}
              onChange={e => setFilters({ sort: e.target.value })}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 hover:bg-slate-50 transition-colors"
              aria-label="Sort by"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="dueDate">Due Date</option>
              <option value="-priority">Priority</option>
            </select>
          </div>

          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${syncVariant.badge}`}>
            <span className={`w-2 h-2 rounded-full ${syncVariant.dot}`} />
            <span>{syncStatus}</span>
          </div>
        </div>
      </div>

      {hasActiveFilters && (
        <ConfirmDialog
          isOpen={showClearConfirm}
          onClose={() => setShowClearConfirm(false)}
          onConfirm={clearFilters}
          title="Clear all filters?"
          message="This will remove all active filters and reset the view."
          confirmLabel="Clear all"
          variant="primary"
        />
      )}
    </header>
  )
}