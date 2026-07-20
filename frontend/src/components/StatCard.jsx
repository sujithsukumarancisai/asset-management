import React from 'react'

const colorMap = {
  indigo: 'bg-brand-50 text-brand-700',
  teal: 'bg-teal-50 text-teal-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  slate: 'bg-slate-100 text-slate-700',
}

export default function StatCard({ label, value, icon, color = 'indigo' }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg text-lg ${colorMap[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}
