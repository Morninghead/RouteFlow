import { createClient } from '@supabase/supabase-js';

// PUBLIC client — browser-safe (anon key only). Never put SERVICE_ROLE_KEY here.
let _client: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_client) {
    _client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

export const supabase = getSupabase();
