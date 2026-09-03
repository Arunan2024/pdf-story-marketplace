'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DownloadPage() {
  const { id } = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [story, setStory] = useState<{ title: string } | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      checkPurchase()
    } else if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, id])

  const checkPurchase = async () => {
    try {
      const response = await fetch(`/api/purchases/check/${id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.hasPurchased) {
          setStory(data.story)
          // Trigger download
          await downloadPDF()
        } else {
          setError('You have not purchased this story')
        }
      } else {
        setError('Could not verify purchase')
      }
    } catch (error) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    try {
      const response = await fetch(`/api/stories/${id}/download`, {
        method: 'POST',
      })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${story?.title || 'story'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        setError('Failed to download PDF')
      }
    } catch (error) {
      setError('Something went wrong during download')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500">Verifying your purchase...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/stories"
            className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Browse Stories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
        <div className="text-6xl mb-4">📥</div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Download Started!</h2>
        <p className="text-gray-600 mb-4">
          Your PDF download should begin automatically.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If the download doesn't start, click the button below.
        </p>
        <button
          onClick={downloadPDF}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Download Again
        </button>
      </div>
    </div>
  )
}
