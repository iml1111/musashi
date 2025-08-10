import React, { useState, useEffect } from 'react'
import { X, Copy, Search, Maximize2, Minimize2, FileText, Check, User, Bot } from 'lucide-react'
import { Typography, Card } from '../common'
import { PromptContext } from '../../types/node'

interface SystemPromptViewModalProps {
  isOpen: boolean
  onClose: () => void
  systemPrompt: string
  nodeName: string
  prompts?: PromptContext[]
}

const SystemPromptViewModal: React.FC<SystemPromptViewModalProps> = ({
  isOpen,
  onClose,
  systemPrompt,
  nodeName,
  prompts = []
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showRaw, setShowRaw] = useState(false)
  const [copied, setCopied] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [activeTab, setActiveTab] = useState<'developer' | 'prompts' | 'preview'>('developer')

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsFullscreen(false)
      setShowRaw(false)
      setSearchTerm('')
      setShowSearch(false)
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false)
        } else {
          onClose()
        }
      }
      // Ctrl/Cmd + F for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && isOpen) {
        e.preventDefault()
        setShowSearch(!showSearch)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, isFullscreen, onClose, showSearch])

  const handleCopy = async () => {
    try {
      let textToCopy = systemPrompt
      if (activeTab === 'preview' || activeTab === 'prompts') {
        textToCopy = `Developer Message:\n${systemPrompt}\n\n${
          prompts.length > 0 
            ? `Prompt Context:\n${prompts.map((p, i) => `${i + 1}. [${p.type}]: ${p.content}`).join('\n\n')}`
            : ''
        }`
      } else if (activeTab === 'prompts') {
        textToCopy = prompts.map((p, i) => `[${p.type}]: ${p.content}`).join('\n\n')
      }
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Simple markdown rendering (basic implementation)
  const renderMarkdown = (text: string) => {
    // Highlight search term if present
    let processedText = text
    if (searchTerm) {
      const regex = new RegExp(`(${searchTerm})`, 'gi')
      processedText = text.replace(regex, '<mark style="background: yellow;">$1</mark>')
    }

    // Basic markdown processing
    const lines = processedText.split('\n')
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} style={{ fontSize: '16px', fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}
              dangerouslySetInnerHTML={{ __html: line.substring(4) }} />
        )
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} style={{ fontSize: '18px', fontWeight: 700, marginTop: '20px', marginBottom: '10px' }}
              dangerouslySetInnerHTML={{ __html: line.substring(3) }} />
        )
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} style={{ fontSize: '20px', fontWeight: 800, marginTop: '24px', marginBottom: '12px' }}
              dangerouslySetInnerHTML={{ __html: line.substring(2) }} />
        )
      }
      
      // Code blocks (simple detection)
      if (line.startsWith('```')) {
        return (
          <div key={index} style={{ 
            fontFamily: 'monospace', 
            background: '#f3f4f6', 
            padding: '2px 4px',
            borderRadius: '4px',
            fontSize: '13px'
          }}>
            {line}
          </div>
        )
      }
      
      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={index} style={{ marginLeft: '20px', marginTop: '4px' }}
              dangerouslySetInnerHTML={{ __html: line.substring(2) }} />
        )
      }
      if (line.match(/^\d+\. /)) {
        return (
          <li key={index} style={{ marginLeft: '20px', marginTop: '4px', listStyleType: 'decimal' }}
              dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\. /, '') }} />
        )
      }
      
      // Bold and italic (simple)
      let processedLine = line
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code style="background: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-family: monospace; font-size: 13px;">$1</code>')
      
      // Regular paragraph
      if (line.trim()) {
        return <p key={index} style={{ marginTop: '8px' }} dangerouslySetInnerHTML={{ __html: processedLine }} />
      }
      
      // Empty line
      return <br key={index} />
    })
  }

  if (!isOpen) return null

  const fullContent = `${systemPrompt}\n${prompts.map(p => p.content).join('\n')}`
  const currentContent = activeTab === 'prompts' 
    ? prompts.map(p => p.content).join('\n')
    : activeTab === 'preview' 
      ? fullContent
      : systemPrompt
      
  const wordCount = currentContent.split(/\s+/).filter(word => word.length > 0).length
  const charCount = currentContent.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-lg shadow-xl ${
          isFullscreen 
            ? 'w-full h-full m-0' 
            : 'w-full max-w-4xl h-[80vh] mx-4'
        } flex flex-col transition-all duration-300`}
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Developer Message & Prompts</h2>
              <p className="text-sm text-gray-500">{nodeName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Action buttons */}
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
            </button>
            
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
                showSearch ? 'bg-gray-100' : ''
              }`}
              title="Search (Ctrl+F)"
            >
              <Search className="w-4 h-4 text-gray-600" />
            </button>
            
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
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-2"
              title="Close (ESC)"
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
          {prompts.length > 0 && (
            <>
              <button
                onClick={() => setActiveTab('prompts')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'prompts'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Prompt Context ({prompts.length})
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
            </>
          )}
        </div>
        
        {/* Search bar */}
        {showSearch && (
          <div className="px-6 py-3 border-b bg-gray-50">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'developer' && (
            showRaw ? (
              <pre className="font-mono text-sm text-gray-700 whitespace-pre-wrap">
                {searchTerm ? (
                  <div dangerouslySetInnerHTML={{
                    __html: systemPrompt.replace(
                      new RegExp(`(${searchTerm})`, 'gi'),
                      '<mark style="background: yellow;">$1</mark>'
                    )
                  }} />
                ) : (
                  systemPrompt
                )}
              </pre>
            ) : (
              <div className="prose prose-sm max-w-none">
                {renderMarkdown(systemPrompt)}
              </div>
            )
          )}
          
          {activeTab === 'prompts' && (
            <div className="space-y-4">
              {prompts.map((prompt, index) => (
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
                    {showRaw ? (
                      <pre className="font-mono text-sm">
                        {searchTerm ? (
                          <div dangerouslySetInnerHTML={{
                            __html: prompt.content.replace(
                              new RegExp(`(${searchTerm})`, 'gi'),
                              '<mark style="background: yellow;">$1</mark>'
                            )
                          }} />
                        ) : (
                          prompt.content
                        )}
                      </pre>
                    ) : (
                      renderMarkdown(prompt.content)
                    )}
                  </div>
                </div>
              ))}
              {prompts.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No prompt context available</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Developer Message */}
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-blue-100 rounded">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-semibold text-sm text-blue-800">Developer Message</span>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {showRaw ? (
                    <pre className="font-mono text-sm">{systemPrompt}</pre>
                  ) : (
                    renderMarkdown(systemPrompt)
                  )}
                </div>
              </div>
              
              {/* Prompt Contexts */}
              {prompts.map((prompt, index) => (
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
                    {showRaw ? (
                      <pre className="font-mono text-sm">{prompt.content}</pre>
                    ) : (
                      renderMarkdown(prompt.content)
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                showRaw 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Raw
            </button>
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                !showRaw 
                  ? 'bg-gray-200 text-gray-800' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Markdown
            </button>
          </div>
          
          <div className="text-sm text-gray-500">
            {wordCount} words · {charCount} characters
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemPromptViewModal