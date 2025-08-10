import React from 'react'

interface SimpleCanvasProps {
  nodes: any[]
  edges: any[]
  onNodeClick?: (node: any) => void
  onPaneClick?: () => void
  [key: string]: any
}

const SimpleCanvas: React.FC<SimpleCanvasProps> = ({ nodes, edges, onNodeClick, onPaneClick }) => {
  // 노드 타입별 색상
  const getNodeColor = (type?: string) => {
    switch (type) {
      case 'userinput': return '#10b981' // green
      case 'agent': return '#3b82f6' // blue
      case 'agenttool': return '#8b5cf6' // purple
      case 'output': return '#f59e0b' // amber
      case 'memo': return '#6b7280' // gray
      default: return '#94a3b8' // slate
    }
  }

  // 노드 타입별 아이콘
  const getNodeIcon = (type?: string) => {
    switch (type) {
      case 'userinput': return '👤'
      case 'agent': return '🤖'
      case 'agenttool': return '🔧'
      case 'output': return '📤'
      case 'memo': return '📝'
      default: return '📦'
    }
  }

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        background: '#f8fafc',
        overflow: 'auto'
      }}
      onClick={onPaneClick}
    >
      {/* Canvas Header */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 10,
        background: 'white',
        padding: '10px 20px',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
          Workflow Canvas (Simplified View)
        </h3>
        <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#64748b' }}>
          {nodes.length} nodes, {edges.length} connections
        </p>
      </div>

      {/* Nodes Grid */}
      <div style={{
        padding: '100px 20px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 20
      }}>
        {nodes.map((node) => (
          <div
            key={node.id}
            onClick={(e) => {
              e.stopPropagation()
              onNodeClick?.(node)
            }}
            style={{
              background: 'white',
              border: `2px solid ${getNodeColor(node.type)}`,
              borderRadius: 8,
              padding: 15,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '20px' }}>{getNodeIcon(node.type)}</span>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: getNodeColor(node.type),
                  fontWeight: 500,
                  marginBottom: 2
                }}>
                  {node.type?.toUpperCase() || 'NODE'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>
                  {node.data?.label || `Node ${node.id}`}
                </div>
              </div>
            </div>
            
            {/* Node properties preview */}
            {node.data && Object.keys(node.data).length > 1 && (
              <div style={{ 
                marginTop: 10, 
                paddingTop: 10, 
                borderTop: '1px solid #e2e8f0',
                fontSize: '12px',
                color: '#64748b'
              }}>
                {Object.entries(node.data)
                  .filter(([key]) => key !== 'label')
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <div key={key} style={{ marginBottom: 2 }}>
                      <span style={{ fontWeight: 500 }}>{key}:</span>{' '}
                      <span>{String(value).substring(0, 30)}...</span>
                    </div>
                  ))}
              </div>
            )}

            {/* Connection count */}
            <div style={{
              marginTop: 10,
              fontSize: '11px',
              color: '#94a3b8',
              display: 'flex',
              gap: 10
            }}>
              <span>
                ← {edges.filter(e => e.target === node.id).length} in
              </span>
              <span>
                → {edges.filter(e => e.source === node.id).length} out
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edges Summary */}
      {edges.length > 0 && (
        <div style={{
          margin: '20px',
          padding: '15px',
          background: 'white',
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: 600 }}>
            Connections
          </h4>
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            {edges.slice(0, 5).map((edge) => {
              const sourceNode = nodes.find(n => n.id === edge.source)
              const targetNode = nodes.find(n => n.id === edge.target)
              return (
                <div key={edge.id} style={{ marginBottom: 5 }}>
                  <span style={{ fontWeight: 500 }}>
                    {sourceNode?.data?.label || edge.source}
                  </span>
                  {' → '}
                  <span style={{ fontWeight: 500 }}>
                    {targetNode?.data?.label || edge.target}
                  </span>
                  {edge.label && (
                    <span style={{ marginLeft: 5, color: '#3b82f6' }}>
                      ({edge.label})
                    </span>
                  )}
                </div>
              )
            })}
            {edges.length > 5 && (
              <div style={{ marginTop: 5, fontStyle: 'italic' }}>
                ...and {edges.length - 5} more connections
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SimpleCanvas