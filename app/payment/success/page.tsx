'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [storyTitle, setStoryTitle] = useState('')

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id')
      if (!sessionId) {
        setStatus('error')
        return
      }

      try {
        const response = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        const data = await response.json()
        if (response.ok) {
          setStatus('success')
          setStoryTitle(data.storyTitle)
        } else {
          setStatus('error')
        }
      } catch (error) {
        setStatus('error')
      }
    }

    verifyPayment()
  }, [searchParams])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="text-5xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">Something went wrong with your payment.</p>
          <Link href="/stories" className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Browse Stories
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
        <p className="text-gray-700 mb-4">
          You now own <span className="font-semibold">{storyTitle || 'the story'}</span>!
        </p>
        <p className="text-gray-600 text-sm mb-6">
          You can download your purchase from your library.
        </p>
        <div className="flex flex-col gap-3">
          <Link href="/library" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Go to My Library
          </Link>
          <Link href="/stories" className="text-indigo-600 hover:text-indigo-700">
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  )
}
