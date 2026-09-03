'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface BuyButtonProps {
  storyId: string
}

export default function BuyButton({ storyId }: BuyButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleBuy = async () => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    setLoading(true)
    
    try {
      console.log('Buying story with ID:', storyId)
      
      const response = await fetch('/api/payment/checkout-with-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          storyId: storyId 
        }),
      })
      
      const data = await response.json()
      console.log('Response:', data)
      
      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        alert(data.error || 'Failed to start checkout')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleBuy}
        disabled={loading}
        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Buy Now'}
      </button>
    </div>
  )
}
