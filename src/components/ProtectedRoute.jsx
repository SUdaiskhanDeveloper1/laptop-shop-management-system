import React, { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Spin } from 'antd'
import { useData } from '../context/DataContext'

export default function ProtectedRoute({ children }) {
  const { user, loading: authLoading } = useAuth()
  const { refreshAll, initialized } = useData()

  useEffect(() => {
    if (user && !initialized) {
      refreshAll()
    }
  }, [user, initialized, refreshAll])

  if (authLoading || (user && !initialized)) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          background: '#f9fafb'
        }}
      >
        <Spin size="large" tip="Loading data..." />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" />
  return children
}
