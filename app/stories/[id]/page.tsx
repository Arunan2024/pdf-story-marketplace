import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'
import BuyButton from './BuyButton'
import StoryImage from '@/components/StoryImage'

interface StoryPageProps {
  params: Promise<{ id: string }>
}

export default async function StoryDetailPage({ params }: StoryPageProps) {
  const { id } = await params

  try {
    const story = await prisma.story.findUnique({
      where: { id: id },
      include: { characters: true },
    })

    if (!story) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Story Not Found</h1>
            <Link href="/stories" className="mt-4 inline-block text-indigo-600">
              ← Back to Stories
            </Link>
          </div>
        </div>
      )
    }

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const coverImageUrl = story.coverImage ? `${baseUrl}${story.coverImage}` : null

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="relative w-full h-80 bg-gray-200">
              <StoryImage
                src={coverImageUrl}
                alt={story.title}
                className="w-full h-full object-cover"
                fallbackClassName="w-full h-80 bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center"
              />
            </div>
            
            <div className="p-8">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">{story.title}</h1>
                {story.popular && (
                  <span className="bg-yellow-400 text-yellow-800 text-sm font-semibold px-3 py-1 rounded">
                    ⭐ Popular
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-4">{story.description}</p>
              <p className="text-2xl font-bold text-indigo-600 mt-4">${story.price}</p>
              
              <BuyButton storyId={story.id} />
              
              <Link href="/stories" className="mt-6 inline-block text-indigo-600 hover:underline">
                ← Back to Stories
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('❌ Error:', error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-500 mt-2">Failed to load story</p>
          <Link href="/stories" className="mt-4 inline-block text-indigo-600">
            ← Back to Stories
          </Link>
        </div>
      </div>
    )
  }
}
