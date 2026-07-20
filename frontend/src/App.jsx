import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { ProtectedLayout } from './components/ProtectedLayout.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Employees from './pages/Employees.jsx'
import EmployeeProfile from './pages/EmployeeProfile.jsx'
import Assets from './pages/Assets.jsx'
import Assignments from './pages/Assignments.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeProfile />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/assignments" element={<Assignments />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
