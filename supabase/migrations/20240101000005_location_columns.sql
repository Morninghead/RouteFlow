-- Add lat/lng to schools (depot location for route optimization)
ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS school_lat FLOAT8,
  ADD COLUMN IF NOT EXISTS school_lng FLOAT8;

-- Add lat/lng float columns to passengers for easy API access
ALTER TABLE passengers
  ADD COLUMN IF NOT EXISTS home_lat FLOAT8,
  ADD COLUMN IF NOT EXISTS home_lng FLOAT8,
  ALTER COLUMN location DROP NOT NULL;

-- Add base location to vehicles (driver start point)
ALTER TABLE vehicles
  ADD COLUMN IF NOT EXISTS base_lat FLOAT8,
  ADD COLUMN IF NOT EXISTS base_lng FLOAT8;

-- Trigger: auto-sync home_lat/home_lng → location geography
CREATE OR REPLACE FUNCTION sync_passenger_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.home_lat IS NOT NULL AND NEW.home_lng IS NOT NULL THEN
    NEW.location = ST_MakePoint(NEW.home_lng, NEW.home_lat)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_passenger_location ON passengers;
CREATE TRIGGER trg_sync_passenger_location
  BEFORE INSERT OR UPDATE ON passengers
  FOR EACH ROW EXECUTE FUNCTION sync_passenger_location();

-- Index for fast lat/lng queries
CREATE INDEX IF NOT EXISTS idx_passengers_home_lat_lng ON passengers(home_lat, home_lng)
  WHERE home_lat IS NOT NULL AND home_lng IS NOT NULL;
