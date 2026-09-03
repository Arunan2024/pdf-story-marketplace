'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import FadeIn from '@/components/ui/FadeIn'

interface DashboardStats {
  totalPurchases: number
  totalSpent: number
  recentPurchases: Array<{
    id: string
    story: { title: string }
    amount: number
    createdAt: string
  }>
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your dashboard.</p>
          <Link 
            href="/auth/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all inline-block"
          >
            Login
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {session?.user?.name}! 👋</h1>
            <p className="text-gray-600 mt-1">Here's an overview of your reading journey</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalPurchases || 0}</p>
              </div>
              <div className="text-3xl">📚</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-indigo-600">${stats?.totalSpent?.toFixed(2) || '0.00'}</p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-lg font-semibold text-gray-900">
                  {session?.user?.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="text-3xl">🎉</div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Account Status</p>
                <p className="text-lg font-semibold text-green-600">✅ Active</p>
              </div>
              <div className="text-3xl">✨</div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Purchases</h2>
              <Link href="/purchases" className="text-sm text-indigo-600 hover:text-indigo-700">
                View all →
              </Link>
            </div>
            {stats?.recentPurchases?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentPurchases.map((purchase) => (
                  <div key={purchase.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{purchase.story.title}</p>
                      <p className="text-sm text-gray-500">{new Date(purchase.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="font-semibold text-indigo-600">${purchase.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No purchases yet</p>
            )}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/stories"
                className="bg-indigo-50 rounded-xl p-4 text-center hover:bg-indigo-100 transition-colors group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📖</div>
                <p className="text-sm font-medium text-gray-900">Browse Stories</p>
              </Link>
              <Link 
                href="/library"
                className="bg-purple-50 rounded-xl p-4 text-center hover:bg-purple-100 transition-colors group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📚</div>
                <p className="text-sm font-medium text-gray-900">My Library</p>
              </Link>
              <Link 
                href="/profile"
                className="bg-green-50 rounded-xl p-4 text-center hover:bg-green-100 transition-colors group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
                <p className="text-sm font-medium text-gray-900">Edit Profile</p>
              </Link>
              <Link 
                href="/stories"
                className="bg-yellow-50 rounded-xl p-4 text-center hover:bg-yellow-100 transition-colors group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">⭐</div>
                <p className="text-sm font-medium text-gray-900">Discover</p>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
