import React, { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'

interface InputItemProps {
  input: { key: string; type: string; example?: string }
  index: number
  onUpdate: (input: { key: string; type: string; example?: string }) => void
  onDelete: () => void
}

const InputItem: React.FC<InputItemProps> = ({ input, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editKey, setEditKey] = useState(input.key)
  const [editType, setEditType] = useState(input.type)
  const [editExample, setEditExample] = useState(input.example || '')

  const handleSave = () => {
    if (editKey.trim()) {
      onUpdate({ 
        key: editKey.trim(), 
        type: editType,
        example: editExample.trim()
      })
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    setEditKey(input.key)
    setEditType(input.type)
    setEditExample(input.example || '')
    setIsEditing(false)
  }

  // JSON 구문 강조를 위한 함수
  const highlightJSON = (jsonStr: string) => {
    try {
      // JSON 파싱 및 포맷팅
      const parsed = JSON.parse(jsonStr)
      const formatted = JSON.stringify(parsed, null, 2)
      
      // JSON 구문 강조
      return formatted
        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
          let cls = 'number'
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'key'
            } else {
              cls = 'string'
            }
          } else if (/true|false/.test(match)) {
            cls = 'boolean'
          } else if (/null/.test(match)) {
            cls = 'null'
          }
          
          const colors = {
            key: '#0550ae',     // 진한 파란색
            string: '#0a7ea4',  // 파란색
            number: '#0550ae',  // 진한 파란색
            boolean: '#0550ae', // 진한 파란색
            null: '#6e7781'     // 회색
          }
          
          return `<span style="color: ${colors[cls]}">${match}</span>`
        })
    } catch (e) {
      // JSON이 아닌 경우 원본 반환
      return jsonStr
    }
  }

  const isJSON = (str: string) => {
    if (!str) return false
    try {
      const parsed = JSON.parse(str)
      return typeof parsed === 'object'
    } catch (e) {
      return false
    }
  }

  if (isEditing) {
    return (
      <div className="bg-gray-50 p-2 rounded-md space-y-2">
        <input
          type="text"
          value={editKey}
          onChange={(e) => setEditKey(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-musashi-500"
          placeholder="Key name"
        />
        <select
          value={editType}
          onChange={(e) => setEditType(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-musashi-500"
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          <option value="boolean">Boolean</option>
          <option value="object">Object</option>
          <option value="array">Array</option>
        </select>
        <textarea
          value={editExample}
          onChange={(e) => setEditExample(e.target.value)}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-musashi-500 font-mono"
          placeholder={editType === 'object' ? '{"key": "value"}' : editType === 'array' ? '["item1", "item2"]' : 'Example value'}
          rows={3}
        />
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={!editKey.trim()}
            className={`flex-1 px-2 py-1 text-xs rounded ${
              editKey.trim()
                ? 'bg-musashi-600 text-white hover:bg-musashi-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 p-2 rounded-md">
      <div className="flex items-center justify-between mb-1">
        <div className="flex-1">
          <span className="text-sm font-medium">{input.key}</span>
          <span className="text-xs text-gray-500 ml-2">({input.type})</span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsEditing(true)}
            className="text-gray-600 hover:text-gray-700 p-1"
            title="Edit input"
          >
            <Edit2 className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-700 p-1"
            title="Delete input"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
      {input.example && (
        <div className="mt-2">
          <span className="text-xs text-gray-500">Example:</span>
          {isJSON(input.example) ? (
            <pre 
              className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto font-mono"
              dangerouslySetInnerHTML={{ __html: highlightJSON(input.example) }}
            />
          ) : (
            <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
              {input.example}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InputItem