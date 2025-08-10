import React from 'react'
import { useParams } from 'react-router-dom'

const SharedWorkflow: React.FC = () => {
  const { shareToken } = useParams()
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Shared Workflow Viewer
        </h1>
        <p className="text-gray-600">
          Share token: {shareToken}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          Workflow sharing is temporarily disabled while we fix some issues.
        </p>
      </div>
    </div>
  )
}

export default SharedWorkflow