export default function EmptyState({ variant = 'noTasks', onAction }) {
  const messages = {
    noTasks: {
      icon: (
        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
      title: 'No tasks yet',
      description: 'Click "Add" or press "n" to create your first task.',
      actionLabel: 'Add Task',
      action: onAction
    },
    noResults: {
      icon: (
        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.3-4.3"/>
        </svg>
      ),
      title: 'No tasks match your filters',
      description: 'Try adjusting your search or filter criteria.',
      actionLabel: 'Clear Filters',
      action: onAction
    },
    noCategories: {
      icon: (
        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
          <line x1="7" x2="7.01" y1="7" y2="7"/>
        </svg>
      ),
      title: 'No categories yet',
      description: 'Create a category to organize your tasks.',
      actionLabel: 'Add Category',
      action: onAction
    },
    offline: {
      icon: (
        <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="1" x2="23" y1="1" y2="23"/>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"/>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
          <line x1="12" x2="12.01" y1="20" y2="20"/>
        </svg>
      ),
      title: 'You\'re offline',
      description: 'Changes will sync when you\'re back online.',
      actionLabel: null,
      action: null
    }
  }

  const { icon, title, description, actionLabel, action } = messages[variant] || messages.noTasks

  return (
    <div className="text-center py-12 px-4">
      {icon}
      <h3 className="text-lg font-medium text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 mb-6">{description}</p>
      {actionLabel && action && (
        <button
          onClick={action}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}