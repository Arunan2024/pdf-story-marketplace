import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stories = await prisma.story.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { purchases: true },
        },
        characters: true,
      },
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error('Error fetching stories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const price = parseFloat(formData.get('price') as string)
    const published = formData.get('published') === 'true'
    const popular = formData.get('popular') === 'true'
    const pdfFile = formData.get('pdf') as File
    const coverImage = formData.get('coverImage') as File | null
    const charactersData = JSON.parse(formData.get('characters') as string || '[]')

    // Validate required fields
    if (!title || !description || !price || !pdfFile) {
      return NextResponse.json(
        { error: 'Title, description, price, and PDF are required' },
        { status: 400 }
      )
    }

    // Validate PDF
    if (pdfFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    if (pdfFile.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'PDF file must be less than 50MB' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'pdfs')
    const coversDir = join(process.cwd(), 'public', 'uploads', 'covers')
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }
    if (!existsSync(coversDir)) {
      await mkdir(coversDir, { recursive: true })
    }

    // Save PDF
    const pdfFileName = `${Date.now()}-${pdfFile.name}`
    const pdfPath = join(uploadsDir, pdfFileName)
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())
    await writeFile(pdfPath, pdfBuffer)

    // Save cover image if provided
    let coverPath = null
    if (coverImage) {
      const coverFileName = `${Date.now()}-${coverImage.name}`
      const coverFullPath = join(coversDir, coverFileName)
      const coverBuffer = Buffer.from(await coverImage.arrayBuffer())
      await writeFile(coverFullPath, coverBuffer)
      coverPath = `/uploads/covers/${coverFileName}`
    }

    // Create story in database
    const story = await prisma.story.create({
      data: {
        title,
        description,
        price,
        published,
        popular,
        coverImage: coverPath,
        pdfStorageKey: `/uploads/pdfs/${pdfFileName}`,
        characters: {
          create: charactersData.filter((c: any) => c.name || c.description),
        },
      },
      include: {
        characters: true,
      },
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    console.error('Error creating story:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
