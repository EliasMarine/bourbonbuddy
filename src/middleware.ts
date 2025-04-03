import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Handle HTTP to HTTPS upgrade for external resources
function externalResourceMiddleware(req: NextRequest) {
  // Only run this middleware for image requests
  if (
    req.nextUrl.pathname.endsWith('.jpg') ||
    req.nextUrl.pathname.endsWith('.jpeg') ||
    req.nextUrl.pathname.endsWith('.png') ||
    req.nextUrl.pathname.endsWith('.gif') ||
    req.nextUrl.pathname.endsWith('.webp')
  ) {
    const url = req.nextUrl.clone();
    const referer = req.headers.get('referer');
    
    // If the URL is HTTP and we're on HTTPS, upgrade it
    if (url.protocol === 'http:' && (referer && referer.startsWith('https:'))) {
      url.protocol = 'https:';
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

// Main middleware chain
export default withAuth(
  function middleware(req) {
    // First, try to upgrade any insecure resources
    const upgradeResponse = externalResourceMiddleware(req);
    if (upgradeResponse.status !== 200) {
      return upgradeResponse;
    }
    
    // Skip WebSocket upgrade requests
    if (req.headers.get('upgrade')?.toLowerCase() === 'websocket') {
      console.log('Allowing WebSocket upgrade request');
      return NextResponse.next();
    }
    
    // Skip socket.io polling requests
    if (req.nextUrl.pathname.includes('/api/socketio') || 
        req.nextUrl.pathname.includes('/api/socket.io') ||
        req.nextUrl.pathname.includes('/socket.io')) {
      console.log('Allowing Socket.IO request:', req.nextUrl.pathname);
      return NextResponse.next();
    }
    
    // Standard middleware check
    console.log('Middleware checking auth for:', req.nextUrl.pathname);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add CORS headers for Socket.IO
  if (request.nextUrl.pathname.startsWith('/api/socketio')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', '*');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

export const config = {
  matcher: [
    // Auth protected routes
    '/dashboard/:path*',
    '/profile/:path*',
    '/streams/create',
    '/streams/:id/host',
    '/collection',
    '/collection/:path*',
    
    // Image paths that might need HTTPS upgrade
    '/(.*).jpg',
    '/(.*).jpeg',
    '/(.*).png',
    '/(.*).gif',
    '/(.*).webp',
  ],
}; 