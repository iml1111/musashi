import React from 'react'
import { ArrowRight, ArrowLeftRight } from 'lucide-react'

interface EdgeDirectionSelectorProps {
  edgeId: string
  currentDirection: 'unidirectional' | 'bidirectional'
  onDirectionChange: (edgeId: string, direction: 'unidirectional' | 'bidirectional') => void
}

const EdgeDirectionSelector: React.FC<EdgeDirectionSelectorProps> = ({
  edgeId,
  currentDirection,
  onDirectionChange
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onDirectionChange(edgeId, 'unidirectional')}
        className={`p-2 rounded-md border ${
          currentDirection === 'unidirectional'
            ? 'bg-musashi-600 text-white border-musashi-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        title="Unidirectional (one-way)"
      >
        <ArrowRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDirectionChange(edgeId, 'bidirectional')}
        className={`p-2 rounded-md border ${
          currentDirection === 'bidirectional'
            ? 'bg-musashi-600 text-white border-musashi-600'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
        title="Bidirectional (two-way)"
      >
        <ArrowLeftRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export default EdgeDirectionSelector