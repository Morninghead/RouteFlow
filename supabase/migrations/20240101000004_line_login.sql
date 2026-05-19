-- Migration: Add LINE Login support
-- Adds line_user_id, display_name, picture_url, status, last_login_at to users
-- Creates sessions table for server-side session management

-- 1. Alter users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS line_user_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS picture_url TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Make phone_number optional (was NOT NULL before)
ALTER TABLE users
  ALTER COLUMN phone_number DROP NOT NULL;

-- Make first_name, last_name optional (LINE users may not have them yet)
ALTER TABLE users
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name DROP NOT NULL;

-- Index for quick LINE user lookup
CREATE INDEX IF NOT EXISTS idx_users_line_user_id ON users(line_user_id);

-- 2. Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  line_user_id TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- RLS for sessions (service role only, no direct client access)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (API routes use service role key)
CREATE POLICY "service_role_all_sessions"
  ON sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Clean up expired sessions function
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
