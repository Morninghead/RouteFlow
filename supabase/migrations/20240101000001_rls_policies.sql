-- Enable Row Level Security on all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role (with NULL safety)
CREATE OR REPLACE FUNCTION get_user_role(uid TEXT)
RETURNS role_type AS $$
    SELECT role FROM users WHERE firebase_uid = uid AND uid IS NOT NULL AND uid != '';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to get user school_id (with NULL safety)
CREATE OR REPLACE FUNCTION get_user_school_id(uid TEXT)
RETURNS UUID AS $$
    SELECT school_id FROM users WHERE firebase_uid = uid AND uid IS NOT NULL AND uid != '';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function to check if user is superadmin (with NULL safety)
CREATE OR REPLACE FUNCTION is_superadmin(uid TEXT)
RETURNS BOOLEAN AS $$
    SELECT COALESCE(
        (SELECT role = 'superadmin' FROM users WHERE firebase_uid = uid AND uid IS NOT NULL AND uid != ''),
        FALSE
    );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Schools policies
CREATE POLICY "SuperAdmins can view all schools"
    ON schools FOR SELECT
    USING (is_superadmin(auth.uid()::TEXT));

CREATE POLICY "Users can view their own school"
    ON schools FOR SELECT
    USING (id = get_user_school_id(auth.uid()::TEXT));

CREATE POLICY "SuperAdmins can insert schools"
    ON schools FOR INSERT
    WITH CHECK (is_superadmin(auth.uid()::TEXT));

CREATE POLICY "SuperAdmins and Admins can update their school"
    ON schools FOR UPDATE
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        (id = get_user_school_id(auth.uid()::TEXT) AND get_user_role(auth.uid()::TEXT) = 'admin')
    );

-- Users policies
CREATE POLICY "Users can view users in their school"
    ON users FOR SELECT
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        school_id = get_user_school_id(auth.uid()::TEXT)
    );

CREATE POLICY "Admins can insert users in their school"
    ON users FOR INSERT
    WITH CHECK (
        is_superadmin(auth.uid()::TEXT) OR
        (school_id = get_user_school_id(auth.uid()::TEXT) AND get_user_role(auth.uid()::TEXT) IN ('admin', 'superadmin'))
    );

CREATE POLICY "Admins can update users in their school"
    ON users FOR UPDATE
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        (school_id = get_user_school_id(auth.uid()::TEXT) AND get_user_role(auth.uid()::TEXT) IN ('admin', 'superadmin'))
    );

-- Vehicles policies
CREATE POLICY "Users can view vehicles in their school"
    ON vehicles FOR SELECT
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        school_id = get_user_school_id(auth.uid()::TEXT)
    );

CREATE POLICY "Admins can manage vehicles in their school"
    ON vehicles FOR ALL
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        (school_id = get_user_school_id(auth.uid()::TEXT) AND get_user_role(auth.uid()::TEXT) IN ('admin', 'superadmin'))
    );

-- Drivers policies
CREATE POLICY "Users can view drivers in their school"
    ON drivers FOR SELECT
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        school_id = get_user_school_id(auth.uid()::TEXT)
    );

CREATE POLICY "Admins can manage drivers in their school"
    ON drivers FOR ALL
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        (school_id = get_user_school_id(auth.uid()::TEXT) AND get_user_role(auth.uid()::TEXT) IN ('admin', 'superadmin'))
    );

-- Passengers policies
CREATE POLICY "Users can view passengers in their school"
    ON passengers FOR SELECT
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        school_id = get_user_school_id(auth.uid()::TEXT)
    );

CREATE POLICY "Parents can view their own children"
    ON passengers FOR SELECT
    USING (
        -- FIX: Validate userId is a valid UUID before JSONB comparison
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.firebase_uid = auth.uid()::TEXT
            AND u.firebase_uid IS NOT NULL
            AND u.id IS NOT NULL
            AND passengers.guardians @> jsonb_build_array(jsonb_build_object('userId', u.id::text))
        )
    );

CREATE POLICY "Admins can manage passengers in their school"
    ON passengers FOR ALL
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        (school_id = get_user_school_id(auth.uid()::TEXT) AND get_user_role(auth.uid()::TEXT) IN ('admin', 'superadmin'))
    );

