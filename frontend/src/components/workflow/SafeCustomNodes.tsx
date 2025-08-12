import React from 'react'
import { Handle, Position } from 'reactflow'
import { 
  User, 
  Bot, 
  Database, 
  BookOpen, 
  Share2, 
  Zap, 
  CheckCircle,
  Box,
  FileText
} from 'lucide-react'

// Icon mapping for each node type
const nodeIcons: Record<string, React.ReactNode> = {
  userinput: <User size={16} />,
  agent: <Bot size={16} />,
  vectorstore: <Database size={16} />,
  knowledgebase: <BookOpen size={16} />,
  mcp: <Share2 size={16} />,
  function: <Zap size={16} />,
  finaloutput: <CheckCircle size={16} />,
  default: <Box size={16} />,
}

// Simple base node without icons to avoid potential import issues
const SimpleBaseNode = ({ data, type }: any) => {
  const nodeStyles: Record<string, any> = {
    userinput: {
      background: '#dcfce7',
      border: '2px solid #22c55e',
      color: '#166534',
    },
    agent: {
      background: '#dbeafe',
      border: '2px solid #3b82f6',
      color: '#1d4ed8',
    },
    vectorstore: {
      background: '#e9d5ff',
      border: '2px solid #a855f7',
      color: '#7c3aed',
    },
    knowledgebase: {
      background: '#e0e7ff',
      border: '2px solid #6366f1',
      color: '#4f46e5',
    },
    mcp: {
      background: '#fce7f3',
      border: '2px solid #ec4899',
      color: '#db2777',
    },
    function: {
      background: '#ccfbf1',
      border: '2px solid #14b8a6',
      color: '#0f766e',
    },
    finaloutput: {
      background: '#f3f4f6',
      border: '2px solid #6b7280',
      color: '#374151',
    },
    default: {
      background: '#ffffff',
      border: '2px solid #e0e0e0',
      color: '#424242',
    },
  }

  const style = nodeStyles[type] || nodeStyles.default

  return (
    <div
      style={{
        ...style,
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        minWidth: '180px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: 'transparent',
          width: '10px',
          height: '10px',
          border: 'none',
          top: '-5px',
        }}
      />
      
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          {nodeIcons[type] || nodeIcons.default}
          <span>{data?.label || 'Node'}</span>
        </div>
        {data?.memo && (
          <div style={{ 
            fontSize: '10px', 
            color: '#6b7280',
            marginTop: '4px',
            fontStyle: 'italic',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.2'
          }} title={data.memo}>
            📝 {data.memo}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: 'transparent',
          width: '10px',
          height: '10px',
          border: 'none',
          bottom: '-5px',
        }}
      />
    </div>
  )
}

// Custom User Input Node
const SafeUserInputNode = ({ data }: any) => {
  const outputs = data?.outputs || []
  const outputCount = Math.min(outputs.length, 30)
  
  return (
    <div
      style={{
        background: '#dcfce7',
        border: '2px solid #22c55e',
        color: '#166534',
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        minWidth: '180px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: 'transparent',
          width: '10px',
          height: '10px',
          border: 'none',
          top: '-5px',
        }}
      />
      
      <div>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <User size={16} />
          <span>{data?.label || 'User Input'}</span>
        </div>
        {outputCount > 0 && (
          <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>
            {outputCount} output{outputCount > 1 ? 's' : ''}
          </div>
        )}
        {data?.memo && (
          <div style={{ 
            fontSize: '10px', 
            color: '#6b7280',
            marginTop: '4px',
            fontStyle: 'italic',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.2'
          }} title={data.memo}>
            📝 {data.memo}
          </div>
        )}
      </div>
      
      {/* Dynamic bottom handles */}
      {outputs.slice(0, 30).map((output: any, index: number) => {
        const handleSpacing = outputCount > 0 ? Math.min(20, 200 / (outputCount + 1)) : 0
        const startOffset = outputCount > 0 ? -(outputCount - 1) * handleSpacing / 2 : 0
        
        return (
          <Handle
            key={`output-${index}`}
            id={`output-${output.key}`}
            type="source"
            position={Position.Bottom}
            style={{
              background: 'transparent',
              width: '8px',
              height: '8px',
              border: 'none',
              bottom: '-5px',
              left: `calc(50% + ${startOffset + index * handleSpacing}px)`,
              transform: 'translateX(-50%)',
            }}
            title={`${output.key} (${output.type})`}
          />
        )
      })}
    </div>
  )
}

