export interface Node {
  id: string
  type: string
  label: string
  properties: Record<string, any>
  position_x?: number
  position_y?: number
}

export interface Edge {
  id: string
  source: string
  target: string
  label?: string
  sourceHandle?: string
  targetHandle?: string
}

export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  metadata: Record<string, any>
  owner_id: string
  team_id?: string
  version: number
  is_public: boolean
  share_token?: string
  created_at: string
  updated_at: string
}

export interface WorkflowCreate {
  name: string
  description?: string
  nodes: Node[]
  edges: Edge[]
  metadata?: Record<string, any>
}

export interface WorkflowUpdate {
  name?: string
  description?: string
  nodes?: Node[]
  edges?: Edge[]
  metadata?: Record<string, any>
}