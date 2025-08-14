import React, { useState, useEffect, useRef } from 'react'
import { X, AlertCircle, Copy, Check, Maximize2, Minimize2, FileText, User, Bot, Plus, Trash2, Edit2, ChevronUp, ChevronDown } from 'lucide-react'
import { validateSystemPrompt, formatValidationWarning } from '../../utils/systemPromptValidator'
import { PromptContext } from '../../types/node'
// getUnusedInputs is no longer used

interface PromptViewerModalProps {
  isOpen: boolean
  onClose: () => void
  developerMessage: string
  prompts: PromptContext[]
  onChange: (developerMessage: string, prompts: PromptContext[]) => void
  inputs: Array<{ key: string; type: string; example?: string }>
}

const PromptViewerModal: React.FC<PromptViewerModalProps> = ({
  isOpen,
  onClose,
  developerMessage,
  prompts,
  onChange,
  inputs
}) => {
  const [tempDeveloperMessage, setTempDeveloperMessage] = useState(developerMessage)
  const [tempPrompts, setTempPrompts] = useState<PromptContext[]>(prompts || [])
  const [validation, setValidation] = useState(() => 
    validateSystemPrompt(developerMessage, inputs, prompts)
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  // Removed unused showMarkdownPreview state
  const [activeTab, setActiveTab] = useState<'developer' | 'prompts' | 'preview'>('developer')
  const [editingPromptIndex, setEditingPromptIndex] = useState<number | null>(null)
  const [isAddingPrompt, setIsAddingPrompt] = useState(false)
  const [newPromptType, setNewPromptType] = useState<'user' | 'agent'>('user')
  const [newPromptContent, setNewPromptContent] = useState('')
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(new Set())
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setTempDeveloperMessage(developerMessage)
    setTempPrompts(prompts || [])
  }, [developerMessage, prompts])

  useEffect(() => {
    setValidation(validateSystemPrompt(tempDeveloperMessage, inputs, tempPrompts))
  }, [tempDeveloperMessage, inputs, tempPrompts])

  // Handle ESC key for fullscreen
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        e.preventDefault()
        setIsFullscreen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, isFullscreen])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  if (!isOpen) return null

  const handleSave = () => {
    onChange(tempDeveloperMessage, tempPrompts)
    onClose()
  }

  const handleCancel = () => {
    setTempDeveloperMessage(developerMessage)
    setTempPrompts(prompts || [])
    setIsFullscreen(false)
    setIsAddingPrompt(false)
    setEditingPromptIndex(null)
    onClose()
  }

  const handleCopy = async () => {
    try {
      const fullContent = `Developer Message:\n${tempDeveloperMessage}\n\n${
        tempPrompts.length > 0 
          ? `Prompt Context:\n${tempPrompts.map((p, i) => `${i + 1}. [${p.type}]: ${p.content}`).join('\n\n')}`
          : ''
      }`
      await navigator.clipboard.writeText(fullContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
    }
  }

  const handleAddPrompt = () => {
    if (tempPrompts.length >= 100) {
      alert('Maximum 100 prompt contexts allowed')
      return
    }
    if (newPromptContent.trim()) {
      const newPrompts = [...tempPrompts, { type: newPromptType, content: newPromptContent.trim() }]
      setTempPrompts(newPrompts)
      setNewPromptContent('')
      setNewPromptType('user')
      setIsAddingPrompt(false)
      // Immediately save changes
      onChange(tempDeveloperMessage, newPrompts)
    }
  }

  const handleDeletePrompt = (index: number) => {
    const newPrompts = tempPrompts.filter((_, i) => i !== index)
    setTempPrompts(newPrompts)
    setEditingPromptIndex(null)
    // Immediately save changes
    onChange(tempDeveloperMessage, newPrompts)
  }

  const handleUpdatePrompt = (index: number, content: string) => {
    const updated = [...tempPrompts]
    updated[index] = { ...updated[index], content }
    setTempPrompts(updated)
    // Immediately save changes
    onChange(tempDeveloperMessage, updated)
  }

  const togglePromptExpanded = (index: number) => {
    const newExpanded = new Set(expandedPrompts)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedPrompts(newExpanded)
  }

  // Process text and highlight tokens
  const processTextWithTokens = (text: string) => {
    const parts = text.split(/(\$\$[A-Za-z_][A-Za-z0-9_]*\$\$)/g)
    return parts.map((part: string, index: number) => {
      if (part.match(/^\$\$[A-Za-z_][A-Za-z0-9_]*\$\$/)) {
        const token = part.slice(2, -2)
        const isValid = inputs.some(input => input.key === token)
        return (
          <span
            key={index}
            className={`font-mono px-1 py-0.5 rounded ${
              isValid 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}
          >
            {part}
          </span>
        )
      }
      return part
    })
  }

  // Render the full conversation preview
  const renderFullPreview = () => {
    return (
      <div className="space-y-4">
        {/* Developer Message */}
        <div className="border-l-4 border-blue-500 pl-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-blue-100 rounded">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <span className="font-semibold text-sm text-blue-800">Developer Message (System Prompt)</span>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {processTextWithTokens(tempDeveloperMessage || 'No developer message defined')}
          </div>
        </div>

        {/* Prompt Contexts */}
        {tempPrompts.map((prompt, index) => (
          <div key={index} className={`border-l-4 pl-4 ${
            prompt.type === 'user' ? 'border-green-500' : 'border-purple-500'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-1 rounded ${
                prompt.type === 'user' ? 'bg-green-100' : 'bg-purple-100'
              }`}>
                {prompt.type === 'user' ? (
                  <User className="w-4 h-4 text-green-600" />
                ) : (
                  <Bot className="w-4 h-4 text-purple-600" />
                )}
              </div>
              <span className={`font-semibold text-sm ${
                prompt.type === 'user' ? 'text-green-800' : 'text-purple-800'
              }`}>
                {prompt.type === 'user' ? 'User' : 'Agent'} Context {index + 1}
              </span>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {processTextWithTokens(prompt.content)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl flex flex-col transition-all duration-300 ${
        isFullscreen 
          ? 'w-full h-full m-0' 
          : 'w-full max-w-6xl h-[85vh] mx-4'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Developer Message & Prompt Context</h2>
              <p className="text-sm text-gray-500">Configure AI agent behavior and conversation context</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy all to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
            
            {/* Fullscreen button */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-gray-600" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-600" />
              )}
            </button>
            
            {/* Close button */}
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('developer')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'developer'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Developer Message
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'prompts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Prompt Context ({tempPrompts.length}/100)
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'preview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Full Preview
          </button>
        </div>

        {/* Validation Warning */}
        {!validation.isValid && activeTab === 'developer' && (
          <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-200">
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-yellow-800">
                {formatValidationWarning(validation)}
              </span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {/* Developer Message Tab */}
          {activeTab === 'developer' && (
            <div className="h-full flex flex-col p-4">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Developer Message (System Prompt) <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500">
                  This is the main system prompt that defines the agent's behavior and capabilities.
                </p>
              </div>
              <textarea
                value={tempDeveloperMessage}
                onChange={(e) => {
                  const newValue = e.target.value
                  setTempDeveloperMessage(newValue)
                  
                  // Debounce auto-save
                  if (saveTimeoutRef.current) {
                    clearTimeout(saveTimeoutRef.current)
                  }
                  saveTimeoutRef.current = setTimeout(() => {
                    onChange(newValue, tempPrompts)
                  }, 500)
                }}
                className="flex-1 p-4 font-mono text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your developer message here. Use $$input_key$$ to reference inputs.

Example:
# Task Instructions

Process the $$input$$ data and generate a summary.

## Requirements
- Be concise
- Focus on key points
- Use markdown formatting"
              />
              <div className="mt-2 text-xs text-gray-500">
                <span>{tempDeveloperMessage.length} characters</span>
              </div>
            </div>
          )}

          {/* Prompt Context Tab */}
          {activeTab === 'prompts' && (
            <div className="h-full flex flex-col p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Prompt Context (Optional)
                  </label>
                  {tempPrompts.length < 100 && !isAddingPrompt && (
                    <button
                      onClick={() => setIsAddingPrompt(true)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Context
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Additional conversation context to guide the agent. You can add up to 100 prompts.
                </p>
              </div>

              {/* Add new prompt form */}
              {isAddingPrompt && (
                <div className="mb-4 p-4 border border-gray-300 rounded-md">
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={newPromptType}
                      onChange={(e) => setNewPromptType(e.target.value as 'user' | 'agent')}
                      className="w-full px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="user">User</option>
                      <option value="agent">Agent</option>
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      value={newPromptContent}
                      onChange={(e) => setNewPromptContent(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter prompt content..."
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsAddingPrompt(false)
                        setNewPromptContent('')
                        setNewPromptType('user')
                      }}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddPrompt}
                      disabled={!newPromptContent.trim()}
                      className={`px-3 py-1 text-sm rounded-md ${
                        newPromptContent.trim()
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {/* Prompt list */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {tempPrompts.map((prompt, index) => (
                  <div key={index} className="border border-gray-300 rounded-md">
                    <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                         onClick={() => togglePromptExpanded(index)}>
                      <div className="flex items-center gap-2">
                        <div className={`p-1 rounded ${
                          prompt.type === 'user' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          {prompt.type === 'user' ? (
                            <User className="w-4 h-4 text-green-600" />
                          ) : (
                            <Bot className="w-4 h-4 text-purple-600" />
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {prompt.type === 'user' ? 'User' : 'Agent'} Context {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingPromptIndex(editingPromptIndex === index ? null : index)
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePrompt(index)
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        {expandedPrompts.has(index) ? (
                          <ChevronUp className="w-4 h-4 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-600" />
                        )}
                      </div>
                    </div>
                    {(expandedPrompts.has(index) || editingPromptIndex === index) && (
                      <div className="px-3 pb-3 border-t">
                        {editingPromptIndex === index ? (
                          <textarea
                            value={prompt.content}
                            onChange={(e) => handleUpdatePrompt(index, e.target.value)}
                            className="w-full mt-2 p-2 text-sm font-mono border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                          />
                        ) : (
                          <div className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                            {processTextWithTokens(prompt.content)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {tempPrompts.length === 0 && !isAddingPrompt && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No prompt context added yet.</p>
                    <p className="text-xs mt-1">Click "Add Context" to add conversation examples.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Full Preview Tab */}
          {activeTab === 'preview' && (
            <div className="h-full overflow-y-auto p-4">
              {renderFullPreview()}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {tempDeveloperMessage.split(/\s+/).filter(w => w.length > 0).length} words in developer message
            </span>
            <span className="text-sm text-gray-500">
              {tempPrompts.length} prompt context{tempPrompts.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-musashi-600 text-white rounded-md hover:bg-musashi-700"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PromptViewerModal
