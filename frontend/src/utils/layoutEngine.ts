import dagre from 'dagre';
import { Node, Edge } from '../types/flow';

type XYPosition = { x: number; y: number };

export interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL';
  nodeSpacing?: number;
  rankSpacing?: number;
  nodeWidth?: number;
  nodeHeight?: number;
}

const defaultOptions: LayoutOptions = {
  direction: 'TB',
  nodeSpacing: 200,
  rankSpacing: 300,
  nodeWidth: 200,
  nodeHeight: 60,
};

export function calculateLayout(
  nodes: Node[],
  edges: Edge[],
  options: LayoutOptions = {}
): { nodes: Node[]; edges: Edge[] } {
  const layoutOptions = { ...defaultOptions, ...options };
  const { direction, nodeSpacing, rankSpacing, nodeWidth, nodeHeight } = layoutOptions;

  // Create a new directed graph
  const g = new dagre.graphlib.Graph({ 
    directed: true,
    multigraph: true,
    compound: false 
  });
  
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 100,
    marginy: 100,
    // Settings for better cycle handling
    ranker: 'longest-path',
    edgesep: 150,
  });

  // Default edge label
  g.setDefaultEdgeLabel(() => ({}));

  // Add nodes to the graph
  nodes.forEach((node) => {
    g.setNode(node.id, {
      width: nodeWidth,
      height: nodeHeight,
    });
  });

  // Add edges to the graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Run the layout algorithm
  dagre.layout(g);

  // Update node positions based on the layout
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = g.node(node.id);
    const position: XYPosition = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };

    return {
      ...node,
      position,
      // Disable dragging
      draggable: false,
    };
  });

  // Post-process to ensure all nodes are visible
  const bounds = layoutedNodes.reduce((acc, node) => {
    return {
      minX: Math.min(acc.minX, node.position.x),
      minY: Math.min(acc.minY, node.position.y),
      maxX: Math.max(acc.maxX, node.position.x + nodeWidth),
      maxY: Math.max(acc.maxY, node.position.y + nodeHeight),
    };
  }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });

  // Add padding and ensure positive coordinates
  const padding = 50;
  const offsetX = bounds.minX < padding ? padding - bounds.minX : 0;
  const offsetY = bounds.minY < padding ? padding - bounds.minY : 0;

  const adjustedNodes = layoutedNodes.map(node => ({
    ...node,
    position: {
      x: node.position.x + offsetX,
      y: node.position.y + offsetY,
    },
  }));

  return {
    nodes: adjustedNodes,
    edges,
  };
}

// Helper function to add a new node with automatic positioning
export function addNodeWithLayout(
  existingNodes: Node[],
  existingEdges: Edge[],
  newNode: Omit<Node, 'position'>,
  options?: LayoutOptions
): { nodes: Node[]; edges: Edge[] } {
  // Add temporary position (will be recalculated)
  const nodeWithPosition: Node = {
    ...newNode,
    position: { x: 0, y: 0 },
    draggable: false,
  };

  const allNodes = [...existingNodes, nodeWithPosition];
  return calculateLayout(allNodes, existingEdges, options);
}

// Helper function to remove a node and recalculate layout
export function removeNodeWithLayout(
  nodes: Node[],
  edges: Edge[],
  nodeId: string,
  options?: LayoutOptions
): { nodes: Node[]; edges: Edge[] } {
  const filteredNodes = nodes.filter((node) => node.id !== nodeId);
  const filteredEdges = edges.filter(
    (edge) => edge.source !== nodeId && edge.target !== nodeId
  );

  return calculateLayout(filteredNodes, filteredEdges, options);
}

// Helper function to add an edge and recalculate layout
export function addEdgeWithLayout(
  nodes: Node[],
  edges: Edge[],
  newEdge: Edge,
  options?: LayoutOptions
): { nodes: Node[]; edges: Edge[] } {
  const allEdges = [...edges, newEdge];
  return calculateLayout(nodes, allEdges, options);
}

// Helper function to remove an edge and recalculate layout
export function removeEdgeWithLayout(
  nodes: Node[],
  edges: Edge[],
  edgeId: string,
  options?: LayoutOptions
): { nodes: Node[]; edges: Edge[] } {
  const filteredEdges = edges.filter((edge) => edge.id !== edgeId);
  return calculateLayout(nodes, filteredEdges, options);
}