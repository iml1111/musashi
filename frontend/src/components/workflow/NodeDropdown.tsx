import React, { useState, useRef, useEffect } from 'react'
import { Node } from '../../types/flow'
import { ChevronDown } from 'lucide-react'
import { getNodeIcon, getNodeIconClass } from '../../utils/nodeIcons'

interface NodeDropdownProps {
  value: string
  onChange: (value: string) => void
  nodes: Node[]
  placeholder?: string
  className?: string
}

const NodeDropdown: React.FC<NodeDropdownProps> = ({
  value,
  onChange,
  nodes,
  placeholder = 'Select a node',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedNode = nodes.find(n => n.id === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (nodeId: string) => {
    onChange(nodeId)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-xs border border-gray-300 rounded bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-musashi-500 flex items-center justify-between"
      >
        <div className="flex items-center space-x-2">
          {selectedNode ? (
            <>
              <span className={getNodeIconClass(selectedNode.type || 'default')}>
                {getNodeIcon(selectedNode.type || 'default')}
              </span>
              <span>{selectedNode.data?.label || 'Unnamed'}</span>
            </>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {nodes.length === 0 ? (
            <div className="px-3 py-2 text-xs text-gray-500">No nodes available</div>
          ) : (
            nodes.map(node => (
              <button
                key={node.id}
                onClick={() => handleSelect(node.id)}
                className="w-full px-3 py-2 text-xs hover:bg-gray-100 flex items-center space-x-2 text-left"
              >
                <span className={getNodeIconClass(node.type || 'default')}>
                  {getNodeIcon(node.type || 'default')}
                </span>
                <span>{node.data?.label || 'Unnamed'}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default NodeDropdown