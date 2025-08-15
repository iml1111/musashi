import { Workflow, WorkflowCreate, WorkflowUpdate } from '../types/workflow'

const API_BASE_URL = '/api/v1'

class WorkflowService {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    const token = localStorage.getItem('access_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  async getWorkflows(): Promise<Workflow[]> {
    const response = await fetch(`${API_BASE_URL}/workflows`, {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch workflows')
    }

    const data = await response.json()
    // Handle both id and _id fields from backend
    return data.map((workflow: any) => {
      if (workflow._id && !workflow.id) {
        workflow.id = workflow._id
      }
      return workflow
    })
  }

  async getWorkflow(id: string): Promise<Workflow> {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to fetch workflow')
    }

    const data = await response.json()
    // Handle both id and _id fields from backend
    if (data._id && !data.id) {
      data.id = data._id
    }
    return data
  }

  async createWorkflow(workflow: WorkflowCreate): Promise<Workflow> {
    const response = await fetch(`${API_BASE_URL}/workflows`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(workflow)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Workflow creation failed' }))
      throw new Error(error.detail || 'Workflow creation failed')
    }

    const data = await response.json()
    // Handle both id and _id fields from backend
    if (data._id && !data.id) {
      data.id = data._id
    }
    return data
  }

  async updateWorkflow(id: string, workflow: WorkflowUpdate): Promise<Workflow> {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(workflow)
    })

    if (response.status === 409) {
      // Handle conflict - throw special error with conflict data
      const conflictData = await response.json()
      const error = new Error('CONFLICT') as any
      error.code = 'CONFLICT'
      error.conflictData = conflictData.detail
      throw error
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Workflow update failed' }))
      throw new Error(error.detail || 'Workflow update failed')
    }

    const data = await response.json()
    // Handle both id and _id fields from backend
    if (data._id && !data.id) {
      data.id = data._id
    }
    return data
  }

  async deleteWorkflow(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Workflow deletion failed' }))
      throw new Error(error.detail || 'Workflow deletion failed')
    }
  }

  async shareWorkflow(id: string): Promise<{ share_token: string; is_public: boolean }> {
    const response = await fetch(`${API_BASE_URL}/workflows/${id}/share`, {
      method: 'POST',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Failed to generate share link' }))
      throw new Error(error.detail || 'Failed to generate share link')
    }

    return response.json()
  }

  async getSharedWorkflow(shareToken: string): Promise<Workflow> {
    const response = await fetch(`${API_BASE_URL}/workflows/shared/${shareToken}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Shared workflow not found')
    }

    const data = await response.json()
    // Handle both id and _id fields from backend
    if (data._id && !data.id) {
      data.id = data._id
    }
    return data
  }
}

export const workflowService = new WorkflowService()
export default WorkflowService