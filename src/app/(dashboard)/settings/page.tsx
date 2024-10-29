'use client'
import React, { useState, useEffect } from 'react'
import { 
  Plus,
  Trash,
  Shield,
  Key
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface UserAuth {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  status: 'active' | 'pending' | 'inactive';
  dateCreated: Date;
  clergyId?: string;  // Reference to clergy profile if role is 'user'
}

const SettingsPage = () => {
  const [users, setUsers] = useState<UserAuth[]>([])
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [selectedRole, setSelectedRole] = useState<'staff' | 'user'>('user')

  // Password change form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const savedUsers = localStorage.getItem('userAuth')
    if (!savedUsers) {
      // Initialize with admin
      const adminUser: UserAuth = {
        id: 'admin-1',
        email: 'admin@diocesetrack.com',
        role: 'admin',
        status: 'active',
        dateCreated: new Date()
      }
      localStorage.setItem('userAuth', JSON.stringify([adminUser]))
      setUsers([adminUser])
    } else {
      setUsers(JSON.parse(savedUsers))
    }
  }, [])

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault()
    const newUser: UserAuth = {
      id: crypto.randomUUID(),
      email: inviteEmail,
      role: selectedRole,
      status: 'pending',
      dateCreated: new Date()
    }

    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem('userAuth', JSON.stringify(updatedUsers))

    // TODO: Send invitation email
    console.log(`Invitation sent to ${inviteEmail}`)

    setInviteEmail('')
    setShowInviteForm(false)
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!")
      return
    }

    // TODO: Add password change logic
    console.log('Password change requested')
    
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setShowPasswordForm(false)
  }

  const handleUpdateRole = (userId: string, newRole: 'staff' | 'user') => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    )
    setUsers(updatedUsers)
    localStorage.setItem('userAuth', JSON.stringify(updatedUsers))
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="space-x-2">
          <Button 
            onClick={() => setShowPasswordForm(true)}
            variant="outline"
          >
            <Key className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          <Button 
            onClick={() => setShowInviteForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>
      </div>

      {/* Password Change Form */}
      {showPasswordForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  Update Password
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowPasswordForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Invite Form */}
      {showInviteForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Invite New User</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'staff' | 'user')}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="staff">Staff</option>
                  <option value="user">User (Clergy)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  Send Invitation
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowInviteForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Users & Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Role</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b">
                    <td className="py-3 px-4">{user.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateRole(user.id, e.target.value as 'staff' | 'user')}
                        className="px-2 py-1 border rounded"
                        disabled={user.role === 'admin'} // Can't change admin role
                      >
                        <option value="staff">Staff</option>
                        <option value="user">User</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={user.role === 'admin'} // Can't delete admin
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SettingsPage
