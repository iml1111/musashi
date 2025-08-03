import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import Dashboard from './pages/Dashboard'
import WorkflowEditor from './pages/WorkflowEditor'
import Login from './pages/Login'
import Components from './pages/Components'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Dashboard />} />
            <Route path="/workflow/:id" element={<WorkflowEditor />} />
            <Route path="/workflow/new" element={<WorkflowEditor />} />
            <Route path="/components" element={<Components />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App