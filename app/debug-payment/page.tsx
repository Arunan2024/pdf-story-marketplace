'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'

export default function DebugPaymentPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const testPayment = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      // Get a story ID from the database
      setResult('Fetching stories...')
      const response = await fetch('/api/stories')
      const stories = await response.json()
      
      if (stories.length === 0) {
        setResult('❌ No stories found. Create a story first.')
        setLoading(false)
        return
      }
      
      const storyId = stories[0].id
      setResult(`📖 Using story ID: ${storyId}`)
      
      setResult('🔄 Creating checkout session...')
      const checkoutResponse = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId }),
      })
      
      const data = await checkoutResponse.json()
      
      if (checkoutResponse.ok && data.url) {
        setResult(`✅ Redirecting to: ${data.url}`)
        window.location.href = data.url
      } else {
        setResult(`❌ Error: ${JSON.stringify(data, null, 2)}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">🔧 Debug Payment</h1>
        <p className="text-gray-600 mb-4">
          Logged in as: {session?.user?.email || '❌ Not logged in'}
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Make sure you have a story in the database with published: true
        </p>
        <button
          onClick={testPayment}
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-indigo-700"
        >
          {loading ? '⏳ Testing...' : '🔀 Test Payment'}
        </button>
        <pre className="mt-4 bg-white p-4 rounded-lg shadow overflow-auto max-h-96 whitespace-pre-wrap">
          {result || 'Click the button to test'}
        </pre>
      </div>
    </div>
  )
}
