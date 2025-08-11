import React from 'react'

// Define EdgeProps type locally
interface EdgeProps {
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition?: string
  targetPosition?: string
  style?: React.CSSProperties
  markerEnd?: any
  markerStart?: any
  data?: any
  source: string
  target: string
}

// Helper function to truncate text with ellipsis
const truncateText = (text: string, maxLength: number = 50): { display: string; isTruncated: boolean } => {
  if (!text || text.length <= maxLength) {
    return { display: text || '', isTruncated: false }
  }
  return { 
    display: text.substring(0, maxLength - 3) + '...', 
    isTruncated: true 
  }
}

// Helper function to calculate dynamic width based on text length
const calculateLabelWidth = (text: string, maxLength: number = 50): number => {
  if (!text) return 80
  const displayLength = Math.min(text.length, maxLength)
  // Approximate width calculation: ~7px per character + padding
  const calculatedWidth = Math.max(80, Math.min(200, displayLength * 7 + 20))
  return calculatedWidth
}

// Simple custom edge component for Reaflow compatibility
export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
  markerStart,
  data,
  source,
  target,
}: EdgeProps) => {
  // Check for self-loop
  const isSelfLoop = source === target
  
  // Check if this is an upward connection (source is below target)
  const isUpward = sourceY > targetY + 20
  
  // Check if nodes are at the same level
  const isSameLevel = Math.abs(sourceY - targetY) < 50 && !isSelfLoop
  
  // Check if this is a locked tool connection
  const isToolConnection = data?.locked === true
  const isBidirectional = data?.direction === 'bidirectional'
  
  let edgePath: string
  
  if (isSelfLoop) {
    // Self-loop edge - create a loop to the side
    const loopSize = 80
    const loopDirection = 1 // Always loop to the right
    edgePath = `M ${sourceX},${sourceY} 
                C ${sourceX + loopSize * loopDirection},${sourceY - loopSize} 
                  ${sourceX + loopSize * loopDirection},${sourceY + loopSize} 
                  ${sourceX},${sourceY}`
  } else if (isUpward && !isSameLevel) {
    // For upward connections (cycles), create a smooth curve to the side
    const horizontalGap = Math.abs(sourceX - targetX)
    const verticalGap = Math.abs(sourceY - targetY)
    
    // Determine curve direction based on node positions
    const curveRight = sourceX <= targetX
    
    // Calculate control points for a smooth curve
    const offsetFactor = Math.min(1.5, verticalGap / 200)
    const sideOffset = Math.max(150, Math.min(300, horizontalGap * offsetFactor))
    
    if (curveRight) {
      // Curve to the right side
      const controlX = Math.max(sourceX, targetX) + sideOffset
      const midY = (sourceY + targetY) / 2
      
      edgePath = `M ${sourceX},${sourceY}
                  C ${sourceX + 30},${sourceY}
                    ${controlX},${sourceY - 30}
                    ${controlX},${midY}
                  S ${controlX},${targetY + 30}
                    ${targetX + 30},${targetY}
                  L ${targetX},${targetY}`
    } else {
      // Curve to the left side
      const controlX = Math.min(sourceX, targetX) - sideOffset
      const midY = (sourceY + targetY) / 2
      
      edgePath = `M ${sourceX},${sourceY}
                  C ${sourceX - 30},${sourceY}
                    ${controlX},${sourceY - 30}
                    ${controlX},${midY}
                  S ${controlX},${targetY + 30}
                    ${targetX - 30},${targetY}
                  L ${targetX},${targetY}`
    }
  } else if (isSameLevel) {
    // For connections at the same level, create a gentle arc
    const midX = (sourceX + targetX) / 2
    const offsetY = sourceX < targetX ? 60 : -60
    
    edgePath = `M ${sourceX},${sourceY}
                Q ${midX},${sourceY + offsetY}
                  ${targetX},${targetY}`
  } else {
    // For normal downward connections, use simple bezier curve
    const midY = (sourceY + targetY) / 2
    edgePath = `M ${sourceX},${sourceY}
                C ${sourceX},${midY}
                  ${targetX},${midY}
                  ${targetX},${targetY}`
  }

  // Calculate label position
  const labelX = (sourceX + targetX) / 2
  const labelY = (sourceY + targetY) / 2

  // Determine edge styling based on type
  const edgeStyle = {
    ...style,
    stroke: isToolConnection ? '#fb923c' : (style?.stroke || '#374151'),
    strokeWidth: isToolConnection ? 2 : (style?.strokeWidth || 3),
    strokeDasharray: isToolConnection ? '8 4' : '5 5',
    animation: 'dashdraw 0.5s linear infinite',
  }

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        fill="none"
        style={edgeStyle}
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      {/* Show lock icon for locked tool connections */}
      {isToolConnection && (
        <foreignObject
          x={labelX - 12}
          y={labelY - 12}
          width={24}
          height={24}
        >
          <div
            style={{
              background: '#fff8ed',
              border: '1px solid #fb923c',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}
            title="Locked bidirectional connection"
          >
            🔒
          </div>
        </foreignObject>
      )}
      {(() => {
        // Show label if sourceOutput exists and not a tool connection
        if (data?.sourceOutput && !isToolConnection) {
          const { display: displayText, isTruncated } = truncateText(data.sourceOutput, 50)
          const labelWidth = calculateLabelWidth(data.sourceOutput, 50)
        
        return (
          <foreignObject
            x={labelX - labelWidth / 2}
            y={labelY - 15}
            width={labelWidth}
            height={30}
          >
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #374151',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: isTruncated ? '10px' : '11px',
                fontWeight: 600,
                textAlign: 'center',
                cursor: 'pointer',
                userSelect: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
              }}
              title={isTruncated ? data.sourceOutput : undefined}
              onClick={(e) => {
                e.stopPropagation()
                if (data.onLabelClick) {
                  data.onLabelClick(e, id, data.sourceOutput)
                }
              }}
              onMouseEnter={(e) => {
                const element = e.currentTarget as HTMLDivElement
                element.style.zIndex = '1000'
                element.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.2)'
                element.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                const element = e.currentTarget as HTMLDivElement
                element.style.zIndex = 'auto'
                element.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)'
                element.style.transform = 'scale(1)'
              }}
            >
              {displayText}
            </div>
          </foreignObject>
        )
        }
        return null
      })()}
    </g>
  )
}

// Edge types object for compatibility
export const edgeTypes = {
  custom: CustomEdge,
  smoothstep: CustomEdge,
}

// Add CSS animation for dashed edges
const style = document.createElement('style')
style.textContent = `
  @keyframes dashdraw {
    from {
      stroke-dashoffset: 10;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
`
document.head.appendChild(style)