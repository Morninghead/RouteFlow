-- Add performance indexes for frequently queried columns

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_school_role ON users(school_id, role);

-- Vehicles table indexes
CREATE INDEX IF NOT EXISTS idx_vehicles_school_id ON vehicles(school_id);
-- (no `status` column on vehicles in current schema)

-- Drivers table indexes
CREATE INDEX IF NOT EXISTS idx_drivers_school_id ON drivers(school_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);

-- Passengers table indexes
CREATE INDEX IF NOT EXISTS idx_passengers_school_id ON passengers(school_id);
CREATE INDEX IF NOT EXISTS idx_passengers_guardians ON passengers USING GIN(guardians);

-- Routes table indexes
CREATE INDEX IF NOT EXISTS idx_routes_school_id ON routes(school_id);
CREATE INDEX IF NOT EXISTS idx_routes_vehicle_id ON routes(vehicle_id);

-- Stops table indexes
CREATE INDEX IF NOT EXISTS idx_stops_route_id ON stops(route_id);
CREATE INDEX IF NOT EXISTS idx_stops_passenger_id ON stops(passenger_id);

-- Trips table indexes
CREATE INDEX IF NOT EXISTS idx_trips_school_id ON trips(school_id);
CREATE INDEX IF NOT EXISTS idx_trips_route_id ON trips(route_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver_id ON trips(driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_vehicle_id ON trips(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(date);

-- Trip events table indexes
CREATE INDEX IF NOT EXISTS idx_trip_events_trip_id ON trip_events(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_events_stop_id ON trip_events(stop_id);
CREATE INDEX IF NOT EXISTS idx_trip_events_passenger_id ON trip_events(passenger_id);
CREATE INDEX IF NOT EXISTS idx_trip_events_type ON trip_events(type);
CREATE INDEX IF NOT EXISTS idx_trip_events_timestamp ON trip_events(timestamp);

-- Photos table indexes
CREATE INDEX IF NOT EXISTS idx_photos_trip_event_id ON photos(trip_event_id);

-- Audit log table indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_school_id ON audit_log(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Push subscriptions table indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);

-- Driver locations table indexes
CREATE INDEX IF NOT EXISTS idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_locations_timestamp ON driver_locations(timestamp);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_trips_school_status ON trips(school_id, status);
CREATE INDEX IF NOT EXISTS idx_trips_driver_status ON trips(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_trip_events_trip_type ON trip_events(trip_id, event_type);
