import React, { useState } from 'react'
import { X, Copy, Check, FileText, Box } from 'lucide-react'
import { ConnectedOutput } from '../../types/node'

interface ConnectedOutputViewerProps {
  isOpen: boolean
  onClose: () => void
  connectedOutputs: ConnectedOutput[]
  nodeLabel: string
}

const ConnectedOutputViewer: React.FC<ConnectedOutputViewerProps> = ({
  isOpen,
  onClose,
  connectedOutputs,
  nodeLabel
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  if (!isOpen) return null

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // JSON 구문 강조
  const highlightJSON = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr)
      const formatted = JSON.stringify(parsed, null, 2)
      
      return formatted
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
          let cls = 'number'
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key'
            } else {
              cls = 'string'
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean'
          } else if (/null/.test(match)) {
            cls = 'null'
          }
          
          const colors: Record<string, string> = {
            key: '#0550ae',
            string: '#0a7ea4',
            number: '#0550ae',
            boolean: '#0550ae',
            null: '#6e7781'
          }
          
          return `<span style="color: ${colors[cls]}">${match}</span>`
        })
    } catch (e) {
      return jsonStr
    }
  }

  const isJSON = (str: string) => {
    if (!str) return false
    try {
      const parsed = JSON.parse(str)
      return typeof parsed === 'object'
    } catch (e) {
      return false
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl flex flex-col w-full max-w-4xl h-[70vh] mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Connected Outputs</h2>
              <p className="text-sm text-gray-500">{nodeLabel} - {connectedOutputs.length} connection{connectedOutputs.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {connectedOutputs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Box className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No outputs connected yet</p>
              <p className="text-xs mt-1">Connect other nodes to this Final Output node to see their outputs here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {connectedOutputs.map((output, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {output.nodeName}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                          {output.outputKey}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Node ID: {output.nodeId}</span>
                        <span>Type: <span className="font-mono">{output.outputType}</span></span>
                      </div>
                    </div>
                    {output.outputExample && (
                      <button
                        onClick={() => handleCopy(output.outputExample!, index)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy example"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>

                  {output.outputExample && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Example Value:</div>
                      {isJSON(output.outputExample) ? (
                        <pre 
                          className="text-xs bg-gray-50 p-3 rounded-md overflow-x-auto font-mono"
                          dangerouslySetInnerHTML={{ __html: highlightJSON(output.outputExample) }}
                        />
                      ) : (
                        <div className="text-sm bg-gray-50 p-3 rounded-md text-gray-700 font-mono">
                          {output.outputExample}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="text-sm text-gray-500">
            Final Output will automatically include all connected outputs
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-musashi-600 text-white rounded-md hover:bg-musashi-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConnectedOutputViewer