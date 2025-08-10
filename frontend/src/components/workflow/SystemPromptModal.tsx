import React, { useState, useEffect } from 'react'
import { X, AlertCircle, Copy, Check, Maximize2, Minimize2, FileText } from 'lucide-react'
// import ReactMarkdown from 'react-markdown'
import { validateSystemPrompt, formatValidationWarning } from '../../utils/systemPromptValidator'

interface SystemPromptModalProps {
  isOpen: boolean
  onClose: () => void
  value: string
  onChange: (value: string) => void
  inputs: Array<{ key: string; type: string }>
}

const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
  inputs
}) => {
  const [tempValue, setTempValue] = useState(value)
  const [validation, setValidation] = useState(() => 
    validateSystemPrompt(value, inputs)
  )
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(true)

  useEffect(() => {
    setTempValue(value)
  }, [value])

  useEffect(() => {
    setValidation(validateSystemPrompt(tempValue, inputs))
  }, [tempValue, inputs])

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

  if (!isOpen) return null

  const handleSave = () => {
    onChange(tempValue)
    onClose()
  }

  const handleCancel = () => {
    setTempValue(value)
    setIsFullscreen(false)
    onClose()
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tempValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Simple markdown rendering with token highlighting
  const renderMarkdownWithTokens = (text: string) => {
    // First, process tokens to highlight them
    const highlightTokens = (str: string) => {
      const parts = str.split(/(\$\$[A-Za-z_][A-Za-z0-9_]*\$\$)/g)
      return parts.map((part, index) => {
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

    const lines = text.split('\n')
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="text-base font-semibold mt-3 mb-2">
            {highlightTokens(line.substring(4))}
          </h3>
        )
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="text-lg font-bold mt-4 mb-2">
            {highlightTokens(line.substring(3))}
          </h2>
        )
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="text-xl font-bold mt-4 mb-3">
            {highlightTokens(line.substring(2))}
          </h1>
        )
      }
      
      // Code blocks (simple detection)
      if (line.startsWith('```')) {
        return (
          <div key={index} className="font-mono text-sm bg-gray-100 p-1 rounded">
            {line}
          </div>
        )
      }
      
      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={index} className="ml-4 mt-1 list-disc">
            {highlightTokens(line.substring(2))}
          </li>
        )
      }
      if (line.match(/^\d+\. /)) {
        return (
          <li key={index} className="ml-4 mt-1 list-decimal">
            {highlightTokens(line.replace(/^\d+\. /, ''))}
          </li>
        )
      }
      
      // Bold and italic
      let processedLine = line
      const boldRegex = /\*\*(.+?)\*\*/g
      const italicRegex = /\*(.+?)\*/g
      const codeRegex = /`(.+?)`/g
      
      if (boldRegex.test(line) || italicRegex.test(line) || codeRegex.test(line)) {
        const parts = []
        let lastIndex = 0
        let match
        
        // Process inline code first
        const tempLine = line.replace(codeRegex, (m, p1) => `<CODE>${p1}</CODE>`)
        // Then bold
        const tempLine2 = tempLine.replace(boldRegex, (m, p1) => `<BOLD>${p1}</BOLD>`)
        // Then italic
        const finalLine = tempLine2.replace(italicRegex, (m, p1) => `<ITALIC>${p1}</ITALIC>`)
        
        // Split and render
        const segments = finalLine.split(/(<CODE>.*?<\/CODE>|<BOLD>.*?<\/BOLD>|<ITALIC>.*?<\/ITALIC>)/g)
        
        return (
          <p key={index} className="mt-1">
            {segments.map((segment, i) => {
              if (segment.startsWith('<CODE>') && segment.endsWith('</CODE>')) {
                return (
                  <code key={i} className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">
                    {segment.slice(6, -7)}
                  </code>
                )
              }
              if (segment.startsWith('<BOLD>') && segment.endsWith('</BOLD>')) {
                return <strong key={i}>{highlightTokens(segment.slice(6, -7))}</strong>
              }
              if (segment.startsWith('<ITALIC>') && segment.endsWith('</ITALIC>')) {
                return <em key={i}>{highlightTokens(segment.slice(8, -9))}</em>
              }
              return highlightTokens(segment)
            })}
          </p>
        )
      }
      
      // Regular paragraph
      if (line.trim()) {
        return <p key={index} className="mt-1">{highlightTokens(line)}</p>
      }
      
      // Empty line
      return <br key={index} />
    })
  }

  // Helper function to process text and highlight tokens
  const processTextWithTokens = (text: any) => {
    if (typeof text === 'string') {
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
    return text
  }

  // Custom Markdown components to highlight tokens
  const markdownComponents = {
    p: ({ children }: any) => {
      return <p>{processTextWithTokens(children)}</p>
    },
    h1: ({ children }: any) => {
      return <h1 className="text-3xl font-bold mb-4">{processTextWithTokens(children)}</h1>
    },
    h2: ({ children }: any) => {
      return <h2 className="text-2xl font-bold mb-3">{processTextWithTokens(children)}</h2>
    },
    h3: ({ children }: any) => {
      return <h3 className="text-xl font-bold mb-2">{processTextWithTokens(children)}</h3>
    },
    h4: ({ children }: any) => {
      return <h4 className="text-lg font-semibold mb-2">{processTextWithTokens(children)}</h4>
    },
    h5: ({ children }: any) => {
      return <h5 className="text-base font-semibold mb-1">{processTextWithTokens(children)}</h5>
    },
    h6: ({ children }: any) => {
      return <h6 className="text-sm font-semibold mb-1">{processTextWithTokens(children)}</h6>
    },
    li: ({ children }: any) => {
      return <li>{processTextWithTokens(children)}</li>
    },
    strong: ({ children }: any) => {
      return <strong className="font-bold">{processTextWithTokens(children)}</strong>
    },
    em: ({ children }: any) => {
      return <em className="italic">{processTextWithTokens(children)}</em>
    },
    code: ({ children }: any) => {
      return <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-sm">{children}</code>
    },
    pre: ({ children }: any) => {
      return (
        <pre className="bg-gray-100 p-3 rounded overflow-x-auto mb-4">
          {children}
        </pre>
      )
    },
    ul: ({ children }: any) => {
      return <ul className="list-disc list-inside mb-4">{children}</ul>
    },
    ol: ({ children }: any) => {
      return <ol className="list-decimal list-inside mb-4">{children}</ol>
    },
    blockquote: ({ children }: any) => {
      return <blockquote className="border-l-4 border-gray-300 pl-4 italic my-4">{children}</blockquote>
    },
    hr: () => {
      return <hr className="my-4 border-gray-300" />
    }
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
          : 'w-full max-w-6xl h-[80vh] mx-4'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Edit System Prompt</h2>
              <p className="text-sm text-gray-500">Configure AI agent behavior</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy to clipboard"
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

        {/* Validation Warning */}
        {!validation.isValid && (
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
        <div className="flex-1 flex overflow-hidden">
          {/* Editor */}
          <div className="flex-1 flex flex-col border-r">
            <div className="px-4 py-2 bg-gray-50 border-b">
              <h3 className="text-sm font-medium text-gray-700">Editor</h3>
            </div>
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="flex-1 p-4 font-mono text-sm resize-none focus:outline-none"
              placeholder="Enter your system prompt here. Use $$input_key$$ to reference inputs.

Example:
# Task Instructions

Process the $$input$$ data and generate a summary.

## Requirements
- Be concise
- Focus on key points
- Use markdown formatting"
            />
          </div>

          {/* Preview */}
          <div className="flex-1 flex flex-col">
            <div className="px-4 py-2 bg-gray-50 border-b flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Preview</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMarkdownPreview(false)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    !showMarkdownPreview 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Raw
                </button>
                <button
                  onClick={() => setShowMarkdownPreview(true)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    showMarkdownPreview 
                      ? 'bg-gray-200 text-gray-800' 
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Markdown
                </button>
              </div>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {showMarkdownPreview ? (
                <div className="prose prose-sm max-w-none">
                  {tempValue ? renderMarkdownWithTokens(tempValue) : <em className="text-gray-400">No content to preview</em>}
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-mono text-sm">
                  {tempValue ? processTextWithTokens(tempValue) : <em className="text-gray-400">No content to preview</em>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">
              {tempValue.split(/\s+/).filter(w => w.length > 0).length} words · {tempValue.length} characters
            </span>
            <span className="text-sm text-gray-500">
              Inputs: {inputs.length > 0 ? inputs.map(input => `$$${input.key}$$`).join(', ') : 'none'}
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

export default SystemPromptModal