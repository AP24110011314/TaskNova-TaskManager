import { useTasks } from './useTasks'

export function useCategories() {
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshStats,
    loading
  } = useTasks()

  return {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshStats,
    loading
  }
}

export default useCategories
