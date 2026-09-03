import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isAdminPage = request.nextUrl.pathname.startsWith('/admin')
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedPage = ['/dashboard', '/profile', '/library'].some(path => 
    request.nextUrl.pathname.startsWith(path)
  )
  
  // Allow auth pages
  if (isAuthPage) {
    return NextResponse.next()
  }
  
  // Check admin access
  if (isAdminPage) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }
  
  // Check protected pages
  if (isProtectedPage) {
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    return NextResponse.next()
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/profile/:path*', '/library/:path*', '/auth/:path*'],
}
