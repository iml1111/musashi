import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import MusashiFlowEditor from './pages/MusashiFlowEditor'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import Components from './pages/Components'
// Temporarily disable SharedWorkflow to avoid initialization issues
// import SharedWorkflow from './pages/SharedWorkflow'
import React from 'react'

// Test component for React Flow testing
const SharedWorkflow = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">React Flow Test Environment</h2>
      <p className="text-gray-600 mb-6">Testing workflow editor components without authentication</p>
      <MusashiFlowEditor />
    </div>
  </div>
)

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Navigate to="/dashboard" replace />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/workflow/new" 
                element={
                  <ProtectedRoute>
                    <MusashiFlowEditor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/workflow/:id" 
                element={
                  <ProtectedRoute>
                    <MusashiFlowEditor />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/components" 
                element={
                  <ProtectedRoute>
                    <Components />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/shared/:shareToken" 
                element={<SharedWorkflow />}
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App