const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // First, clear existing stories (optional)
  await prisma.story.deleteMany({})
  console.log('🗑️  Cleared existing stories')

  // Create sample stories
  const stories = [
    {
      title: 'The Lost Kingdom',
      description: 'A thrilling adventure through ancient ruins and forgotten civilizations. When archaeologist Dr. Sarah Chen discovers an ancient map, she unwittingly unlocks a mystery hidden for millennia.',
      price: 4.99,
      published: true,
      popular: true,
    },
    {
      title: 'Whispers in the Dark',
      description: 'A gripping mystery that will keep you guessing until the very end. In a small town where everyone has secrets, one detective must uncover the truth.',
      price: 3.99,
      published: true,
      popular: false,
    },
    {
      title: 'Love Beyond Time',
      description: 'A heartwarming romance that transcends centuries. Two souls destined to meet across time must find their way back to each other.',
      price: 5.99,
      published: true,
      popular: true,
    },
    {
      title: 'The Last Guardian',
      description: 'An epic fantasy about a young warrior\'s quest to save their world from an ancient evil.',
      price: 6.99,
      published: true,
      popular: false,
    },
  ]

  for (const storyData of stories) {
    const story = await prisma.story.create({
      data: storyData,
    })
    console.log('✅ Created story:', story.title)
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