// Custom Agent Node
const SafeAgentNode = ({ data, id }: any) => {
  const model = data?.parameters?.model?.trim() || ''
  const hasModel = model.length > 0
  const hasDeveloperMessage = (data?.parameters?.developer_message || data?.parameters?.system_prompt)?.trim()?.length > 0
  const hasPromptContexts = data?.parameters?.prompts?.length > 0
  
  // Get outputs for dynamic handle generation
  const outputs = data?.outputs || []
  const outputCount = Math.min(outputs.length, 30)
  
  // Get enabled tools
  const enabledTools = data?.parameters?.tools?.filter((tool: any) => tool.enabled) || []
  
  // Tool configuration with colors
  const toolConfig: Record<string, { color: string; name: string }> = {
    web_search: { color: '#0ea5e9', name: 'Web Search' },
    api_call: { color: '#8b5cf6', name: 'API Call' },
    file_search: { color: '#f59e0b', name: 'File Search' },
    code_interpreter: { color: '#10b981', name: 'Code Interpreter' },
    image_generation: { color: '#ec4899', name: 'Image Generation' }
  }

  // Handler for Developer Message button click
  const handlePromptViewerClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Dispatch custom event to open modal
    const event = new CustomEvent('openPromptViewerModal', { 
      detail: { 
        nodeId: id,
        nodeName: data?.label || 'Agent',
        developerMessage: data.parameters.developer_message || data.parameters.system_prompt,
        prompts: data.parameters.prompts || []
      } 
    })
    window.dispatchEvent(event)
  }

  return (
    <div
      style={{
        background: '#dbeafe',
        border: '2px solid #3b82f6',
        color: '#1d4ed8',
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        minWidth: '180px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* Tool Dot Indicators - Top Left */}
      {enabledTools.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            display: 'flex',
            gap: '4px',
            padding: '2px',
          }}
          title={`Tools: ${enabledTools.map((t: any) => toolConfig[t.type]?.name || t.type).join(', ')}`}
        >
          {enabledTools.map((tool: any) => (
            <div
              key={tool.type}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: toolConfig[tool.type]?.color || '#6b7280',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,255,255,0.8)',
              }}
              title={toolConfig[tool.type]?.name || tool.type}
            />
          ))}
        </div>
      )}
      
      {/* Developer Message & Prompts Indicator Button */}
      {(hasDeveloperMessage || hasPromptContexts) && (
        <button
          onClick={handlePromptViewerClick}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: hasPromptContexts 
              ? 'rgba(139, 92, 246, 0.15)' // Purple tint if has prompts
              : 'rgba(59, 130, 246, 0.15)', // Blue tint for just developer message
            border: `1px solid ${hasPromptContexts 
              ? 'rgba(139, 92, 246, 0.3)' 
              : 'rgba(59, 130, 246, 0.3)'}`,
            borderRadius: '4px',
            padding: '3px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = hasPromptContexts 
              ? 'rgba(139, 92, 246, 0.25)'
              : 'rgba(59, 130, 246, 0.25)'
            e.currentTarget.style.transform = 'scale(1.1)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = hasPromptContexts 
              ? 'rgba(139, 92, 246, 0.15)'
              : 'rgba(59, 130, 246, 0.15)'
            e.currentTarget.style.transform = 'scale(1)'
          }}
          title={`View Developer Message${hasPromptContexts ? ' & Prompts' : ''}`}
        >
          <FileText size={12} color={hasPromptContexts ? '#8b5cf6' : '#3b82f6'} />
        </button>
      )}
      
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: 'transparent',
          width: '10px',
          height: '10px',
          border: 'none',
          top: '-5px',
        }}
      />
      
      <div>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Bot size={16} />
          <span>{data?.label || 'Agent'}</span>
        </div>
        <div style={{ 
          fontSize: '11px', 
          marginTop: '2px',
          color: hasModel ? '#1d4ed8' : '#ef4444',
          opacity: hasModel ? 0.7 : 1,
          fontWeight: hasModel ? 400 : 500
        }}>
          {hasModel ? model : 'No model selected'}
        </div>
        {data?.memo && (
          <div style={{ 
            fontSize: '10px', 
            color: '#6b7280',
            marginTop: '4px',
            fontStyle: 'italic',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.2'
          }} title={data.memo}>
            📝 {data.memo}
          </div>
        )}
      </div>
      
      {/* Dynamic bottom handles based on outputs */}
      {outputCount > 0 ? (
        outputs.slice(0, 30).map((output: any, index: number) => {
          const handleSpacing = outputCount > 0 ? Math.min(20, 200 / (outputCount + 1)) : 0
          const startOffset = outputCount > 0 ? -(outputCount - 1) * handleSpacing / 2 : 0
          
          return (
            <Handle
              key={`output-${index}`}
              id={`output-${output.key}`}
              type="source"
              position={Position.Bottom}
              style={{
                background: 'transparent',
                width: '8px',
                height: '8px',
                border: 'none',
                bottom: '-5px',
                left: `calc(50% + ${startOffset + index * handleSpacing}px)`,
                transform: 'translateX(-50%)',
              }}
              title={`${output.key} (${output.type})`}
            />
          )
        })
      ) : (
        // Fallback handle if no outputs defined
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: 'transparent',
            width: '10px',
            height: '10px',
            border: 'none',
            bottom: '-5px',
          }}
        />
      )}
    </div>
  )
}

