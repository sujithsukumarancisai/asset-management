import api from './api'

export const authApi = {
  login: (username, password) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    return api.post('/api/auth/login', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  },
  me: () => api.get('/api/auth/me'),
}

export const dashboardApi = {
  stats: () => api.get('/api/dashboard/stats'),
}

export const employeesApi = {
  list: (params) => api.get('/api/employees', { params }),
  get: (id) => api.get(`/api/employees/${id}`),
  assignments: (id) => api.get(`/api/employees/${id}/assignments`),
  create: (data) => api.post('/api/employees', data),
  update: (id, data) => api.put(`/api/employees/${id}`, data),
  remove: (id) => api.delete(`/api/employees/${id}`),
}

export const assetsApi = {
  list: (params) => api.get('/api/assets', { params }),
  get: (id) => api.get(`/api/assets/${id}`),
  history: (id) => api.get(`/api/assets/${id}/history`),
  create: (data) => api.post('/api/assets', data),
  update: (id, data) => api.put(`/api/assets/${id}`, data),
  remove: (id) => api.delete(`/api/assets/${id}`),
}

export const assignmentsApi = {
  list: (params) => api.get('/api/assignments', { params }),
  create: (data) => api.post('/api/assignments', data),
  returnAsset: (id) => api.post(`/api/assignments/${id}/return`),
}

export const reportsApi = {
  types: () => api.get('/api/reports'),
  downloadExcel: (type) => api.get(`/api/reports/${type}/excel`, { responseType: 'blob' }),
  downloadPdf: (type) => api.get(`/api/reports/${type}/pdf`, { responseType: 'blob' }),
}
