import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { useFilters } from '../../hooks/useFilters'
import ConfirmDialog from '../common/ConfirmDialog'
import SortSelect from '../filters/SortSelect'
import SyncStatus from './SyncStatus'

export default function Header({ onToggleSidebar }) {
  const { filters, setFilters, clearFilters } = useFilters()
  const [search, setSearch] = useState(filters.q || '')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const searchInputRef = useRef(null)
  const prevFilterQRef = useRef(filters.q || '')

  useEffect(() => {
    if (debouncedSearch !== (filters.q || '')) {
      setFilters({ q: debouncedSearch || '' })
    }
  }, [debouncedSearch, filters.q, setFilters])

  // Synchronize input if query reset from external action
  useEffect(() => {
    if (filters.q !== prevFilterQRef.current) {
      prevFilterQRef.current = filters.q || ''
      setSearch(filters.q || '')
    }
  }, [filters.q])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if (e.key === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent('open-task-form'))
        window.dispatchEvent(new CustomEvent('quick-add-focus'))
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => value && value !== '' && key !== 'sort' && key !== 'page' && key !== 'limit'
  )

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="flex items-center justify-between px-3 sm:px-6 gap-2 sm:gap-4 h-full">
        {/* Left side: Mobile menu toggle + Search bar */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl min-w-0">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shrink-0"
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
              className="w-full pl-9 sm:pl-10 pr-8 py-1.5 sm:py-2 bg-slate-50 sm:bg-white border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 hover:border-slate-400 transition-colors"
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

        {/* Right side: SortSelect and SyncStatus (Sort appears exactly once) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
          <SortSelect />
          <SyncStatus />
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