// Create individual node components

const VectorStoreNode = ({ data, id: _id }: any) => {
  const dbType = data?.parameters?.type || 'mongodb'
  const outputs = data?.outputs || []
  const outputCount = Math.min(outputs.length, 30)
  
  // DB Type display names
  const dbTypeNames: Record<string, string> = {
    mongodb: 'MongoDB',
    qdrant: 'Qdrant',
    pinecone: 'Pinecone'
  }
  
  return (
    <div
      style={{
        background: '#e9d5ff',
        border: '2px solid #a855f7',
        color: '#7c3aed',
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        minWidth: '180px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* Vector Store nodes do not accept incoming connections - no target handle */}
      
      <div>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Database size={16} />
          <span>{data?.label || 'Vector Store'}</span>
        </div>
        <div style={{ 
          fontSize: '11px', 
          marginTop: '2px',
          color: '#7c3aed',
          opacity: 0.8,
          fontWeight: 500
        }}>
          {dbTypeNames[dbType]}
        </div>
        {data?.memo && (
          <div style={{ 
            fontSize: '10px', 
            color: '#6b7280',
            marginTop: '4px',
            fontStyle: 'italic',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.2'
          }} title={data.memo}>
            📝 {data.memo}
          </div>
        )}
      </div>
      
      {/* Dynamic bottom handles */}
      {outputCount > 0 ? (
        outputs.slice(0, 30).map((output: any, index: number) => {
          const handleSpacing = outputCount > 0 ? Math.min(20, 200 / (outputCount + 1)) : 0
          const startOffset = outputCount > 0 ? -(outputCount - 1) * handleSpacing / 2 : 0
          
          return (
            <Handle
              key={`output-${index}`}
              id={`output-${output.key}`}
              type="source"
              position={Position.Bottom}
              style={{
                background: 'transparent',
                width: '8px',
                height: '8px',
                border: 'none',
                bottom: '-5px',
                left: `calc(50% + ${startOffset + index * handleSpacing}px)`,
                transform: 'translateX(-50%)',
              }}
              title={`${output.key} (${output.type})`}
            />
          )
        })
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: 'transparent',
            width: '10px',
            height: '10px',
            border: 'none',
            bottom: '-5px',
          }}
        />
      )}
    </div>
  )
}

