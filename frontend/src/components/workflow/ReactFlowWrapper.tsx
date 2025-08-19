import React, { forwardRef } from 'react'
import FlowCanvas, { FlowCanvasHandle } from './FlowCanvas'

interface ReactFlowWrapperProps {
  nodes: any[]
  edges: any[]
  onNodeClick?: (event: React.MouseEvent, node: any) => void
  onPaneClick?: () => void
  onNodesChange?: (changes: any[]) => void
  onEdgesChange?: (changes: any[]) => void
  onConnect?: (connection: any) => void
  onEdgeClick?: (event: React.MouseEvent, edge: any) => void
  nodeTypes?: any
  edgeTypes?: any
  fitView?: boolean
  fitViewOptions?: any
  isSidebarOpen?: boolean
  children?: React.ReactNode
  deleteKeyCode?: string | null
  multiSelectionKeyCode?: string | null
}

// Wrapper component that uses FlowCanvas
const ReactFlowWrapper = forwardRef<FlowCanvasHandle, ReactFlowWrapperProps>((props, ref) => {
  // Note: deleteKeyCode and multiSelectionKeyCode are accepted but not passed to FlowCanvas
  // as FlowCanvas doesn't support these props. They're included in the interface
  // for compatibility with SharedWorkflow component.
  const {
    deleteKeyCode,
    multiSelectionKeyCode,
    ...flowCanvasProps
  } = props;
  
  return (
    <FlowCanvas
      ref={ref}
      nodes={flowCanvasProps.nodes}
      edges={flowCanvasProps.edges}
      onNodeClick={flowCanvasProps.onNodeClick}
      onPaneClick={flowCanvasProps.onPaneClick}
      onNodesChange={flowCanvasProps.onNodesChange}
      onEdgesChange={flowCanvasProps.onEdgesChange}
      onConnect={flowCanvasProps.onConnect}
      onEdgeClick={flowCanvasProps.onEdgeClick}
      nodeTypes={flowCanvasProps.nodeTypes}
      edgeTypes={flowCanvasProps.edgeTypes}
      fitView={flowCanvasProps.fitView}
      fitViewOptions={flowCanvasProps.fitViewOptions}
      isSidebarOpen={flowCanvasProps.isSidebarOpen}
    />
  )
})

export default ReactFlowWrapper