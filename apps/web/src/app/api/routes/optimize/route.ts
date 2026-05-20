import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VRPSolver } from '@repo/routing';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { school_id } = body;

    if (!school_id) {
      return NextResponse.json({ error: 'school_id is required' }, { status: 400 });
    }

    // 1. Get school (depot location)
    const { data: school, error: schoolError } = await supabaseAdmin
      .from('schools')
      .select('id, name, address')
      .eq('id', school_id)
      .single();

    if (schoolError || !school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // 2. Get school location via coordinates stored in school (we'll use a default if none)
    // school's lat/lng stored as school_lat/school_lng or we use Thailand center
    const { data: schoolLoc } = await supabaseAdmin
      .from('schools')
      .select('school_lat, school_lng')
      .eq('id', school_id)
      .single();

    const depotLat: number = (schoolLoc as any)?.school_lat || 13.7563;
    const depotLng: number = (schoolLoc as any)?.school_lng || 100.5018;

    // 3. Get all passengers with home location for this school
    const { data: passengers, error: passengerError } = await supabaseAdmin
      .from('passengers')
      .select('id, first_name, last_name, home_lat, home_lng')
      .eq('school_id', school_id)
      .not('home_lat', 'is', null)
      .not('home_lng', 'is', null);

    if (passengerError) {
      return NextResponse.json({ error: 'Failed to fetch passengers' }, { status: 500 });
    }

    if (!passengers || passengers.length === 0) {
      return NextResponse.json({ error: 'No passengers with location data found' }, { status: 400 });
    }

    // 4. Get all vehicles for this school
    const { data: vehicles, error: vehicleError } = await supabaseAdmin
      .from('vehicles')
      .select('id, name, max_passengers, base_lat, base_lng')
      .eq('school_id', school_id);

    if (vehicleError || !vehicles || vehicles.length === 0) {
      return NextResponse.json({ error: 'No vehicles found for this school' }, { status: 400 });
    }

    // 5. Build VRP stops and vehicles
    const stops = passengers.map((p: any) => ({
      id: p.id,
      location: { lat: p.home_lat, lng: p.home_lng },
      passengerId: p.id,
      passengerName: `${p.first_name} ${p.last_name}`,
      demand: 1,
    }));

    const vrpVehicles = vehicles.map((v: any) => ({
      id: v.id,
      capacity: v.max_passengers,
      startLocation: {
        lat: v.base_lat || depotLat,
        lng: v.base_lng || depotLng,
      },
    }));

    // 6. Build distance matrix using Haversine (fast, no API key needed)
    const allLocations = stops.map((s: any) => s.location);
    const n = allLocations.length;
    const distMatrix: number[][] = [];
    const durMatrix: number[][] = [];

    for (let i = 0; i < n; i++) {
      distMatrix[i] = [];
      durMatrix[i] = [];
      for (let j = 0; j < n; j++) {
        const d = haversineMeters(allLocations[i], allLocations[j]);
        distMatrix[i][j] = d;
        durMatrix[i][j] = Math.round((d / 1000) / 40 * 3600); // ~40 km/h average speed
      }
    }

    // 7. Run VRP solver
    const solver = new VRPSolver();
    const routes = solver.solve(vrpVehicles, stops, distMatrix, durMatrix);

    // 8. Save routes to DB (delete old auto-generated routes first)
    await supabaseAdmin
      .from('routes')
      .delete()
      .eq('school_id', school_id)
      .eq('name', 'like', '[AUTO]%');

    const savedRoutes = [];
    for (const route of routes) {
      if (route.stops.length === 0) continue;

      const vehicle = vehicles.find((v: any) => v.id === route.vehicleId);
      const routeName = `[AUTO] ${vehicle?.name || route.vehicleId} - รับนักเรียน`;

      const stopsJson = route.stops.map((stop: any, idx: number) => ({
        sequence: idx + 1,
        passenger_id: stop.passengerId,
        passenger_name: stop.passengerName,
        lat: stop.location.lat,
        lng: stop.location.lng,
      }));

      const { data: savedRoute } = await supabaseAdmin
        .from('routes')
        .insert({
          school_id,
          vehicle_id: route.vehicleId,
          name: routeName,
          type: 'pickup',
          stops: stopsJson,
          total_distance: Math.round(route.totalDistance),
          estimated_duration: Math.round(route.totalDuration / 60), // minutes
          is_active: true,
        })
        .select()
        .single();

      savedRoutes.push({
        ...savedRoute,
        vehicleName: vehicle?.name,
        stopCount: route.stops.length,
        utilizationRate: route.utilizationRate,
        totalDistanceKm: (route.totalDistance / 1000).toFixed(1),
        estimatedDurationMin: Math.round(route.totalDuration / 60),
        stops: stopsJson,
      });
    }

    const unassigned = passengers.length - routes.reduce((sum: number, r: any) => sum + r.stops.length, 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalPassengers: passengers.length,
        totalVehicles: routes.filter((r: any) => r.stops.length > 0).length,
        unassignedPassengers: unassigned,
      },
      routes: savedRoutes,
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    return NextResponse.json({ error: 'Optimization failed' }, { status: 500 });
  }
}

function haversineMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180;
}
