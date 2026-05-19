/**
 * Session API Route
 * Handles session validation and logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * GET /api/auth/session
 * Get current session
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null });
    }

    // Validate session
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token', sessionToken)
      .single();

    if (!session || new Date(session.expires_at) < new Date()) {
      // Clear expired session
      cookieStore.delete('session');
      return NextResponse.json({ user: null });
    }

    // Get user data
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user_id)
      .single();

    if (!user) {
      cookieStore.delete('session');
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        role: user.role,
        displayName: user.display_name,
        pictureUrl: user.picture_url,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json({ user: null });
  }
}

/**
 * DELETE /api/auth/session
 * Logout - clear session
 */
export async function DELETE() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;

  if (sessionToken) {
    // Remove from database
    await supabaseAdmin.from('sessions').delete().eq('token', sessionToken);
    // Clear cookie
    cookieStore.delete('session');
  }

  return NextResponse.json({ success: true });
}
