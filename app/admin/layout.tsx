'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (session?.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav className="bg-gray-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold">📚 Admin Panel</span>
              <div className="ml-10 flex space-x-4">
                <Link href="/admin" className="hover:text-gray-300">Dashboard</Link>
                <Link href="/admin/stories" className="hover:text-gray-300">Stories</Link>
                <Link href="/admin/users" className="hover:text-gray-300">Users</Link>
                <Link href="/admin/orders" className="hover:text-gray-300">Orders</Link>
                <Link href="/admin/analytics" className="hover:text-gray-300">Analytics</Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-300 mr-4">{session?.user?.email}</span>
              <Link href="/" className="hover:text-gray-300 text-sm">← Back to Site</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
