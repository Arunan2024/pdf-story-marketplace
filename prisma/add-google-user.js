const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // PASTE YOUR GOOGLE EMAIL HERE
  const email = 's.s.arunan077@gmail.com'  // CHANGE THIS
  const name = 'Arunan'  // CHANGE THIS
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name,
      role: 'USER',
      accountStatus: 'ACTIVE',
    },
  })
  
  console.log('✅ User created:', user.email)
  console.log('User ID:', user.id)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
