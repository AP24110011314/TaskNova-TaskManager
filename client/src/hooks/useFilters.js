import { useSearchParams } from 'react-router-dom'
import { useMemo, useCallback } from 'react'

const DEFAULT_FILTERS = {
  q: '',
  category: '',
  priority: '',
  status: '',
  tag: '',
  dueFrom: '',
  dueTo: '',
  overdue: '',
  group: '',
  sort: '-createdAt',
  page: '1',
  limit: '20'
}

export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const result = { ...DEFAULT_FILTERS }
    for (const key of Object.keys(DEFAULT_FILTERS)) {
      const value = searchParams.get(key)
      if (value !== null) {
        result[key] = value
      }
    }
    return result
  }, [searchParams])

  const setFilters = useCallback((newFilters, options = {}) => {
    const params = new URLSearchParams()
    const filterKeys = Object.keys(newFilters)
    const shouldResetPage = filterKeys.some(key => !['page', 'limit', 'sort'].includes(key))
    const merged = { ...filters, ...newFilters, ...(shouldResetPage ? { page: '1' } : {}) }

    for (const [key, value] of Object.entries(merged)) {
      if (value && value !== DEFAULT_FILTERS[key]) {
        params.set(key, value)
      }
    }

    setSearchParams(params, { replace: options.replace !== false })
  }, [filters, setSearchParams])

  const clearFilters = useCallback(() => {
    setSearchParams({}, { replace: true })
  }, [setSearchParams])

  const clearFilter = useCallback((key) => {
    const params = new URLSearchParams(searchParams)
    params.delete(key)
    setSearchParams(params, { replace: true })
  }, [searchParams, setSearchParams])

  return { filters, setFilters, clearFilters, clearFilter }
}