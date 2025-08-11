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
}

// Wrapper component that uses FlowCanvas
const ReactFlowWrapper = forwardRef<FlowCanvasHandle, ReactFlowWrapperProps>((props, ref) => {
  return (
    <FlowCanvas
      ref={ref}
      nodes={props.nodes}
      edges={props.edges}
      onNodeClick={props.onNodeClick}
      onPaneClick={props.onPaneClick}
      onNodesChange={props.onNodesChange}
      onEdgesChange={props.onEdgesChange}
      onConnect={props.onConnect}
      onEdgeClick={props.onEdgeClick}
      nodeTypes={props.nodeTypes}
      edgeTypes={props.edgeTypes}
      fitView={props.fitView}
      fitViewOptions={props.fitViewOptions}
      isSidebarOpen={props.isSidebarOpen}
    />
  )
})

export default ReactFlowWrapper