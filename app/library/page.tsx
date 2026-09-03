'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import FadeIn from '@/components/ui/FadeIn'

interface Purchase {
  id: string
  story: {
    id: string
    title: string
    price: number
    coverImage: string | null
    pdfStorageKey: string | null
  }
  amount: number
  createdAt: string
  status: string
}

export default function LibraryPage() {
  const { data: session, status } = useSession()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPurchases()
    }
  }, [status])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/purchases')
      if (response.ok) {
        const data = await response.json()
        setPurchases(data)
      }
    } catch (error) {
      console.error('Error fetching purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (storyId: string, title: string) => {
    setDownloading(storyId)
    try {
      const response = await fetch(`/api/stories/${storyId}/download`, {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to download')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      alert('Failed to download PDF')
    } finally {
      setDownloading(null)
    }
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your library.</p>
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
          <p className="mt-4 text-gray-600">Loading your library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <FadeIn>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Library</h1>
          <p className="text-gray-600 mb-8">{purchases.length} stories purchased</p>
        </FadeIn>

        <AnimatePresence>
          {purchases.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-16 text-center"
            >
              <div className="text-7xl mb-6">📚</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Your Library is Empty</h2>
              <p className="text-gray-600 mb-6">Start exploring our collection of amazing stories!</p>
              <Link 
                href="/stories"
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-all hover:scale-105 inline-block"
              >
                Browse Stories
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {purchases.map((purchase, index) => {
                const coverImageUrl = purchase.story.coverImage 
                  ? `${window.location.origin}${purchase.story.coverImage}`
                  : null

                return (
                  <motion.div
                    key={purchase.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48 bg-gradient-to-r from-purple-400 to-pink-400 overflow-hidden">
                      {coverImageUrl ? (
                        <img 
                          src={coverImageUrl} 
                          alt={purchase.story.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <span className="text-6xl">📖</span>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">
                        Purchased
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                        {purchase.story.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{new Date(purchase.createdAt).toLocaleDateString()}</span>
                        <span className="font-medium text-indigo-600">${purchase.amount}</span>
                      </div>
                      <button 
                        onClick={() => handleDownload(purchase.story.id, purchase.story.title)}
                        disabled={downloading === purchase.story.id}
                        className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {downloading === purchase.story.id ? 'Downloading...' : 'Download PDF'}
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
