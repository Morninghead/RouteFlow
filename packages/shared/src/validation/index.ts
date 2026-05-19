import { z } from 'zod';

// Input validation schemas for API endpoints
export const createSchoolSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(500),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  email: z.string().email().optional(),
  settings: z.object({
    otpIntervalMinutes: z.number().int().min(1).max(60).default(15),
    requirePhotoProof: z.boolean().default(true),
    notificationChannels: z.array(z.enum(['telegram', 'line', 'fcm'])).default(['fcm']),
  }).optional(),
});

export const createUserSchema = z.object({
  firebaseUid: z.string().min(1).max(128),
  schoolId: z.string().uuid(),
  role: z.enum(['superadmin', 'admin', 'staff', 'driver', 'parent']),
  name: z.string().min(1).max(255),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  email: z.string().email().optional(),
});

export const createVehicleSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(1).max(255),
  licensePlate: z.string().min(1).max(50),
  capacity: z.number().int().min(1).max(100),
  type: z.enum(['van', 'bus', 'minibus']),
  status: z.enum(['active', 'inactive', 'maintenance']).default('active'),
});

export const createDriverSchema = z.object({
  schoolId: z.string().uuid(),
  userId: z.string().uuid(),
  licenseNumber: z.string().min(1).max(50),
  licenseExpiry: z.string().datetime(),
});

export const createPassengerSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(1).max(255),
  grade: z.string().min(1).max(50).optional(),
  pickupLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional(),
  }),
  dropoffLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional(),
  }),
  guardians: z.array(z.object({
    userId: z.string().uuid(),
    name: z.string().min(1).max(255),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
    relationship: z.string().min(1).max(50),
  })).min(1),
});

export const createRouteSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(1).max(255),
  vehicleId: z.string().uuid(),
  direction: z.enum(['pickup', 'dropoff']),
  active: z.boolean().default(true),
});

export const createStopSchema = z.object({
  routeId: z.string().uuid(),
  passengerId: z.string().uuid(),
  sequence: z.number().int().min(0),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().optional(),
  }),
  estimatedArrival: z.string().datetime().optional(),
});

export const createTripSchema = z.object({
  schoolId: z.string().uuid(),
  routeId: z.string().uuid(),
  driverId: z.string().uuid(),
  vehicleId: z.string().uuid(),
  scheduledDate: z.string().datetime(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).default('scheduled'),
});

export const createTripEventSchema = z.object({
  tripId: z.string().uuid(),
  stopId: z.string().uuid(),
  passengerId: z.string().uuid(),
  eventType: z.enum(['pickup', 'dropoff', 'no_show', 'delay']),
  timestamp: z.string().datetime(),
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }).optional(),
  notes: z.string().max(1000).optional(),
});

// Validation helper
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${messages}`);
    }
    throw error;
  }
}

// Export all schemas
export const schemas = {
  createSchool: createSchoolSchema,
  createUser: createUserSchema,
  createVehicle: createVehicleSchema,
  createDriver: createDriverSchema,
  createPassenger: createPassengerSchema,
  createRoute: createRouteSchema,
  createStop: createStopSchema,
  createTrip: createTripSchema,
  createTripEvent: createTripEventSchema,
};
