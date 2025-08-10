import React, { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Typography, Card } from '../common'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ShortcutItem {
  keys: string[]
  description: string
}

interface ShortcutCategory {
  title: string
  shortcuts: ShortcutItem[]
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const shortcutCategories: ShortcutCategory[] = [
    {
      title: '편집 작업',
      shortcuts: [
        { keys: ['Ctrl/Cmd', 'Z'], description: '실행 취소' },
        { keys: ['Ctrl/Cmd', 'Shift', 'Z'], description: '다시 실행' },
        { keys: ['Ctrl/Cmd', 'Y'], description: '다시 실행 (대체)' },
        { keys: ['Delete'], description: '선택된 노드 삭제' },
      ]
    },
    {
      title: '파일 작업',
      shortcuts: [
        { keys: ['Ctrl/Cmd', 'S'], description: '워크플로우 저장' },
        { keys: ['Ctrl/Cmd', 'E'], description: '워크플로우 내보내기' },
      ]
    },
    {
      title: '자동 저장',
      shortcuts: [
        { keys: ['자동'], description: '매 1분마다 자동 저장' },
      ]
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden animate-slideUp"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <Typography variant="h2" className="text-gray-900">
            키보드 단축키
          </Typography>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-88px)]">
          {shortcutCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className={categoryIndex > 0 ? 'mt-6' : ''}>
              <Typography variant="h4" className="text-gray-700 mb-3">
                {category.title}
              </Typography>
              <div className="space-y-2">
                {category.shortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      {shortcut.keys.map((key, keyIndex) => (
                        <React.Fragment key={keyIndex}>
                          {keyIndex > 0 && (
                            <Typography variant="small" className="text-gray-400 mx-1">
                              +
                            </Typography>
                          )}
                          <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded-md shadow-sm">
                            {key}
                          </kbd>
                        </React.Fragment>
                      ))}
                    </div>
                    <Typography variant="body" className="text-gray-600">
                      {shortcut.description}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Additional Info */}
          <Card variant="outlined" className="mt-6 p-4 bg-blue-50 border-blue-200">
            <Typography variant="body" className="text-blue-700">
              <strong>팁:</strong> Ctrl 키는 Windows/Linux에서, Cmd 키는 macOS에서 사용됩니다.
            </Typography>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default KeyboardShortcutsModal