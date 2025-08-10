import {
  LoginRequest,
  LoginResponse,
  User,
  CreateUserRequest,
  UpdateUserRequest,
  AdminUpdateUserRequest
} from '../types/auth'

const API_BASE_URL = '/api/v1'

class AuthService {
  private token: string | null = null

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('access_token')
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    return headers
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    console.log('Login attempt:', { username: credentials.username, password: credentials.password ? '***' : 'empty' })
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

    console.log('Login response status:', response.status)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Login failed' }))
      console.error('Login error:', error)
      throw new Error(error.detail || 'Login failed')
    }

    const data: LoginResponse = await response.json()
    console.log('Login successful:', { user: data.user.username, role: data.user.role })
    this.token = data.access_token
    localStorage.setItem('access_token', data.access_token)
    
    return data
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders()
      })
    } catch (error) {
      console.warn('Logout request failed:', error)
    } finally {
      this.token = null
      localStorage.removeItem('access_token')
    }
  }

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to get current user')
    }

    return response.json()
  }

  async getAllUsers(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Failed to get users')
    }

    return response.json()
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'User creation failed' }))
      console.error('User creation error:', error)
      
      // Handle validation errors (422)
      if (response.status === 422 && error.detail) {
        // If detail is an array (validation errors), format it nicely
        if (Array.isArray(error.detail)) {
          const messages = error.detail.map((err: any) => 
            err.msg || err.message || JSON.stringify(err)
          ).join(', ')
          throw new Error(messages)
        }
        // If detail is an object, stringify it
        else if (typeof error.detail === 'object') {
          throw new Error(JSON.stringify(error.detail))
        }
      }
      
      throw new Error(error.detail || 'User creation failed')
    }

    return response.json()
  }

  async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'User update failed' }))
      throw new Error(error.detail || 'User update failed')
    }

    return response.json()
  }

  async adminUpdateUser(userId: string, userData: AdminUpdateUserRequest): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'User update failed' }))
      throw new Error(error.detail || 'User update failed')
    }

    return response.json()
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'User deletion failed' }))
      throw new Error(error.detail || 'User deletion failed')
    }
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  getToken(): string | null {
    return this.token
  }
}

export const authService = new AuthService()
export default AuthService