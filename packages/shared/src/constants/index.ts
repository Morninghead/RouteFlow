export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  STAFF: 'staff',
  DRIVER: 'driver',
  PARENT: 'parent',
} as const;

export const VEHICLE_TYPES = {
  VAN: 'van',
  BUS: 'bus',
  CAR: 'car',
} as const;

export const DEFAULT_VEHICLE_CAPACITY = {
  van: 12,
  bus: 45,
  car: 4,
} as const;

export const TITLES_TH = {
  MR: 'นาย',
  MRS: 'นาง',
  MISS: 'นางสาว',
  BOY: 'ด.ช.',
  GIRL: 'ด.ญ.',
} as const;

export const NOTIFICATION_CHANNELS = {
  TELEGRAM: 'telegram',
  LINE: 'line',
  WEB_PUSH: 'web_push',
} as const;

export const TRIP_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const EVENT_TYPES = {
  PICKUP: 'pickup',
  DROPOFF: 'dropoff',
  NO_SHOW: 'no_show',
  INCIDENT: 'incident',
} as const;
