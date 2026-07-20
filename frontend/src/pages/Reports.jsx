import React, { useState } from 'react'
import { reportsApi } from '../services/resources'

const REPORTS = [
  { key: 'employee', label: 'Employee Report', icon: '👨‍💼' },
  { key: 'asset', label: 'Asset Report', icon: '💻' },
  { key: 'department', label: 'Department Report', icon: '🏢' },
  { key: 'available', label: 'Available Assets', icon: '✅' },
  { key: 'assigned', label: 'Assigned Assets', icon: '🔄' },
  { key: 'maintenance', label: 'Maintenance Report', icon: '🛠️' },
  { key: 'warranty', label: 'Warranty Expiry Report', icon: '📅' },
]

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export default function Reports() {
  const [pending, setPending] = useState(null)
  const [error, setError] = useState(null)

  const handleExport = async (key, format) => {
    setPending(`${key}-${format}`)
    setError(null)
    try {
      const { data } = format === 'excel'
        ? await reportsApi.downloadExcel(key)
        : await reportsApi.downloadPdf(key)
      const ext = format === 'excel' ? 'xlsx' : 'pdf'
      downloadBlob(data, `${key}_report.${ext}`)
    } catch (err) {
      setError('Could not generate the report. Please try again.')
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Generate and download reports as Excel or PDF.
      </p>

      {error && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((r) => (
          <div key={r.key} className="card flex flex-col justify-between p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-lg">
                {r.icon}
              </div>
              <p className="font-medium text-slate-800">{r.label}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="btn-secondary flex-1"
                onClick={() => handleExport(r.key, 'excel')}
                disabled={pending === `${r.key}-excel`}
              >
                {pending === `${r.key}-excel` ? 'Exporting…' : 'Export Excel'}
              </button>
              <button
                className="btn-secondary flex-1"
                onClick={() => handleExport(r.key, 'pdf')}
                disabled={pending === `${r.key}-pdf`}
              >
                {pending === `${r.key}-pdf` ? 'Exporting…' : 'Export PDF'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
