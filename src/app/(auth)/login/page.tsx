'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import UserCreateForm from '@/components/UserCreateForm'

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
  const [isReplitEnvironment, setIsReplitEnvironment] = useState(false)

  // Load Replit auth script if in Replit environment
  useEffect(() => {
    const hostname = window.location.hostname
    const isReplit = hostname.includes('replit') || hostname.includes('.repl.co')
    setIsReplitEnvironment(isReplit)

    if (isReplit) {
      const script = document.createElement('script')
      script.src = "https://replit.com/public/js/repl-auth-v2.js"
      script.onload = () => console.log('Replit auth script loaded')
      document.head.appendChild(script)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log('=== LOGIN ATTEMPT ===')
    console.log('Email:', email)

    try {
      // Check for system administrator
      if (email === 'system@administrator.com' && password === 'admin1234') {
        handleSuccessfulLogin(SYSTEM_ADMIN)
        return
      }

      // Check for diocese administrator
      if (email === 'admin@diocesetrack.com' && password === 'admin123') {
        handleSuccessfulLogin(DIOCESE_ADMIN)
        return
      }

      // Check regular user credentials
      const loginCredentials = JSON.parse(localStorage.getItem('loginCredentials') || '[]');
      const userCredential = loginCredentials.find(cred => cred.email === email && cred.password === password);

      if (userCredential) {
        // Get user data
        const users = JSON.parse(localStorage.getItem('userAuth') || '[]');
        const userData = users.find(user => user.id === userCredential.userId);

        if (userData) {
          handleSuccessfulLogin(userData);
          return;
        }
      }

      setError('Invalid email or password')
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login')
    }
  }

  const handleSuccessfulLogin = (userData: any) => {
    const userJson = JSON.stringify(userData);
    localStorage.setItem('currentUser', userJson);
    document.cookie = `currentUser=${encodeURIComponent(userJson)}; path=/`;
    
    // Direct users based on role
    if (userData.role === 'user') {
      router.push('/clergy');
    } else {
      router.push('/dashboard');
    }
  };

  // Add Replit login handler
  const handleReplitLogin = async () => {
    try {
      console.log('Starting Replit login...')
      // @ts-ignore
      await window.LoginWithReplit()
      console.log('LoginWithReplit completed')
      
      const response = await fetch('/__replauthuser')
      const replitUser = await response.json()
      console.log('Replit user data:', replitUser)
      
      if (replitUser) {
        console.log('Setting credentials...')
        await new Promise<void>((resolve) => {
          setEmail('admin@diocesetrack.com')
          setPassword('admin123')
          resolve()
        })
        
        console.log('Triggering login...')
        const event = new Event('submit') as any
        event.preventDefault = () => {}
        handleSubmit(event)
      }
    } catch (error) {
      console.error('Replit login error:', error)
      setError('Failed to authenticate with Replit')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        
        {!showSignup ? (
          <>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm space-y-4">
                <div className="relative">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
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
          </>
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

        {/* Add Replit login button if in Replit environment */}
        {isReplitEnvironment && (
          <div className="mt-4">
            <button
              onClick={handleReplitLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Verify with Replit
            </button>
          </div>
        )}
        
        {error && (
          <div className="mt-2 text-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default Page
