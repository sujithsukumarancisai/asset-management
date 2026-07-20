import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { employeesApi } from '../services/resources'
import StatusBadge from '../components/StatusBadge.jsx'

export default function EmployeeProfile() {
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([employeesApi.get(id), employeesApi.assignments(id)])
      .then(([empRes, asgRes]) => {
        setEmployee(empRes.data)
        setAssignments(asgRes.data)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-sm text-slate-500">Loading…</p>
  if (!employee) return <p className="text-sm text-rose-600">Employee not found.</p>

  return (
    <div className="space-y-6">
      <Link to="/employees" className="text-sm text-brand-600 hover:text-brand-700">
        ← Back to Employees
      </Link>

      <div className="card p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-700">
              {employee.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{employee.name}</h2>
              <p className="text-sm text-slate-500">{employee.emp_code} · {employee.department}</p>
            </div>
          </div>
          <StatusBadge status={employee.status} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="label">Designation</p>
            <p className="text-sm text-slate-700">{employee.designation || '—'}</p>
          </div>
          <div>
            <p className="label">Email</p>
            <p className="text-sm text-slate-700">{employee.email || '—'}</p>
          </div>
          <div>
            <p className="label">Phone</p>
            <p className="text-sm text-slate-700">{employee.phone || '—'}</p>
          </div>
          <div>
            <p className="label">Assets Assigned</p>
            <p className="text-sm text-slate-700">{employee.assets_assigned}</p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-700">Assigned Assets</h3>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Assigned Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                  No assets assigned yet.
                </td>
              </tr>
            )}
            {assignments.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{a.asset_name}</td>
                <td className="px-4 py-3 text-slate-600">{a.asset_code}</td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(a.assigned_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
