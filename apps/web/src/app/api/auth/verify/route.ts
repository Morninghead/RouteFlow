import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from '@repo/auth/firebase-admin';
import { getClientSafeError, AuthenticationError, logError } from '@repo/shared';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      throw new AuthenticationError('Token is required');
    }

    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) {
      throw new AuthenticationError('Invalid or expired token');
    }

    return NextResponse.json({
      success: true,
      uid: decodedToken.uid,
      email: decodedToken.email,
    });
  } catch (error) {
    logError(error, { endpoint: '/api/auth/verify' });
    const clientError = getClientSafeError(error);
    
    return NextResponse.json(
      { success: false, error: clientError },
      { status: error instanceof AuthenticationError ? 401 : 500 }
    );
  }
}
