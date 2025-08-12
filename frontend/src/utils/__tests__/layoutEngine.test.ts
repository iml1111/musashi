import { describe, it, expect } from 'vitest'
import { calculateLayout, addNodeWithLayout, removeNodeWithLayout } from '../layoutEngine'
import { Node, Edge } from '../../types/flow'

describe('layoutEngine', () => {
  describe('calculateLayout', () => {
    it('should calculate layout for simple flow', () => {
      const nodes: Node[] = [
        {
          id: '1',
          type: 'agent',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' }
        },
        {
          id: '2',
          type: 'function',
          position: { x: 0, y: 0 },
          data: { label: 'Node 2' }
        }
      ]
      
      const edges: Edge[] = [
        { id: 'e1', source: '1', target: '2' }
      ]
      
      const result = calculateLayout(nodes, edges)
      
      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(1)
      expect(result.nodes[0].position).toBeDefined()
      expect(result.nodes[0].draggable).toBe(false)
      expect(result.nodes[0].data).toEqual(nodes[0].data)
    })

    it('should preserve node data during layout', () => {
      const nodes: Node[] = [
        {
          id: '1',
          type: 'agent',
          position: { x: 0, y: 0 },
          data: { 
            label: 'Test',
            connected_inputs: [{ nodeId: 'test', outputKey: 'output' }],
            customProp: 'value'
          }
        }
      ]
      
      const result = calculateLayout(nodes, [])
      
      expect(result.nodes[0].data.connected_inputs).toBeDefined()
      expect(result.nodes[0].data.connected_inputs).toHaveLength(1)
      expect(result.nodes[0].data.customProp).toBe('value')
    })

    it('should handle disconnected nodes', () => {
      const nodes: Node[] = [
        {
          id: '1',
          type: 'agent',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' }
        },
        {
          id: '2',
          type: 'function',
          position: { x: 0, y: 0 },
          data: { label: 'Node 2' }
        },
        {
          id: '3',
          type: 'mcp',
          position: { x: 0, y: 0 },
          data: { label: 'Node 3' }
        }
      ]
      
      const edges: Edge[] = [
        { id: 'e1', source: '1', target: '2' }
      ]
      
      const result = calculateLayout(nodes, edges)
      
      expect(result.nodes).toHaveLength(3)
      result.nodes.forEach(node => {
        expect(node.position?.x).toBeTypeOf('number')
        expect(node.position?.y).toBeTypeOf('number')
      })
    })

    it('should handle empty nodes array', () => {
      const result = calculateLayout([], [])
      expect(result.nodes).toEqual([])
      expect(result.edges).toEqual([])
    })

    it('should handle cyclic graphs', () => {
      const nodes: Node[] = [
        {
          id: '1',
          type: 'agent',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' }
        },
        {
          id: '2',
          type: 'function',
          position: { x: 0, y: 0 },
          data: { label: 'Node 2' }
        }
      ]
      
      const edges: Edge[] = [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '1' }
      ]
      
      const result = calculateLayout(nodes, edges)
      
      expect(result.nodes).toHaveLength(2)
      expect(result.nodes[0].position?.x).not.toBeNaN()
      expect(result.nodes[0].position?.y).not.toBeNaN()
    })
  })

  describe('addNodeWithLayout', () => {
    it('should add new node and recalculate layout', () => {
      const existingNodes: Node[] = [
        {
          id: '1',
          type: 'agent',
          position: { x: 100, y: 100 },
          data: { label: 'Existing' }
        }
      ]
      
      const existingEdges: Edge[] = []
      
      const newNode = {
        id: '2',
        type: 'function',
        data: { label: 'New Node' }
      }
      
      const result = addNodeWithLayout(existingNodes, existingEdges, newNode)
      
      expect(result.nodes).toHaveLength(2)
      expect(result.nodes.find(n => n.id === '2')).toBeDefined()
    })

    it('should handle adding node with existing edges', () => {
      const existingNodes: Node[] = [
        {
          id: '1',
          type: 'agent',
          position: { x: 100, y: 100 },
          data: { label: 'Source' }
        }
      ]
      
      const existingEdges: Edge[] = []
      
      const newNode = {
        id: '2',
        type: 'function',
        data: { label: 'Target' }
      }
      
      const result = addNodeWithLayout(
        existingNodes, 
        existingEdges, 
        newNode
      )
      
      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(0)
    })
  })

  describe('removeNodeWithLayout', () => {
    it('should remove node and its edges', () => {
      const nodes: Node[] = [
        {
          id: '1',
          type: 'agent',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' }
        },
        {
          id: '2',
          type: 'function',
          position: { x: 200, y: 0 },
          data: { label: 'Node 2' }
        },
        {
          id: '3',
          type: 'mcp',
          position: { x: 400, y: 0 },
          data: { label: 'Node 3' }
        }
      ]
      
      const edges: Edge[] = [
        { id: 'e1', source: '1', target: '2' },
        { id: 'e2', source: '2', target: '3' }
      ]
      
      const result = removeNodeWithLayout(nodes, edges, '2')
      
      expect(result.nodes).toHaveLength(2)
      expect(result.nodes.find(n => n.id === '2')).toBeUndefined()
      expect(result.edges).toHaveLength(0)
    })

    it('should preserve unrelated edges', () => {
      const nodes: Node[] = [
        {
          id: '1',
          type: 'agent',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' }
        },
        {
          id: '2',
          type: 'function',
          position: { x: 200, y: 0 },
          data: { label: 'Node 2' }
        },
        {
          id: '3',
          type: 'mcp',
          position: { x: 400, y: 0 },
          data: { label: 'Node 3' }
        }
      ]
      
      const edges: Edge[] = [
        { id: 'e1', source: '1', target: '3' },
        { id: 'e2', source: '2', target: '3' }
      ]
      
      const result = removeNodeWithLayout(nodes, edges, '2')
      
      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(1)
      expect(result.edges[0].id).toBe('e1')
    })

    it('should handle removing non-existent node', () => {
      const nodes: Node[] = [
        {
          id: '1',
          type: 'agent',
          position: { x: 0, y: 0 },
          data: { label: 'Node 1' }
        }
      ]
      
      const edges: Edge[] = []
      
      const result = removeNodeWithLayout(nodes, edges, 'non-existent')
      
      expect(result.nodes).toHaveLength(1)
      expect(result.edges).toHaveLength(0)
    })
  })
})