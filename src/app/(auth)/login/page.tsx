'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isReplitScriptLoaded, setIsReplitScriptLoaded] = useState(false)

  useEffect(() => {
    // Only load on Replit domain
    if (window.location.hostname.includes('replit')) {
      const script = document.createElement('script')
      script.src = "https://replit.com/public/js/repl-auth-v2.js"
      script.onload = () => {
        console.log('Replit auth script loaded')
        setIsReplitScriptLoaded(true)
      }
      document.head.appendChild(script)
    }
  }, [])

  const handleReplitVerify = async () => {
    if (!isReplitScriptLoaded) {
      setError('Replit authentication is not ready yet')
      return
    }

    try {
      console.log('Starting Replit verification...')
      // @ts-ignore
      await window.LoginWithReplit()
      
      const response = await fetch('/__replauthuser')
      const replitUser = await response.json()
      console.log('Replit user:', replitUser)

      if (replitUser) {
        // Store Replit verification
        sessionStorage.setItem('replitVerified', JSON.stringify(replitUser))
        console.log('Replit verification stored')
        
        // Now show regular login form or redirect as needed
        router.push('/login/select-role')
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

        <button
          onClick={handleReplitVerify}
          disabled={!isReplitScriptLoaded}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          Verify with Replit
        </button>

        {error && (
          <div className="mt-4 text-red-600 text-center">{error}</div>
        )}
      </div>
    </div>
  )
}
