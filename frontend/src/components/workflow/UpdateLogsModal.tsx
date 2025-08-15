import React from 'react'
import { X, Clock, User } from 'lucide-react'
import { UpdateLog } from '../../types/workflow'
import { formatRelativeTime } from '../../utils/dateUtils'

interface UpdateLogsModalProps {
  isOpen: boolean
  onClose: () => void
  logs: UpdateLog[]
  workflowName: string
}

const UpdateLogsModal: React.FC<UpdateLogsModalProps> = ({
  isOpen,
  onClose,
  logs,
  workflowName,
}) => {
  if (!isOpen) return null

  // Sort logs by timestamp (newest first)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900">Update History</h2>
            <span className="text-sm text-gray-500">- {workflowName}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {sortedLogs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No update history available
            </div>
          ) : (
            <div className="space-y-2">
              {sortedLogs.map((log, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    {index < sortedLogs.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-200 mt-1" />
                    )}
                  </div>

                  {/* Log content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">
                        {log.username}
                      </span>
                      <span className="text-sm text-gray-500">
                        saved version {log.version}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatRelativeTime(log.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {sortedLogs.length} update{sortedLogs.length !== 1 ? 's' : ''}
              {sortedLogs.length >= 50 && ' (maximum 50 displayed)'}
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateLogsModal