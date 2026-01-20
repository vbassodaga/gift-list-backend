import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle CORS
  const response = NextResponse.next();

  // Allow requests from Netlify and localhost (development)
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:4200',
    'http://localhost',
    'https://*.netlify.app',
    'https://*.vercel.app'
  ];

  if (origin) {
    const isAllowed = allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        return origin.includes(allowed.replace('*.', ''));
      }
      return origin === allowed;
    });

    if (isAllowed || origin.includes('netlify.app') || origin.includes('localhost')) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
  } else {
    // Fallback para desenvolvimento local
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: response.headers
    });
  }

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
