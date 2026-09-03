'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface DashboardStats {
  totalUsers: number
  totalStories: number
  totalPurchases: number
  totalRevenue: number
  recentPurchases: Array<{
    id: string
    user: { name: string; email: string }
    story: { title: string }
    amount: number
    createdAt: string
  }>
  topStories: Array<{
    id: string
    title: string
    _count: { purchases: number }
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Stories</p>
              <p className="text-2xl font-bold">{stats?.totalStories || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">🛒</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold">{stats?.totalPurchases || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">${stats?.totalRevenue?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Purchases */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Purchases</h2>
          {stats?.recentPurchases?.length > 0 ? (
            <div className="space-y-4">
              {stats.recentPurchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between border-b pb-3">
                  <div>
                    <p className="font-medium">{purchase.story.title}</p>
                    <p className="text-sm text-gray-600">{purchase.user.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${purchase.amount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{new Date(purchase.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent purchases</p>
          )}
        </div>

        {/* Top Stories */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top Selling Stories</h2>
          {stats?.topStories?.length > 0 ? (
            <div className="space-y-4">
              {stats.topStories.map((story, index) => (
                <div key={story.id} className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center">
                    <span className="text-sm font-bold text-gray-500 mr-3">#{index + 1}</span>
                    <span className="font-medium">{story.title}</span>
                  </div>
                  <span className="text-sm text-gray-600">{story._count.purchases} sales</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No sales yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
