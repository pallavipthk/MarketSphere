import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwt(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const path = request.nextUrl.pathname;

  let user: any = null;
  if (token) {
    const decoded = decodeJwt(token);
    // Check if token is expired
    if (decoded && decoded.exp && decoded.exp * 1000 > Date.now()) {
      user = decoded;
    }
  }

  // Paths requiring authentication
  const authRequiredPaths = ['/cart', '/checkout', '/orders', '/profile', '/wishlist'];
  const isAuthRequired = authRequiredPaths.some((p) => path.startsWith(p));

  // Role paths
  const isSellerPath = path.startsWith('/seller');
  const isAdminPath = path.startsWith('/admin');

  // Auth pages (login/register)
  const isAuthPage = path === '/login' || path === '/register';

  if (isAuthPage) {
    if (user) {
      if (user.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (user.role === 'seller') {
        return NextResponse.redirect(new URL('/seller', request.url));
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
    return NextResponse.next();
  }

  if (isAuthRequired && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  if (isSellerPath) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'seller') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  if (isAdminPath) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/cart/:path*',
    '/checkout/:path*',
    '/orders/:path*',
    '/profile/:path*',
    '/wishlist/:path*',
    '/seller/:path*',
    '/admin/:path*',
  ],
};
