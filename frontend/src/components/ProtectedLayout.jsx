import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

const TITLES = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/assets': 'Assets',
  '/assignments': 'Assignments',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export function ProtectedLayout() {
  const { admin } = useAuth()

  if (!admin) {
    return <Navigate to="/login" replace />
  }

  const path = window.location.pathname
  const matched = Object.keys(TITLES).find((key) =>
    key === '/' ? path === '/' : path.startsWith(key),
  )
  const title = TITLES[matched] || 'Company Asset Management'

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
