'use client'

import React, { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
  const [hostname, setHostname] = useState('')

  // Initialize admin accounts in localStorage if they don't exist
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem('userAuth') || '[]')
    let updated = false

    if (!users.some(user => user.email === SYSTEM_ADMIN.email)) {
      users.push(SYSTEM_ADMIN)
      updated = true
    }

    if (!users.some(user => user.email === DIOCESE_ADMIN.email)) {
      users.push(DIOCESE_ADMIN)
      updated = true
    }

    if (updated) {
      localStorage.setItem('userAuth', JSON.stringify(users))
      console.log('Admin accounts initialized')
    }
  }, [])

  // Load Replit auth script
  useEffect(() => {
    console.log('Checking environment...')
    const hostname = window.location.hostname
    console.log('Hostname:', hostname)

    if (hostname.includes('replit')) {
      console.log('Loading Replit auth script...')
      const script = document.createElement('script')
      script.src = "https://replit.com/public/js/repl-auth-v2.js"
      script.onload = () => {
        console.log('Replit auth script loaded')
      }
      document.head.appendChild(script)
    }
  }, [])

  // Simple login handler
  const handleReplitLogin = async () => {
    try {
      // @ts-ignore
      await window.LoginWithReplit()
      const response = await fetch('/__replauthuser')
      const replitUser = await response.json()
      
      if (replitUser) {
        // Check if user exists in our system
        const existingUsers = JSON.parse(localStorage.getItem('userAuth') || '[]')
        const userMatch = existingUsers.find(user => 
          user.email === replitUser.name + '@replit.user' || 
          user.email === replitUser.name + '@replit.com'
        )

        if (userMatch) {
          // User exists, log them in
          localStorage.setItem('currentUser', JSON.stringify(userMatch))
          router.push('/dashboard')
        } else {
          // User needs to be added by admin
          setError('Your Replit account is verified, but you need to be added as a user by an administrator.')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Failed to login with Replit')
    }
  }

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

  useEffect(() => {
    const currentHostname = window.location.hostname
    setHostname(currentHostname)
    
    const isReplit = currentHostname.includes('replit.dev') || 
                    currentHostname.includes('.repl.co') ||
                    currentHostname === 'replit.com'
    
    console.log('Current hostname:', currentHostname)
    console.log('Is Replit environment?', isReplit)
    setIsReplitEnvironment(isReplit)
  }, [])

  return (
    <div className="space-y-8 p-8 bg-white rounded-lg shadow">
      <div className="text-sm text-gray-500">
        Running in: {isReplitEnvironment ? 'Replit' : 'Local'}
        <br />
        Hostname: {hostname}
      </div>

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
        <>
          {window.location.hostname.includes('replit') ? (
            <button
              onClick={handleReplitLogin}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
            >
              Login with Replit
            </button>
          ) : (
            // Existing Login Form
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
          )}
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
    </div>
  )
}

export default Page
