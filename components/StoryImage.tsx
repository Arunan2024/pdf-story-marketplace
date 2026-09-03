'use client'

import { useState } from 'react'

interface StoryImageProps {
  src: string | null
  alt: string
  className?: string
  fallbackClassName?: string
}

export default function StoryImage({ src, alt, className = '', fallbackClassName = '' }: StoryImageProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return (
      <div className={`flex items-center justify-center ${fallbackClassName || 'h-48 bg-gradient-to-r from-purple-400 to-pink-400'}`}>
        <span className="text-5xl">📖</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  )
}
