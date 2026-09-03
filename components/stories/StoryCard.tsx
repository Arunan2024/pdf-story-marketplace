'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Story {
  id: string
  title: string
  description: string
  price: number
  coverImage: string | null
  popular: boolean
}

interface StoryCardProps {
  story: Story
  index: number
}

export default function StoryCard({ story, index }: StoryCardProps) {
  const coverImageUrl = story.coverImage 
    ? `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${story.coverImage}`
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300">
        <div className="relative h-56 bg-gradient-to-r from-purple-400 to-pink-400 overflow-hidden">
          {coverImageUrl ? (
            <img 
              src={coverImageUrl} 
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-6xl">📖</span>
            </div>
          )}
          {story.popular && (
            <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              ⭐ Popular
            </div>
          )}
        </div>
        
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
            {story.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {story.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-indigo-600">
              ${story.price}
            </span>
            <Link
              href={`/stories/${story.id}`}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-all hover:scale-105"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
