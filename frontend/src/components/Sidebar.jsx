import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/employees', label: 'Employees', icon: '👨‍💼' },
  { to: '/assets', label: 'Assets', icon: '💻' },
  { to: '/assignments', label: 'Assignments', icon: '🔄' },
  { to: '/reports', label: 'Reports', icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="flex h-screen w-60 flex-col bg-ink-900 text-slate-300">
      <div className="flex items-center gap-2 border-b border-white/10 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-sm font-bold text-white">
          CA
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-tight">Company Assets</p>
          <p className="text-[11px] text-slate-400 leading-tight">Management System</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="text-base leading-none">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 px-3 py-4">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <span className="text-base leading-none">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  )
}
