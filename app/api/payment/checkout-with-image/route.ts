import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/db/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
})

export async function POST(request: Request) {
  try {
    console.log('💰 Creating payment with image...')
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    const { storyId } = await request.json()
    console.log('💰 Story ID:', storyId)

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 })
    }

    const story = await prisma.story.findUnique({
      where: { id: storyId },
    })

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    console.log('💰 Story found:', story.title)

    // Check if user already purchased this story
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: session.user.id,
        storyId: story.id,
        status: 'SUCCESSFUL',
      },
    })

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'You already own this story' },
        { status: 400 }
      )
    }

    // Delete any pending purchases for this user and story
    await prisma.purchase.deleteMany({
      where: {
        userId: session.user.id,
        storyId: story.id,
        status: 'PENDING',
      },
    })

    // Get the full URL for the cover image
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const imageUrl = story.coverImage ? `${baseUrl}${story.coverImage}` : null
    console.log('💰 Image URL:', imageUrl)

    // Create a product with image
    const product = await stripe.products.create({
      name: story.title,
      description: story.description || '',
      images: imageUrl ? [imageUrl] : [],
    })
    console.log('💰 Product created:', product.id)

    // Create a price for the product
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: Math.round(story.price * 100),
      currency: 'usd',
    })
    console.log('💰 Price created:', price.id)

    // Create a payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        },
      },
      metadata: {
        userId: session.user.id,
        storyId: story.id,
        storyTitle: story.title,
      },
    })

    console.log('💰 Payment link created:', paymentLink.url)

    // Create purchase record (pending)
    await prisma.purchase.create({
      data: {
        userId: session.user.id,
        storyId: story.id,
        amount: story.price,
        currency: 'usd',
        stripeCheckoutSessionId: paymentLink.id,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ url: paymentLink.url })
  } catch (error) {
    console.error('❌ Error creating payment with image:', error)
    return NextResponse.json(
      { error: 'Failed to create payment', details: String(error) },
      { status: 500 }
    )
  }
}
