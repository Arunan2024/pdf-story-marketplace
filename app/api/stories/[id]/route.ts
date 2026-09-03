import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// This is the correct way to handle dynamic routes in Next.js App Router
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise
    const params = await context.params
    const id = params.id
    
    console.log('📖 API: Fetching story with ID:', id)
    
    if (!id) {
      return NextResponse.json({ error: 'No ID provided' }, { status: 400 })
    }

    const story = await prisma.story.findUnique({
      where: { id: id },
      include: { characters: true },
    })

    console.log('📖 Story found?', story ? 'Yes' : 'No')
    
    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    return NextResponse.json(story)
  } catch (error) {
    console.error('❌ API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    )
  }
}
