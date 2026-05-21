import { createClient, SupabaseClient } from '@supabase/supabase-js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDB = Record<string, any>;

// PUBLIC client — browser-safe (anon key only). Never put SERVICE_ROLE_KEY here.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _client: SupabaseClient<AnyDB> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase(): SupabaseClient<AnyDB> {
  if (!_client) {
    _client = createClient<AnyDB>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

export const supabase = getSupabase();
