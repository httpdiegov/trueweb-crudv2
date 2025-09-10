import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Rutas que requieren autenticación (excluyendo la página de login)
  const requiresAuth = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = request.cookies.get('admin-auth')?.value === 'true';

  // Redirigir a login si no está autenticado y está en una ruta protegida
  if (requiresAuth && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Si está autenticado y trata de acceder a /admin, redirigir a /admin/dashboard
  if (pathname === '/admin' && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Si no está autenticado y trata de acceder a /admin, redirigir a /admin/login
  if (pathname === '/admin' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

// Configura las rutas donde se aplicará el middleware
export const config = {
  matcher: ['/admin/:path*'],
};
