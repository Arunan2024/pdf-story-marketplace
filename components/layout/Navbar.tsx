'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isLoggedIn = status === 'authenticated'
  const isAdmin = session?.user?.role === 'ADMIN'

  if (!mounted) {
    return (
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">📖 PDF Story</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Loading...</span>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600">
              📖 PDF Story
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-700 hover:text-indigo-600">
              Home
            </Link>
            <Link href="/stories" className="text-gray-700 hover:text-indigo-600">
              Stories
            </Link>
            
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-indigo-600">
                  Dashboard
                </Link>
                <Link href="/library" className="text-gray-700 hover:text-indigo-600">
                  My Library
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-indigo-600">
                  Profile
                </Link>
                {isAdmin && (
                  <Link href="/admin" className="text-gray-700 hover:text-indigo-600 font-semibold">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-gray-700 hover:text-indigo-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                  Login
                </Link>
                <Link href="/auth/register" className="border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50">
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
