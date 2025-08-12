import { describe, it, expect } from 'vitest'
import { 
  validateAgentConnections, 
  validateWorkflowConnections,
  checkForCircularDependencies 
} from '../connectionValidator'
import { Node, Edge } from '../../types/flow'

describe('connectionValidator', () => {
  describe('validateAgentConnections', () => {
    it('should validate agent node connections correctly', () => {
      const agentNode: Node = {
        id: 'agent1',
        type: 'agent',
        position: { x: 0, y: 0 },
        data: {
          label: 'Test Agent',
          connected_inputs: [
            { nodeId: 'node1', outputKey: 'output' }
          ]
        }
      }
      
      const edges: Edge[] = [
        {
          id: 'edge1',
          source: 'node1',
          target: 'agent1',
          sourceHandle: 'output-output',
          targetHandle: 'input'
        }
      ]
      
      const result = validateAgentConnections(agentNode, edges)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toHaveLength(0)
    })

    it('should detect orphaned edges', () => {
      const agentNode: Node = {
        id: 'agent1',
        type: 'agent',
        position: { x: 0, y: 0 },
        data: {
          label: 'Test Agent',
          connected_inputs: []
        }
      }
      
      const edges: Edge[] = [
        {
          id: 'edge1',
          source: 'node1',
          target: 'agent1',
          sourceHandle: 'output-output'
        }
      ]
      
      const result = validateAgentConnections(agentNode, edges)
      expect(result.isValid).toBe(false)
      expect(result.warnings).toContain('Edge from node node1 is not registered in connected_inputs')
    })

    it('should detect stale connected_inputs', () => {
      const agentNode: Node = {
        id: 'agent1',
        type: 'agent',
        position: { x: 0, y: 0 },
        data: {
          label: 'Test Agent',
          connected_inputs: [
            { nodeId: 'node1', outputKey: 'output' }
          ]
        }
      }
      
      const edges: Edge[] = []
      
      const result = validateAgentConnections(agentNode, edges)
      expect(result.isValid).toBe(false)
      expect(result.unconnectedInputs).toContain('node1.output')
    })

    it('should return valid for non-agent nodes', () => {
      const functionNode: Node = {
        id: 'func1',
        type: 'function',
        position: { x: 0, y: 0 },
        data: { label: 'Function' }
      }
      
      const result = validateAgentConnections(functionNode, [])
      expect(result.isValid).toBe(true)
    })
  })

  describe('validateWorkflowConnections', () => {
    it('should validate entire workflow connections', () => {
      const nodes: Node[] = [
        {
          id: 'agent1',
          type: 'agent',
          position: { x: 0, y: 0 },
          data: {
            label: 'Agent 1',
            connected_inputs: []
          }
        },
        {
          id: 'agent2',
          type: 'agent',
          position: { x: 200, y: 0 },
          data: {
            label: 'Agent 2',
            connected_inputs: [
              { nodeId: 'agent1', outputKey: 'output' }
            ]
          }
        }
      ]
      
      const edges: Edge[] = [
        {
          id: 'edge1',
          source: 'agent1',
          target: 'agent2',
          sourceHandle: 'output-output',
          targetHandle: 'input'
        }
      ]
      
      const results = validateWorkflowConnections(nodes, edges)
      expect(results).toHaveLength(2)
      expect(results.every(r => r.isValid)).toBe(true)
    })

    it('should detect multiple validation issues', () => {
      const nodes: Node[] = [
        {
          id: 'agent1',
          type: 'agent',
          position: { x: 0, y: 0 },
          data: {
            label: 'Agent 1',
            connected_inputs: [
              { nodeId: 'missing', outputKey: 'output' }
            ]
          }
        }
      ]
      
      const edges: Edge[] = []
      
      const results = validateWorkflowConnections(nodes, edges)
      expect(results[0].isValid).toBe(false)
      expect(results[0].unconnectedInputs).toContain('missing.output')
    })
  })

  describe('checkForCircularDependencies', () => {
    it('should detect circular dependencies', () => {
      const edges: Edge[] = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n1' }
      ]
      
      const hasCycle = checkForCircularDependencies(edges)
      expect(hasCycle).toBe(true)
    })

    it('should return false for DAG', () => {
      const edges: Edge[] = [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n1', target: 'n3' }
      ]
      
      const hasCycle = checkForCircularDependencies(edges)
      expect(hasCycle).toBe(false)
    })

    it('should handle self-loops', () => {
      const edges: Edge[] = [
        { id: 'e1', source: 'n1', target: 'n1' }
      ]
      
      const hasCycle = checkForCircularDependencies(edges)
      expect(hasCycle).toBe(true)
    })

    it('should handle empty edges', () => {
      const hasCycle = checkForCircularDependencies([])
      expect(hasCycle).toBe(false)
    })
  })
})