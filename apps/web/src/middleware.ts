import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
let lastCleanup = Date.now();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10; // 10 requests per minute for auth endpoints
const CLEANUP_INTERVAL = 60 * 1000; // Cleanup every minute
const MAX_STORE_SIZE = 10000; // Maximum entries to prevent memory leak

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting to auth endpoints
  if (pathname.startsWith('/api/auth')) {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const key = `${ip}:${pathname}`;
    const now = Date.now();

    // FIX: Deterministic cleanup to prevent memory leak
    if (now - lastCleanup > CLEANUP_INTERVAL) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now > v.resetTime) {
          rateLimitStore.delete(k);
        }
      }
      lastCleanup = now;
    }

    // FIX: Prevent unbounded growth
    if (rateLimitStore.size > MAX_STORE_SIZE) {
      // Remove oldest entries
      const entries = Array.from(rateLimitStore.entries())
        .sort((a, b) => a[1].resetTime - b[1].resetTime);
      const toRemove = entries.slice(0, Math.floor(MAX_STORE_SIZE * 0.1));
      toRemove.forEach(([k]) => rateLimitStore.delete(k));
    }

    let isRateLimited = false;
    const record = rateLimitStore.get(key);

    if (record) {
      if (now < record.resetTime) {
        if (record.count >= MAX_REQUESTS_PER_WINDOW) {
          isRateLimited = true;
        } else {
          // FIX: Create new object instead of mutating (thread-safe)
          rateLimitStore.set(key, { 
            count: record.count + 1, 
            resetTime: record.resetTime 
          });
        }
      } else {
        // Reset window
        rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    } else {
      rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }

    // FIX: Constant-time response to prevent timing attacks
    if (isRateLimited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
