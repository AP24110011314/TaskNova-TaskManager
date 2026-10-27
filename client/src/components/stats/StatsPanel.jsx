import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { useTasks } from '../../hooks/useTasks'

// Light theme chart colors - readable on white
const PRIORITY_COLORS = {
  low: '#94a3b8',      // slate-400
  medium: '#3b82f6',   // blue-500
  high: '#f97316',     // orange-500
  urgent: '#ef4444'    // red-500
}

const STATUS_COLORS = {
  todo: '#3b82f6',         // blue-500
  'in-progress': '#f59e0b', // amber-500
  done: '#10b981'          // emerald-500
}

const GROUP_COLORS = {
  today: '#3b82f6',      // blue-500
  upcoming: '#f59e0b',   // amber-500
  overdue: '#ef4444',    // red-500
  nodate: '#94a3b8'      // slate-400
}

const CATEGORY_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ec4899',
  '#8b5cf6', '#06b6d4', '#3b82f6', '#84cc16'
]

export default function StatsPanel() {
  const { stats, refreshStats } = useTasks()

  if (!stats) {
    return (
      <div className="space-y-6 animate-pulse" role="status" aria-label="Loading statistics">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-slate-200 rounded-lg" />
          <div className="h-8 w-20 bg-slate-200 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-slate-200 rounded-xl" />
          <div className="h-72 bg-slate-200 rounded-xl" />
        </div>
      </div>
    )
  }

  const priorityData = [
    { name: 'Low', value: stats.byPriority.low, color: PRIORITY_COLORS.low },
    { name: 'Medium', value: stats.byPriority.medium, color: PRIORITY_COLORS.medium },
    { name: 'High', value: stats.byPriority.high, color: PRIORITY_COLORS.high },
    { name: 'Urgent', value: stats.byPriority.urgent, color: PRIORITY_COLORS.urgent }
  ].filter(d => d.value > 0)

  const categoryData = stats.byCategory.map((cat, index) => ({
    name: cat.name,
    value: cat.count,
    color: cat.color || CATEGORY_COLORS[index % CATEGORY_COLORS.length]
  })).filter(d => d.value > 0)

  const statusData = [
    { name: 'To Do', value: stats.byStatus.todo, color: STATUS_COLORS.todo },
    { name: 'In Progress', value: stats.byStatus['in-progress'], color: STATUS_COLORS['in-progress'] },
    { name: 'Done', value: stats.byStatus.done, color: STATUS_COLORS.done }
  ].filter(d => d.value > 0)

  const groupData = [
    { name: 'Today', value: stats.groups.today, color: GROUP_COLORS.today },
    { name: 'Upcoming', value: stats.groups.upcoming, color: GROUP_COLORS.upcoming },
    { name: 'Overdue', value: stats.groups.overdue, color: GROUP_COLORS.overdue },
    { name: 'No Date', value: stats.groups.nodate, color: GROUP_COLORS.nodate }
  ].filter(d => d.value > 0)

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Task Insights</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Real-time breakdown of your productivity and task distribution</p>
        </div>
        <button
          type="button"
          onClick={refreshStats}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-white hover:bg-indigo-50 border border-slate-200 rounded-lg shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6"/>
            <path d="M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={stats.total} icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        } variant="indigo" />
        <StatCard label="Completed" value={stats.completed} icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        } variant="green" />
        <StatCard label="Completion Rate" value={`${stats.completionRate}%`} icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" x2="18" y1="20" y2="10"/>
            <line x1="12" x2="12" y1="20" y2="4"/>
            <line x1="6" x2="6" y1="20" y2="14"/>
          </svg>
        } variant="blue" />
        <StatCard label="Overdue Tasks" value={stats.overdue} icon={
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        } variant="red" />
      </div>

      {/* Charts Grid Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tasks by Priority">
          {priorityData.length === 0 ? (
            <EmptyChartMessage message="No active tasks to display priority distribution" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`pcell-${index}`} fill={`var(--chart-priority-${index}, ${entry.color})`} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                  formatter={value => [value, 'tasks']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Tasks by Category">
          {categoryData.length === 0 ? (
            <EmptyChartMessage message="No categorized tasks available yet" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                  formatter={value => [value, 'tasks']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`ccell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {/* Charts Grid Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Tasks by Status">
          {statusData.length === 0 ? (
            <EmptyChartMessage message="No tasks recorded for status comparison" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`scell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                  formatter={value => [value, 'tasks']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Smart Views Distribution">
          {groupData.length === 0 ? (
            <EmptyChartMessage message="No upcoming or dated tasks scheduled" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={groupData} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#1e293b', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  itemStyle={{ color: '#1e293b' }}
                  formatter={value => [value, 'tasks']}
                />
                <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
                  {groupData.map((entry, index) => (
                    <Cell key={`gcell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, variant }) {
  const badgeStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 border border-indigo-100',
    green: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
    blue: 'bg-sky-50 text-sky-600 border border-sky-100',
    red: 'bg-rose-50 text-rose-600 border border-rose-100'
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-1">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${badgeStyles[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm">
      <h2 className="text-base font-bold text-slate-900 mb-3">{title}</h2>
      <div className="h-[260px] w-full">{children}</div>
    </div>
  )
}

function EmptyChartMessage({ message }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
      <svg className="w-8 h-8 mb-2 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" x2="18" y1="20" y2="10"/>
        <line x1="12" x2="12" y1="20" y2="4"/>
        <line x1="6" x2="6" y1="20" y2="14"/>
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  )
}