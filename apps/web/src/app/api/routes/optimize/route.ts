import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';
import { getServerUser } from '@/lib/session';
import { VRPSolver } from '@repo/routing';

// Configurable via env (default 40 km/h urban speed)
const AVG_SPEED_KMH = Number(process.env.VRP_AVG_SPEED_KMH ?? 40);
const AUTO_ROUTE_TAG = process.env.VRP_ROUTE_TAG ?? '[AUTO]';

export async function POST() {
  // 1. Auth — derive school_id from session, never from request body
  const serverUser = await getServerUser();
  if (!serverUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!['superadmin', 'admin', 'staff'].includes(serverUser.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const school_id = serverUser.school_id;
  if (!school_id) {
    return NextResponse.json({ error: 'No school associated with this account' }, { status: 400 });
  }

  try {
    const db = createAdminClient();

    // 2. Get school with location in one query
    const { data: school, error: schoolError } = await db
      .from('schools')
      .select('id, name, school_lat, school_lng')
      .eq('id', school_id)
      .single();

    if (schoolError || !school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    if (!school.school_lat || !school.school_lng) {
      return NextResponse.json(
        { error: 'School location not set. Please configure school_lat/school_lng.' },
        { status: 400 }
      );
    }

    const depotLat: number = school.school_lat;
    const depotLng: number = school.school_lng;

    // 3. Passengers + vehicles in parallel
    const [passengersResult, vehiclesResult] = await Promise.all([
      db
        .from('passengers')
        .select('id, first_name, last_name, home_lat, home_lng')
        .eq('school_id', school_id)
        .not('home_lat', 'is', null)
        .not('home_lng', 'is', null),
      db
        .from('vehicles')
        .select('id, name, max_passengers, base_lat, base_lng')
        .eq('school_id', school_id),
    ]);

    if (passengersResult.error) {
      return NextResponse.json({ error: 'Failed to fetch passengers' }, { status: 500 });
    }
    if (!passengersResult.data || passengersResult.data.length === 0) {
      return NextResponse.json({ error: 'No passengers with location data found' }, { status: 400 });
    }
    if (vehiclesResult.error || !vehiclesResult.data || vehiclesResult.data.length === 0) {
      return NextResponse.json({ error: 'No vehicles found for this school' }, { status: 400 });
    }

    const passengers = passengersResult.data;
    const vehicles = vehiclesResult.data;

    // 4. Build VRP input
    const stops = passengers.map((p: any) => ({
      id: p.id,
      location: { lat: p.home_lat as number, lng: p.home_lng as number },
      passengerId: p.id,
      passengerName: `${p.first_name} ${p.last_name}`,
      demand: 1,
    }));

    const vrpVehicles = vehicles.map((v: any) => ({
      id: v.id,
      capacity: v.max_passengers,
      startLocation: {
        lat: v.base_lat ?? depotLat,
        lng: v.base_lng ?? depotLng,
      },
    }));

    // 5. Haversine distance matrix (no external API, no billing)
    const locs = stops.map((s: any) => s.location);
    const n = locs.length;
    const distMatrix: number[][] = Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (__, j) => haversineMeters(locs[i], locs[j]))
    );
    const durMatrix: number[][] = distMatrix.map(row =>
      row.map(d => Math.round((d / 1000 / AVG_SPEED_KMH) * 3600))
    );

    // 6. Solve VRP
    const solver = new VRPSolver();
    const routes = solver.solve(vrpVehicles, stops, distMatrix, durMatrix);

    // 7. Delete previous auto-generated routes (correct ilike syntax)
    await db
      .from('routes')
      .delete()
      .eq('school_id', school_id)
      .ilike('name', `${AUTO_ROUTE_TAG}%`);

    // 8. Bulk-build inserts
    const inserts = routes
      .filter((r: any) => r.stops.length > 0)
      .map((r: any) => {
        const vehicle = vehicles.find((v: any) => v.id === r.vehicleId);
        return {
          school_id,
          vehicle_id: r.vehicleId,
          name: `${AUTO_ROUTE_TAG} ${vehicle?.name ?? r.vehicleId} - รับนักเรียน`,
          type: 'pickup',
          stops: r.stops.map((s: any, idx: number) => ({
            sequence: idx + 1,
            passenger_id: s.passengerId,
            passenger_name: s.passengerName,
            lat: s.location.lat,
            lng: s.location.lng,
          })),
          total_distance: Math.round(r.totalDistance),
          estimated_duration: Math.round(r.totalDuration / 60),
          is_active: true,
        };
      });

    const { data: savedRoutes, error: insertError } = await db
      .from('routes')
      .insert(inserts)
      .select();

    if (insertError) {
      console.error('Route insert error:', insertError);
      return NextResponse.json({ error: 'Failed to save routes' }, { status: 500 });
    }

    const totalAssigned = routes.reduce((s: number, r: any) => s + r.stops.length, 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalPassengers: passengers.length,
        totalVehicles: inserts.length,
        unassignedPassengers: passengers.length - totalAssigned,
      },
      routes: (savedRoutes ?? []).map((saved: any, i: number) => ({
        ...saved,
        vehicleName: vehicles.find((v: any) => v.id === saved.vehicle_id)?.name,
        stopCount: saved.stops?.length ?? 0,
        totalDistanceKm: ((saved.total_distance ?? 0) / 1000).toFixed(1),
        estimatedDurationMin: saved.estimated_duration ?? 0,
      })),
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    return NextResponse.json({ error: 'Optimization failed' }, { status: 500 });
  }
}

function haversineMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6_371_000;
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
