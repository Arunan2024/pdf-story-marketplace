import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    // Only get published stories for public view
    const stories = await prisma.story.findMany({
      where: {
        published: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        characters: true,
        _count: {
          select: {
            purchases: {
              where: { status: 'SUCCESSFUL' },
            },
          },
        },
      },
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
