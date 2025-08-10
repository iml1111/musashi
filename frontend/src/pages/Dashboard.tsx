import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Share2, Settings, LogOut, User, Trash2, Check, Copy } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { workflowService } from '../services/workflow'
import { Workflow } from '../types/workflow'

interface DeleteConfirmDialog {
  show: boolean
  workflowId: string | null
  workflowName: string
}

interface ShareState {
  [workflowId: string]: {
    loading: boolean
    copied: boolean
    shareToken?: string
  }
}

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<DeleteConfirmDialog>({
    show: false,
    workflowId: null,
    workflowName: ''
  })
  const [shareState, setShareState] = useState<ShareState>({})

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const data = await workflowService.getWorkflows()
      setWorkflows(data)
    } catch (err) {
      console.error('Failed to fetch workflows:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch workflows')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkflows()
  }, [])

  const showDeleteDialog = (workflow: Workflow) => {
    setDeleteDialog({
      show: true,
      workflowId: workflow.id,
      workflowName: workflow.name
    })
  }

  const hideDeleteDialog = () => {
    setDeleteDialog({
      show: false,
      workflowId: null,
      workflowName: ''
    })
  }

  const handleDelete = async () => {
    if (!deleteDialog.workflowId) return

    try {
      setDeleting(deleteDialog.workflowId)
      await workflowService.deleteWorkflow(deleteDialog.workflowId)
      
      // Remove workflow from local state
      setWorkflows(prev => prev.filter(w => w.id !== deleteDialog.workflowId))
      
      hideDeleteDialog()
    } catch (err) {
      console.error('Failed to delete workflow:', err)
      alert('Failed to delete workflow. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleShare = async (workflow: Workflow) => {
    // If already have share token, just copy
    if (workflow.share_token || shareState[workflow.id]?.shareToken) {
      const token = workflow.share_token || shareState[workflow.id]?.shareToken
      await copyShareLink(workflow.id, token!)
      return
    }

    // Generate new share token
    setShareState(prev => ({
      ...prev,
      [workflow.id]: { loading: true, copied: false }
    }))

    try {
      const result = await workflowService.shareWorkflow(workflow.id)
      setShareState(prev => ({
        ...prev,
        [workflow.id]: { 
          loading: false, 
          copied: false, 
          shareToken: result.share_token 
        }
      }))
      
      // Update workflow in local state
      setWorkflows(prev => prev.map(w => 
        w.id === workflow.id 
          ? { ...w, share_token: result.share_token, is_public: result.is_public }
          : w
      ))
      
      // Copy to clipboard
      await copyShareLink(workflow.id, result.share_token)
    } catch (err) {
      console.error('Failed to generate share link:', err)
      alert('Failed to generate share link. Please try again.')
      setShareState(prev => ({
        ...prev,
        [workflow.id]: { loading: false, copied: false }
      }))
    }
  }

  const copyShareLink = async (workflowId: string, shareToken: string) => {
    const shareUrl = `${window.location.origin}/shared/${shareToken}`
    
    try {
      await navigator.clipboard.writeText(shareUrl)
      setShareState(prev => ({
        ...prev,
        [workflowId]: { ...prev[workflowId], copied: true }
      }))
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setShareState(prev => ({
          ...prev,
          [workflowId]: { ...prev[workflowId], copied: false }
        }))
      }, 2000)
    } catch (err) {
      console.error('Failed to copy to clipboard:', err)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = shareUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      
      setShareState(prev => ({
        ...prev,
        [workflowId]: { ...prev[workflowId], copied: true }
      }))
      
      setTimeout(() => {
        setShareState(prev => ({
          ...prev,
          [workflowId]: { ...prev[workflowId], copied: false }
        }))
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Delete Confirmation Dialog */}
      {deleteDialog.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Workflow</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{deleteDialog.workflowName}"</span>?
              <br />
              <span className="text-sm text-red-600">This action cannot be undone.</span>
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={hideDeleteDialog}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deleting}
                className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white ${
                  deleting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Musashi</h1>
              <span className="ml-3 text-sm text-gray-500">Cut the code. Shape the flow.</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="w-4 h-4" />
                <span>{user?.username}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  user?.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user?.role}
                </span>
              </div>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              )}
              <Link
                to="/workflow/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-musashi-600 hover:bg-musashi-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Workflow
              </Link>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900">Your Workflows</h2>
          <p className="text-gray-600">Design and manage your AI agent workflows</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-musashi-600"></div>
            <p className="mt-2 text-gray-600">Loading workflows...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-musashi-600 text-white rounded-md hover:bg-musashi-700"
            >
              Retry
            </button>
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No workflows</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new workflow.</p>
            <div className="mt-6">
              <Link
                to="/workflow/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-musashi-600 hover:bg-musashi-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Workflow
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{workflow.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{workflow.description || 'No description'}</p>
                    <p className="text-xs text-gray-400">
                      Updated {new Date(workflow.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleShare(workflow)}
                      disabled={shareState[workflow.id]?.loading}
                      className={`p-1 transition-colors ${
                        shareState[workflow.id]?.copied
                          ? 'text-green-600'
                          : shareState[workflow.id]?.loading
                          ? 'text-gray-300'
                          : workflow.is_public
                          ? 'text-blue-600 hover:text-blue-700'
                          : 'text-gray-400 hover:text-gray-600'
                      }`}
                      title={
                        shareState[workflow.id]?.copied
                          ? 'Link copied!'
                          : workflow.is_public
                          ? 'Copy share link'
                          : 'Share'
                      }
                    >
                      {shareState[workflow.id]?.copied ? (
                        <Check className="w-4 h-4" />
                      ) : shareState[workflow.id]?.loading ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                      ) : workflow.is_public ? (
                        <Copy className="w-4 h-4" />
                      ) : (
                        <Share2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex space-x-3">
                  <Link
                    to={`/workflow/${workflow.id}`}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={() => showDeleteDialog(workflow)}
                    disabled={deleting === workflow.id}
                    className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
                      deleting === workflow.id
                        ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                        : 'text-red-700 bg-white hover:bg-red-50 hover:border-red-300'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {deleting === workflow.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard