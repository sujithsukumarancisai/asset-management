import React, { useEffect, useState } from 'react'
import { employeesApi, assetsApi, assignmentsApi } from '../services/resources'
import StatusBadge from '../components/StatusBadge.jsx'

export default function Assignments() {
  const [employees, setEmployees] = useState([])
  const [availableAssets, setAvailableAssets] = useState([])
  const [assignments, setAssignments] = useState([])
  const [employeeId, setEmployeeId] = useState('')
  const [assetId, setAssetId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [statusFilter, setStatusFilter] = useState('Active')

  const loadAll = () => {
    setLoading(true)
    Promise.all([
      employeesApi.list(),
      assetsApi.list({ status: 'Available' }),
      assignmentsApi.list(statusFilter === 'All' ? {} : { status: statusFilter }),
    ])
      .then(([empRes, assetRes, asgRes]) => {
        setEmployees(empRes.data)
        setAvailableAssets(assetRes.data)
        setAssignments(asgRes.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter])

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!employeeId || !assetId) return
    setSubmitting(true)
    setError(null)
    try {
      await assignmentsApi.create({
        employee_id: Number(employeeId),
        asset_id: Number(assetId),
        notes: notes || undefined,
      })
      setEmployeeId('')
      setAssetId('')
      setNotes('')
      loadAll()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not assign asset.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReturn = async (id) => {
    try {
      await assignmentsApi.returnAsset(id)
      loadAll()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not process return.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Assign Asset</h2>
        {error && (
          <div className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
        )}
        <form onSubmit={handleAssign} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className="label">Employee</label>
            <select
              className="input"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            >
              <option value="">Select employee…</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} ({e.emp_code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Asset</label>
            <select
              className="input"
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              required
            >
              <option value="">Select asset…</option>
              {availableAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.asset_code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full" disabled={submitting}>
              {submitting ? 'Assigning…' : 'Assign'}
            </button>
          </div>
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h3 className="text-sm font-semibold text-slate-700">Assigned Assets</h3>
          <select
            className="input w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Returned">Returned</option>
            <option value="All">All</option>
          </select>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Assigned Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading…</td>
              </tr>
            )}
            {!loading && assignments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No assignments found.</td>
              </tr>
            )}
            {assignments.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{a.employee_name}</td>
                <td className="px-4 py-3 text-slate-600">{a.asset_name} ({a.asset_code})</td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(a.assigned_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3 text-right">
                  {a.status === 'Active' && (
                    <button
                      onClick={() => handleReturn(a.id)}
                      className="text-sm font-medium text-brand-600 hover:text-brand-700"
                    >
                      Mark Returned
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
