// Local type definitions to avoid ReactFlow import issues
export type Node = {
  id: string
  type?: string
  data?: any
  position?: { x: number; y: number }
  draggable?: boolean
}

export type Edge = {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  label?: string | React.ReactNode
  type?: string
  animated?: boolean
  data?: any
  markerEnd?: any
  markerStart?: any
  style?: any
}

export enum MarkerType {
  Arrow = 'arrow',
  ArrowClosed = 'arrowclosed',
}