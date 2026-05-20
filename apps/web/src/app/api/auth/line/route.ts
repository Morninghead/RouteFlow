/**
 * LINE Login API Route
 * Handles LINE OAuth callback and session creation
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getLINEAuthUrl,
  exchangeCodeForToken,
  generateState,
  validateState,
} from '@repo/auth';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// LINE Login configuration from environment
const LINE_CHANNEL_ID = process.env.LINE_CHANNEL_ID || '';
const LINE_CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const REDIRECT_URI = `${APP_URL}/api/auth/line`;

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

/**
 * GET /api/auth/line?action=url
 * Generates LINE Login authorization URL
 * 
 * GET /api/auth/line?code=xxx&state=xxx
 * Handles LINE OAuth callback
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    // Action 1: Generate LINE Login URL
    if (action === 'url') {
      const state = generateState();

      // Store state in cookie for CSRF protection
      const cookieStore = await cookies();
      cookieStore.set('line_auth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 600, // 10 minutes
        path: '/',
      });

      const authUrl = getLINEAuthUrl({
        channelId: LINE_CHANNEL_ID,
        channelSecret: LINE_CHANNEL_SECRET,
        redirectUri: REDIRECT_URI,
        state,
      });

      return NextResponse.json({ url: authUrl });
    }

    // Action 2: Handle callback (code exchange)
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle LINE errors
    if (error) {
      console.error('LINE OAuth error:', error);
      return NextResponse.redirect(
        `${APP_URL}/auth/login?error=${encodeURIComponent('LINE login was cancelled or denied.')}`
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${APP_URL}/auth/login?error=${encodeURIComponent('Invalid login response.')}`
      );
    }

    // Verify state parameter (CSRF protection)
    const cookieStore = await cookies();
    const storedState = cookieStore.get('line_auth_state')?.value;

    if (!storedState || !validateState(storedState, state)) {
      return NextResponse.redirect(
        `${APP_URL}/auth/login?error=${encodeURIComponent('Invalid or expired login session. Please try again.')}`
      );
    }

    // Clear state cookie
    cookieStore.delete('line_auth_state');

    // Exchange code for access token
    const lineUser = await exchangeCodeForToken(code, {
      channelId: LINE_CHANNEL_ID,
      channelSecret: LINE_CHANNEL_SECRET,
      redirectUri: REDIRECT_URI,
    });

    // Find or create user in database
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('line_user_id', lineUser.userId)
      .single();

    let userId: string;
    let role = 'parent'; // Default role for new users

    if (existingUser) {
      // Update existing user's last login
      userId = existingUser.id;
      role = existingUser.role;

      await supabaseAdmin
        .from('users')
        .update({
          last_login_at: new Date().toISOString(),
          display_name: lineUser.displayName,
          picture_url: lineUser.pictureUrl,
        })
        .eq('id', userId);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          line_user_id: lineUser.userId,
          display_name: lineUser.displayName,
          picture_url: lineUser.pictureUrl,
          role,
          status: 'active',
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('Failed to create user:', createError);
        return NextResponse.redirect(
          `${APP_URL}/auth/login?error=${encodeURIComponent('Failed to create user account.')}`
        );
      }

      userId = newUser.id;
    }

    // Create session token
    const sessionToken = await createSession(userId, lineUser.userId);

    // Set session cookie
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Redirect to dashboard
    return NextResponse.redirect(`${APP_URL}/dashboard`);

  } catch (error) {
    console.error('LINE auth error:', error);
    return NextResponse.redirect(
      `${APP_URL}/auth/login?error=${encodeURIComponent('Login failed. Please try again.')}`
    );
  }
}

/**
 * Create a session token for the user
 */
async function createSession(userId: string, lineUserId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('sessions')
    .insert({
      user_id: userId,
      line_user_id: lineUserId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('token')
    .single();

  if (error || !data) {
    throw new Error('Failed to create session');
  }

  return data.token;
}
