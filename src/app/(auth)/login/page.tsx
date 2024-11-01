'use client'

import React, { useEffect, useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import UserCreateForm from '@/components/UserCreateForm'

interface PageProps {}

const Page: React.FC<PageProps> = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [showSignup, setShowSignup] = useState(false)

  useEffect(() => {
    console.log('=== LOGIN DEBUG ===');
    console.log('LoginCredentials:', JSON.parse(localStorage.getItem('loginCredentials') || '[]'));
    console.log('UserAuth:', JSON.parse(localStorage.getItem('userAuth') || '[]'));
    console.log('Clergy:', JSON.parse(localStorage.getItem('clergy') || '[]'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log('=== LOGIN ATTEMPT ===')
    console.log('Email:', email)

    try {
      const credentials = JSON.parse(localStorage.getItem('loginCredentials') || '[]')
      const users = JSON.parse(localStorage.getItem('userAuth') || '[]')
      
      console.log('Found credentials:', credentials)
      console.log('Found users:', users)

      // Check for admin
      if (email === 'admin@diocesetrack.com' && password === 'admin123') {
        const adminUser = users.find(u => u.role === 'admin')
        localStorage.setItem('currentUser', JSON.stringify(adminUser))
        document.cookie = `currentUser=${JSON.stringify(adminUser)}; path=/`
        router.push('/dashboard')
        return
      }

      // Check for regular users
      const userMatch = credentials.find((cred: any) => 
        cred.email === email && cred.password === password
      )

      console.log('User match:', userMatch)

      if (userMatch) {
        const user = users.find(u => u.id === userMatch.userId)
        console.log('Found user:', user)

        if (user) {
          localStorage.setItem('currentUser', JSON.stringify(user))
          document.cookie = `currentUser=${JSON.stringify(user)}; path=/`
          
          // Simple routing - no profile paths
          if (user.role === 'user') {
            console.log('Redirecting clergy user to /clergy')
            router.push('/clergy')
          } else {
            console.log('Redirecting to dashboard')
            router.push('/dashboard')
          }
        } else {
          setError('User account not found')
        }
      } else {
        setError('Invalid email or password')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred during login')
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
        <>
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
