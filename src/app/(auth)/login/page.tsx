'use client'

import React, { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserCreateForm from '@/components/UserCreateForm'
import { storage } from '@/lib/storageService'

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

const Page: React.FC<PageProps> = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    const initializeAdmins = async () => {
      try {
        console.log('Initializing admin accounts...')
        const users = await storage.getJSON('userAuth') || []
        let updated = false

        if (users.length === 0) {
          users.push(SYSTEM_ADMIN)
          users.push(DIOCESE_ADMIN)
          updated = true
          console.log('Added admin accounts')
        }

        if (updated) {
          const success = await storage.setJSON('userAuth', users)
          if (!success) {
            setError('Error initializing system. Please try again.')
          }
        }
      } catch (error) {
        console.error('Error initializing admin accounts:', error)
        setError('Error initializing system. Please try again.')
      }
    }

    initializeAdmins()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== LOGIN START ===')
    console.log('Environment check:', {
      isReplit: typeof window !== 'undefined' && 
        window.location.hostname.includes('replit.dev'),
      email,
      adminEmail: SYSTEM_ADMIN.email
    })

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    try {
      if (email === SYSTEM_ADMIN.email && password === 'admin1234') {
        console.log('System admin credentials match')
        
        // Add more detailed logging for the navigation process
        console.log('About to call handleSuccessfulLogin')
        await handleSuccessfulLogin(SYSTEM_ADMIN)
        console.log('handleSuccessfulLogin completed')
        
        return
      }

      if (email === DIOCESE_ADMIN.email && password === 'admin1234') {
        console.log('Diocese admin login successful')
        await handleSuccessfulLogin(DIOCESE_ADMIN)
        return
      }

      const loginCredentials = await storage.getJSON('loginCredentials') || []
      const userCredential = loginCredentials.find(cred => 
        cred.email === email && cred.password === password
      )

      if (!userCredential) {
        setError('Invalid email or password')
        return
      }

      const users = await storage.getJSON('userAuth') || []
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

  const handleSuccessfulLogin = async (userData: any) => {
    console.log('handleSuccessfulLogin started with:', userData)
    
    try {
      // Store user data in session storage
      sessionStorage.setItem('user', JSON.stringify(userData))
      console.log('User data stored in session')
      
      // Store in Replit DB if we're in Replit
      if (typeof window !== 'undefined' && 
          window.location.hostname.includes('replit.dev')) {
        console.log('Storing in Replit DB')
        await storage.setJSON('userAuth', [userData])
      }
      
      console.log('Navigation environment:', {
        hostname: window.location.hostname,
        pathname: window.location.pathname,
        href: window.location.href,
        protocol: window.location.protocol,
        router: !!router,
        isReplit: window.location.hostname.includes('replit.dev')
      })
      console.log('About to navigate')
      window.location.href = '/dashboard'
      console.log('Navigation command issued')
    } catch (error) {
      console.error('Error in handleSuccessfulLogin:', error)
      throw error
    }
  }

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