-- Routes policies
CREATE POLICY "Users can view routes in their school"
    ON routes FOR SELECT
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        school_id = get_user_school_id(auth.uid()::TEXT)
    );

CREATE POLICY "Admins can manage routes in their school"
    ON routes FOR ALL
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        (school_id = get_user_school_id(auth.uid()::TEXT) AND get_user_role(auth.uid()::TEXT) IN ('admin', 'superadmin'))
    );

-- Stops policies
CREATE POLICY "Users can view stops for routes in their school"
    ON stops FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM routes
            WHERE routes.id = stops.route_id
            AND (
                is_superadmin(auth.uid()::TEXT) OR
                routes.school_id = get_user_school_id(auth.uid()::TEXT)
            )
        )
    );

CREATE POLICY "Admins can manage stops"
    ON stops FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM routes
            WHERE routes.id = stops.route_id
            AND (
                is_superadmin(auth.uid()::TEXT) OR
                (routes.school_id = get_user_school_id(auth.uid()::TEXT) AND get_user_role(auth.uid()::TEXT) IN ('admin', 'superadmin'))
            )
        )
    );

-- Trips policies
CREATE POLICY "Users can view trips in their school"
    ON trips FOR SELECT
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        school_id = get_user_school_id(auth.uid()::TEXT)
    );

CREATE POLICY "Drivers can view their own trips"
    ON trips FOR SELECT
    USING (
        driver_id IN (SELECT id FROM drivers WHERE user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()::TEXT))
    );

CREATE POLICY "Admins and Drivers can manage trips"
    ON trips FOR ALL
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        (school_id = get_user_school_id(auth.uid()::TEXT) AND get_user_role(auth.uid()::TEXT) IN ('admin', 'driver', 'superadmin'))
    );

-- Trip events policies
CREATE POLICY "Users can view trip events in their school"
    ON trip_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trips
            WHERE trips.id = trip_events.trip_id
            AND (
                is_superadmin(auth.uid()::TEXT) OR
                trips.school_id = get_user_school_id(auth.uid()::TEXT)
            )
        )
    );

CREATE POLICY "Drivers can create trip events for their trips"
    ON trip_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trips
            JOIN drivers ON trips.driver_id = drivers.id
            WHERE trips.id = trip_events.trip_id
            AND drivers.user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()::TEXT)
        )
    );

-- Photos policies
CREATE POLICY "Users can view photos for events in their school"
    ON photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trip_events
            JOIN trips ON trip_events.trip_id = trips.id
            WHERE trip_events.id = photos.trip_event_id
            AND (
                is_superadmin(auth.uid()::TEXT) OR
                trips.school_id = get_user_school_id(auth.uid()::TEXT)
            )
        )
    );

CREATE POLICY "Parents can view photos of their children"
    ON photos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trip_events
            JOIN passengers ON trip_events.passenger_id = passengers.id
            WHERE trip_events.id = photos.trip_event_id
            AND passengers.guardians @> jsonb_build_array(jsonb_build_object('userId', (SELECT id FROM users WHERE firebase_uid = auth.uid()::TEXT)))
        )
    );

-- Audit log policies
CREATE POLICY "Admins can view audit log for their school"
    ON audit_log FOR SELECT
    USING (
        is_superadmin(auth.uid()::TEXT) OR
        (school_id = get_user_school_id(auth.uid()::TEXT) AND get_user_role(auth.uid()::TEXT) IN ('admin', 'staff', 'superadmin'))
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (
        recipient_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()::TEXT)
    );

-- Push subscriptions policies
CREATE POLICY "Users can manage their own push subscriptions"
    ON push_subscriptions FOR ALL
    USING (
        user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()::TEXT)
    );

-- Driver locations policies
CREATE POLICY "Users can view driver locations in their school"
    ON driver_locations FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM drivers
            WHERE drivers.id = driver_locations.driver_id
            AND (
                is_superadmin(auth.uid()::TEXT) OR
                drivers.school_id = get_user_school_id(auth.uid()::TEXT)
            )
        )
    );

CREATE POLICY "Drivers can insert their own location"
    ON driver_locations FOR INSERT
    WITH CHECK (
        driver_id IN (SELECT id FROM drivers WHERE user_id = (SELECT id FROM users WHERE firebase_uid = auth.uid()::TEXT))
    );
