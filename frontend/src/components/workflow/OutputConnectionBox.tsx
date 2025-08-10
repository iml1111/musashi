import React, { useState, useEffect } from 'react'
import { Node, Edge } from '../../types/flow'
import { Plus, Unlink, ArrowRight, ArrowLeftRight } from 'lucide-react'
import { getNodeIcon, getNodeIconClass } from '../../utils/nodeIcons'
import NodeDropdown from './NodeDropdown'
import EdgeDirectionSelector from './EdgeDirectionSelector'

interface OutputConnectionBoxProps {
  output: { key: string; type: string }
  outputHandle: string
  selectedNodeId: string
  edges: Edge[]
  nodes: Node[]
  availableNodes: Node[]
  onAddConnection: (sourceId: string, targetId: string, sourceHandle?: string) => void
  onRemoveConnection: (edgeId: string) => void
  onUpdateEdgeDirection?: (edgeId: string, direction: 'unidirectional' | 'bidirectional') => void
}

const OutputConnectionBox: React.FC<OutputConnectionBoxProps> = ({
  output,
  outputHandle,
  selectedNodeId,
  edges,
  nodes,
  availableNodes,
  onAddConnection,
  onRemoveConnection,
  onUpdateEdgeDirection,
}) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<string>('')

  const outputConnections = edges.filter(edge => 
    edge.source === selectedNodeId && edge.sourceHandle === outputHandle
  )

  const handleAddConnection = () => {
    if (selectedTarget) {
      onAddConnection(selectedNodeId, selectedTarget, outputHandle)
      setSelectedTarget('')
      setIsConnecting(false)
    }
  }

  const handleCancel = () => {
    setIsConnecting(false)
    setSelectedTarget('')
  }

  // Auto-connect when target is selected
  useEffect(() => {
    if (selectedTarget && isConnecting) {
      handleAddConnection()
    }
  }, [selectedTarget])

  return (
    <div className="bg-gray-50 p-3 rounded-md">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-medium">{output.key}</span>
          <span className="text-xs text-gray-500 ml-1">({output.type})</span>
        </div>
      </div>
      
      {/* Existing connections for this output */}
      {outputConnections.length > 0 && (
        <div className="space-y-1 mb-2">
          {outputConnections.map(edge => {
            const targetNode = nodes.find(n => n.id === edge.target)
            const targetType = targetNode?.type || 'default'
            return (
              <div key={edge.id} className="flex items-center justify-between bg-white p-2 rounded">
                <div className="flex items-center space-x-2">
                  <span className={getNodeIconClass(targetType)}>
                    {getNodeIcon(targetType)}
                  </span>
                  <span className="text-xs">
                    {targetNode?.data?.label || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  {onUpdateEdgeDirection && (
                    <EdgeDirectionSelector
                      edgeId={edge.id}
                      currentDirection={edge.data?.direction || 'unidirectional'}
                      onDirectionChange={onUpdateEdgeDirection}
                    />
                  )}
                  <button
                    onClick={() => onRemoveConnection(edge.id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    title="Remove connection"
                  >
                    <Unlink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      
      {/* Add connection for this output */}
      {!isConnecting ? (
        <button
          onClick={() => setIsConnecting(true)}
          className="flex items-center text-xs text-musashi-600 hover:text-musashi-700"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add connection from {output.key}
        </button>
      ) : (
        // Connection dialog for this specific output
        <div className="space-y-2 mt-2">
          <NodeDropdown
            value={selectedTarget}
            onChange={setSelectedTarget}
            nodes={availableNodes}
            placeholder="Select target node to connect"
          />
          <button
            onClick={handleCancel}
            className="w-full px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default OutputConnectionBox