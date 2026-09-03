'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-700 mb-4">There was a problem signing in.</p>
        {error && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
            <p className="text-red-600 text-sm">Error: {error}</p>
          </div>
        )}
        <p className="text-gray-600 text-sm mb-6">
          This could be because:
          <ul className="list-disc ml-4 mt-2 space-y-1">
            <li>The Google OAuth configuration is incorrect</li>
            <li>The redirect URI doesn't match Google Console</li>
            <li>The user doesn't exist in the database</li>
          </ul>
        </p>
        <Link 
          href="/auth/login"
          className="block text-center bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </Link>
      </div>
    </div>
  )
}
