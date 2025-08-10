export interface User {
  id: string
  username: string
  email?: string
  full_name?: string
  role: 'admin' | 'user'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: User
}

export interface CreateUserRequest {
  username: string
  password: string
  email?: string
  full_name?: string
  role?: 'admin' | 'user'
}

export interface UpdateUserRequest {
  username?: string
  password?: string
  email?: string
  full_name?: string
  is_active?: boolean
}

export interface AdminUpdateUserRequest {
  username?: string
  password?: string
  is_active?: boolean
  role?: 'admin' | 'user'
}

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
}