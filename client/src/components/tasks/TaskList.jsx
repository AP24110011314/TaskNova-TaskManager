import TaskCard from './TaskCard'
import EmptyState from '../common/EmptyState'
import Spinner from '../common/Spinner'

export default function TaskList({ tasks, loading, hasMore, onLoadMore, isFiltered, onAction }) {
  if (loading && tasks.length === 0) {
    return (
      <div className="space-y-3" role="status" aria-label="Loading tasks">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        variant={isFiltered ? 'noResults' : 'noTasks'}
        onAction={onAction}
      />
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard key={task._id} task={task} />
      ))}
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Spinner size="sm" /> : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}