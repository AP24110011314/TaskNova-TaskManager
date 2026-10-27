import { useState, useEffect } from 'react'
import { useDebounce } from '../../hooks/useDebounce'
import { useFilters } from '../../hooks/useFilters'

export default function SearchBar() {
  const { filters, setFilters } = useFilters()
  const [search, setSearch] = useState(() => filters.q || '')
  const [prevFilterQ, setPrevFilterQ] = useState(filters.q || '')
  const debouncedSearch = useDebounce(search, 300)

  if ((filters.q || '') !== prevFilterQ) {
    setPrevFilterQ(filters.q || '')
    setSearch(filters.q || '')
  }

  useEffect(() => {
    if (debouncedSearch !== filters.q) {
      setFilters({ q: debouncedSearch || '' })
    }
  }, [debouncedSearch, filters.q, setFilters])

  return (
    <input
      type="search"
      placeholder="Search tasks... (press /)"
      value={search}
      onChange={e => setSearch(e.target.value)}
      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500"
      maxLength={120}
      aria-label="Search tasks"
    />
  )
}