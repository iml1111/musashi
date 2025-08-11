// Node configuration without React components
export const nodeConfig = {
  userinput: {
    label: 'User Input',
    icon: 'User',
    style: {
      background: '#dcfce7',
      border: '2px solid #22c55e',
      color: '#166534',
    }
  },
  agent: {
    label: 'AI Agent',
    icon: 'Bot',
    style: {
      background: '#dbeafe',
      border: '2px solid #3b82f6',
      color: '#1d4ed8',
    }
  },
  vectorstore: {
    label: 'Vector Store',
    icon: 'Database',
    style: {
      background: '#e9d5ff',
      border: '2px solid #a855f7',
      color: '#7c3aed',
    }
  },
  knowledgebase: {
    label: 'Knowledge Base',
    icon: 'BookOpen',
    style: {
      background: '#e0e7ff',
      border: '2px solid #6366f1',
      color: '#4f46e5',
    }
  },
  mcp: {
    label: 'MCP Server',
    icon: 'Network',
    style: {
      background: '#f0f9ff',
      border: '2px solid #0ea5e9',
      color: '#0c4a6e',
    }
  },
  function: {
    label: 'Function',
    icon: 'Zap',
    style: {
      background: '#ccfbf1',
      border: '2px solid #14b8a6',
      color: '#0f766e',
    }
  },
  router: {
    label: 'Router',
    icon: 'GitBranch',
    style: {
      background: '#fce7f3',
      border: '2px solid #ec4899',
      color: '#9f1239',
    }
  },
  finaloutput: {
    label: 'Final Output',
    icon: 'CheckCircle',
    style: {
      background: '#d1fae5',
      border: '2px solid #10b981',
      color: '#065f46',
    }
  },
  default: {
    label: 'Node',
    icon: 'Circle',
    style: {
      background: '#f3f4f6',
      border: '2px solid #9ca3af',
      color: '#374151',
    }
  }
}

export const edgeConfig = {
  bidirectional: {
    style: {
      stroke: '#6b7280',
      strokeWidth: 2,
    }
  },
  default: {
    style: {
      stroke: '#9ca3af',
      strokeWidth: 1,
    }
  }
}