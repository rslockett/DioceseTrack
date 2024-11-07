'use client'

import React, { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserCreateForm from '@/components/UserCreateForm'
import { storage as replitStorage } from '@/lib/storageService'

interface PageProps {}

const SYSTEM_ADMIN = {
  id: 'system-admin-id',
  firstName: 'System',
  lastName: 'Administrator',
  email: 'system@administrator.com',
  role: 'admin',
  status: 'active',
  dateCreated: new Date().toISOString()
};

const DIOCESE_ADMIN = {
  id: 'diocese-admin-id',
  firstName: 'Diocese',
  lastName: 'Administrator',
  email: 'admin@diocesetrack.com',
  role: 'admin',
  status: 'active',
  dateCreated: new Date().toISOString()
};

const storage = {
  getItem: (key: string) => {
    try {
      if (typeof window !== 'undefined' && 
          window.location.hostname.includes('replit.dev')) {
        return replitStorage.getJSON(key)
      }
      return localStorage.getItem(key)
    } catch (error) {
      console.error('Error accessing storage:', error)
      return null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      if (typeof window !== 'undefined' && 
          window.location.hostname.includes('replit.dev')) {
        return replitStorage.setJSON(key, JSON.parse(value))
      }
      localStorage.setItem(key, value)
      return true
    } catch (error) {
      console.error('Error writing to storage:', error)
      return false
    }
  }
}

const Page: React.FC<PageProps> = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    try {
      console.log('Initializing admin accounts...')
      const users = JSON.parse(storage.getItem('userAuth') || '[]')
      let updated = false

      if (users.length === 0) {
        users.push(SYSTEM_ADMIN)
        users.push(DIOCESE_ADMIN)
        updated = true
        console.log('Added admin accounts')
      }

      if (updated) {
        const success = storage.setItem('userAuth', JSON.stringify(users))
        if (!success) {
          setError('Error initializing system. Please try again.')
        }
      }

      if (window.location.pathname !== '/login') {
        const currentUser = storage.getItem('currentUser')
        if (currentUser) {
          const userData = JSON.parse(currentUser)
          const targetPath = userData.role === 'user' ? '/clergy' : '/dashboard'
          window.location.href = targetPath
        }
      }
    } catch (err) {
      console.error('Initialization error:', err)
      setError('Error initializing system. Please refresh the page.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    console.log('Login attempt:', { email })

    try {
      if (email === SYSTEM_ADMIN.email && password === 'admin1234') {
        console.log('System admin login successful')
        handleSuccessfulLogin(SYSTEM_ADMIN)
        return
      }

      if (email === DIOCESE_ADMIN.email && password === 'admin123') {
        console.log('Diocese admin login successful')
        handleSuccessfulLogin(DIOCESE_ADMIN)
        return
      }

      const loginCredentials = JSON.parse(storage.getItem('loginCredentials') || '[]')
      const userCredential = loginCredentials.find(cred => 
        cred.email === email && cred.password === password
      )

      if (!userCredential) {
        setError('Invalid email or password')
        return
      }

      const users = JSON.parse(storage.getItem('userAuth') || '[]')
      const userData = users.find(user => user.id === userCredential.userId)

      if (!userData) {
        setError('User account not found')
        return
      }

      console.log('Regular user login successful')
      handleSuccessfulLogin(userData)

    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
    }
  }

  const handleSuccessfulLogin = (userData: any) => {
    try {
      console.log('=== LOGIN PROCESS START ===');
      
      // Store user data
      const userJson = JSON.stringify(userData);
      storage.setItem('currentUser', userJson);
      document.cookie = `currentUser=${encodeURIComponent(userJson)}; path=/`;
      
      // Determine target path
      const targetPath = userData.role === 'user' ? '/clergy' : '/dashboard';
      console.log('Navigating to:', targetPath);
      
      // Use router for navigation
      router.push(targetPath);
      console.log('Navigation successful');
      
    } catch (err) {
      console.error('Login process error:', err);
      setError('Error during login process. Please try again.');
    }
  };

  return (
    <div className="space-y-8 p-8 bg-white rounded-lg shadow">
      <div>
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {!showSignup ? (
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div className="relative">
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setShowSignup(true)}
                className="text-blue-500 hover:underline"
              >
                Create one here
              </button>
            </p>
          </div>
        </form>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Create Account</h2>
          <UserCreateForm onSuccess={() => setShowSignup(false)} />
          <button
            onClick={() => setShowSignup(false)}
            className="mt-4 text-blue-500 hover:underline"
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  )
}

export default Page