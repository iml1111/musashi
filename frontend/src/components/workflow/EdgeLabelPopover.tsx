import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface EdgeLabelPopoverProps {
  outputKey: string
  outputType: string
  outputExample?: string
  position: { x: number; y: number }
  onClose: () => void
}

const EdgeLabelPopover: React.FC<EdgeLabelPopoverProps> = ({
  outputKey,
  outputType,
  outputExample,
  position,
  onClose
}) => {
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    // Add a small delay to prevent immediate closure when clicking the label
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Adjust position to center the popover above the click point
  const adjustedPosition = {
    x: position.x - 120, // Center horizontally (assuming ~240px width)
    y: position.y - 150  // Position above the label
  }

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[240px] max-w-[320px]"
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
        transform: 'translateZ(0)' // Force GPU acceleration
      }}
    >
      {/* Arrow pointing down */}
      <div 
        className="absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderTop: '8px solid white',
          filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))'
        }}
      />
      
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Output Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500">Name</label>
          <div className="text-sm font-medium text-gray-800">{outputKey}</div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500">Type</label>
          <div className="text-sm">
            <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
              {outputType}
            </span>
          </div>
        </div>

        {outputExample && (
          <div>
            <label className="text-xs font-medium text-gray-500">Example</label>
            <div className="mt-1 p-2 bg-gray-50 rounded-md">
              <code className="text-xs text-gray-700 break-all">{outputExample}</code>
            </div>
          </div>
        )}

        {!outputExample && (
          <div className="text-xs text-gray-400 italic">
            No example provided
          </div>
        )}
      </div>
    </div>
  )
}

export default EdgeLabelPopover