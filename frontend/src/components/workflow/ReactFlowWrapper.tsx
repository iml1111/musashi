import React from 'react'
import FlowCanvas from './FlowCanvas'

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
const ReactFlowWrapper: React.FC<ReactFlowWrapperProps> = (props) => {
  return (
    <FlowCanvas
      nodes={props.nodes}
      edges={props.edges}
      onNodeClick={props.onNodeClick}
      onPaneClick={props.onPaneClick}
      isSidebarOpen={props.isSidebarOpen}
    />
  )
}

export default ReactFlowWrapper