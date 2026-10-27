import { useTasks } from '../../hooks/useTasks'

export default function SyncStatus({ className = '' }) {
  const { syncStatus } = useTasks()

  const getSyncStatusVariant = () => {
    if (syncStatus.startsWith('Offline')) {
      return {
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: syncStatus
      }
    }
    if (syncStatus === 'Syncing...') {
      return {
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-600 animate-pulse',
        label: 'Syncing...'
      }
    }
    return {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dot: 'bg-emerald-500',
      label: 'Synced'
    }
  }

  const variant = getSyncStatusVariant()

  const mobileLabel = syncStatus.startsWith('Offline')
    ? (syncStatus.match(/\d+/) ? `Offline (${syncStatus.match(/\d+/)[0]})` : 'Offline')
    : (syncStatus === 'Syncing...' ? 'Syncing' : 'Synced')

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-full border text-[11px] sm:text-xs font-medium transition-all shrink-0 ${variant.badge} ${className}`}
      title={`Sync status: ${syncStatus}`}
      role="status"
      aria-live="polite"
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${variant.dot}`} />
      <span className="hidden sm:inline">{syncStatus}</span>
      <span className="sm:hidden">{mobileLabel}</span>
    </div>
  )
}
