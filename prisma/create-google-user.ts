import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // REPLACE with YOUR Google email address
  const email = 's.s.arunan077@gmail.com'  // CHANGE THIS!
  const name = 'Arunan'  // CHANGE THIS!
  
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        role: 'USER',
        accountStatus: 'ACTIVE',
        // No password for OAuth users
      },
    })
    console.log('✅ User created/updated:', user.email)
    console.log('User ID:', user.id)
  } catch (error) {
    console.error('❌ Error creating user:', error)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
