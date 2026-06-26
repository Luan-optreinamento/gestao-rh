import { NextRequest, NextResponse } from 'next/server'
import { verificarToken } from '@/lib/auth'

const PUBLIC_ROUTES = ['/login']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get('token')?.value

  if (PUBLIC_ROUTES.includes(pathname)) {
    if (token && verificarToken(token)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  if (!token || !verificarToken(token)) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}