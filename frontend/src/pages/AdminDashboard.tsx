import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authService } from '../services/auth'
import { User, CreateUserRequest, AdminUpdateUserRequest } from '../types/auth'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Card from '../components/common/Card'
import { ArrowLeft } from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const { user: currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  

  // Create user form state
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    username: '',
    password: '',
    email: '',
    full_name: '',
    role: 'user'
  })

  // Edit user form state
  const [editForm, setEditForm] = useState<AdminUpdateUserRequest>({})

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setError('Access denied. Admin privileges required.')
      return
    }
    fetchUsers()
  }, [currentUser])

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const usersList = await authService.getAllUsers()
      setUsers(usersList)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setError('')
      // Clean up empty strings from optional fields
      const cleanedForm = {
        ...createForm,
        email: createForm.email || undefined,
        full_name: createForm.full_name || undefined
      }
      const newUser = await authService.createUser(cleanedForm)
      setUsers([...users, newUser])
      setCreateForm({ username: '', password: '', email: '', full_name: '', role: 'user' })
      setShowCreateUser(false)
      showSuccess(`User "${newUser.username}" created successfully!`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create user')
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      setError('')
      // Clean up empty strings and undefined values
      const cleanedForm = Object.entries(editForm).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          (acc as any)[key] = value
        }
        return acc
      }, {} as AdminUpdateUserRequest)
      
      const updatedUser = await authService.adminUpdateUser(editingUser.id, cleanedForm)
      setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u))
      setEditingUser(null)
      setEditForm({})
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update user')
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    try {
      setError('')
      setIsDeleting(true)
      await authService.deleteUser(deletingUser.id)
      setUsers(users.filter(u => u.id !== deletingUser.id))
      showSuccess(`User "${deletingUser.username}" deleted successfully!`)
      setDeletingUser(null)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete user')
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDeleteUser = (user: User) => {
    setDeletingUser(user)
  }

  const startEditUser = (user: User) => {
    setEditingUser(user)
    setEditForm({
      username: user.username,
      is_active: user.is_active,
      role: user.role
    })
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full p-6">
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
          <Button onClick={logout} variant="tertiary">
            Logout
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users and system settings</p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="tertiary"
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <Button
              onClick={() => setShowCreateUser(true)}
              variant="primary"
            >
              Create User
            </Button>
            <Button onClick={logout} variant="tertiary">
              Logout
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{successMessage}</div>
          </div>
        )}

        {/* Current User Info */}
        <Card className="mb-8 p-6">
          <h2 className="text-xl font-semibold mb-4">Current User</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Username</p>
              <p className="font-medium">{currentUser?.username}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {currentUser?.role}
              </span>
            </div>
          </div>
        </Card>

        {/* Create User Modal */}
        {showCreateUser && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <Card className="max-w-md w-full m-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input
                  label="Username (max 50 characters)"
                  value={createForm.username}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      setCreateForm({ ...createForm, username: value });
                    }
                  }}
                  maxLength={50}
                  required
                  placeholder="Enter username (1-50 characters)"
                />
                <Input
                  label="Password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  required
                />
                <Input
                  label="Email (Optional)"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                />
                <Input
                  label="Full Name (Optional)"
                  value={createForm.full_name}
                  onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as 'admin' | 'user' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-musashi-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    Create User
                  </Button>
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={() => setShowCreateUser(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <Card className="max-w-md w-full m-4 p-6">
              <h3 className="text-lg font-semibold mb-4">Edit User: {editingUser.username}</h3>
              <form onSubmit={handleEditUser} className="space-y-4">
                <Input
                  label="Username (max 50 characters)"
                  value={editForm.username || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 50) {
                      setEditForm({ ...editForm, username: value });
                    }
                  }}
                  maxLength={50}
                  placeholder="Enter username (1-50 characters)"
                />
                <Input
                  label="New Password (Optional)"
                  type="password"
                  value={editForm.password || ''}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Leave empty to keep current password"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editForm.role || editingUser.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value as 'admin' | 'user' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-musashi-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editForm.is_active ?? editingUser.is_active}
                    onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active User
                  </label>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button type="submit" variant="primary" className="flex-1">
                    Update User
                  </Button>
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={() => setEditingUser(null)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Delete User Confirmation Modal */}
        {deletingUser && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
            <Card className="max-w-md w-full m-4 p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Delete User</h3>
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete user <strong>"{deletingUser.username}"</strong>?
                This action cannot be undone.
              </p>
              {deletingUser.email && (
                <p className="text-sm text-gray-600 mb-4">
                  Email: {deletingUser.email}
                </p>
              )}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleDeleteUser}
                  variant="primary"
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Deleting...' : 'Delete User'}
                </Button>
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={() => setDeletingUser(null)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Users List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">All Users</h2>
          {isLoading ? (
            <p className="text-gray-600">Loading users...</p>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 min-w-[200px]">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 min-w-[100px]">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 min-w-[100px]">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 min-w-[120px]">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 min-w-[150px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditUser(user)}
                            className="text-musashi-600 hover:text-musashi-900"
                          >
                            Edit
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => confirmDeleteUser(user)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
