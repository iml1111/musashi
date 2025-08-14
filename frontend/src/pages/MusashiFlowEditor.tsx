import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Save, Download, Upload, ArrowLeft, AlertCircle, Undo, Redo, Info } from 'lucide-react'
import ReactFlowWrapper from '../components/workflow/ReactFlowWrapper'
import NodeSidebar from '../components/workflow/NodeSidebar'
import NodeTypeSelector from '../components/workflow/NodeTypeSelector'
import EdgeLabelPopover from '../components/workflow/EdgeLabelPopover'
import KeyboardShortcutsModal from '../components/workflow/KeyboardShortcutsModal'
import SystemPromptViewModal from '../components/workflow/SystemPromptViewModal'
import { PromptContext } from '../types/node'
import { safeNodeTypes as nodeTypes } from '../components/workflow/SafeCustomNodes'
import { edgeTypes } from '../components/workflow/CustomEdges'
import { workflowService } from '../services/workflow'
import { Workflow } from '../types/workflow'
import { ConnectedInput, isFinalOutputNode, ConnectedOutput } from '../types/node'
import {
  calculateLayout,
  addNodeWithLayout,
  removeNodeWithLayout,
  addEdgeWithLayout,
  removeEdgeWithLayout,
} from '../utils/layoutEngine'

// Define types locally without ReactFlow dependency
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

type Connection = {
  source: string | null
  target: string | null
  sourceHandle?: string | null
  targetHandle?: string | null
}

type NodeChange = any
type EdgeChange = any

interface NotificationState {
  type: 'success' | 'error' | 'info'
  message: string
  show: boolean
}

// Generate unique node ID with format: {type}_{6 random chars}
const generateNodeId = (type: string) => {
  const randomChars = Math.random().toString(36).substring(2, 8)
  return `${type}_${randomChars}`
}

// nodeTypes and edgeTypes are now imported from SafeCustomNodes and CustomEdges

// Initial workflow with empty nodes and edges
const createInitialWorkflow = (): { nodes: Node[]; edges: Edge[] } => {
  // Start with empty workflow - users will add nodes as needed
  return { nodes: [], edges: [] }
}

// Custom hook for debouncing
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => clearTimeout(handler)
  }, [value, delay])
  
  return debouncedValue
}

const MusashiFlowEditor: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const workflowId = id || 'new'
  
  // Workflow state
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [workflowName, setWorkflowName] = useState('New Workflow')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [nodes, setNodes] = useState<Node[]>([])
  const [edges, setEdges] = useState<Edge[]>([])
  
  // Layout version for triggering fitView
  const [layoutVersion, setLayoutVersion] = useState(0)
  
  // UI state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<NotificationState>({
    type: 'info',
    message: '',
    show: false,
  })
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [systemPromptModal, setSystemPromptModal] = useState<{
    isOpen: boolean
    systemPrompt: string
    nodeName: string
    prompts: PromptContext[]
  }>({
    isOpen: false,
    systemPrompt: '',
    nodeName: '',
    prompts: []
  })
  
  // History for undo/redo
  const [history, setHistory] = useState<Array<{ nodes: Node[]; edges: Edge[] }>>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const isInternalUpdate = useRef(false)
  const maxHistorySize = 50 // Maximum number of history states to keep
  
  // Flow instance ref for fitView
  const flowRef = useRef<any>(null)
  
  // Edge label popover state
  const [edgeLabelPopover, setEdgeLabelPopover] = useState<{
    edgeId: string
    outputKey: string
    outputType: string
    outputExample?: string
    position: { x: number; y: number }
  } | null>(null)

  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message, show: true })
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }))
    }, 3000)
  }, [])

  // Save state to history for undo/redo
  const saveToHistory = useCallback((newNodes: Node[], newEdges: Edge[]) => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    
    // Remove any history after current index when new change is made
    const newHistory = history.slice(0, historyIndex + 1)
    
    // Add new state
    newHistory.push({ nodes: newNodes, edges: newEdges })
    
    // Keep history size limited
    if (newHistory.length > maxHistorySize) {
      newHistory.shift()
    }
    
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex])

  // Undo function
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const previousState = history[newIndex]
      
      isInternalUpdate.current = true
      setNodes(previousState.nodes)
      setEdges(previousState.edges)
      setHistoryIndex(newIndex)
      
      showNotification('info', 'Undone')
    }
  }, [history, historyIndex, showNotification])

  // Redo function
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const nextState = history[newIndex]
      
      isInternalUpdate.current = true
      setNodes(nextState.nodes)
      setEdges(nextState.edges)
      setHistoryIndex(newIndex)
      
      showNotification('info', 'Redone')
    }
  }, [history, historyIndex, showNotification])

  // Delete node function (moved here to avoid hoisting issues)
  const handleDeleteNode = useCallback((nodeId: string) => {
    const result = removeNodeWithLayout(nodes, edges, nodeId)
    setNodes(result.nodes)
    setEdges(result.edges)
    setSelectedNode(null)
    setLayoutVersion(v => v + 1) // Trigger fitView
  }, [nodes, edges])

  // Export function (moved here to avoid hoisting issues)
  const handleExport = useCallback(() => {
    const data = {
      name: workflowName,
      description: workflowDescription,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type,
        label: node.data?.label,
        properties: node.data,
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName || 'workflow'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [nodes, edges, workflowName, workflowDescription])

  // Moved keyboard shortcuts to after function definitions

  const handleEdgeLabelClick = useCallback((event: React.MouseEvent, edgeId: string, outputKey: string) => {
    const edge = edges.find(e => e.id === edgeId)
    if (!edge) return
    
    // Find the source node to get output details
    const sourceNode = nodes.find(n => n.id === edge.source)
    if (!sourceNode || !sourceNode.data?.outputs) return
    
    // Find the specific output
    const output = sourceNode.data.outputs.find((o: any) => o.key === outputKey)
    if (!output) return
    
    // Get click position relative to viewport
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    
    setEdgeLabelPopover({
      edgeId,
      outputKey: output.key,
      outputType: output.type || 'string',
      outputExample: output.example,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top
      }
    })
  }, [edges, nodes])

  const loadWorkflow = useCallback(async () => {
    try {
      setLoading(true)
      const data = await workflowService.getWorkflow(workflowId)
      setWorkflow(data)
      setWorkflowName(data.name)
      setWorkflowDescription(data.description || '')
      
      // Convert workflow nodes/edges to React Flow format
      const flowNodes: Node[] = data.nodes.map(node => {
        // Convert old node types to default type
        let nodeType = node.type
        const validNodeTypes = [
          'userinput', 'agent', 'vectorstore', 
          'knowledgebase', 'mcp', 'function', 'finaloutput'
        ]
        
        if (!validNodeTypes.includes(nodeType)) {
          nodeType = 'default'
        }
        
        // Prepare node data with all properties
        const nodeData: any = { 
          label: node.label, 
          name: node.properties?.name || node.label, // Use label as default value if name is not available
          ...node.properties 
        }
        
        // Ensure Agent nodes have their connected_inputs, outputs, and parameters structure
        if (nodeType === 'agent') {
          // Migrate from old inputs to connected_inputs if needed
          if (nodeData.inputs && !nodeData.connected_inputs) {
            nodeData.connected_inputs = []
            // Note: Old inputs are removed, connections will populate connected_inputs
          }
          
          // Ensure connected_inputs exists
          if (!nodeData.connected_inputs) {
            nodeData.connected_inputs = []
          }
          
          // Remove old inputs field if it exists
          delete nodeData.inputs
          
          // Add default outputs if not present
          if (!nodeData.outputs || nodeData.outputs.length === 0) {
            nodeData.outputs = [{
              key: 'output1',
              type: 'string',
              example: ''
            }]
          }
          
          // Add default parameters if not present
          if (!nodeData.parameters) {
            nodeData.parameters = {
              model: '',
              temperature: 1.0,
              max_tokens: 10000,
              top_p: 1.0,
              system_prompt: ''
            }
          }
        }
        
        // Ensure all node types have outputs
        if (!nodeData.outputs || nodeData.outputs.length === 0) {
          nodeData.outputs = [{
            key: 'output',
            type: 'string',
            example: ''
          }]
        }
        
        return {
          id: node.id,
          type: nodeType,
          data: nodeData,
          position: { x: node.position_x || 0, y: node.position_y || 0 },
          draggable: false,
        }
      })
      
      const flowEdges: Edge[] = data.edges.map(edge => {
        const direction = (edge as any).data?.direction || 'unidirectional'
        const edgeConfig: Edge = {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          label: edge.label,
          type: 'custom',
          animated: true,
          data: {
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            sourceOutput: edge.sourceHandle ? edge.sourceHandle.replace('output-', '') : undefined,
            onLabelClick: handleEdgeLabelClick,
            direction
          },
          markerEnd: {
            type: 'arrowclosed',
            width: 11,
            height: 11,
            color: '#374151',
          },
          style: {
            stroke: '#374151',
            strokeWidth: 3,
          },
        }
        
        // Add markerStart for bidirectional edges
        if (direction === 'bidirectional') {
          edgeConfig.markerStart = {
            type: 'arrowclosed',
            width: 11,
            height: 11,
            color: '#374151',
          }
        }
        
        return edgeConfig
      })
      
      // Apply auto-layout
      const layouted = calculateLayout(flowNodes, flowEdges)
      
      // Populate connected_inputs for Agent nodes based on edges
      const nodesWithConnectedInputs = layouted.nodes.map(node => {
        if (node.type === 'agent') {
          const incomingEdges = layouted.edges.filter(e => e.target === node.id)
          const connectedInputs: ConnectedInput[] = []
          
          incomingEdges.forEach(edge => {
            const sourceNode = layouted.nodes.find(n => n.id === edge.source)
            if (sourceNode) {
              const outputKey = edge.sourceHandle?.replace('output-', '') || 'output'
              const sourceOutput = sourceNode.data?.outputs?.find((o: any) => o.key === outputKey)
              
              if (sourceOutput) {
                connectedInputs.push({
                  nodeId: sourceNode.id,
                  nodeName: sourceNode.data?.name || sourceNode.data?.label || 'Unknown',
                  outputKey: sourceOutput.key,
                  outputType: sourceOutput.type || 'string',
                  outputExample: sourceOutput.example
                })
              }
            }
          })
          
          return {
            ...node,
            data: {
              ...node.data,
              connected_inputs: connectedInputs
            }
          }
        }
        return node
      })
      
      setNodes(nodesWithConnectedInputs)
      setEdges(layouted.edges)
      
      // Initialize history with loaded state
      setHistory([{ nodes: nodesWithConnectedInputs, edges: layouted.edges }])
      setHistoryIndex(0)
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to load workflow', show: true })
      setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }))
      }, 3000)
    } finally {
      setLoading(false)
    }
  }, [workflowId, handleEdgeLabelClick])

  // Removed unused saveToLocalStorage function
  
  // Initialize workflow
  useEffect(() => {
    if (workflowId === 'new') {
      const initial = createInitialWorkflow()
      setNodes(initial.nodes)
      setEdges(initial.edges)
      // Initialize history with initial state
      setHistory([{ nodes: initial.nodes, edges: initial.edges }])
      setHistoryIndex(0)
      // Save to localStorage
      const data = {
        name: workflowName,
        description: workflowDescription,
        nodes: initial.nodes,
        edges: initial.edges,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(`workflow_${workflowId}`, JSON.stringify(data))
    } else {
      loadWorkflow()
    }
  }, [workflowId]) // Only depend on workflowId

  // Auto-save to localStorage on changes and update history
  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      const data = {
        name: workflowName,
        description: workflowDescription,
        nodes,
        edges,
        timestamp: new Date().toISOString(),
      }
      localStorage.setItem(`workflow_${workflowId}`, JSON.stringify(data))
      
      // Save to history for undo/redo
      if (!isInternalUpdate.current) {
        saveToHistory(nodes, edges)
      }
    }
  }, [nodes, edges, workflowId, workflowName, workflowDescription])

  // Auto-save every 1 minute
  useEffect(() => {
    // Only auto-save if we have a valid workflow (not new)
    if (workflowId === 'new' || !workflow) return

    const autoSaveInterval = setInterval(() => {
      // Only save if there are nodes
      if (nodes.length > 0) {
        handleSave(true) // true indicates this is an auto-save
      }
    }, 60000) // 60000ms = 1 minute

    // Cleanup interval on unmount
    return () => clearInterval(autoSaveInterval)
  }, [workflowId, workflow, nodes.length]) // Remove handleSave from dependencies to avoid infinite loop

  // Listen for Prompt Viewer Modal open events
  useEffect(() => {
    const handleOpenPromptViewerModal = (event: CustomEvent) => {
      const { nodeName, developerMessage, systemPrompt, prompts } = event.detail
      setSystemPromptModal({
        isOpen: true,
        systemPrompt: developerMessage || systemPrompt || '',
        nodeName: nodeName || 'Agent',
        prompts: prompts || []
      })
    }

    // Listen for both new and old event names for backward compatibility
    window.addEventListener('openPromptViewerModal', handleOpenPromptViewerModal as EventListener)
    window.addEventListener('openSystemPromptModal', handleOpenPromptViewerModal as EventListener)
    return () => {
      window.removeEventListener('openPromptViewerModal', handleOpenPromptViewerModal as EventListener)
      window.removeEventListener('openSystemPromptModal', handleOpenPromptViewerModal as EventListener)
    }
  }, [])

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    setLayoutVersion(v => v + 1) // Trigger fitView when sidebar opens
  }, [])

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null)
    setEdgeLabelPopover(null)
  }, [])

  // React Flow handlers
  const handleNodesChange = useCallback((_changes: NodeChange[]) => {
    // Handle node changes if needed
    // For now, we don't allow manual node dragging
  }, [])

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    // Check for removed edges to update connected_inputs
    changes.forEach(change => {
      if (change.type === 'remove') {
        const removedEdge = edges.find(e => e.id === change.id)
        if (removedEdge) {
          const targetNode = nodes.find(n => n.id === removedEdge.target)
          
          // If target is an Agent or MCP node, remove the connected_input
          if (targetNode?.type === 'agent' || targetNode?.type === 'mcp') {
            const outputKey = removedEdge.sourceHandle?.replace('output-', '') || 'output'
            
            // Filter out the connected input for this source
            const updatedConnectedInputs = (targetNode.data?.connected_inputs || []).filter(
              (input: ConnectedInput) => 
                !(input.nodeId === removedEdge.source && input.outputKey === outputKey)
            )
            
            // Update the node
            const updatedNodes = nodes.map(node => {
              if (node.id === targetNode.id) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    connected_inputs: updatedConnectedInputs
                  }
                }
              }
              return node
            })
            
            setNodes(updatedNodes)
          }
        }
      }
    })
  }, [edges, nodes])

  const handleConnect = useCallback((connection: Connection) => {
    console.log('=== handleConnect called ===')
    console.log('Connection:', connection)
    
    if (!connection.source || !connection.target) return
    
    // Get source and target nodes
    const sourceNode = nodes.find(n => n.id === connection.source)
    const targetNode = nodes.find(n => n.id === connection.target)
    
    console.log('Source node:', sourceNode)
    console.log('Target node:', targetNode)
    
    if (!sourceNode || !targetNode) return
    
    // Prevent connections TO Vector Store nodes
    if (targetNode.type === 'vectorstore') {
      showNotification('error', 'Vector Store nodes cannot receive connections. They can only send data to other nodes.')
      return
    }
    
    // MCP nodes can now receive connections, but only from Agent nodes
    if (targetNode.type === 'mcp' && sourceNode.type !== 'agent') {
      showNotification('error', 'MCP nodes can only receive connections from Agent nodes.')
      return
    }
    
    // Function nodes can receive connections from any node type
    // No specific restriction needed for Function nodes
    
    // Knowledge Base still cannot receive connections
    if (targetNode.type === 'knowledgebase') {
      showNotification('error', 'Knowledge Base nodes cannot receive connections.')
      return
    }
    
    // Extract output key from sourceHandle (format: "output-{key}")
    let outputKey = connection.sourceHandle?.replace('output-', '') || ''
    
    // Debug logging for connection
    console.log('Connection Debug:', {
      source: sourceNode.type,
      target: targetNode.type,
      sourceHandle: connection.sourceHandle,
      outputKey: outputKey,
      sourceOutputs: sourceNode.data?.outputs,
      targetType: targetNode.type
    })
    
    // Handle missing sourceHandle for MCP and Agent nodes
    if (!connection.sourceHandle) {
      if (sourceNode.type === 'mcp') {
        // Manually construct the expected sourceHandle for MCP
        if (sourceNode.data?.outputs?.length > 0) {
          connection.sourceHandle = `output-${sourceNode.data.outputs[0].key}`
        } else {
          connection.sourceHandle = 'output-mcp_result'
        }
        // Re-extract outputKey with the new sourceHandle
        outputKey = connection.sourceHandle.replace('output-', '')
      } else if (sourceNode.type === 'agent') {
        // Agent nodes should have dynamic handles based on outputs
        if (sourceNode.data?.outputs?.length > 0) {
          connection.sourceHandle = `output-${sourceNode.data.outputs[0].key}`
          outputKey = sourceNode.data.outputs[0].key
        } else {
          // Fallback for Agent nodes without outputs
          connection.sourceHandle = 'output-output1'
          outputKey = 'output1'
        }
      }
    }
    
    // Fallback for MCP nodes if outputKey is still missing
    if (!outputKey && sourceNode.type === 'mcp' && sourceNode.data?.outputs?.length > 0) {
      outputKey = sourceNode.data.outputs[0].key
    }
    
    // Default fallback for other cases
    if (!outputKey) {
      outputKey = 'output'
    }
    
    // Update connected_inputs for Agent, MCP, and Function nodes
    let updatedNodes = [...nodes]
    if (targetNode.type === 'agent' || targetNode.type === 'mcp' || targetNode.type === 'function') {
      // Find the output details from source node
      const sourceOutput = sourceNode.data?.outputs?.find((o: any) => o.key === outputKey)
      
      console.log('Looking for sourceOutput:', {
        outputKey: outputKey,
        sourceOutputs: sourceNode.data?.outputs,
        foundOutput: sourceOutput
      })
      
      if (sourceOutput) {
        // Create new connected input
        const newConnectedInput: ConnectedInput = {
          nodeId: sourceNode.id,
          nodeName: sourceNode.data?.name || sourceNode.data?.label || 'Unknown',
          outputKey: sourceOutput.key,
          outputType: sourceOutput.type || 'string',
          outputExample: sourceOutput.example
        }
        
        console.log('Creating connected input:', newConnectedInput)
        
        // Update target node's connected_inputs
        updatedNodes = updatedNodes.map(node => {
          if (node.id === targetNode.id) {
            const updatedNode = {
              ...node,
              data: {
                ...node.data,
                connected_inputs: [
                  ...(node.data?.connected_inputs || []),
                  newConnectedInput
                ]
              }
            }
            console.log('Updated target node:', updatedNode)
            return updatedNode
          }
          return node
        })
      } else {
        console.log('sourceOutput not found!')
      }
    }
    
    // Check if Vector Store is involved in the connection (only Vector Store creates bidirectional connections)
    const isVectorStoreConnection = sourceNode.type === 'vectorstore' || targetNode.type === 'vectorstore'
    
    // Find the output index for tracking renamed outputs
    // outputKey is already declared above, so just calculate the index
    const outputIndex = outputKey && sourceNode.data?.outputs 
      ? sourceNode.data.outputs.findIndex((o: any) => o.key === outputKey)
      : undefined
    
    
    const newEdge: Edge = {
      id: `${connection.source}-${connection.target}`,
      source: connection.source,
      target: connection.target,
      sourceHandle: connection.sourceHandle || undefined,
      targetHandle: connection.targetHandle || undefined,
      label: outputKey || '', // Add label from sourceHandle
      type: 'custom',
      data: {
        sourceOutput: outputKey,
        outputIndex: outputIndex, // Store output index for tracking renames
        onLabelClick: handleEdgeLabelClick,
        direction: isVectorStoreConnection ? 'bidirectional' : 'unidirectional'
      },
      markerEnd: {
        type: 'arrowclosed',
      },
      // Add markerStart for bidirectional connections
      ...(isVectorStoreConnection && {
        markerStart: {
          type: 'arrowclosed',
        }
      })
    }
    
    // Debug: Check if updatedNodes contains connected_inputs
    console.log('Before layout - updatedNodes:', updatedNodes.map(n => ({
      id: n.id,
      type: n.type,
      connected_inputs: n.data?.connected_inputs
    })))
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = addEdgeWithLayout(
      updatedNodes,
      edges,
      newEdge
    )
    
    // Debug: Check if layoutedNodes lost connected_inputs
    console.log('After layout - layoutedNodes:', layoutedNodes.map(n => ({
      id: n.id,
      type: n.type,
      connected_inputs: n.data?.connected_inputs
    })))
    
    setNodes(layoutedNodes)
    setEdges(layoutedEdges)
    
    // Debug: Verify that the connected_inputs are in the final nodes
    console.log('=== Final verification after setNodes ===')
    const targetNodeFinal = layoutedNodes.find(n => n.id === targetNode.id)
    console.log('Target node after layout:', targetNodeFinal)
    console.log('Target node connected_inputs:', targetNodeFinal?.data?.connected_inputs)
    
    // Update selectedNode to reflect the latest data after connection
    if (selectedNode) {
      const updatedSelectedNode = layoutedNodes.find(n => n.id === selectedNode.id)
      if (updatedSelectedNode) {
        console.log('Updating selectedNode with:', updatedSelectedNode)
        setSelectedNode(updatedSelectedNode)
      }
    }
    
    setLayoutVersion(v => v + 1) // Trigger fitView
  }, [nodes, edges, selectedNode])

  const handleAddNode = useCallback((type: string, label: string) => {
    const nodeData: any = { 
      label,
      name: label,  // Save default label value to name field
      memo: ''  // Add memo field
    }
    
    // Add default output for User Input node
    if (type === 'userinput') {
      nodeData.outputs = [{
        key: 'output1',
        type: 'string',
        example: ''
      }]
    }
    
    // Add connected_inputs, outputs, parameters for Agent node
    if (type === 'agent') {
      nodeData.connected_inputs = []
      nodeData.outputs = [{
        key: 'output1',
        type: 'string',
        example: ''
      }]
      nodeData.parameters = {
        model: '',
        temperature: 1.0,
        max_tokens: 10000,
        top_p: 1.0,
        system_prompt: ''
      }
    }
    
    // Add parameters for Vector Store node
    if (type === 'vectorstore') {
      nodeData.outputs = [{
        key: 'documents',
        type: 'array',
        example: '["doc1", "doc2", "doc3"]'
      }]
      nodeData.parameters = {
        type: 'mongodb'  // DefaultValue
      }
    }
    
    // Add parameters for Knowledge Base node
    if (type === 'knowledgebase') {
      nodeData.outputs = [{
        key: 'records',
        type: 'array<array<any>>',
        example: '[["John", 30, true, {"city": "Seoul"}], ["Jane", 25, false, {"city": "Busan"}]]'
      }]
      nodeData.parameters = {
        type: 'postgresql',  // DefaultValue
        query: ''
      }
    }
    
    // Add connected_outputs for Final Output node
    if (type === 'finaloutput') {
      nodeData.connected_outputs = []
      nodeData.outputs = []  // Start with empty array, auto-created from connected_outputs
    }
    
    // Add connected_inputs, parameters and outputs for MCP node
    if (type === 'mcp') {
      nodeData.connected_inputs = []  // Start with empty array (input to receive from Agent)
      nodeData.outputs = [{
        key: 'mcp_result',
        type: 'object',
        example: '{"status": "success", "data": {}}'
      }]  // Exactly 1 output (fixed)
      nodeData.parameters = {
        mode: 'query'  // Remove servers field
      }
    }
    
    // Add connected_inputs and outputs for Function node
    if (type === 'function') {
      nodeData.connected_inputs = []  // Start with empty array (input to receive from other nodes)
      nodeData.outputs = [{
        key: 'function_result',
        type: 'object',
        example: '{"status": "success", "result": {}}'
      }]  // Exactly 1 output (fixed)
      nodeData.parameters = {
        function_type: 'custom'
      }
    }
    
    // Ensure all other node types have at least one output
    else if (type !== 'agent' && type !== 'userinput' && type !== 'vectorstore' && 
             type !== 'knowledgebase' && type !== 'mcp' && type !== 'function') {
      nodeData.outputs = [{
        key: 'output',
        type: 'string',
        example: ''
      }]
    }
    
    const newNode: Omit<Node, 'position'> = {
      id: generateNodeId(type),
      type,
      data: nodeData,
      draggable: false,
    }
    
    const result = addNodeWithLayout(nodes, edges, newNode)
    setNodes(result.nodes)
    setEdges(result.edges)
    setLayoutVersion(v => v + 1) // Trigger fitView
  }, [nodes, edges])

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<Node>) => {
    setNodes(prevNodes => {
      const updated = prevNodes.map(node => {
        if (node.id === nodeId) {
          // Deep merge for data property
          if (updates.data) {
            return {
              ...node,
              ...updates,
              data: {
                ...node.data,
                ...updates.data
              }
            }
          }
          return { ...node, ...updates }
        }
        return node
      })
      
      // Recalculate layout after node update
      const result = calculateLayout(updated, edges)
      return result.nodes
    })
    
    // Update edge labels when outputs change
    if (updates.data?.outputs) {
      console.log('Updating node outputs:', nodeId, updates.data.outputs)
      
      setEdges(prevEdges => {
        const updatedEdges = prevEdges.map(edge => {
          // Update edges that originate from this node
          if (edge.source === nodeId && edge.sourceHandle) {
            const oldOutputKey = edge.sourceHandle.replace('output-', '')
            const newOutput = updates.data.outputs.find((o: any) => o.key === oldOutputKey)
            
            if (newOutput) {
              // Output exists with the same key - keep the edge as is
              // The output might have been edited in place
              const updatedEdge = {
                ...edge,
                label: newOutput.key,
                data: {
                  ...edge.data,
                  sourceOutput: newOutput.key // CustomEdge displays this value
                }
              }
              console.log(`Updated edge from ${nodeId}: ${oldOutputKey} -> ${newOutput.key}`)
              return updatedEdge
            } else {
              // Output key has changed or been removed
              // Try to find if this is a renamed output by position
              const outputIndex = edge.data?.outputIndex
              if (outputIndex !== undefined && updates.data.outputs[outputIndex]) {
                const renamedOutput = updates.data.outputs[outputIndex]
                const updatedEdge = {
                  ...edge,
                  label: renamedOutput.key,
                  sourceHandle: `output-${renamedOutput.key}`, // Update sourceHandle with new key
                  data: {
                    ...edge.data,
                    sourceOutput: renamedOutput.key // Update displayed value
                  }
                }
                console.log(`Renamed edge output from ${nodeId}: ${oldOutputKey} -> ${renamedOutput.key}`)
                return updatedEdge
              }
              console.warn(`Output ${oldOutputKey} not found for edge from ${nodeId}`)
            }
          }
          return edge
        })
        
        console.log('Updated edges:', updatedEdges.filter(e => e.source === nodeId))
        return updatedEdges
      })
    }
  }, [edges])

  const handleAddConnection = useCallback((sourceId: string, targetId: string, sourceHandle?: string) => {
    // Check if the exact same connection already exists
    const existingEdge = edges.find(
      edge => edge.source === sourceId && edge.target === targetId && edge.sourceHandle === sourceHandle
    )
    
    if (existingEdge) {
      showNotification('info', 'This connection already exists')
      return
    }
    
    // Get source and target nodes
    const sourceNode = nodes.find(n => n.id === sourceId)
    const targetNode = nodes.find(n => n.id === targetId)
    
    if (!sourceNode || !targetNode) return
    
    // Prevent connections TO Vector Store nodes
    if (targetNode.type === 'vectorstore') {
      showNotification('error', 'Vector Store nodes cannot receive connections. They can only send data to other nodes.')
      return
    }
    
    // Update connected_inputs for Agent nodes or connected_outputs for Final Output nodes
    let updatedNodes = [...nodes]
    if (targetNode.type === 'agent') {
      // Extract output key from sourceHandle (format: "output-{key}")
      const outputKey = sourceHandle?.replace('output-', '') || 'output'
      
      // Find the output details from source node
      const sourceOutput = sourceNode.data?.outputs?.find((o: any) => o.key === outputKey)
      
      if (sourceOutput) {
        // Create new connected input
        const newConnectedInput: ConnectedInput = {
          nodeId: sourceNode.id,
          nodeName: sourceNode.data?.name || sourceNode.data?.label || 'Unknown',
          outputKey: sourceOutput.key,
          outputType: sourceOutput.type || 'string',
          outputExample: sourceOutput.example
        }
        
        // Update target node's connected_inputs
        updatedNodes = updatedNodes.map(node => {
          if (node.id === targetNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                connected_inputs: [
                  ...(node.data?.connected_inputs || []),
                  newConnectedInput
                ]
              }
            }
          }
          return node
        })
      }
    } else if (targetNode.type === 'finaloutput') {
      // Handle Final Output node connections
      const outputKey = sourceHandle?.replace('output-', '') || 'output'
      const sourceOutput = sourceNode.data?.outputs?.find((o: any) => o.key === outputKey)
      
      if (sourceOutput) {
        // Create new connected output
        const newConnectedOutput: ConnectedOutput = {
          nodeId: sourceNode.id,
          nodeName: sourceNode.data?.name || sourceNode.data?.label || 'Unknown',
          outputKey: sourceOutput.key,
          outputType: sourceOutput.type || 'string',
          outputExample: sourceOutput.example
        }
        
        // Update target node's connected_outputs and outputs
        updatedNodes = updatedNodes.map(node => {
          if (node.id === targetNode.id) {
            const currentConnectedOutputs = node.data?.connected_outputs || []
            const newConnectedOutputs = [...currentConnectedOutputs, newConnectedOutput]
            
            // Auto-generate outputs from connected_outputs
            const newOutputs = newConnectedOutputs.map(co => ({
              key: co.outputKey,
              type: co.outputType,
              example: co.outputExample
            }))
            
            return {
              ...node,
              data: {
                ...node.data,
                connected_outputs: newConnectedOutputs,
                outputs: newOutputs
              }
            }
          }
          return node
        })
      }
    }
    
    // Check if Vector Store is involved in the connection (only Vector Store creates bidirectional connections)
    const isVectorStoreConnection = sourceNode.type === 'vectorstore' || targetNode.type === 'vectorstore'
    
    // Find the output index for tracking renamed outputs
    const outputKey = sourceHandle ? sourceHandle.replace('output-', '') : undefined
    const outputIndex = outputKey && sourceNode.data?.outputs 
      ? sourceNode.data.outputs.findIndex((o: any) => o.key === outputKey)
      : undefined
    
    const newEdge: Edge = {
      id: `edge_${sourceId}_to_${targetId}_${Date.now()}`,
      source: sourceId,
      target: targetId,
      sourceHandle: sourceHandle,
      label: outputKey || '', // Add label from sourceHandle
      type: 'custom',
      animated: true,
      data: { 
        source: sourceId, 
        target: targetId,
        sourceHandle: sourceHandle,
        sourceOutput: outputKey,
        outputIndex: outputIndex, // Store output index for tracking renames
        onLabelClick: handleEdgeLabelClick,
        direction: isVectorStoreConnection ? 'bidirectional' : 'unidirectional'
      },
      markerEnd: {
        type: 'arrowclosed',
        width: 11,
        height: 11,
        color: '#374151',
      },
      // Add markerStart for bidirectional connections
      ...(isVectorStoreConnection && {
        markerStart: {
          type: 'arrowclosed',
          width: 11,
          height: 11,
          color: '#374151',
        }
      }),
      style: {
        stroke: '#374151',
        strokeWidth: 3,
      },
    }
    
    const result = addEdgeWithLayout(updatedNodes, edges, newEdge)
    setNodes(result.nodes)
    setEdges(result.edges)
  }, [nodes, edges, showNotification, handleEdgeLabelClick])

  const handleRemoveConnection = useCallback((edgeId: string) => {
    // Find the edge to be removed
    const edgeToRemove = edges.find(edge => edge.id === edgeId)
    
    if (!edgeToRemove) return
    
    // Update connected_inputs for Agent nodes or connected_outputs for Final Output nodes
    let updatedNodes = [...nodes]
    const targetNode = nodes.find(n => n.id === edgeToRemove.target)
    
    if (targetNode?.type === 'agent' && targetNode.data?.connected_inputs) {
      // Extract output key from sourceHandle
      const outputKey = edgeToRemove.sourceHandle?.replace('output-', '') || 'output'
      
      // Remove the connected input that matches this edge
      updatedNodes = updatedNodes.map(node => {
        if (node.id === targetNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              connected_inputs: (node.data.connected_inputs || []).filter(
                (input: ConnectedInput) => 
                  !(input.nodeId === edgeToRemove.source && input.outputKey === outputKey)
              )
            }
          }
        }
        return node
      })
    } else if (targetNode?.type === 'finaloutput' && isFinalOutputNode(targetNode.data)) {
      // Handle Final Output node disconnections
      const outputKey = edgeToRemove.sourceHandle?.replace('output-', '') || 'output'
      
      // Remove the connected output that matches this edge
      updatedNodes = updatedNodes.map(node => {
        if (node.id === targetNode.id) {
          const newConnectedOutputs = (node.data?.connected_outputs || []).filter(
            (output: ConnectedOutput) => 
              !(output.nodeId === edgeToRemove.source && output.outputKey === outputKey)
          )
          
          // Auto-generate outputs from connected_outputs
          const newOutputs = newConnectedOutputs.map((co: ConnectedOutput) => ({
            key: co.outputKey,
            type: co.outputType,
            example: co.outputExample
          }))
          
          return {
            ...node,
            data: {
              ...node.data,
              connected_outputs: newConnectedOutputs,
              outputs: newOutputs
            }
          }
        }
        return node
      })
    }
    
    const result = removeEdgeWithLayout(updatedNodes, edges, edgeId)
    setNodes(result.nodes)
    setEdges(result.edges)
    setLayoutVersion(v => v + 1) // Trigger fitView
  }, [nodes, edges])

  const handleUpdateEdgeDirection = useCallback((edgeId: string, direction: 'unidirectional' | 'bidirectional') => {
    setEdges(prevEdges => prevEdges.map(edge => {
      if (edge.id === edgeId) {
        const updatedEdge = {
          ...edge,
          data: {
            ...edge.data,
            direction
          }
        }
        
        // Add or remove markerStart based on direction
        if (direction === 'bidirectional') {
          updatedEdge.markerStart = {
            type: 'arrowclosed',
            width: 11,
            height: 11,
            color: '#374151',
          }
        } else {
          delete updatedEdge.markerStart
        }
        
        return updatedEdge
      }
      return edge
    }))
  }, [])

  const handleSave = useCallback(async (isAutoSave = false) => {
    try {
      setSaving(true)
      
      // Convert React Flow format to workflow format
      const workflowNodes = nodes.map(node => ({
        id: node.id,
        type: node.type || 'default',
        label: node.data?.label || '',
        properties: node.data || {},
        position_x: node.position?.x,
        position_y: node.position?.y,
      }))
      
      const workflowEdges = edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: typeof edge.label === 'string' ? edge.label : '',
        sourceHandle: edge.sourceHandle,
        data: edge.data || {},
      }))
      
      if (workflowId === 'new' || !workflow) {
        const newWorkflow = await workflowService.createWorkflow({
          name: workflowName,
          description: workflowDescription || undefined,
          nodes: workflowNodes,
          edges: workflowEdges,
          metadata: { editor: 'musashi-flow' },
        })
        setWorkflow(newWorkflow)
        // Sync state with server response
        setWorkflowName(newWorkflow.name)
        setWorkflowDescription(newWorkflow.description || '')
        if (!isAutoSave) {
          showNotification('success', 'Workflow created successfully!')
        }
        const newId = newWorkflow.id || (newWorkflow as any)._id
        navigate(`/workflow/${newId}`, { replace: true })
      } else {
        const updatedWorkflow = await workflowService.updateWorkflow(workflow.id, {
          name: workflowName,
          description: workflowDescription,
          nodes: workflowNodes,
          edges: workflowEdges,
        })
        setWorkflow(updatedWorkflow)
        // Sync state with server response
        setWorkflowName(updatedWorkflow.name)
        setWorkflowDescription(updatedWorkflow.description || '')
        if (!isAutoSave) {
          showNotification('success', 'Workflow saved successfully!')
        }
      }
    } catch (error) {
      if (!isAutoSave) {
        showNotification('error', error instanceof Error ? error.message : 'Failed to save workflow')
      }
    } finally {
      setSaving(false)
    }
  }, [workflowId, workflow, nodes, edges, workflowName, navigate, showNotification])

  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        if (data.nodes && data.edges) {
          // Apply auto-layout to imported nodes
          const layouted = calculateLayout(data.nodes, data.edges)
          setNodes(layouted.nodes)
          setEdges(layouted.edges)
          setWorkflowName(data.name || 'Imported Workflow')
          setWorkflowDescription(data.description || '')
          
          // Reset history with imported state
          setHistory([{ nodes: layouted.nodes, edges: layouted.edges }])
          setHistoryIndex(0)
          
          showNotification('success', 'Workflow imported successfully')
        } else {
          showNotification('error', 'Invalid workflow file format')
        }
      } catch (error) {
        console.error('Failed to import workflow:', error)
        showNotification('error', 'Failed to import workflow. Invalid file format.')
      }
    }
    reader.readAsText(file)
    
    // Reset input value to allow importing the same file again
    event.target.value = ''
  }, [showNotification])

  // Keyboard shortcuts - moved here after all function definitions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl/Cmd + Z
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      
      // Redo: Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y
      if ((e.metaKey || e.ctrlKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault()
        handleRedo()
      }
      
      // Delete selected node: Delete only
      if (e.key === 'Delete' && selectedNode) {
        e.preventDefault()
        handleDeleteNode(selectedNode.id)
      }
      
      // Save: Ctrl/Cmd + S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave(false)
      }
      
      // Export: Ctrl/Cmd + E
      if ((e.metaKey || e.ctrlKey) && e.key === 'e') {
        e.preventDefault()
        handleExport()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedNode, handleUndo, handleRedo, handleDeleteNode, handleExport, handleSave])

  // Auto fit view when layout changes
  const debouncedLayoutVersion = useDebounce(layoutVersion, 300) // 300ms debounce
  
  useEffect(() => {
    if (nodes.length > 0 && flowRef.current?.fitView && debouncedLayoutVersion > 0) {
      console.log('Auto fitting view after layout change')
      flowRef.current.fitView()
    }
  }, [debouncedLayoutVersion, nodes.length])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-musashi-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="text-lg font-semibold text-gray-900 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-musashi-500 focus:outline-none px-1"
                placeholder="Workflow Name"
              />
              <textarea
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                className="block w-full mt-1 text-sm text-gray-600 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-musashi-500 focus:outline-none px-1 resize-none"
                placeholder="Add a description..."
                rows={1}
                style={{ minHeight: '24px', overflow: 'hidden' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement
                  target.style.height = 'auto'
                  target.style.height = `${target.scrollHeight}px`
                }}
              />
              <p className="text-sm text-gray-500 mt-1">Musashi Flow Editor - Auto-layout workflow design</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <NodeTypeSelector onAddNode={handleAddNode} />
            
            {/* Undo/Redo buttons */}
            <div className="flex items-center space-x-1 border-l pl-4">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleExport}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            
            <label className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className={`px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white flex items-center ${
                saving
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-musashi-600 hover:bg-musashi-700'
              }`}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? 'Saving...' : 'Save'}
            </button>

            {/* Keyboard Shortcuts Info Button */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 border border-gray-300 rounded-md text-gray-600 bg-white hover:bg-gray-50 hover:text-gray-900 transition-colors ml-2"
              title="Keyboard Shortcuts (i)"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 relative">
        <ReactFlowWrapper
          ref={flowRef}
          nodes={nodes}
          edges={edges}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          isSidebarOpen={!!selectedNode}
        />
        
        {selectedNode && (
          <NodeSidebar
            selectedNode={selectedNode}
            nodes={nodes}
            edges={edges}
            onClose={() => setSelectedNode(null)}
            onUpdateNode={handleUpdateNode}
            onDeleteNode={handleDeleteNode}
            onAddConnection={handleAddConnection}
            onRemoveConnection={handleRemoveConnection}
            onUpdateEdgeDirection={handleUpdateEdgeDirection}
            onSaveWorkflow={() => handleSave(false)}
          />
        )}
        
        {/* Edge Label Popover */}
        {edgeLabelPopover && (
          <EdgeLabelPopover
            outputKey={edgeLabelPopover.outputKey}
            outputType={edgeLabelPopover.outputType}
            outputExample={edgeLabelPopover.outputExample}
            position={edgeLabelPopover.position}
            onClose={() => setEdgeLabelPopover(null)}
          />
        )}
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal 
        isOpen={showShortcuts} 
        onClose={() => setShowShortcuts(false)} 
      />

      {/* System Prompt View Modal */}
      <SystemPromptViewModal
        isOpen={systemPromptModal.isOpen}
        onClose={() => setSystemPromptModal({ isOpen: false, systemPrompt: '', nodeName: '', prompts: [] })}
        systemPrompt={systemPromptModal.systemPrompt}
        nodeName={systemPromptModal.nodeName}
        prompts={systemPromptModal.prompts}
      />
    </div>
  )
}

export default MusashiFlowEditor