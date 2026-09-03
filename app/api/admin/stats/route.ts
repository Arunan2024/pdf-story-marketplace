import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Check if user is admin
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get total stories
    const totalStories = await prisma.story.count({
      where: { published: true },
    })

    // Get total purchases
    const totalPurchases = await prisma.purchase.count({
      where: { status: 'SUCCESSFUL' },
    })

    // Get total revenue
    const revenueResult = await prisma.purchase.aggregate({
      where: { status: 'SUCCESSFUL' },
      _sum: { amount: true },
    })
    const totalRevenue = revenueResult._sum.amount || 0

    // Get recent purchases
    const recentPurchases = await prisma.purchase.findMany({
      where: { status: 'SUCCESSFUL' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        story: {
          select: { title: true },
        },
      },
    })

    // Get top selling stories
    const topStories = await prisma.story.findMany({
      where: { published: true },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            purchases: {
              where: { status: 'SUCCESSFUL' },
            },
          },
        },
      },
      orderBy: {
        purchases: {
          _count: 'desc',
        },
      },
      take: 5,
    })

    return NextResponse.json({
      totalUsers,
      totalStories,
      totalPurchases,
      totalRevenue,
      recentPurchases,
      topStories,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
