import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'
import FadeIn from '@/components/ui/FadeIn'
import StaggerContainer from '@/components/ui/StaggerContainer'
import StoryCard from '@/components/stories/StoryCard'

export default async function Home() {
  const popularStories = await prisma.story.findMany({
    where: { popular: true, published: true },
    take: 3,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <FadeIn>
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6 border border-white/20">
              📚 Discover Your Next Read
            </span>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Stories That
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">
                Capture Your Heart
              </span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={0.4}>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              Explore a growing collection of premium stories from talented authors.
              Your next unforgettable read is just a click away.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.6}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/stories"
                className="group px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
              >
                Explore Stories
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link 
                href="/auth/register"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/20 transition-all border border-white/20 inline-flex items-center justify-center"
              >
                Join Free
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Popular Stories Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-center justify-between mb-12">
              <div>
                <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">Trending</span>
                <h2 className="text-3xl font-bold text-gray-900 mt-1">Popular Stories</h2>
              </div>
              <Link href="/stories" className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All
                <span>→</span>
              </Link>
            </div>
          </FadeIn>

          {popularStories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow">
              <p className="text-gray-500">No popular stories yet. Check back soon!</p>
            </div>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popularStories.map((story, index) => (
                <StoryCard key={story.id} story={story} index={index} />
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Why Choose Us</h2>
            <p className="text-gray-600 mt-2">Everything you need for the perfect reading experience</p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '📚',
                title: 'Quality Stories',
                description: 'Curated collection of premium stories from talented authors worldwide.'
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'Your purchases and personal information are always safe and protected.'
              },
              {
                icon: '💳',
                title: 'Instant Access',
                description: 'Download your purchased stories immediately after payment.'
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-gray-50 rounded-2xl p-8 text-center hover:shadow-xl transition-all hover:scale-105">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </main>
  )
}
