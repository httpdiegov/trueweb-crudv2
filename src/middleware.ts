import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define las rutas que requieren autenticación
const protectedRoutes = ['/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // Verificar si el usuario está autenticado
  const isAuthenticated = request.cookies.get('admin-auth')?.value === 'true';

  // Redirigir al home si no está autenticado y está en una ruta protegida
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Configura las rutas donde se aplicará el middleware
export const config = {
  matcher: ['/admin/:path*'],
};
