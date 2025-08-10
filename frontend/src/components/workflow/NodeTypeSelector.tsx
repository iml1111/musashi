import React from 'react'
import { 
  Plus, 
  User, 
  Bot, 
  Database, 
  BookOpen, 
  Network, 
  Globe, 
  GitBranch, 
  CheckCircle 
} from 'lucide-react'

export const nodeTypes = [
  { type: 'userinput', label: 'User Input', icon: User, color: 'text-green-600' },
  { type: 'agent', label: 'Agent', icon: Bot, color: 'text-blue-600' },
  { type: 'vectorstore', label: 'Vector Store', icon: Database, color: 'text-purple-600' },
  { type: 'knowledgebase', label: 'Knowledge Base', icon: BookOpen, color: 'text-indigo-600' },
  { type: 'mcp', label: 'MCP', icon: Network, color: 'text-pink-600' },
  { type: 'apicall', label: 'API Call', icon: Globe, color: 'text-teal-600' },
  { type: 'router', label: 'Router', icon: GitBranch, color: 'text-yellow-600' },
  { type: 'finaloutput', label: 'Final Output', icon: CheckCircle, color: 'text-gray-700' },
]

interface NodeTypeSelectorProps {
  onAddNode: (type: string, label: string) => void
}

const NodeTypeSelector: React.FC<NodeTypeSelectorProps> = ({ onAddNode }) => {
  const [isOpen, setIsOpen] = React.useState(false)

  const handleAddNode = (type: string, label: string) => {
    onAddNode(type, label)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-musashi-600 text-white rounded-md hover:bg-musashi-700 flex items-center"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Node
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-12 left-0 bg-white shadow-lg rounded-md border border-gray-200 p-2 z-20 min-w-[200px]">
            {nodeTypes.map(({ type, label, icon: Icon, color }) => (
              <button
                key={type}
                onClick={() => handleAddNode(type, label)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded flex items-center space-x-2"
              >
                <Icon className={`w-5 h-5 ${color}`} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default NodeTypeSelector