const KnowledgeBaseNode = ({ data, id: _id }: any) => {
  const dbType = data?.parameters?.type || 'postgresql'
  const outputs = data?.outputs || []
  const outputCount = Math.min(outputs.length, 30)
  
  // DB Type display names
  const dbTypeNames: Record<string, string> = {
    postgresql: 'PostgreSQL',
    mongodb: 'MongoDB'
  }
  
  return (
    <div
      style={{
        background: '#e0e7ff',
        border: '2px solid #6366f1',
        color: '#4f46e5',
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        minWidth: '180px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* Knowledge Base nodes do not accept incoming connections - no target handle */}
      
      <div>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <BookOpen size={16} />
          <span>{data?.label || 'Knowledge Base'}</span>
        </div>
        <div style={{ 
          fontSize: '11px', 
          marginTop: '2px',
          color: '#4f46e5',
          opacity: 0.8,
          fontWeight: 500
        }}>
          {dbTypeNames[dbType]}
        </div>
        {outputCount > 0 && (
          <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>
            {outputCount} output{outputCount > 1 ? 's' : ''}
          </div>
        )}
        {data?.memo && (
          <div style={{ 
            fontSize: '10px', 
            color: '#6b7280',
            marginTop: '4px',
            fontStyle: 'italic',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.2'
          }} title={data.memo}>
            📝 {data.memo}
          </div>
        )}
      </div>
      
      {/* Dynamic bottom handles */}
      {outputCount > 0 ? (
        outputs.slice(0, 30).map((output: any, index: number) => {
          const handleSpacing = outputCount > 0 ? Math.min(20, 200 / (outputCount + 1)) : 0
          const startOffset = outputCount > 0 ? -(outputCount - 1) * handleSpacing / 2 : 0
          
          return (
            <Handle
              key={`output-${index}`}
              id={`output-${output.key}`}
              type="source"
              position={Position.Bottom}
              style={{
                background: 'transparent',
                width: '8px',
                height: '8px',
                border: 'none',
                bottom: '-5px',
                left: `calc(50% + ${startOffset + index * handleSpacing}px)`,
                transform: 'translateX(-50%)',
              }}
              title={`${output.key} (${output.type})`}
            />
          )
        })
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: 'transparent',
            width: '10px',
            height: '10px',
            border: 'none',
            bottom: '-5px',
          }}
        />
      )}
    </div>
  )
}

// Custom MCP Node - Can receive inputs from Agent nodes and send outputs
const SafeMCPNode = ({ data, id: _id }: any) => {
  const connectedInputs = data?.connected_inputs || []
  const outputs = data?.outputs || []
  const inputCount = connectedInputs.length
  const outputCount = outputs.length
  
  return (
    <div
      style={{
        background: '#fce7f3',
        border: '2px solid #ec4899',
        color: '#db2777',
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        minWidth: '180px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* Target Handle - MCP can now receive connections from Agent nodes */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: 'transparent',
          width: '10px',
          height: '10px',
          border: 'none',
          top: '-5px',
        }}
      />
      
      <div>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Share2 size={16} />
          <span>{data?.label || 'MCP'}</span>
        </div>
        {inputCount > 0 && (
          <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>
            {inputCount} input{inputCount > 1 ? 's' : ''} connected
          </div>
        )}
        {data?.memo && (
          <div style={{ 
            fontSize: '10px', 
            color: '#6b7280',
            marginTop: '4px',
            fontStyle: 'italic',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.2'
          }} title={data.memo}>
            📝 {data.memo}
          </div>
        )}
      </div>
      
      {/* Dynamic output-based handle (MCP has exactly 1 output) */}
      {outputCount === 1 ? (
        <Handle
          id={`output-${outputs[0].key}`}
          type="source"
          position={Position.Bottom}
          style={{
            background: 'transparent',
            width: '10px',
            height: '10px',
            border: 'none',
            bottom: '-5px',
          }}
          title={`${outputs[0].key} (${outputs[0].type})`}
        />
      ) : (
        // Fallback handle - also provide an id for consistency
        <Handle
          id="output-mcp_result"
          type="source"
          position={Position.Bottom}
          style={{
            background: 'transparent',
            width: '10px',
            height: '10px',
            border: 'none',
            bottom: '-5px',
          }}
          title="mcp_result (object)"
        />
      )}
    </div>
  )
}

