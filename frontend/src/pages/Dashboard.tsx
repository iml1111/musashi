import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Share2 } from 'lucide-react'

const Dashboard: React.FC = () => {
  const workflows = [
    { id: '1', name: 'Customer Support Agent', description: 'Automated customer support workflow', updatedAt: '2024-01-15' },
    { id: '2', name: 'Content Generation', description: 'Multi-step content creation process', updatedAt: '2024-01-14' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Musashi</h1>
              <span className="ml-3 text-sm text-gray-500">Cut the code. Shape the flow.</span>
            </div>
            <Link
              to="/workflow/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-musashi-600 hover:bg-musashi-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Workflow
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900">Your Workflows</h2>
          <p className="text-gray-600">Design and manage your AI agent workflows</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{workflow.description}</p>
                  <p className="text-xs text-gray-400">Updated {workflow.updatedAt}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                <Link
                  to={`/workflow/${workflow.id}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Dashboard