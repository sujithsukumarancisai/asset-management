import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { employeesApi } from '../services/resources'
import Modal from '../components/Modal.jsx'

const emptyForm = {
  emp_code: '',
  name: '',
  email: '',
  phone: '',
  department: '',
  designation: '',
  status: 'Active',
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = (q) => {
    setLoading(true)
    employeesApi
      .list(q ? { search: q } : {})
      .then(({ data }) => setEmployees(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      await employeesApi.create(form)
      setModalOpen(false)
      setForm(emptyForm)
      load(search)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Could not add employee.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          className="input sm:max-w-xs"
          placeholder="Search employee by name, ID, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn-primary" onClick={() => setModalOpen(true)}>
          + Add Employee
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Assets Assigned</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No employees found.
                </td>
              </tr>
            )}
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-700">{emp.emp_code}</td>
                <td className="px-4 py-3">{emp.name}</td>
                <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                <td className="px-4 py-3 text-slate-600">{emp.assets_assigned}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    to={`/employees/${emp.id}`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Employee">
        <form onSubmit={handleSubmit} className="space-y-3">
          {formError && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>
          )}
          <div>
            <label className="label">Employee ID</label>
            <input name="emp_code" className="input" value={form.emp_code} onChange={handleChange} placeholder="EMP001" required />
          </div>
          <div>
            <label className="label">Name</label>
            <input name="name" className="input" value={form.name} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Department</label>
              <input name="department" className="input" value={form.department} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Designation</label>
              <input name="designation" className="input" value={form.designation} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input name="phone" className="input" value={form.phone} onChange={handleChange} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Employee'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
