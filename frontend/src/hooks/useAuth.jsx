import React, { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../services/resources'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem('admin')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = useCallback(async (username, password) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await authApi.login(username, password)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('admin', JSON.stringify(data.admin))
      setAdmin(data.admin)
      return true
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('admin')
    setAdmin(null)
  }, [])

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
