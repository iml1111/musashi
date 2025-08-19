import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Download, AlertCircle, Share2, User, Calendar, Eye } from 'lucide-react'
import ReactFlowWrapper from '../components/workflow/ReactFlowWrapper'
import NodeSidebar from '../components/workflow/NodeSidebar'
import PromptViewerModal from '../components/workflow/PromptViewerModal'
import { workflowService } from '../services/workflow'
import { Workflow } from '../types/workflow'
import { safeNodeTypes as nodeTypes } from '../components/workflow/SafeCustomNodes'
import { edgeTypes } from '../components/workflow/CustomEdges'
import { calculateLayout } from '../utils/layoutEngine'
import { formatRelativeTime } from '../utils/dateUtils'

// Define types locally
type Node = {
  id: string
  type?: string
  data?: any
  position?: { x: number; y: number }
  draggable?: boolean
}

type Edge = {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  label?: string | undefined
  type?: string
  animated?: boolean
  data?: any
  markerEnd?: any
  markerStart?: any
  style?: any
}

const SharedWorkflow: React.FC = () => {
  const { shareToken } = useParams()
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showPromptModal, setShowPromptModal] = useState(false)
  const [promptModalData, setPromptModalData] = useState<{
    developerMessage: string
    prompts: any[]
  } | null>(null)

  // Handle prompt viewer modal event
  useEffect(() => {
    const handleOpenPromptViewerModal = (event: CustomEvent) => {
      setPromptModalData({
        developerMessage: event.detail.developerMessage || '',
        prompts: event.detail.prompts || []
      })
      setShowPromptModal(true)
    }

    window.addEventListener('openPromptViewerModal', handleOpenPromptViewerModal as EventListener)
    
    return () => {
      window.removeEventListener('openPromptViewerModal', handleOpenPromptViewerModal as EventListener)
    }
  }, [])

  useEffect(() => {
    const fetchWorkflow = async () => {
      if (!shareToken) {
        setError('Invalid share link')
        setLoading(false)
        return
      }

      try {
        const data = await workflowService.getSharedWorkflow(shareToken)
        setWorkflow(data)
        
        // Convert workflow nodes and edges to React Flow format
        const flowNodes = data.nodes.map((node: any) => ({
          id: node.id,
          type: node.type || 'custom',
          position: { x: node.position_x || 0, y: node.position_y || 0 },
          data: {
            ...node.properties,
            label: node.label,
            onDelete: undefined, // Disable delete in read-only mode
            isReadOnly: true
          },
          draggable: false // Disable dragging in read-only mode
        }))

        const flowEdges = data.edges.map((edge: any) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          label: edge.label,
          type: 'custom',
          animated: true,
          data: {
            onDelete: undefined, // Disable delete in read-only mode
            isReadOnly: true
          }
        }))

        // Apply layout if positions are not set
        const { nodes: layoutNodes, edges: layoutEdges } = calculateLayout(flowNodes, flowEdges)
        setNodes(layoutNodes)
        setEdges(layoutEdges)
      } catch (err) {
        console.error('Error fetching shared workflow:', err)
        setError('Workflow not found or link has expired')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflow()
  }, [shareToken])

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node)
  }, [])

  const handleExport = () => {
    if (!workflow) return
    
    const dataStr = JSON.stringify({
      name: workflow.name,
      description: workflow.description,
      nodes: workflow.nodes,
      edges: workflow.edges,
      metadata: workflow.metadata
    }, null, 2)
    
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${workflow.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_workflow.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workflow...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Workflow Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/login" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  if (!workflow) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Eye className="w-4 h-4 mr-1" />
              View Only
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{workflow.name}</h1>
              {workflow.description && (
                <p className="text-sm text-gray-500 mt-1">{workflow.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500">
              <User className="w-4 h-4 mr-1" />
              <span>{workflow.last_modified_by || 'Unknown'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              <span>{formatRelativeTime(workflow.updated_at)}</span>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        <div className="flex-1 relative">
          <ReactFlowWrapper
            nodes={nodes}
            edges={edges}
            onNodesChange={() => {}} // No changes in read-only mode
            onEdgesChange={() => {}} // No changes in read-only mode
            onConnect={() => {}} // No connections in read-only mode
            onNodeClick={onNodeClick}
            onEdgeClick={() => {}}
            onPaneClick={() => setSelectedNode(null)}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            deleteKeyCode={null} // Disable delete key
            multiSelectionKeyCode={null} // Disable multi-selection
          />
        </div>

        {/* Node Sidebar - Read Only */}
        {selectedNode && (
          <NodeSidebar
            selectedNode={selectedNode}
            nodes={nodes}
            edges={edges}
            onClose={() => setSelectedNode(null)}
            onUpdateNode={() => {}} // No updates in read-only mode
            onDeleteNode={() => {}} // No deletes in read-only mode
            onAddConnection={() => {}} // No connections in read-only mode
            onRemoveConnection={() => {}} // No removals in read-only mode
            isReadOnly={true}
          />
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <Share2 className="w-4 h-4 mr-1" />
            <span>This workflow is shared via a public link</span>
          </div>
          <div className="text-sm text-gray-500">
            Version {workflow.version} • {workflow.nodes.length} nodes • {workflow.edges.length} connections
          </div>
        </div>
      </div>

      {/* Prompt Viewer Modal - Read Only */}
      {showPromptModal && promptModalData && (
        <PromptViewerModal
          isOpen={showPromptModal}
          onClose={() => {
            setShowPromptModal(false)
            setPromptModalData(null)
          }}
          developerMessage={promptModalData.developerMessage}
          prompts={promptModalData.prompts}
          onChange={() => {}} // No changes in read-only mode
          inputs={[]} // No inputs needed for read-only display
          isReadOnly={true}
        />
      )}
    </div>
  )
}

export default SharedWorkflow