import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db/prisma'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const storyId = params.id

    // Check if user has purchased this story
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        storyId: storyId,
        status: 'SUCCESSFUL',
      },
      include: {
        story: true,
      },
    })

    if (!purchase) {
      return NextResponse.json(
        { error: 'You have not purchased this story' },
        { status: 403 }
      )
    }

    // Get the PDF file path
    const pdfPath = purchase.story.pdfStorageKey
    if (!pdfPath) {
      return NextResponse.json(
        { error: 'PDF file not found' },
        { status: 404 }
      )
    }

    // Read the PDF file
    const fullPath = join(process.cwd(), 'public', pdfPath)
    const fileBuffer = await readFile(fullPath)

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${purchase.story.title}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error downloading PDF:', error)
    return NextResponse.json(
      { error: 'Failed to download PDF' },
      { status: 500 }
    )
  }
}
