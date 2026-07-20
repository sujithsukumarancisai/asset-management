import React from 'react'
import { useAuth } from '../hooks/useAuth.jsx'

export default function Navbar({ title }) {
  const { admin } = useAuth()

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-slate-800 leading-tight">{admin?.username}</p>
          <p className="text-xs text-slate-400 leading-tight capitalize">{admin?.role}</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
          {admin?.username?.[0]?.toUpperCase() || '?'}
        </div>
      </div>
    </header>
  )
}
