import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import MusashiFlowEditor from './pages/MusashiFlowEditor'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import Components from './pages/Components'
import SharedWorkflow from './pages/SharedWorkflow'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
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
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App