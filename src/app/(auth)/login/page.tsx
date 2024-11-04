'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [showLoginForm, setShowLoginForm] = useState(true)

  useEffect(() => {
    if (window.location.hostname.includes('replit')) {
      const script = document.createElement('script')
      script.src = "https://replit.com/public/js/repl-auth-v2.js"
      script.onload = () => console.log('Replit auth script loaded')
      document.head.appendChild(script)
    }
  }, [])

  const handleReplitVerify = async () => {
    try {
      // @ts-ignore
      await window.LoginWithReplit()
      const response = await fetch('/__replauthuser')
      const replitUser = await response.json()
      
      if (replitUser) {
        // Store Replit verification
        sessionStorage.setItem('replitVerified', JSON.stringify(replitUser))
        
        // Show login form for admin credentials
        setShowLoginForm(true)
      }
    } catch (error) {
      console.error('Replit verification error:', error)
      setError('Failed to verify with Replit')
    }
  }

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const email = (e.target as any).email.value
    const password = (e.target as any).password.value

    // Check against admin credentials
    const credentials = JSON.parse(localStorage.getItem('loginCredentials') || '[]')
    const match = credentials.find(c => c.email === email && c.password === password)

    if (match) {
      router.push('/dashboard')
    } else {
      setError('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to your account</h2>
        </div>

        {!showLoginForm ? (
          <button
            onClick={handleReplitVerify}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Verify with Replit
          </button>
        ) : (
          <form onSubmit={handleAdminLogin} className="mt-8 space-y-6">
            <input type="email" name="email" placeholder="Email" required className="w-full p-2 border rounded" />
            <input type="password" name="password" placeholder="Password" required className="w-full p-2 border rounded" />
            <button type="submit" className="w-full py-2 px-4 bg-blue-600 text-white rounded">
              Sign in
            </button>
          </form>
        )}

        {error && (
          <div className="text-red-600 text-center mt-2">{error}</div>
        )}
      </div>
    </div>
  )
}
