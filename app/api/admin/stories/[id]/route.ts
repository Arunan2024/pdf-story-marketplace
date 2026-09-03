import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params Promise
    const { id: storyId } = await params
    console.log('📝 Updating story with ID:', storyId)
    
    if (!storyId) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 })
    }

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
    const pdfFile = formData.get('pdf') as File | null
    const coverImage = formData.get('coverImage') as File | null

    const updateData: any = {
      title,
      description,
      price,
      published,
      popular,
    }

    // Handle PDF upload
    if (pdfFile && pdfFile.size > 0) {
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'pdfs')
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true })
      }
      const pdfFileName = `${Date.now()}-${pdfFile.name}`
      const pdfPath = join(uploadsDir, pdfFileName)
      const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())
      await writeFile(pdfPath, pdfBuffer)
      updateData.pdfStorageKey = `/uploads/pdfs/${pdfFileName}`
    }

    // Handle cover image upload
    if (coverImage && coverImage.size > 0) {
      const coversDir = join(process.cwd(), 'public', 'uploads', 'covers')
      if (!existsSync(coversDir)) {
        await mkdir(coversDir, { recursive: true })
      }
      const coverFileName = `${Date.now()}-${coverImage.name}`
      const coverPath = join(coversDir, coverFileName)
      const coverBuffer = Buffer.from(await coverImage.arrayBuffer())
      await writeFile(coverPath, coverBuffer)
      updateData.coverImage = `/uploads/covers/${coverFileName}`
    }

    const story = await prisma.story.update({
      where: { id: storyId },
      data: updateData,
    })

    console.log('✅ Story updated:', story.title)
    return NextResponse.json(story)
  } catch (error) {
    console.error('❌ Error updating story:', error)
    return NextResponse.json(
      { error: 'Failed to update story', details: String(error) },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: storyId } = await params
    console.log('📝 Toggling publish for story:', storyId)
    
    const session = await getServerSession(authOptions)
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { published } = await request.json()
    
    const story = await prisma.story.update({
      where: { id: storyId },
      data: { published },
    })

    return NextResponse.json(story)
  } catch (error) {
    console.error('Error toggling publish:', error)
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    )
  }
}
