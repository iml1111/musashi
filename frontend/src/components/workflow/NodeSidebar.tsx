import React, { useState } from 'react'
import { Node, Edge } from '../../types/flow'
import { 
  X, Plus, Trash2, Link2, Unlink, Edit2, AlertCircle, 
  ChevronDown, ChevronUp, Globe, 
  Terminal, Image, Check
} from 'lucide-react'
import { nodeDescriptions } from '../../constants/nodeDescriptions'
import OutputConnectionBox from './OutputConnectionBox'
// InputItem component is no longer used directly
import ModelDropdown from './ModelDropdown'
import PromptViewerModal from './PromptViewerModal'
import { validateAgentConnections, validateUserInputToAgentConnections } from '../../utils/connectionValidator'
import { validateSystemPrompt, formatValidationWarning } from '../../utils/systemPromptValidator'
import { ConnectedInput, ConnectedOutput, isFinalOutputNode } from '../../types/node'
import ConnectedOutputViewer from './ConnectedOutputViewer'
import { getUnusedInputs } from '../../utils/inputUsageChecker'

// OutputItem Component
interface OutputItemProps {
  output: { key: string; type: string; example?: string }
  index: number
  onUpdate: (output: { key: string; type: string; example?: string }) => void
  onDelete?: () => void
}

