import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, user, isLoading } = useAuth()

  console.log('ProtectedRoute:', { 
    isAuthenticated, 
    user: user ? { username: user.username, role: user.role } : null, 
    isLoading, 
    requireAdmin 
  })

  if (isLoading) {
    console.log('ProtectedRoute: Still loading, showing spinner')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-musashi-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login')
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && user?.role !== 'admin') {
    console.log('ProtectedRoute: Admin required but user is not admin, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  console.log('ProtectedRoute: Access granted, rendering children')
  return <>{children}</>
}

export default ProtectedRoute