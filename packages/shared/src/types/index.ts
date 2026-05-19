export type Role = 'superadmin' | 'admin' | 'staff' | 'driver' | 'parent';

export type VehicleType = 'van' | 'bus' | 'car';

export type TitleTH = 'นาย' | 'นาง' | 'นางสาว' | 'ด.ช.' | 'ด.ญ.';

export interface User {
  id: string;
  schoolId: string;
  role: Role;
  email?: string;
  phoneNumber: string;
  title?: TitleTH;
  firstName: string;
  lastName: string;
  createdAt: Date;
  updatedAt: Date;
  lastVerifiedAt?: Date;
}

export interface School {
  id: string;
  name: string;
  nameEn?: string;
  address: string;
  location: Location;
  primaryColor?: string;
  logoUrl?: string;
  telegramBotToken?: string;
  lineChannelAccessToken?: string;
  lineChannelSecret?: string;
  config: SchoolConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolConfig {
  form: {
    passenger: {
      fields: FormField[];
    };
    driver: {
      fields: FormField[];
    };
  };
  driver: {
    reverifyEverySeconds: number;
  };
  proofPhoto: {
    requiredOn: 'none' | 'pickup' | 'dropoff' | 'both';
  };
  notifications: {
    telegram: boolean;
    line: boolean;
    webPush: boolean;
  };
}

export interface FormField {
  name: string;
  label: string;
  labelEn?: string;
  type: 'text' | 'textarea' | 'select' | 'tel' | 'location';
  required: boolean;
  options?: string[];
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Vehicle {
  id: string;
  schoolId: string;
  name: string;
  type: VehicleType;
  licensePlate: string;
  maxPassengers: number;
  telegramChatId?: string;
  lineGroupId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Driver {
  id: string;
  userId: string;
  schoolId: string;
  vehicleId?: string;
  licenseNumber: string;
  licenseExpiry: Date;
  emergencyContact: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Passenger {
  id: string;
  schoolId: string;
  title?: TitleTH;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: string;
  location: Location;
  grade?: string;
  guardians: Guardian[];
  vehicleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Guardian {
  id: string;
  title?: TitleTH;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
  userId?: string;
}

export interface Route {
  id: string;
  schoolId: string;
  vehicleId: string;
  name: string;
  type: 'pickup' | 'dropoff';
  stops: Stop[];
  totalDistance: number;
  estimatedDuration: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Stop {
  id: string;
  routeId: string;
  passengerId: string;
  sequence: number;
  location: Location;
  estimatedArrival?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Trip {
  id: string;
  schoolId: string;
  routeId: string;
  driverId: string;
  vehicleId: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface TripEvent {
  id: string;
  tripId: string;
  stopId: string;
  passengerId: string;
  type: 'pickup' | 'dropoff' | 'no_show' | 'incident';
  timestamp: Date;
  location?: Location;
  photoUrl?: string;
  notes?: string;
  createdAt: Date;
}

export interface Photo {
  id: string;
  tripEventId: string;
  url: string;
  thumbnailUrl?: string;
  location: Location;
  timestamp: Date;
  metadata: {
    width: number;
    height: number;
    size: number;
  };
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  schoolId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, any>;
  timestamp: Date;
}

export interface Notification {
  id: string;
  schoolId: string;
  recipientId: string;
  channel: 'telegram' | 'line' | 'web_push';
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed';
  createdAt: Date;
}