const OutputItem: React.FC<OutputItemProps> = ({ output, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editKey, setEditKey] = useState(output.key)
  const [editType, setEditType] = useState(output.type)
  const [editExample, setEditExample] = useState(output.example || '')

  const handleSave = () => {
    if (editKey.trim()) {
      onUpdate({ 
        key: editKey.trim(), 
        type: editType,
        example: editExample.trim()
      })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditKey(output.key)
    setEditType(output.type)
    setEditExample(output.example || '')
    setIsEditing(false)
  }

  // JSON 구문 강조를 위한 함수
  const highlightJSON = (jsonStr: string) => {
    try {
      // JSON 파싱 및 포맷팅
      const parsed = JSON.parse(jsonStr)
      const formatted = JSON.stringify(parsed, null, 2)
      
      // JSON 구문 강조
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
            key: '#0550ae',     // 진한 파란색
            string: '#0a7ea4',  // 파란색
            number: '#0550ae',  // 진한 파란색
            boolean: '#0550ae', // 진한 파란색
            null: '#6e7781'     // 회색
          }
          
          return `<span style="color: ${colors[cls] || '#000'}">${match}</span>`
        })
    } catch (e) {
      // JSON이 아닌 경우 원본 반환
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

  if (isEditing) {
    return (
      <div className="bg-gray-50 p-2 rounded-md space-y-2">
        <input
          type="text"
          value={editKey}
          onChange={(e) => setEditKey(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-musashi-500"
          placeholder="Key name"
        />
        <select
          value={editType}
          onChange={(e) => setEditType(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-musashi-500"
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="object">Object</option>
          <option value="array">Array</option>
        </select>
        <textarea
          value={editExample}
          onChange={(e) => setEditExample(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-musashi-500 font-mono"
          placeholder={editType === 'object' ? '{"key": "value"}' : editType === 'array' ? '["item1", "item2"]' : 'Example value'}
          rows={3}
        />
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={!editKey.trim()}
            className={`flex-1 px-2 py-1 text-xs rounded ${
              editKey.trim()
                ? 'bg-musashi-600 text-white hover:bg-musashi-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-2 rounded-md">
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1">
          <span className="text-sm font-medium">{output.key}</span>
          <span className="text-xs text-gray-500 ml-2">({output.type})</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-600 hover:text-gray-700 p-1"
            title="Edit output"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 p-1"
              title="Delete output"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
      {output.example && (
        <div className="mt-2">
          <span className="text-xs text-gray-500">Example:</span>
          {isJSON(output.example) ? (
            <pre 
              className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto font-mono"
              dangerouslySetInnerHTML={{ __html: highlightJSON(output.example) }}
            />
          ) : (
            <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
              {output.example}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface NodeSidebarProps {
  selectedNode: Node | null
  nodes: Node[]
  edges: Edge[]
  onClose: () => void
  onUpdateNode: (nodeId: string, updates: Partial<Node>) => void
  onDeleteNode: (nodeId: string) => void
  onAddConnection: (sourceId: string, targetId: string, sourceHandle?: string) => void
  onRemoveConnection: (edgeId: string) => void
  onUpdateEdgeDirection?: (edgeId: string, direction: 'unidirectional' | 'bidirectional') => void
  onSaveWorkflow?: () => void
}

const NodeSidebar: React.FC<NodeSidebarProps> = ({
  selectedNode,
  nodes,
  edges,
  onClose,
  onUpdateNode,
  onDeleteNode,
  onAddConnection,
  onRemoveConnection,
  onUpdateEdgeDirection,
  onSaveWorkflow,
}) => {
  const [isConnecting, setIsConnecting] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<string>('')
  const [isAddingOutput, setIsAddingOutput] = useState(false)
  const [newOutputKey, setNewOutputKey] = useState('')
  const [newOutputType, setNewOutputType] = useState('string')
  const [newOutputExample, setNewOutputExample] = useState('')
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showPromptViewerModal, setShowPromptViewerModal] = useState(false)
  const [showConnectedOutputViewer, setShowConnectedOutputViewer] = useState(false)

  if (!selectedNode) return null

  // Find the current node from nodes array to get updated data
  const currentNode = nodes.find(n => n.id === selectedNode.id)
  
  // Debug: Log the current node data
  
  // If we can't find the node in the current nodes array, something went wrong
  if (!currentNode) {
    return null
  }

  // Get connections for the selected node
  const outgoingConnections = edges.filter(edge => edge.source === selectedNode.id)
  const incomingConnections = edges.filter(edge => edge.target === selectedNode.id)

  // Get available nodes for connection (excluding self)
  const availableNodes = nodes.filter(node => node.id !== selectedNode.id)

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value
    onUpdateNode(selectedNode.id, {
      data: { ...selectedNode.data, label: newLabel }
    })
  }

  const handleAddConnection = () => {
    if (selectedTarget) {
      onAddConnection(selectedNode.id, selectedTarget)
      setSelectedTarget('')
      setIsConnecting(false)
    }
  }

  const handleDeleteNode = () => {
    onDeleteNode(selectedNode.id)
    onClose()
  }

  return (
    <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg border-l border-gray-200 z-10 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Node Details</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Description */}
        {selectedNode.type && nodeDescriptions[selectedNode.type] && (
          <p className="text-xs text-gray-600 leading-relaxed">
            {nodeDescriptions[selectedNode.type]}
          </p>
        )}

        {/* Read-only Node Information */}
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span>
            <span className="text-sm text-gray-700 font-medium">{currentNode.data?.name || 'Unnamed'}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">ID</span>
            <span className="text-xs text-gray-600 font-mono select-all">{selectedNode.id}</span>
          </div>
        </div>

        {/* Editable Fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Label
          </label>
          <input
            type="text"
            value={currentNode.data?.label || ''}
            onChange={handleLabelChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-musashi-500"
          />
        </div>
        
        {/* Memo Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Memo
          </label>
          <textarea
            value={currentNode.data?.memo || ''}
            onChange={(e) => {
              onUpdateNode(selectedNode.id, {
                data: { ...selectedNode.data, memo: e.target.value }
              })
            }}
            placeholder="Add your notes or comments here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-musashi-500 resize-none"
            rows={3}
          />
        </div>

        {/* Outputs for all node types except MCP and Function (they have their own Output Configuration) */}
        {selectedNode.type !== 'mcp' && selectedNode.type !== 'function' && (
        <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Outputs</h3>
            
            {/* Special handling for Final Output nodes */}
            {selectedNode.type === 'finaloutput' ? (
              <div className="space-y-3">
                <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">Auto-Generated Outputs</span><br />
                    Final Output automatically includes all connected node outputs. Connect other nodes to populate outputs.
                  </p>
                </div>
                
                {isFinalOutputNode(currentNode.data) && currentNode.data.connected_outputs.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {currentNode.data.connected_outputs.length} connected output{currentNode.data.connected_outputs.length !== 1 ? 's' : ''}
                      </p>
                      <button
                        onClick={() => setShowConnectedOutputViewer(true)}
                        className="text-xs text-musashi-600 hover:text-musashi-700"
                      >
                        View Details
                      </button>
                    </div>
                    
                    {/* Display connected outputs as read-only */}
                    {currentNode.data.connected_outputs.map((output: ConnectedOutput, index: number) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-md p-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium">{output.outputKey}</span>
                            <span className="text-xs text-gray-500 ml-2">({output.outputType})</span>
                          </div>
                          <span className="text-xs text-gray-400">{output.nodeName}</span>
                        </div>
                        {output.outputExample && (
                          <div className="mt-1 text-xs text-gray-500 font-mono truncate">
                            {output.outputExample}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    No outputs connected yet. Connect other nodes to this Final Output node.
                  </p>
                )}
              </div>
            ) : (
              /* Regular output handling for other nodes */
              <div className="space-y-2">
                {(currentNode.data?.outputs || []).map((output: any, index: number) => (
                  <OutputItem
                    key={index}
                    output={output}
                    index={index}
                    onUpdate={(updatedOutput) => {
                      const newOutputs = [...(currentNode.data?.outputs || [])]
                      newOutputs[index] = updatedOutput
                      onUpdateNode(selectedNode.id, {
                        data: { ...currentNode.data, outputs: newOutputs }
                      })
                    }}
                    onDelete={selectedNode.type !== 'vectorstore' ? () => {
                      const newOutputs = [...(currentNode.data?.outputs || [])]
                      newOutputs.splice(index, 1)
                      onUpdateNode(selectedNode.id, {
                        data: { ...currentNode.data, outputs: newOutputs }
                      })
                    } : undefined}
                  />
                ))}
                
                {selectedNode.type !== 'vectorstore' && (!currentNode.data?.outputs || currentNode.data.outputs.length < 30) && !isAddingOutput && (
                <button
                  onClick={() => {
                    setIsAddingOutput(true)
                    setNewOutputKey(`output${(currentNode.data?.outputs || []).length + 1}`)
                    setNewOutputType('string')
                    setNewOutputExample('')
                  }}
                  className="flex items-center text-sm text-musashi-600 hover:text-musashi-700 w-full justify-center py-2 border border-dashed border-gray-300 rounded-md hover:border-musashi-300"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Output
                </button>
              )}
              
              {selectedNode.type !== 'vectorstore' && isAddingOutput && (
                <div className="bg-gray-50 p-3 rounded-md space-y-2">
                  <input
                    type="text"
                    placeholder="Key name"
                    value={newOutputKey}
                    onChange={(e) => setNewOutputKey(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-musashi-500"
                  />
                  <select
                    value={newOutputType}
                    onChange={(e) => setNewOutputType(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-musashi-500"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                    <option value="object">Object</option>
                    <option value="array">Array</option>
                  </select>
                  <textarea
                    value={newOutputExample}
                    onChange={(e) => setNewOutputExample(e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-musashi-500 font-mono"
                    placeholder={newOutputType === 'object' ? '{"key": "value"}' : newOutputType === 'array' ? '["item1", "item2"]' : 'Example value'}
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (newOutputKey.trim()) {
                          const newOutputs = [...(currentNode.data?.outputs || [])]
                          newOutputs.push({ 
                            key: newOutputKey.trim(), 
                            type: newOutputType,
                            example: newOutputExample.trim()
                          })
                          onUpdateNode(selectedNode.id, {
                            data: { ...currentNode.data, outputs: newOutputs }
                          })
                          setIsAddingOutput(false)
                          setNewOutputKey('')
                          setNewOutputType('string')
                          setNewOutputExample('')
                        }
                      }}
                      disabled={!newOutputKey.trim()}
                      className={`flex-1 px-2 py-1 text-xs rounded ${
                        newOutputKey.trim()
                          ? 'bg-musashi-600 text-white hover:bg-musashi-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingOutput(false)
                        setNewOutputKey('')
                        setNewOutputType('string')
                        setNewOutputExample('')
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {currentNode.data?.outputs && currentNode.data.outputs.length >= 30 && (
                <p className="text-xs text-gray-500 text-center">Maximum 30 outputs reached</p>
              )}
              </div>
            )}
          </div>
        )}

        {/* Connections - Moved to right after Outputs */}
        <div className="border-t pt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Connections</h3>
          
          {/* Special connections UI for User Input, Vector Store, and Knowledge Base nodes */}
          {(selectedNode.type === 'userinput' || selectedNode.type === 'vectorstore' || selectedNode.type === 'knowledgebase') ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Connect outputs to other nodes:</p>
              {currentNode.data?.outputs && currentNode.data.outputs.length > 0 ? (
                currentNode.data.outputs.map((output: any) => (
                  <OutputConnectionBox
                    key={output.key}
                    output={output}
                    outputHandle={`output-${output.key}`}
                    selectedNodeId={selectedNode.id}
                    edges={edges}
                    nodes={nodes}
                    availableNodes={availableNodes}
                    onAddConnection={onAddConnection}
                    onRemoveConnection={onRemoveConnection}
                    onUpdateEdgeDirection={onUpdateEdgeDirection}
                  />
                ))
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <p className="text-xs text-yellow-700">
                    <span className="font-semibold">No outputs defined.</span> {selectedNode.type === 'userinput' ? 'User Input' : 'Vector Store'} nodes require at least one output to create connections. 
                    {selectedNode.type === 'userinput' ? 'Please add an output above.' : 'Vector Store nodes have a default output that can be modified but not deleted.'}
                  </p>
                </div>
              )}
            </div>
          ) : selectedNode.type === 'agent' ? (
            // Special connections UI for Agent node
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Connect outputs to other nodes:</p>
              {currentNode.data?.outputs && currentNode.data.outputs.length > 0 ? (
                currentNode.data.outputs.map((output: any) => (
                  <OutputConnectionBox
                    key={output.key}
                    output={output}
                    outputHandle={`output-${output.key}`}
                    selectedNodeId={selectedNode.id}
                    edges={edges}
                    nodes={nodes}
                    availableNodes={availableNodes}
                    onAddConnection={onAddConnection}
                    onRemoveConnection={onRemoveConnection}
                    onUpdateEdgeDirection={onUpdateEdgeDirection}
                  />
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">
                  No outputs defined. Add outputs above if you want to connect this Agent to other nodes.
                </p>
              )}
            </div>
          ) : selectedNode.type === 'mcp' ? (
            // Special connections UI for MCP node (single output)
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Connect MCP output to other nodes:</p>
              {currentNode.data?.outputs && currentNode.data.outputs.length > 0 ? (
                <OutputConnectionBox
                  output={currentNode.data.outputs[0]}
                  outputHandle={`output-${currentNode.data.outputs[0].key}`}
                  selectedNodeId={selectedNode.id}
                  edges={edges}
                  nodes={nodes}
                  availableNodes={availableNodes}
                  onAddConnection={onAddConnection}
                  onRemoveConnection={onRemoveConnection}
                  onUpdateEdgeDirection={onUpdateEdgeDirection}
                />
              ) : (
                <p className="text-xs text-gray-500 italic">
                  No output configured for MCP node.
                </p>
              )}
            </div>
          ) : selectedNode.type === 'function' ? (
            // Special connections UI for Function node (single output)
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Connect Function output to other nodes:</p>
              {currentNode.data?.outputs && currentNode.data.outputs.length > 0 ? (
                <OutputConnectionBox
                  output={currentNode.data.outputs[0]}
                  outputHandle={`output-${currentNode.data.outputs[0].key}`}
                  selectedNodeId={selectedNode.id}
                  edges={edges}
                  nodes={nodes}
                  availableNodes={availableNodes}
                  onAddConnection={onAddConnection}
                  onRemoveConnection={onRemoveConnection}
                  onUpdateEdgeDirection={onUpdateEdgeDirection}
                />
              ) : (
                <p className="text-xs text-gray-500 italic">
                  No output configured for Function node.
                </p>
              )}
            </div>
          ) : (
            // Regular connections UI for other node types
            <>
          
          {/* Incoming connections */}
          {incomingConnections.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Incoming from:</p>
              {incomingConnections.map(edge => {
                const sourceNode = nodes.find(n => n.id === edge.source)
                return (
                  <div key={edge.id} className="bg-gray-50 p-2 rounded mb-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{sourceNode?.data?.label || 'Unknown'}</span>
                        <span className="text-xs text-gray-500 font-mono block">{edge.source}</span>
                      </div>
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

          {/* Outgoing connections */}
          {outgoingConnections.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Outgoing to:</p>
              {outgoingConnections.map(edge => {
                const targetNode = nodes.find(n => n.id === edge.target)
                return (
                  <div key={edge.id} className="bg-gray-50 p-2 rounded mb-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium">{targetNode?.data?.label || 'Unknown'}</span>
                        <span className="text-xs text-gray-500 font-mono block">{edge.target}</span>
                      </div>
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

          {/* Add new connection */}
          {!isConnecting && (
            <button
              onClick={() => setIsConnecting(true)}
              className="flex items-center text-sm text-musashi-600 hover:text-musashi-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Connection
            </button>
          )}
          </>
          )}
          
          {/* Connection Dialog - shown only for non-User Input, non-Agent, and non-Vector Store nodes */}
          {isConnecting && selectedNode.type !== 'userinput' && selectedNode.type !== 'agent' && selectedNode.type !== 'vectorstore' && (
            <div className="mt-3 space-y-2">
              <select
                value={selectedTarget}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-musashi-500"
              >
                <option value="">Select target node</option>
                {availableNodes.map(node => (
                  <option key={node.id} value={node.id}>
                    {node.data?.label || 'Unnamed'} ({node.id})
                  </option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddConnection}
                  disabled={!selectedTarget}
                  className={`flex-1 px-3 py-1 text-sm rounded ${
                    selectedTarget
                      ? 'bg-musashi-600 text-white hover:bg-musashi-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Link2 className="w-4 h-4 inline mr-1" />
                  Connect
                </button>
                <button
                  onClick={() => {
                    setIsConnecting(false)
                    setSelectedTarget('')
                  }}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Parameters for Agent Node */}
        {selectedNode.type === 'agent' && currentNode.data?.parameters && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Parameters</h3>
            <div className="space-y-3">
              {/* Model */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <ModelDropdown
                  value={currentNode.data.parameters.model || ''}
                  onChange={(newModel) => {
                    onUpdateNode(selectedNode.id, {
                      data: {
                        ...currentNode.data,
                        parameters: {
                          ...currentNode.data.parameters,
                          model: newModel
                        }
                      }
                    })
                  }}
                  required
                />
                {!currentNode.data.parameters.model && (
                  <p className="text-xs text-red-500 mt-1">Model is required</p>
                )}
              </div>


              {/* Developer Message */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Developer Message (System Prompt) <span className="text-red-500">*</span>
                  </label>
                  {(() => {
                    const developerMessage = currentNode.data.parameters.developer_message || 
                                           currentNode.data.parameters.system_prompt || ''
                    const validation = validateSystemPrompt(
                      developerMessage,
                      currentNode.data?.inputs || []
                    )
                    return !validation.isValid ? (
                      <div className="flex items-center text-yellow-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        <span className="text-xs">{formatValidationWarning(validation)}</span>
                      </div>
                    ) : null
                  })()}
                </div>
                
                {/* Developer Message Preview */}
                <div className="bg-gray-50 border border-gray-300 rounded-md p-3 mb-2">
                  {(() => {
                    const developerMessage = currentNode.data.parameters.developer_message || 
                                           currentNode.data.parameters.system_prompt || ''
                    const prompts = currentNode.data.parameters.prompts || []
                    if (developerMessage || prompts.length > 0) {
                      return (
                        <div>
                          <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap break-words max-h-32 overflow-y-auto">
                            {developerMessage.length > 200 
                              ? developerMessage.substring(0, 200) + '...' 
                              : developerMessage}
                          </div>
                          {prompts.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-600">
                              + {prompts.length} prompt context{prompts.length !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      )
                    } else {
                      return (
                        <div className="text-sm text-gray-500 italic">
                          No developer message defined. Click edit to add one.
                        </div>
                      )
                    }
                  })()}
                </div>
                
                {/* Edit Button */}
                <button
                  onClick={() => setShowPromptViewerModal(true)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Developer Message & Prompts
                </button>
                
                <div className="flex items-start justify-between mt-1">
                  <div className="text-xs text-gray-500">
                    {(() => {
                      const developerMessage = currentNode.data.parameters.developer_message || 
                                             currentNode.data.parameters.system_prompt || ''
                      return `${developerMessage.length} characters`
                    })()}
                  </div>
                  <div className={(() => {
                    const connectedInputs = currentNode.data?.connected_inputs || []
                    if (connectedInputs.length === 0) {
                      return "text-xs text-gray-500"
                    }
                    
                    const unusedInputs = getUnusedInputs(
                      connectedInputs,
                      currentNode.data.parameters.developer_message || currentNode.data.parameters.system_prompt,
                      currentNode.data.parameters.prompts
                    )
                    
                    if (unusedInputs.length > 0) {
                      return "text-xs text-yellow-600 font-medium"
                    }
                    return "text-xs text-green-600"
                  })()}>
                    {(() => {
                      const connectedInputs = currentNode.data?.connected_inputs || []
                      if (connectedInputs.length === 0) {
                        return "No connected inputs"
                      }
                      
                      const unusedInputs = getUnusedInputs(
                        connectedInputs,
                        currentNode.data.parameters.developer_message || currentNode.data.parameters.system_prompt,
                        currentNode.data.parameters.prompts
                      )
                      
                      if (unusedInputs.length > 0) {
                        return (
                          <>
                            ⚠️ Unused inputs: {unusedInputs.map(key => `$$${key}$$`).join(', ')}
                          </>
                        )
                      }
                      
                      return (
                        <>
                          ✅ All inputs used
                        </>
                      )
                    })()}
                  </div>
                </div>
                {(() => {
                  const developerMessage = currentNode.data.parameters.developer_message || 
                                         currentNode.data.parameters.system_prompt || ''
                  return !developerMessage && (
                    <p className="text-xs text-red-500 mt-1">Developer message is required</p>
                  )
                })()}
              </div>

              {/* Advanced Options Toggle - Moved to bottom of Parameters */}
              <div className="border-t pt-3">
                <button
                  onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  {showAdvancedOptions ? (
                    <ChevronUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ChevronDown className="w-4 h-4 mr-1" />
                  )}
                  Advanced Options
                </button>
                
                {/* Advanced Options Content */}
                {showAdvancedOptions && (
                  <div className="mt-3 space-y-3 pl-5">
                    {/* Temperature */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Temperature: {currentNode.data.parameters.temperature || 1.0}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={currentNode.data.parameters.temperature || 1.0}
                        onChange={(e) => {
                          onUpdateNode(selectedNode.id, {
                            data: {
                              ...currentNode.data,
                              parameters: {
                                ...currentNode.data.parameters,
                                temperature: parseFloat(e.target.value)
                              }
                            }
                          })
                        }}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Controls randomness in the output</p>
                    </div>

                    {/* Max Tokens */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Max Tokens</label>
                      <input
                        type="number"
                        value={currentNode.data.parameters.max_tokens || 10000}
                        onChange={(e) => {
                          onUpdateNode(selectedNode.id, {
                            data: {
                              ...currentNode.data,
                              parameters: {
                                ...currentNode.data.parameters,
                                max_tokens: parseInt(e.target.value) || 10000
                              }
                            }
                          })
                        }}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-musashi-500"
                        min="1"
                        max="128000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum number of tokens to generate</p>
                    </div>

                    {/* Top P */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Top P: {currentNode.data.parameters.top_p || 1.0}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={currentNode.data.parameters.top_p || 1.0}
                        onChange={(e) => {
                          onUpdateNode(selectedNode.id, {
                            data: {
                              ...currentNode.data,
                              parameters: {
                                ...currentNode.data.parameters,
                                top_p: parseFloat(e.target.value)
                              }
                            }
                          })
                        }}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500 mt-1">Nucleus sampling parameter</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Agent Tools Section - Moved to bottom of Parameters */}
              <div className="border-t pt-3">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Agent Tools
                </label>
                <div className="space-y-2">
                  {[
                    { 
                      type: 'web_search', 
                      label: 'Web Search', 
                      icon: Globe,
                      description: 'Search and fetch web data',
                      color: '#0ea5e9'
                    },
                    { 
                      type: 'code_interpreter', 
                      label: 'Code Interpreter', 
                      icon: Terminal,
                      description: 'Execute and interpret code',
                      color: '#10b981'
                    },
                    { 
                      type: 'image_generation', 
                      label: 'Image Generation', 
                      icon: Image,
                      description: 'Generate images from text',
                      color: '#ec4899'
                    }
                  ].map((tool) => {
                    const isEnabled = currentNode.data.parameters.tools?.some(
                      (t: any) => t.type === tool.type && t.enabled
                    ) || false
                    const Icon = tool.icon
                    
                    return (
                      <div
                        key={tool.type}
                        onClick={() => {
                          const currentTools = currentNode.data.parameters.tools || []
                          let updatedTools
                          
                          if (!isEnabled) {
                            // Add or enable the tool
                            const existingTool = currentTools.find((t: any) => t.type === tool.type)
                            if (existingTool) {
                              updatedTools = currentTools.map((t: any) =>
                                t.type === tool.type ? { ...t, enabled: true } : t
                              )
                            } else {
                              updatedTools = [...currentTools, { type: tool.type, enabled: true }]
                            }
                          } else {
                            // Disable the tool
                            updatedTools = currentTools.map((t: any) =>
                              t.type === tool.type ? { ...t, enabled: false } : t
                            )
                          }
                          
                          onUpdateNode(selectedNode.id, {
                            data: {
                              ...currentNode.data,
                              parameters: {
                                ...currentNode.data.parameters,
                                tools: updatedTools
                              }
                            }
                          })
                        }}
                        className={`
                          border rounded-lg p-3 cursor-pointer transition-all duration-200
                          ${isEnabled 
                            ? 'border-blue-400 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }
                        `}
                        style={{
                          borderLeftWidth: '3px',
                          borderLeftColor: isEnabled ? tool.color : 'transparent'
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div 
                              className={`
                                p-2 rounded-lg transition-colors duration-200
                                ${isEnabled ? 'bg-white' : 'bg-gray-50'}
                              `}
                            >
                              <Icon 
                                size={16} 
                                style={{ color: isEnabled ? tool.color : '#9ca3af' }}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className={`
                                  text-sm font-medium transition-colors duration-200
                                  ${isEnabled ? 'text-gray-900' : 'text-gray-700'}
                                `}>
                                  {tool.label}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {tool.description}
                              </p>
                            </div>
                          </div>
                          <div className={`
                            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200
                            ${isEnabled 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300 bg-white'
                            }
                          `}>
                            {isEnabled && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click to toggle tools this agent can use
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Parameters for Vector Store Node */}
        {selectedNode.type === 'vectorstore' && currentNode.data?.parameters && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Parameters</h3>
            <div className="space-y-3">
              {/* Database Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Database Type
                </label>
                <select
                  value={currentNode.data.parameters.type || 'mongodb'}
                  onChange={(e) => {
                    onUpdateNode(selectedNode.id, {
                      data: {
                        ...currentNode.data,
                        parameters: {
                          ...currentNode.data.parameters,
                          type: e.target.value as 'mongodb' | 'qdrant' | 'pinecone'
                        }
                      }
                    })
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-musashi-500"
                >
                  <option value="mongodb">MongoDB Atlas</option>
                  <option value="qdrant">Qdrant</option>
                  <option value="pinecone">Pinecone</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Vector database for storing and searching embeddings
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Parameters for MCP Node */}
        {selectedNode.type === 'mcp' && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">MCP Configuration</h3>
            <div className="space-y-4">
              
              {/* Single Output Section (Editable but not deletable) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Output Configuration (Single)
                </label>
                {currentNode.data?.outputs?.length === 1 ? (
                  <div className="bg-white border border-gray-200 rounded p-3">
                    <OutputItem
                      output={currentNode.data.outputs[0]}
                      index={0}
                      onUpdate={(updatedOutput) => {
                        // Output modification only (no deletion)
                        onUpdateNode(selectedNode.id, {
                          data: {
                            ...currentNode.data,
                            outputs: [updatedOutput] // Always maintain exactly 1 output
                          }
                        })
                      }}
                      onDelete={undefined} // Disable delete functionality
                    />
                    <p className="text-xs text-gray-500 mt-2 italic">
                      ⚠️ MCP nodes must have exactly one output (cannot be deleted)
                    </p>
                  </div>
                ) : (
                  // Auto-fix: Ensure MCP has exactly 1 output
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p className="text-xs text-yellow-700">
                      Fixing output configuration...
                    </p>
                    {(() => {
                      // Auto-fix to ensure exactly 1 output
                      const fixedOutput = currentNode.data?.outputs?.length > 0 
                        ? [currentNode.data.outputs[0]]  // Keep first output if multiple exist
                        : [{  // Create default output if none exist
                            key: 'mcp_result',
                            type: 'object',
                            example: '{"status": "success", "data": {}}'
                          }]
                      
                      // Apply fix immediately
                      setTimeout(() => {
                        onUpdateNode(selectedNode.id, {
                          data: {
                            ...currentNode.data,
                            outputs: fixedOutput
                          }
                        })
                      }, 100)
                      
                      return null
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Parameters for Function Node */}
        {selectedNode.type === 'function' && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Function Configuration</h3>
            <div className="space-y-4">
              
              {/* Single Output Section (Editable but not deletable) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  Output Configuration (Single)
                </label>
                {currentNode.data?.outputs?.length === 1 ? (
                  <div className="bg-white border border-gray-200 rounded p-3">
                    <OutputItem
                      output={currentNode.data.outputs[0]}
                      index={0}
                      onUpdate={(updatedOutput) => {
                        // Output modification only (no deletion)
                        onUpdateNode(selectedNode.id, {
                          data: {
                            ...currentNode.data,
                            outputs: [updatedOutput] // Always maintain exactly 1 output
                          }
                        })
                      }}
                      onDelete={undefined} // Disable delete functionality
                    />
                    <p className="text-xs text-gray-500 mt-2 italic">
                      ⚠️ Function nodes must have exactly one output (cannot be deleted)
                    </p>
                  </div>
                ) : (
                  // Auto-fix: Ensure Function has exactly 1 output
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p className="text-xs text-yellow-700">
                      Fixing output configuration...
                    </p>
                    {(() => {
                      // Auto-fix to ensure exactly 1 output
                      const fixedOutput = currentNode.data?.outputs?.length > 0 
                        ? [currentNode.data.outputs[0]]  // Keep first output if multiple exist
                        : [{  // Create default output if none exist
                            key: 'function_result',
                            type: 'object',
                            example: '{"status": "success", "result": {}}'
                          }]
                      
                      // Apply fix immediately
                      setTimeout(() => {
                        onUpdateNode(selectedNode.id, {
                          data: {
                            ...currentNode.data,
                            outputs: fixedOutput
                          }
                        })
                      }, 100)
                      
                      return null
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Parameters for Knowledge Base Node */}
        {selectedNode.type === 'knowledgebase' && currentNode.data?.parameters && (
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Parameters</h3>
            <div className="space-y-3">
              {/* Database Type */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Database Type
                </label>
                <select
                  value={currentNode.data.parameters.type || 'postgresql'}
                  onChange={(e) => {
                    onUpdateNode(selectedNode.id, {
                      data: {
                        ...currentNode.data,
                        parameters: {
                          ...currentNode.data.parameters,
                          type: e.target.value as 'postgresql' | 'mongodb'
                        }
                      }
                    })
                  }}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-musashi-500"
                >
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mongodb">MongoDB</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Database type for structured data storage
                </p>
              </div>

              {/* Query */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Query (Optional)
                </label>
                <textarea
                  value={currentNode.data.parameters.query || ''}
                  onChange={(e) => {
                    onUpdateNode(selectedNode.id, {
                      data: {
                        ...currentNode.data,
                        parameters: {
                          ...currentNode.data.parameters,
                          query: e.target.value
                        }
                      }
                    })
                  }}
                  placeholder={currentNode.data.parameters.type === 'postgresql' 
                    ? 'SELECT * FROM users WHERE active = true LIMIT 10' 
                    : '{ "active": true }'}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-musashi-500 font-mono"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {currentNode.data.parameters.type === 'postgresql' 
                    ? 'SQL query to filter records' 
                    : 'MongoDB query to filter documents'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Warnings for Agent nodes */}
        {selectedNode.type === 'agent' && (() => {
          const validation = validateAgentConnections(currentNode, edges)
          return !validation.isValid ? (
            <div className="border-t pt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Connection Required</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      All Agent inputs must be connected. The following inputs are not connected:
                    </p>
                    <ul className="text-xs text-yellow-700 mt-2 list-disc list-inside">
                      {validation.unconnectedInputs.map((input, index) => (
                        <li key={index}>{input}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null
        })()}

        {/* Connection Warnings for User Input nodes */}
        {selectedNode.type === 'userinput' && (() => {
          const validation = validateUserInputToAgentConnections(currentNode, nodes, edges)
          return !validation.isValid ? (
            <div className="border-t pt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-start">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Connected Agent Warning</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Some connected Agent nodes have unconnected inputs:
                    </p>
                    <ul className="text-xs text-yellow-700 mt-2 list-disc list-inside">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : null
        })()}


        {/* Delete Node */}
        <div className="border-t pt-4">
          <button
            onClick={handleDeleteNode}
            className="w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Node
          </button>
        </div>
      </div>
      
      {/* Prompt Viewer Modal */}
      {selectedNode?.type === 'agent' && (
        <PromptViewerModal
          isOpen={showPromptViewerModal}
          onClose={() => setShowPromptViewerModal(false)}
          developerMessage={currentNode.data?.parameters?.developer_message || 
                          currentNode.data?.parameters?.system_prompt || ''}
          prompts={currentNode.data?.parameters?.prompts || []}
          onChange={(newDeveloperMessage, newPrompts) => {
            onUpdateNode(selectedNode.id, {
              data: {
                ...currentNode.data,
                parameters: {
                  ...currentNode.data.parameters,
                  developer_message: newDeveloperMessage,
                  prompts: newPrompts
                  // system_prompt field removed - using developer_message only
                }
              }
            })
            // Save workflow immediately after updating node
            onSaveWorkflow?.()
          }}
          inputs={currentNode.data?.connected_inputs?.map((input: ConnectedInput) => ({
            key: input.outputKey,
            type: input.outputType,
            example: input.outputExample
          })) || []}
        />
      )}

      {/* Connected Output Viewer Modal for Final Output nodes */}
      {selectedNode?.type === 'finaloutput' && (
        <ConnectedOutputViewer
          isOpen={showConnectedOutputViewer}
          onClose={() => setShowConnectedOutputViewer(false)}
          connectedOutputs={isFinalOutputNode(currentNode.data) ? currentNode.data.connected_outputs : []}
          nodeLabel={currentNode.data?.label || 'Final Output'}
        />
      )}
    </div>
  )
}

export default NodeSidebar
