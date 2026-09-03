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
    console.log('💰 Payment: Starting checkout...')
    
    // Check if user is logged in
    const session = await getServerSession(authOptions)
    console.log('💰 User session:', session?.user?.email || 'Not logged in')
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please login first' }, { status: 401 })
    }

    // Get story ID from request
    const body = await request.json()
    const storyId = body.storyId
    console.log('💰 Story ID:', storyId)

    if (!storyId) {
      return NextResponse.json({ error: 'Story ID required' }, { status: 400 })
    }

    // Get story from database
    const story = await prisma.story.findUnique({
      where: { id: storyId },
    })

    if (!story) {
      console.log('❌ Story not found:', storyId)
      return NextResponse.json({ error: 'Story not found' }, { status: 404 })
    }

    console.log('💰 Story found:', story.title, 'Price:', story.price)

    // Check if user already successfully purchased this story
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

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: story.title,
              description: story.description?.substring(0, 100) || '',
            },
            unit_amount: Math.round(story.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/stories/${story.id}`,
      metadata: {
        userId: session.user.id,
        storyId: story.id,
        storyTitle: story.title,
      },
    })

    console.log('💰 Checkout session created:', checkoutSession.id)
    console.log('💰 Checkout URL:', checkoutSession.url)

    // Create purchase record (pending)
    await prisma.purchase.create({
      data: {
        userId: session.user.id,
        storyId: story.id,
        amount: story.price,
        currency: 'usd',
        stripeCheckoutSessionId: checkoutSession.id,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('❌ Payment checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: String(error) },
      { status: 500 }
    )
  }
}
