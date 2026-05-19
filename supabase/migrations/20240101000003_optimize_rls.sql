-- Optimize RLS policies by reducing subquery overhead

-- Create materialized view for user permissions (optional, for high-traffic scenarios)
-- This can be refreshed periodically or via triggers

-- Add helper function to get user with school in one query
CREATE OR REPLACE FUNCTION get_user_context(uid TEXT)
RETURNS TABLE(user_id UUID, school_id UUID, role role_type) AS $$
    SELECT id, school_id, role 
    FROM users 
    WHERE firebase_uid = uid 
    AND uid IS NOT NULL 
    AND uid != ''
    LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Optimize trips policy to use JOIN instead of subquery
DROP POLICY IF EXISTS "Drivers can view their own trips" ON trips;
CREATE POLICY "Drivers can view their own trips"
    ON trips FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM drivers d
            JOIN users u ON d.user_id = u.id
            WHERE d.id = trips.driver_id
            AND u.firebase_uid = auth.uid()::TEXT
        )
    );

-- Optimize photos policy with better JOIN
DROP POLICY IF EXISTS "Parents can view photos of their children" ON photos;
CREATE POLICY "Parents can view photos of their children"
    ON photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 
            FROM trip_events te
            JOIN passengers p ON te.passenger_id = p.id
            JOIN users u ON u.id = ANY(
                SELECT (jsonb_array_elements(p.guardians)->>'userId')::UUID
            )
            WHERE te.id = photos.trip_event_id
            AND u.firebase_uid = auth.uid()::TEXT
        )
    );

-- Add index on auth.uid() lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid_active ON users(firebase_uid) WHERE firebase_uid IS NOT NULL;

-- Add partial indexes for common RLS checks
CREATE INDEX IF NOT EXISTS idx_drivers_user_active ON drivers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trips_driver_active ON trips(driver_id) WHERE status IN ('scheduled', 'in_progress');
