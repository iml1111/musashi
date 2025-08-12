import { 
  User, 
  Brain, 
  Workflow, 
  Cpu, 
  Server, 
  FileText, 
  Database, 
  CircuitBoard,
  Box,
  Boxes,
  GitBranch,
  Bot
} from 'lucide-react'

export const getNodeIcon = (nodeType: string) => {
  switch (nodeType) {
    case 'userinput':
      return <User className="w-4 h-4" />
    case 'agent':
      return <Bot className="w-4 h-4" />
    case 'llmchain':
      return <Brain className="w-4 h-4" />
    case 'llmengine':
      return <Cpu className="w-4 h-4" />
    case 'workflow':
      return <Workflow className="w-4 h-4" />
    case 'aggregator':
      return <Boxes className="w-4 h-4" />
    case 'decision':
      return <GitBranch className="w-4 h-4" />
    case 'function':
      return <CircuitBoard className="w-4 h-4" />
    case 'datasource':
      return <Database className="w-4 h-4" />
    case 'output':
      return <FileText className="w-4 h-4" />
    case 'api':
      return <Server className="w-4 h-4" />
    default:
      return <Box className="w-4 h-4" />
  }
}

export const getNodeIconClass = (nodeType: string) => {
  switch (nodeType) {
    case 'userinput':
      return 'text-green-600'
    case 'agent':
      return 'text-blue-600'
    case 'llmchain':
      return 'text-purple-600'
    case 'llmengine':
      return 'text-orange-600'
    case 'workflow':
      return 'text-indigo-600'
    case 'aggregator':
      return 'text-pink-600'
    case 'decision':
      return 'text-yellow-600'
    case 'function':
      return 'text-red-600'
    case 'datasource':
      return 'text-cyan-600'
    case 'output':
      return 'text-gray-600'
    case 'api':
      return 'text-teal-600'
    default:
      return 'text-gray-500'
  }
}