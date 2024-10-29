'use client'
import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Page() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'Priest' as const,
    currentAssignment: '',
    phone: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      // Create user auth entry
      const userAuth = {
        id: crypto.randomUUID(),
        email: formData.email,
        role: 'user',
        status: 'active',
        dateCreated: new Date(),
      }

      // Create clergy profile
      const clergyProfile = {
        id: crypto.randomUUID(),
        name: formData.name,
        role: formData.role,
        ordained: '',
        status: 'Active',
        currentAssignment: formData.currentAssignment,
        email: formData.email,
        phone: formData.phone,
        initials: formData.name.split(' ').map(n => n[0]).join(''),
        nameDay: '',
      }

      // Save to localStorage
      const existingUsers = JSON.parse(localStorage.getItem('userAuth') || '[]')
      localStorage.setItem('userAuth', JSON.stringify([...existingUsers, {
        ...userAuth,
        clergyId: clergyProfile.id
      }]))

      const existingClergy = JSON.parse(localStorage.getItem('clergy') || '[]')
      localStorage.setItem('clergy', JSON.stringify([...existingClergy, clergyProfile]))

      // Redirect to login
      router.push('/login')
    } catch (err) {
      setError('An error occurred during registration')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            {/* Name Field */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
              />
            </div>

            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  password: e.target.value
                }))}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>

            {/* Role Selection */}
            <div>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  role: e.target.value as typeof formData.role
                }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg"
                required
              >
                <option value="Priest">Priest</option>
                <option value="Deacon">Deacon</option>
              </select>
            </div>

            {/* Current Assignment */}
            <div>
              <input
                type="text"
                placeholder="Current Assignment"
                value={formData.currentAssignment}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  currentAssignment: e.target.value
                }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  phone: e.target.value
                }))}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Account
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}