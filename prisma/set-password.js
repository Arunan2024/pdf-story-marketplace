const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = 'YOUR_EMAIL@gmail.com'  // CHANGE THIS to your email
  const password = 'Admin12345'  // Choose a password
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const user = await prisma.user.update({
    where: { email },
    data: { passwordHash: hashedPassword },
  })
  
  console.log('✅ Password set for:', user.email)
  console.log('Password:', password)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
