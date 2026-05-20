import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const STAFF_ROLES = ['superadmin', 'admin', 'staff'];

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Authenticate via Supabase Auth
    const { data: authData, error: authError } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Look up user in our users table by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, role, status, display_name, picture_url, email')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User account not found. Contact your administrator.' }, { status: 403 });
    }

    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Your account is inactive. Contact your administrator.' }, { status: 403 });
    }

    // Only staff roles can use email/password login
    if (!STAFF_ROLES.includes(user.role)) {
      return NextResponse.json({ error: 'Please use LINE Login to sign in.' }, { status: 403 });
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await supabaseAdmin.from('sessions').insert({
      token: sessionToken,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
    });

    // Update last_login_at
    await supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    // Determine redirect based on role
    const redirectMap: Record<string, string> = {
      superadmin: '/dashboard',
      admin: '/dashboard',
      staff: '/dashboard',
    };

    return NextResponse.json({
      success: true,
      role: user.role,
      redirect: redirectMap[user.role] || '/dashboard',
    });
  } catch (error) {
    console.error('Email auth error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
