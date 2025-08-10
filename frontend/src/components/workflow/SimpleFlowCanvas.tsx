import React, { useState, useRef, useEffect, useCallback } from 'react'
import dagre from 'dagre'

interface Node {
  id: string
  type?: string
  data?: any
  position?: { x: number; y: number }
}

interface Edge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  label?: string
  data?: any
}

interface SimpleFlowCanvasProps {
  nodes: Node[]
  edges: Edge[]
  onNodeClick?: (event: React.MouseEvent, node: Node) => void
  onPaneClick?: () => void
  onConnect?: (connection: any) => void
  fitView?: boolean
}

const nodeStyles: Record<string, any> = {
  userinput: {
    fill: '#dcfce7',
    stroke: '#22c55e',
    color: '#166534',
  },
  agent: {
    fill: '#dbeafe',
    stroke: '#3b82f6',
    color: '#1d4ed8',
  },
  agenttool: {
    fill: '#fed7aa',
    stroke: '#fb923c',
    color: '#ea580c',
  },
  vectorstore: {
    fill: '#e9d5ff',
    stroke: '#a855f7',
    color: '#7c3aed',
  },
  knowledgebase: {
    fill: '#e0e7ff',
    stroke: '#6366f1',
    color: '#4f46e5',
  },
  mcp: {
    fill: '#fce7f3',
    stroke: '#ec4899',
    color: '#db2777',
  },
  apicall: {
    fill: '#ccfbf1',
    stroke: '#14b8a6',
    color: '#0f766e',
  },
  router: {
    fill: '#fef3c7',
    stroke: '#f59e0b',
    color: '#d97706',
  },
  finaloutput: {
    fill: '#f3f4f6',
    stroke: '#6b7280',
    color: '#374151',
  },
  default: {
    fill: '#ffffff',
    stroke: '#e0e0e0',
    color: '#424242',
  },
}

const SimpleFlowCanvas: React.FC<SimpleFlowCanvasProps> = ({
  nodes,
  edges,
  onNodeClick,
  onPaneClick,
  onConnect,
  fitView = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [layoutedNodes, setLayoutedNodes] = useState<Node[]>([])
  const [viewBox, setViewBox] = useState('0 0 1000 600')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)

  // Apply Dagre layout
  useEffect(() => {
    if (nodes.length === 0) {
      setLayoutedNodes([])
      return
    }

    const g = new dagre.graphlib.Graph()
    g.setGraph({
      rankdir: 'TB',
      nodesep: 100,
      ranksep: 150,
      marginx: 50,
      marginy: 50,
    })
    g.setDefaultEdgeLabel(() => ({}))

    // Add nodes to graph
    nodes.forEach(node => {
      g.setNode(node.id, { width: 180, height: 80 })
    })

    // Add edges to graph
    edges.forEach(edge => {
      g.setEdge(edge.source, edge.target)
    })

    // Calculate layout
    dagre.layout(g)

    // Update node positions
    const positioned = nodes.map(node => {
      const nodeWithPosition = g.node(node.id)
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - 90, // Center the node
          y: nodeWithPosition.y - 40,
        },
      }
    })

    setLayoutedNodes(positioned)

    // Calculate viewBox for fitView
    if (fitView && positioned.length > 0) {
      const minX = Math.min(...positioned.map(n => n.position!.x)) - 100
      const minY = Math.min(...positioned.map(n => n.position!.y)) - 100
      const maxX = Math.max(...positioned.map(n => n.position!.x)) + 280
      const maxY = Math.max(...positioned.map(n => n.position!.y)) + 180
      
      setViewBox(`${minX} ${minY} ${maxX - minX} ${maxY - minY}`)
    }
  }, [nodes, edges, fitView])

  // Handle mouse wheel for zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)))
  }, [])

  // Handle panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).classList.contains('canvas-background')) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Render edge path
  const renderEdgePath = (edge: Edge) => {
    const sourceNode = layoutedNodes.find(n => n.id === edge.source)
    const targetNode = layoutedNodes.find(n => n.id === edge.target)
    
    if (!sourceNode || !targetNode) return null
    
    const sx = sourceNode.position!.x + 90
    const sy = sourceNode.position!.y + 80
    const tx = targetNode.position!.x + 90
    const ty = targetNode.position!.y
    
    // Simple bezier curve
    const midY = (sy + ty) / 2
    return `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty}`
  }

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={viewBox}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          background: '#f9fafb',
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => {
          if (e.target === svgRef.current || (e.target as Element).classList.contains('canvas-background')) {
            onPaneClick?.()
          }
        }}
      >
        <rect
          className="canvas-background"
          x={viewBox.split(' ')[0]}
          y={viewBox.split(' ')[1]}
          width={viewBox.split(' ')[2]}
          height={viewBox.split(' ')[3]}
          fill="transparent"
        />
        
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Render edges */}
          {edges.map(edge => {
            const path = renderEdgePath(edge)
            if (!path) return null
            
            return (
              <g key={edge.id}>
                <path
                  d={path}
                  fill="none"
                  stroke="#374151"
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                />
                {edge.label && (
                  <text
                    x={(layoutedNodes.find(n => n.id === edge.source)?.position?.x ?? 0) + 90}
                    y={((layoutedNodes.find(n => n.id === edge.source)?.position?.y ?? 0) + 
                        (layoutedNodes.find(n => n.id === edge.target)?.position?.y ?? 0)) / 2 + 40}
                    textAnchor="middle"
                    fill="#374151"
                    fontSize="12"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}
          
          {/* Render nodes */}
          {layoutedNodes.map(node => {
            const style = nodeStyles[node.type || 'default'] || nodeStyles.default
            const x = node.position?.x ?? 0
            const y = node.position?.y ?? 0
            
            return (
              <g
                key={node.id}
                transform={`translate(${x}, ${y})`}
                onClick={(e) => {
                  e.stopPropagation()
                  onNodeClick?.(e, node)
                }}
                style={{ cursor: 'pointer' }}
              >
                <rect
                  width="180"
                  height="80"
                  rx="12"
                  fill={style.fill}
                  stroke={style.stroke}
                  strokeWidth="2"
                />
                
                {/* Node name */}
                {node.data?.name && (
                  <text
                    x="90"
                    y="25"
                    textAnchor="middle"
                    fill={style.color}
                    fontSize="11"
                    opacity="0.7"
                  >
                    {node.data.name}
                  </text>
                )}
                
                {/* Node label */}
                <text
                  x="90"
                  y={node.data?.name ? "45" : "40"}
                  textAnchor="middle"
                  fill={style.color}
                  fontSize="14"
                  fontWeight="600"
                >
                  {node.data?.label || 'Node'}
                </text>
                
                {/* Agent model display */}
                {node.type === 'agent' && node.data?.parameters?.model && (
                  <text
                    x="90"
                    y="60"
                    textAnchor="middle"
                    fill={node.data.parameters.model ? style.color : '#ef4444'}
                    fontSize="11"
                    opacity={node.data.parameters.model ? "0.7" : "1"}
                  >
                    {node.data.parameters.model || 'No model selected'}
                  </text>
                )}
              </g>
            )
          })}
        </g>
        
        {/* Arrow marker definition */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 5, 0 10"
              fill="#374151"
            />
          </marker>
        </defs>
      </svg>
    </div>
  )
}

export default SimpleFlowCanvas