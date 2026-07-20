import React, { useEffect, useState } from 'react'
import { dashboardApi } from '../services/resources'
import StatCard from '../components/StatCard.jsx'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    dashboardApi
      .stats()
      .then(({ data }) => setStats(data))
      .catch(() => setError('Could not load dashboard stats.'))
  }, [])

  if (error) return <p className="text-sm text-rose-600">{error}</p>
  if (!stats) return <p className="text-sm text-slate-500">Loading…</p>

  const cards = [
    { label: 'Total Employees', value: stats.total_employees, icon: '👨‍💼', color: 'indigo' },
    { label: 'Total Assets', value: stats.total_assets, icon: '💻', color: 'slate' },
    { label: 'Assigned', value: stats.assigned, icon: '🔄', color: 'indigo' },
    { label: 'Available', value: stats.available, icon: '✅', color: 'teal' },
    { label: 'Maintenance', value: stats.maintenance, icon: '🛠️', color: 'amber' },
    { label: 'Lost', value: stats.lost, icon: '⚠️', color: 'rose' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Asset Distribution</h2>
        <div className="space-y-3">
          {[
            { label: 'Assigned', value: stats.assigned, total: stats.total_assets, color: 'bg-brand-500' },
            { label: 'Available', value: stats.available, total: stats.total_assets, color: 'bg-teal-500' },
            { label: 'Maintenance', value: stats.maintenance, total: stats.total_assets, color: 'bg-amber-500' },
            { label: 'Lost', value: stats.lost, total: stats.total_assets, color: 'bg-rose-500' },
          ].map((row) => {
            const pct = row.total ? Math.round((row.value / row.total) * 100) : 0
            return (
              <div key={row.label}>
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>{row.label}</span>
                  <span>{row.value} ({pct}%)</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full ${row.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
