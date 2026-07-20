import React from 'react'

const STYLES = {
  Available: 'bg-teal-50 text-teal-700',
  Assigned: 'bg-brand-50 text-brand-700',
  Maintenance: 'bg-amber-50 text-amber-700',
  Lost: 'bg-rose-50 text-rose-700',
  Active: 'bg-teal-50 text-teal-700',
  Inactive: 'bg-slate-100 text-slate-600',
  Returned: 'bg-slate-100 text-slate-600',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
      {status}
    </span>
  )
}