const MCPNode = (props: any) => {
  return <SafeMCPNode {...props} />
}

// Custom Function Node - Can receive inputs from other nodes and send outputs
const SafeFunctionNode = ({ data, id: _id }: any) => {
  const connectedInputs = data?.connected_inputs || []
  const outputs = data?.outputs || []
  const inputCount = connectedInputs.length
  const outputCount = outputs.length
  
  return (
    <div
      style={{
        background: '#ccfbf1',
        border: '2px solid #14b8a6',
        color: '#0f766e',
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        minWidth: '180px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      {/* Target Handle - Function can receive connections from various nodes */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: 'transparent',
          width: '10px',
          height: '10px',
          border: 'none',
          top: '-5px',
        }}
      />
      
      <div>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Zap size={16} />
          <span>{data?.label || 'Function'}</span>
        </div>
        {inputCount > 0 && (
          <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>
            {inputCount} input{inputCount > 1 ? 's' : ''} connected
          </div>
        )}
        {data?.memo && (
          <div style={{ 
            fontSize: '10px', 
            color: '#6b7280',
            marginTop: '4px',
            fontStyle: 'italic',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.2'
          }} title={data.memo}>
            📝 {data.memo}
          </div>
        )}
      </div>
      
      {/* Dynamic output-based handle (Function has exactly 1 output) */}
      {outputCount === 1 ? (
        <Handle
          id={`output-${outputs[0].key}`}
          type="source"
          position={Position.Bottom}
          style={{
            background: 'transparent',
            width: '10px',
            height: '10px',
            border: 'none',
            bottom: '-5px',
          }}
          title={`${outputs[0].key} (${outputs[0].type})`}
        />
      ) : (
        // Fallback handle - also provide an id for consistency
        <Handle
          id="output-function_result"
          type="source"
          position={Position.Bottom}
          style={{
            background: 'transparent',
            width: '10px',
            height: '10px',
            border: 'none',
            bottom: '-5px',
          }}
          title="function_result (object)"
        />
      )}
    </div>
  )
}

const FunctionNode = (props: any) => {
  return <SafeFunctionNode {...props} />
}

// Custom Final Output Node
const SafeFinalOutputNode = ({ data }: any) => {
  const connectedOutputs = data?.connected_outputs || []
  const outputCount = connectedOutputs.length
  
  return (
    <div
      style={{
        background: '#f3f4f6',
        border: '2px solid #6b7280',
        color: '#374151',
        padding: '12px 20px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: 500,
        minWidth: '180px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: 'transparent',
          width: '10px',
          height: '10px',
          border: 'none',
          top: '-5px',
        }}
      />
      
      <div>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <CheckCircle size={16} />
          <span>{data?.label || 'Final Output'}</span>
        </div>
        {outputCount > 0 && (
          <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '2px' }}>
            {outputCount} connected output{outputCount > 1 ? 's' : ''}
          </div>
        )}
        {data?.memo && (
          <div style={{ 
            fontSize: '10px', 
            color: '#6b7280',
            marginTop: '4px',
            fontStyle: 'italic',
            maxWidth: '150px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.2'
          }} title={data.memo}>
            📝 {data.memo}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: 'transparent',
          width: '10px',
          height: '10px',
          border: 'none',
          bottom: '-5px',
        }}
      />
    </div>
  )
}

const FinalOutputNode = (props: any) => {
  return <SafeFinalOutputNode {...props} />
}

const DefaultNode = (props: any) => {
  return <SimpleBaseNode {...props} type="default" />
}

// Export safe node types
export const safeNodeTypes = {
  userinput: SafeUserInputNode,
  agent: SafeAgentNode,
  vectorstore: VectorStoreNode,
  knowledgebase: KnowledgeBaseNode,
  mcp: MCPNode,
  function: FunctionNode,
  finaloutput: FinalOutputNode,
  default: DefaultNode,
}