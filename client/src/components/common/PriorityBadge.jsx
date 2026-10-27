const priorityStyles = {
  low: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  medium: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  high: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  urgent: 'bg-red-50 text-red-700 ring-1 ring-red-200'
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent'
}

export default function PriorityBadge({ priority, size = 'default' }) {
  const sizeClasses = {
    default: 'px-2.5 py-0.5 text-xs',
    small: 'px-2 py-0.5 text-[10px]',
    large: 'px-3 py-1 text-sm'
  }

  return (
    <span className={`font-medium rounded-full ${priorityStyles[priority] || priorityStyles.medium} ${sizeClasses[size]}`}>
      {priorityLabels[priority] || priority}
    </span>
  )
}