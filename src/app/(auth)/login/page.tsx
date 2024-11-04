'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  // Regular login form for existing users
  const handleRegularLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Your existing login form code
  }

  // Replit verification only
  const handleReplitVerify = async () => {
    try {
      // @ts-ignore
      await window.LoginWithReplit()
      const response = await fetch('/__replauthuser')
      const replitUser = await response.json()
      
      if (replitUser) {
        // Store Replit verification only
        sessionStorage.setItem('replitVerified', JSON.stringify(replitUser))
        // Show regular login form
        setShowLoginForm(true)
      }
    } catch (error) {
      console.error('Replit verification error:', error)
      setError('Failed to verify with Replit')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleRegularLogin} className="mt-8 space-y-6">
          {/* Your existing login form fields */}
        </form>

        {/* Replit Verify Button */}
        <div className="mt-6">
          <button
            onClick={handleReplitVerify}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Verify with Replit
          </button>
        </div>

        {error && (
          <div className="mt-4 text-red-600 text-center">{error}</div>
        )}
      </div>
    </div>
  )
}
