import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's purchases
    const purchases = await prisma.purchase.findMany({
      where: {
        userId: session.user.id,
        status: 'SUCCESSFUL',
      },
      include: {
        story: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate stats
    const totalPurchases = purchases.length
    const totalSpent = purchases.reduce((sum, p) => sum + p.amount, 0)
    const recentPurchases = purchases.slice(0, 5)

    return NextResponse.json({
      totalPurchases,
      totalSpent,
      recentPurchases,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
