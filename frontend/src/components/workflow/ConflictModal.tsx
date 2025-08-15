import React from 'react'
import { AlertTriangle, RefreshCw, Save } from 'lucide-react'

interface ConflictModalProps {
  isOpen: boolean
  onClose: () => void
  onKeepLocal: () => void
  onUseServer: () => void
  conflictInfo: {
    message: string
    currentVersion: number
    yourVersion: number
    lastModifiedBy?: string
  } | null
}

const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  onClose,
  onKeepLocal,
  onUseServer,
  conflictInfo,
}) => {
  if (!isOpen || !conflictInfo) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Workflow Conflict Detected</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-3">{conflictInfo.message}</p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 space-y-1">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Server Version:</span> {conflictInfo.currentVersion}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Your Version:</span> {conflictInfo.yourVersion}
            </p>
            {conflictInfo.lastModifiedBy && (
              <p className="text-sm text-gray-700">
                <span className="font-medium">Last Modified By:</span> {conflictInfo.lastModifiedBy}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onUseServer}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Server Version (Recommended)
          </button>
          
          <button
            onClick={onKeepLocal}
            className="w-full flex items-center justify-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            <Save className="w-4 h-4 mr-2" />
            Keep My Changes (Override)
          </button>
          
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-xs text-blue-700">
            <strong>Tip:</strong> Choose "Load Server Version" to see the latest changes from other users. 
            You can then reapply your changes if needed.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConflictModal