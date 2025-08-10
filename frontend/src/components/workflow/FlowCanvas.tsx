import React, { useEffect, useCallback, useMemo } from 'react'
import ReactFlow, {
  Node,
  Edge,
  ReactFlowProvider,
  Background,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  ControlButton,
  Panel,
} from 'reactflow'
import { Maximize, Plus, Minus, Lock, Unlock } from 'lucide-react'
import 'reactflow/dist/style.css'
// import { nodeTypes } from './CustomNodes'
// import { simpleNodeTypes as nodeTypes } from './SimpleNodes'
import { safeNodeTypes as nodeTypes } from './SafeCustomNodes'
import { edgeTypes } from './CustomEdges'

interface FlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodeClick: (event: React.MouseEvent, node: Node) => void
  onPaneClick: () => void
  isSidebarOpen?: boolean
}

// Inner component that has access to React Flow instance
const FlowCanvasInner: React.FC<FlowCanvasProps> = ({
  nodes,
  edges,
  onNodeClick,
  onPaneClick,
  isSidebarOpen,
}) => {
  const { fitView, zoomIn, zoomOut, getViewport, setViewport, getNodes, project } = useReactFlow()
  const [isInteractive, setIsInteractive] = React.useState(true)
  const [isMounted, setIsMounted] = React.useState(false)

  // Mark component as mounted after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  // Custom fit view handler with alternative implementation
  const handleFitView = useCallback(() => {
    // Don't run if component is not mounted
    if (!isMounted) {
      console.warn('Component not yet mounted, skipping fitView')
      return
    }

    // Safety check: ensure nodes exist
    if (!nodes || nodes.length === 0) {
      console.warn('No nodes available for fitView')
      return
    }

    try {
      // Get all nodes from React Flow store
      const flowNodes = getNodes()
      
      if (!flowNodes || flowNodes.length === 0) {
        console.warn('No nodes in React Flow store')
        return
      }

      // Check if all nodes have valid positions
      const validNodes = flowNodes.filter(node => 
        node.position && 
        typeof node.position.x === 'number' && 
        typeof node.position.y === 'number' &&
        !isNaN(node.position.x) && 
        !isNaN(node.position.y) &&
        isFinite(node.position.x) &&
        isFinite(node.position.y)
      )

      if (validNodes.length === 0) {
        console.warn('No nodes with valid positions')
        return
      }

      // Calculate bounding box manually
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
      
      validNodes.forEach(node => {
        const nodeWidth = node.width || 180  // Default width
        const nodeHeight = node.height || 50  // Default height
        
        minX = Math.min(minX, node.position.x)
        minY = Math.min(minY, node.position.y)
        maxX = Math.max(maxX, node.position.x + nodeWidth)
        maxY = Math.max(maxY, node.position.y + nodeHeight)
      })

      // Check if bounding box is valid
      if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
        console.warn('Invalid bounding box calculated')
        return
      }

      // Get viewport dimensions
      const viewport = getViewport()
      const container = document.querySelector('.react-flow') as HTMLElement
      
      if (!container) {
        console.warn('React Flow container not found')
        return
      }

      const containerWidth = container.offsetWidth
      const containerHeight = container.offsetHeight
      
      if (!containerWidth || !containerHeight) {
        console.warn('Container dimensions invalid')
        return
      }

      // Calculate the width and height of the bounding box
      const boundsWidth = maxX - minX
      const boundsHeight = maxY - minY
      
      // Calculate padding
      const paddingX = containerWidth * 0.1  // 10% padding
      const paddingY = containerHeight * 0.1  // 10% padding
      const sidebarPadding = isSidebarOpen ? 400 : 0  // Sidebar width
      
      // Calculate available space
      const availableWidth = containerWidth - paddingX * 2 - sidebarPadding
      const availableHeight = containerHeight - paddingY * 2
      
      // Calculate zoom level to fit
      const zoomX = availableWidth / boundsWidth
      const zoomY = availableHeight / boundsHeight
      let zoom = Math.min(zoomX, zoomY)
      
      // Clamp zoom to reasonable values
      zoom = Math.max(0.1, Math.min(1.5, zoom))
      
      // Calculate center position
      const centerX = minX + boundsWidth / 2
      const centerY = minY + boundsHeight / 2
      
      // Calculate viewport position
      const x = (containerWidth - sidebarPadding) / 2 - centerX * zoom
      const y = containerHeight / 2 - centerY * zoom
      
      // Validate final values
      if (!isFinite(x) || !isFinite(y) || !isFinite(zoom)) {
        console.warn('Invalid viewport values calculated')
        return
      }

      // Set viewport with animation
      setViewport(
        { x, y, zoom },
        { duration: 400 }
      )
    } catch (error) {
      console.error('Custom fitView failed:', error)
      // As last resort, try the native fitView with error suppression
      try {
        const padding = isSidebarOpen 
          ? { top: 0.1, right: 0.35, bottom: 0.1, left: 0.1 }
          : 0.1
        
        fitView({
          padding,
          includeHiddenNodes: false,
          minZoom: 0.1,
          maxZoom: 1.5,
          duration: 400,
        })
      } catch (fallbackError) {
        console.error('Fallback fitView also failed:', fallbackError)
      }
    }
  }, [fitView, isSidebarOpen, nodes, isMounted, getNodes, getViewport, setViewport])

  // DISABLED: Automatic fitView to prevent NaN errors
  // Only manual fitView through button is allowed

  const defaultEdgeOptions = {
    animated: true,
    type: 'custom',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#374151',
    },
    style: {
      strokeWidth: 3,
      stroke: '#374151',
    },
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      onNodeClick={onNodeClick}
      onPaneClick={onPaneClick}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={true}
      defaultEdgeOptions={defaultEdgeOptions}
      fitView={false}
      defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      zoomOnScroll={isInteractive}
      panOnScroll={isInteractive}
      panOnDrag={isInteractive}
      zoomOnDoubleClick={isInteractive}
      preventScrolling={!isInteractive}
      className="bg-gray-50"
    >
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      
      {/* Custom Controls */}
      <Panel position="bottom-left" className="react-flow__controls">
        <div className="react-flow__controls-button-group">
          <ControlButton
            onClick={() => zoomIn({ duration: 200 })}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <Plus size={16} />
          </ControlButton>
          <ControlButton
            onClick={() => zoomOut({ duration: 200 })}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <Minus size={16} />
          </ControlButton>
          <ControlButton
            onClick={handleFitView}
            title="Fit view"
            aria-label="Fit view"
          >
            <Maximize size={16} />
          </ControlButton>
          <ControlButton
            onClick={() => setIsInteractive(!isInteractive)}
            title={isInteractive ? 'Lock interaction' : 'Unlock interaction'}
            aria-label={isInteractive ? 'Lock interaction' : 'Unlock interaction'}
          >
            {isInteractive ? <Unlock size={16} /> : <Lock size={16} />}
          </ControlButton>
        </div>
      </Panel>
      
      <MiniMap />
    </ReactFlow>
  )
}

const FlowCanvas: React.FC<FlowCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full">
        <FlowCanvasInner {...props} />
      </div>
    </ReactFlowProvider>
  )
}

export default FlowCanvas