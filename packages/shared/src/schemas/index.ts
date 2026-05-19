import { z } from 'zod';

export const roleSchema = z.enum(['superadmin', 'admin', 'staff', 'driver', 'parent']);

export const vehicleTypeSchema = z.enum(['van', 'bus', 'car']);

export const titleTHSchema = z.enum(['นาย', 'นาง', 'นางสาว', 'ด.ช.', 'ด.ญ.']);

export const locationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().optional(),
});

export const userSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid().optional(),
  role: roleSchema,
  email: z.string().email().optional(),
  phoneNumber: z.string().min(10).optional(),
  lineUserId: z.string().optional(),
  displayName: z.string().optional(),
  pictureUrl: z.string().url().optional(),
  title: titleTHSchema.optional(),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  status: z.enum(['active', 'inactive', 'pending']),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastVerifiedAt: z.date().optional(),
  lastLoginAt: z.date().optional(),
});

export const schoolConfigSchema = z.object({
  form: z.object({
    passenger: z.object({
      fields: z.array(z.any()),
    }),
    driver: z.object({
      fields: z.array(z.any()),
    }),
  }),
  driver: z.object({
    reverifyEverySeconds: z.number().default(2592000),
  }),
  proofPhoto: z.object({
    requiredOn: z.enum(['none', 'pickup', 'dropoff', 'both']),
  }),
  notifications: z.object({
    telegram: z.boolean(),
    line: z.boolean(),
    webPush: z.boolean(),
  }),
});

export const schoolSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  nameEn: z.string().optional(),
  address: z.string().min(1),
  location: locationSchema,
  primaryColor: z.string().optional(),
  logoUrl: z.string().url().optional(),
  telegramBotToken: z.string().optional(),
  lineChannelAccessToken: z.string().optional(),
  lineChannelSecret: z.string().optional(),
  config: schoolConfigSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const vehicleSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  name: z.string().min(1),
  type: vehicleTypeSchema,
  licensePlate: z.string().min(1),
  maxPassengers: z.number().min(1).max(100),
  telegramChatId: z.string().optional(),
  lineGroupId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const guardianSchema = z.object({
  id: z.string().uuid(),
  title: titleTHSchema.optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().min(10),
  relationship: z.string().min(1),
  isPrimary: z.boolean(),
  userId: z.string().uuid().optional(),
});

export const passengerSchema = z.object({
  id: z.string().uuid(),
  schoolId: z.string().uuid(),
  title: titleTHSchema.optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phoneNumber: z.string().min(10),
  address: z.string().min(1),
  location: locationSchema,
  grade: z.string().optional(),
  guardians: z.array(guardianSchema),
  vehicleId: z.string().uuid().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const driverSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  schoolId: z.string().uuid(),
  vehicleId: z.string().uuid().optional(),
  licenseNumber: z.string().min(1),
  licenseExpiry: z.date(),
  emergencyContact: z.string().min(10),
  createdAt: z.date(),
  updatedAt: z.date(),
});
