import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, AuthContextType } from '../types/auth'
import { authService } from '../services/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      // Check if we have a token first
      if (authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          // Token might be expired, clear it
          authService.logout()
        }
      } else {
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true)
      const response = await authService.login({ username, password })
      setUser(response.user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (): void => {
    authService.logout()
    setUser(null)
  }

  const isAuthenticated = !!user

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
