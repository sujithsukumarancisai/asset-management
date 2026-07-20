import React, { useEffect, useState } from 'react'
import { assetsApi } from '../services/resources'
import Modal from '../components/Modal.jsx'
import StatusBadge from '../components/StatusBadge.jsx'

const emptyForm = {
  asset_code: '',
  name: '',
  category: '',
  brand: '',
  model: '',
  serial_number: '',
  purchase_date: '',
  warranty_expiry: '',
  vendor: '',
  condition: 'New',
  status: 'Available',
}

const STATUS_FILTERS = ['All', 'Available', 'Assigned', 'Maintenance', 'Lost']

export default function Assets() {
  const [assets, setAssets] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [formError, setFormError] = useState(null)
  const [saving, setSaving] = useState(false)

  const load = (q, status) => {
    setLoading(true)
    const params = {}
    if (q) params.search = q
    if (status && status !== 'All') params.status = status
    assetsApi
      .list(params)
      .then(({ data }) => setAssets(data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => load(search, statusFilter), 300)
    return () => clearTimeout(t)
  }, [search, statusFilter])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setFormError(null)
    try {
      const payload = { ...form }
      if (!payload.purchase_date) delete payload.purchase_date
      if (!payload.warranty_expiry) delete payload.warranty_expiry
      await assetsApi.create(payload)
      setModalOpen(false)
      setForm(emptyForm)
      load(search, statusFilter)
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Could not add asset.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <input
            className="input sm:max-w-xs"
            placeholder="Search assets by name, code, brand…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="input sm:max-w-[160px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary whitespace-nowrap" onClick={() => setModalOpen(true)}>
          + Add Asset
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Asset</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Assigned To</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">Loading…</td>
              </tr>
            )}
            {!loading && assets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">No assets found.</td>
              </tr>
            )}
            {assets.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-700">{a.name}</p>
                  <p className="text-xs text-slate-400">{a.category}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{a.asset_code}</td>
                <td className="px-4 py-3 text-slate-600">{a.brand || '—'}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3 text-slate-600">{a.assigned_to || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Asset" wide>
        <form onSubmit={handleSubmit} className="space-y-3">
          {formError && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Asset Name</label>
              <input name="name" className="input" value={form.name} onChange={handleChange} placeholder="Laptop" required />
            </div>
            <div>
              <label className="label">Category</label>
              <input name="category" className="input" value={form.category} onChange={handleChange} placeholder="Laptop" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Brand</label>
              <input name="brand" className="input" value={form.brand} onChange={handleChange} placeholder="Dell" />
            </div>
            <div>
              <label className="label">Model</label>
              <input name="model" className="input" value={form.model} onChange={handleChange} placeholder="Latitude 7420" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Asset ID</label>
              <input name="asset_code" className="input" value={form.asset_code} onChange={handleChange} placeholder="LAP001" required />
            </div>
            <div>
              <label className="label">Serial Number</label>
              <input name="serial_number" className="input" value={form.serial_number} onChange={handleChange} placeholder="ABC12345" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Purchase Date</label>
              <input type="date" name="purchase_date" className="input" value={form.purchase_date} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Warranty Expiry</label>
              <input type="date" name="warranty_expiry" className="input" value={form.warranty_expiry} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Vendor</label>
              <input name="vendor" className="input" value={form.vendor} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Condition</label>
              <select name="condition" className="input" value={form.condition} onChange={handleChange}>
                <option>New</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select name="status" className="input" value={form.status} onChange={handleChange}>
                <option>Available</option>
                <option>Maintenance</option>
                <option>Lost</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
