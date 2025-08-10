import React from 'react'

interface TestCanvasProps {
  nodes: any[]
  edges: any[]
  onNodeClick: (event: React.MouseEvent, node: any) => void
  onPaneClick: () => void
}

const TestCanvas: React.FC<TestCanvasProps> = ({
  nodes,
  edges,
  onNodeClick,
  onPaneClick,
}) => {
  return (
    <div style={{ width: '100%', height: '100%', background: '#f0f0f0', padding: '20px' }}>
      <h2>Test Canvas - ReactFlow Disabled</h2>
      <p>Nodes count: {nodes.length}</p>
      <p>Edges count: {edges.length}</p>
      <div style={{ marginTop: '20px' }}>
        <h3>Nodes:</h3>
        <ul>
          {nodes.map(node => (
            <li key={node.id}>{node.id} - {node.data?.label}</li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: '20px' }}>
        <h3>Edges:</h3>
        <ul>
          {edges.map(edge => (
            <li key={edge.id}>{edge.source} → {edge.target}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default TestCanvas