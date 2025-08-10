import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { MODEL_LIST, MODELS_BY_PROVIDER } from '../../constants/modelList'

interface ModelDropdownProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({ 
  value, 
  onChange, 
  placeholder = 'e.g., gpt-4, claude-3',
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(value || '')
  const [filteredModels, setFilteredModels] = useState(MODEL_LIST)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update search value when value prop changes
  useEffect(() => {
    setSearchValue(value || '')
  }, [value])

  // Filter models based on search
  useEffect(() => {
    const search = searchValue.toLowerCase()
    if (!search) {
      setFilteredModels(MODEL_LIST)
    } else {
      setFilteredModels(
        MODEL_LIST.filter(model => 
          model.value.toLowerCase().includes(search) ||
          model.label.toLowerCase().includes(search) ||
          model.provider.toLowerCase().includes(search)
        )
      )
    }
  }, [searchValue])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        // If user didn't select a model, keep what they typed
        if (searchValue !== value) {
          onChange(searchValue)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [searchValue, value, onChange])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setSearchValue(newValue)
    setIsOpen(true)
  }

  const handleInputBlur = () => {
    // Delay to allow click on dropdown item
    setTimeout(() => {
      if (searchValue !== value) {
        onChange(searchValue)
      }
    }, 200)
  }

  const handleSelectModel = (modelValue: string) => {
    setSearchValue(modelValue)
    onChange(modelValue)
    setIsOpen(false)
    inputRef.current?.blur()
  }

  // Group filtered models by provider
  const groupedModels = filteredModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = []
    }
    acc[model.provider].push(model)
    return acc
  }, {} as Record<string, typeof filteredModels>)

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onBlur={handleInputBlur}
          className="w-full px-3 py-2 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-musashi-500"
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen)
            inputRef.current?.focus()
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {Object.keys(groupedModels).length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              No models found. You can still type a custom model name.
            </div>
          ) : (
            Object.entries(groupedModels).map(([provider, models]) => (
              <div key={provider}>
                <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50 sticky top-0">
                  {provider}
                </div>
                {models.map(model => (
                  <button
                    key={model.value}
                    type="button"
                    onClick={() => handleSelectModel(model.value)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <div className="font-medium">{model.value}</div>
                    <div className="text-xs text-gray-500">{model.label}</div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default ModelDropdown