import React, { useState } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import api from '../services/api'

export default function Settings() {
  const { admin } = useAuth()
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'admin' })
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    setError(null)
    try {
      await api.post('/api/auth/register', form)
      setMessage(`Admin "${form.username}" created successfully.`)
      setForm({ username: '', email: '', password: '', role: 'admin' })
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create admin account.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Your Account</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="label">Username</p>
            <p className="text-sm text-slate-700">{admin?.username}</p>
          </div>
          <div>
            <p className="label">Email</p>
            <p className="text-sm text-slate-700">{admin?.email}</p>
          </div>
          <div>
            <p className="label">Role</p>
            <p className="text-sm capitalize text-slate-700">{admin?.role}</p>
          </div>
        </div>
      </div>

      {admin?.role === 'superadmin' && (
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold text-slate-700">Add New Admin</h2>
          {message && (
            <div className="mb-3 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">{message}</div>
          )}
          {error && (
            <div className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          )}
          <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Username</label>
              <input name="username" className="input" value={form.username} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" className="input" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" className="input" value={form.password} onChange={handleChange} required />
            </div>
            <div>
              <label className="label">Role</label>
              <select name="role" className="input" value={form.role} onChange={handleChange}>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Creating…' : 'Create Admin'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
