'use client'
import { useState, useEffect } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

interface FormData {
  clergyType: string
  prefix: string
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function UserCreateForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState<FormData>({
    clergyType: 'Priest',
    prefix: 'Fr.',
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Update prefix when clergy type changes
  useEffect(() => {
    const prefixMap = {
      'Priest': 'Fr.',
      'Deacon': 'Dcn.',
      'Bishop': 'Bp.'
    }
    setFormData(prev => ({
      ...prev,
      prefix: prefixMap[prev.clergyType as keyof typeof prefixMap]
    }))
  }, [formData.clergyType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!")
      return
    }

    try {
      const userId = crypto.randomUUID()
      const [firstName, ...lastNameParts] = formData.name.split(' ')
      const lastName = lastNameParts.join(' ')
      
      // Create user record
      const newUser = {
        id: userId,
        firstName,
        lastName,
        email: formData.email,
        role: 'user',
        status: 'active',
        dateCreated: new Date().toISOString(),
        clergyId: userId
      }

      // Create clergy record
      const newClergy = {
        id: userId,
        name: formData.name,
        type: formData.clergyType,
        status: 'Active',
        email: formData.email,
        children: [],
        deaneryId: '',
        deaneryName: '',
        initials: `${firstName[0]}${lastName[0]}`.toLowerCase(),
        nameDay: '',
        patronSaintDay: { date: '', saint: '' }
      }

      // Create login credentials
      const loginCredentials = {
        email: formData.email,
        password: formData.password,
        userId: userId
      }

      // Get existing records
      const existingUsers = JSON.parse(localStorage.getItem('userAuth') || '[]')
      const existingClergy = JSON.parse(localStorage.getItem('clergy') || '[]')
      const existingCredentials = JSON.parse(localStorage.getItem('loginCredentials') || '[]')

      // Save everything
      localStorage.setItem('userAuth', JSON.stringify([...existingUsers, newUser]))
      localStorage.setItem('clergy', JSON.stringify([...existingClergy, newClergy]))
      localStorage.setItem('loginCredentials', JSON.stringify([...existingCredentials, loginCredentials]))

      alert('Account created successfully!')
      if (onSuccess) onSuccess()
    } catch (error) {
      console.error('Error creating account:', error)
      alert('Error creating account. Please try again.')
    }
  }

  // Calculate initials for preview
  const getInitials = () => {
    if (!formData.name) return ''
    const [firstName, ...lastNameParts] = formData.name.split(' ')
    const lastName = lastNameParts.join(' ')
    return firstName && lastName ? `${firstName[0]}${lastName[0]}`.toLowerCase() : ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-md shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Clergy Type</label>
          <select
            value={formData.clergyType}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              clergyType: e.target.value
            }))}
            className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="Priest">Priest</option>
            <option value="Deacon">Deacon</option>
            <option value="Bishop">Bishop</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium mb-1">Name</label>
          <div className="flex gap-2">
            <div className="w-20">
              <input
                type="text"
                value={formData.prefix}
                disabled
                className="appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 bg-gray-100 text-gray-900"
              />
            </div>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                name: e.target.value
              }))}
              className="flex-1 appearance-none rounded-lg relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
              placeholder="Full name"
            />
          </div>
          {formData.name && (
            <div className="text-gray-600 text-sm ml-1">
              Preview: {formData.prefix} {formData.name}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1">Email</label>
          <Mail className="absolute left-3 top-[38px] transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              email: e.target.value
            }))}
            className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Email address"
            required
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1">Password</label>
          <Lock className="absolute left-3 top-[38px] transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              password: e.target.value
            }))}
            className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] transform -translate-y-1/2"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium mb-1">Confirm Password</label>
          <Lock className="absolute left-3 top-[38px] transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              confirmPassword: e.target.value
            }))}
            className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm password"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-[38px] transform -translate-y-1/2"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Create Account
      </button>
    </form>
  )
} 