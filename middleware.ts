import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rutas protegidas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/history',
  '/alerts',
  '/info',
]

// Rutas públicas (accesibles sin autenticación)
const publicRoutes = [
  '/',
  '/connection-guide',
  '/recover-password',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar si la ruta actual es protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )
  
  // Verificar si la ruta actual es pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  )
  
  // Obtener el token de sesión de Firebase desde las cookies
  const sessionCookie = request.cookies.get('__session')?.value
  
  // Si es una ruta protegida y no hay sesión, redirigir al home
  if (isProtectedRoute && !sessionCookie) {
    const url = new URL('/', request.url)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  
  // Si está autenticado y trata de acceder a rutas de auth, redirigir al dashboard
  if (sessionCookie && (pathname === '/' || pathname.startsWith('/recover-password'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/(api|trpc)(.*)'],
}
