import { Node, Edge } from '../types/flow'
import { ConnectedInput } from '../types/node'

export interface ConnectionValidationResult {
  isValid: boolean
  warnings: string[]
  unconnectedInputs: string[]
}

/**
 * Validates if Agent node's connected_inputs are in sync with actual edges
 */
export function validateAgentConnections(
  agentNode: Node,
  edges: Edge[]
): ConnectionValidationResult {
  const result: ConnectionValidationResult = {
    isValid: true,
    warnings: [],
    unconnectedInputs: []
  }

  // Only validate Agent nodes
  if (agentNode.type !== 'agent') {
    return result
  }

  // Get connected_inputs and incoming edges
  const connectedInputs = agentNode.data?.connected_inputs || []
  const incomingEdges = edges.filter(edge => edge.target === agentNode.id)
  
  // Agent nodes don't require inputs, they can work without connections
  // But if there are connections, they should match connected_inputs
  
  // Check for orphaned edges (edges without corresponding connected_inputs)
  incomingEdges.forEach(edge => {
    const outputKey = edge.sourceHandle?.replace('output-', '') || 'output'
    const hasMatchingInput = connectedInputs.some((input: ConnectedInput) => 
      input.nodeId === edge.source && input.outputKey === outputKey
    )
    
    if (!hasMatchingInput) {
      result.isValid = false
      result.warnings.push(`Edge from node ${edge.source} is not registered in connected_inputs`)
    }
  })
  
  // Check for stale connected_inputs (inputs without actual edges)
  connectedInputs.forEach((input: ConnectedInput) => {
    const hasEdge = incomingEdges.some(edge => 
      edge.source === input.nodeId && 
      edge.sourceHandle === `output-${input.outputKey}`
    )
    
    if (!hasEdge) {
      result.isValid = false
      result.warnings.push(`Connected input "${input.outputKey}" from "${input.nodeName}" has no actual edge`)
      result.unconnectedInputs.push(input.outputKey)
    }
  })

  return result
}

/**
 * Validates all Agent nodes connected to a User Input node
 */
export function validateUserInputToAgentConnections(
  userInputNode: Node,
  nodes: Node[],
  edges: Edge[]
): ConnectionValidationResult {
  const result: ConnectionValidationResult = {
    isValid: true,
    warnings: [],
    unconnectedInputs: []
  }

  // Only validate User Input nodes
  if (userInputNode.type !== 'userinput') {
    return result
  }

  // Find all edges originating from this User Input node
  const outgoingEdges = edges.filter(edge => edge.source === userInputNode.id)
  
  // Find all Agent nodes that are targets of these edges
  const connectedAgentNodes = outgoingEdges
    .map(edge => nodes.find(node => node.id === edge.target))
    .filter(node => node && node.type === 'agent') as Node[]

  // Validate each connected Agent node
  connectedAgentNodes.forEach(agentNode => {
    const agentValidation = validateAgentConnections(agentNode, edges)
    if (!agentValidation.isValid) {
      result.isValid = false
      result.warnings.push(...agentValidation.warnings)
      result.unconnectedInputs.push(...agentValidation.unconnectedInputs)
    }
  })

  return result
}

/**
 * Check if a specific node needs validation warning
 */
export function needsConnectionWarning(
  node: Node,
  nodes: Node[],
  edges: Edge[]
): boolean {
  if (node.type === 'agent') {
    const validation = validateAgentConnections(node, edges)
    return !validation.isValid
  }
  
  if (node.type === 'userinput') {
    const validation = validateUserInputToAgentConnections(node, nodes, edges)
    return !validation.isValid
  }
  
  return false
}