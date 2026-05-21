// SERVER ONLY — session helper for API routes and server components.
import { cookies } from 'next/headers';
import { createAdminClient } from './supabase-server';

export interface ServerUser {
  id: string;
  role: string;
  status: string;
  school_id: string | null;
  display_name: string | null;
  picture_url: string | null;
}

export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;
  if (!token) return null;

  const admin = createAdminClient();

  const { data: session } = await admin
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .single();

  if (!session || new Date(session.expires_at) < new Date()) return null;

  const { data: user } = await admin
    .from('users')
    .select('id, role, status, school_id, display_name, picture_url')
    .eq('id', session.user_id)
    .eq('status', 'active')
    .single();

  return user ?? null;
}

export async function requireAuth(
  allowedRoles?: string[]
): Promise<ServerUser | Response> {
  const user = await getServerUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  return user;
}
