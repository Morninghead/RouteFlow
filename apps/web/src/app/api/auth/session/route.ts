/**
 * Session API Route
 * Handles session validation and logout
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase-server';

/**
 * GET /api/auth/session
 * Get current session
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('session')?.value;
    if (!sessionToken) return NextResponse.json({ user: null });

    const db = createAdminClient();

    const { data: session } = await db
      .from('sessions')
      .select('user_id, expires_at')
      .eq('token', sessionToken)
      .single();

    if (!session || new Date(session.expires_at) < new Date()) {
      cookieStore.delete('session');
      return NextResponse.json({ user: null });
    }

    const { data: user } = await db
      .from('users')
      .select('id, role, status, display_name, picture_url, school_id')
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
        schoolId: user.school_id,
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
    await createAdminClient().from('sessions').delete().eq('token', sessionToken);
    cookieStore.delete('session');
  }
  return NextResponse.json({ success: true });
}
