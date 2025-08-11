// Node type definitions for Musashi workflow

export interface OutputField {
  key: string
  type: string
  example?: string
}

export interface ConnectedInput {
  nodeId: string       // Connected source node ID
  nodeName: string     // Connected source node name
  outputKey: string    // Connected output's key
  outputType: string   // Connected output's type
  outputExample?: string // Connected output's example
}

export interface AgentTool {
  type: 'web_search' | 'api_call' | 'file_search' | 'code_interpreter' | 'image_generation'
  enabled: boolean
  config?: Record<string, any>
}

export interface PromptContext {
  type: 'user' | 'agent'
  content: string
}

export interface AgentParameters {
  model: string
  temperature: number
  max_tokens: number
  top_p: number
  developer_message: string  // Previously system_prompt
  system_prompt?: string      // For backward compatibility
  prompts?: PromptContext[]   // Optional array of prompt contexts (max 100)
  tools?: AgentTool[]
}

export interface BaseNodeData {
  label: string
  name: string
  memo?: string
  outputs: OutputField[]
}

export interface AgentNodeData extends BaseNodeData {
  connected_inputs: ConnectedInput[]
  parameters: AgentParameters
}

export interface VectorStoreParameters {
  type: 'mongodb' | 'qdrant' | 'pinecone'
}

export interface VectorStoreNodeData extends BaseNodeData {
  parameters: VectorStoreParameters
}

export interface KnowledgeBaseParameters {
  type: 'postgresql' | 'mongodb'
  query?: string      // Query for retrieving data
}

export interface KnowledgeBaseNodeData extends BaseNodeData {
  parameters: KnowledgeBaseParameters
}

export interface ConnectedOutput {
  nodeId: string       // Connected source node ID
  nodeName: string     // Connected source node name
  outputKey: string    // Connected output's key
  outputType: string   // Connected output's type
  outputExample?: string // Connected output's example
}

export interface FinalOutputNodeData extends BaseNodeData {
  connected_outputs: ConnectedOutput[]  // Similar to Agent's connected_inputs
  // outputs are auto-generated from connected_outputs
}

export interface MCPParameters {
  mode?: 'query' | 'command' | 'stream'
  // servers field removed - no longer needed
}

export interface MCPNodeData extends BaseNodeData {
  parameters: MCPParameters
  connected_inputs: ConnectedInput[]  // Inputs from Agent nodes (read-only)
  // outputs are partially editable (inherited from BaseNodeData) - exactly 1 output, can modify but not delete
}

export interface StandardNodeData extends BaseNodeData {
  // For non-agent nodes that just have outputs
}

export type NodeData = AgentNodeData | VectorStoreNodeData | KnowledgeBaseNodeData | FinalOutputNodeData | MCPNodeData | StandardNodeData

// Helper type guards
export function isAgentNode(data: any): data is AgentNodeData {
  return data && 'connected_inputs' in data && 'parameters' in data
}

export function isVectorStoreNode(data: any): data is VectorStoreNodeData {
  return data && 'parameters' in data && data.parameters?.type && 
    ['mongodb', 'qdrant', 'pinecone'].includes(data.parameters.type)
}

export function isKnowledgeBaseNode(data: any): data is KnowledgeBaseNodeData {
  return data && 'parameters' in data && data.parameters?.type && 
    ['postgresql', 'mongodb'].includes(data.parameters.type)
}

export function isFinalOutputNode(data: any): data is FinalOutputNodeData {
  return data && 'connected_outputs' in data
}

export function isMCPNode(data: any): data is MCPNodeData {
  return data && 'connected_inputs' in data && 'parameters' in data && 
    data.parameters?.mode !== undefined
}