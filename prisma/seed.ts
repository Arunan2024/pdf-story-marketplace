import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      birthYear: 1990,
      gender: 'male',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Create sample stories
  const sampleStories = [
    {
      title: 'The Lost Kingdom',
      description: 'A thrilling adventure through ancient ruins and forgotten civilizations.',
      price: 4.99,
      published: true,
      popular: true,
    },
    {
      title: 'Whispers in the Dark',
      description: 'A gripping mystery that will keep you guessing until the very end.',
      price: 3.99,
      published: true,
      popular: false,
    },
    {
      title: 'Love Beyond Time',
      description: 'A heartwarming romance that transcends centuries.',
      price: 5.99,
      published: true,
      popular: true,
    },
    {
      title: 'The Last Guardian',
      description: 'An epic fantasy about a young warrior\'s quest to save their world.',
      price: 6.99,
      published: true,
      popular: false,
    },
  ]

  for (const storyData of sampleStories) {
    const story = await prisma.story.create({
      data: storyData,
    })
    console.log('✅ Story created:', story.title)
  }

  console.log('🎉 Database seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
