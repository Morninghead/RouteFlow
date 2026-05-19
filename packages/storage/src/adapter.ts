import type {
  School,
  User,
  Vehicle,
  Driver,
  Passenger,
  Route,
  Stop,
  Trip,
  TripEvent,
  Photo,
  AuditLog,
  Notification,
} from '@repo/shared';

export interface StorageAdapter {
  schools: {
    list(): Promise<School[]>;
    get(id: string): Promise<School | null>;
    create(data: Omit<School, 'id' | 'createdAt' | 'updatedAt'>): Promise<School>;
    update(id: string, data: Partial<School>): Promise<School>;
    delete(id: string): Promise<void>;
  };

  users: {
    list(schoolId: string): Promise<User[]>;
    get(id: string): Promise<User | null>;
    getByFirebaseUid(firebaseUid: string): Promise<User | null>;
    create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    delete(id: string): Promise<void>;
  };

  vehicles: {
    list(schoolId: string): Promise<Vehicle[]>;
    get(id: string): Promise<Vehicle | null>;
    create(data: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle>;
    update(id: string, data: Partial<Vehicle>): Promise<Vehicle>;
    delete(id: string): Promise<void>;
  };

  drivers: {
    list(schoolId: string): Promise<Driver[]>;
    get(id: string): Promise<Driver | null>;
    getByUserId(userId: string): Promise<Driver | null>;
    create(data: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver>;
    update(id: string, data: Partial<Driver>): Promise<Driver>;
    delete(id: string): Promise<void>;
  };

  passengers: {
    list(schoolId: string): Promise<Passenger[]>;
    get(id: string): Promise<Passenger | null>;
    create(data: Omit<Passenger, 'id' | 'createdAt' | 'updatedAt'>): Promise<Passenger>;
    update(id: string, data: Partial<Passenger>): Promise<Passenger>;
    delete(id: string): Promise<void>;
  };

  routes: {
    list(schoolId: string): Promise<Route[]>;
    get(id: string): Promise<Route | null>;
    create(data: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route>;
    update(id: string, data: Partial<Route>): Promise<Route>;
    delete(id: string): Promise<void>;
  };

  stops: {
    list(routeId: string): Promise<Stop[]>;
    get(id: string): Promise<Stop | null>;
    create(data: Omit<Stop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stop>;
    update(id: string, data: Partial<Stop>): Promise<Stop>;
    delete(id: string): Promise<void>;
  };

  trips: {
    list(schoolId: string, filters?: { date?: Date; status?: string }): Promise<Trip[]>;
    get(id: string): Promise<Trip | null>;
    create(data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip>;
    update(id: string, data: Partial<Trip>): Promise<Trip>;
    delete(id: string): Promise<void>;
  };

  tripEvents: {
    list(tripId: string): Promise<TripEvent[]>;
    get(id: string): Promise<TripEvent | null>;
    create(data: Omit<TripEvent, 'id' | 'createdAt'>): Promise<TripEvent>;
  };

  photos: {
    get(id: string): Promise<Photo | null>;
    create(data: Omit<Photo, 'id' | 'createdAt'>): Promise<Photo>;
    uploadFile(file: File, path: string): Promise<string>;
    getSignedUrl(path: string, expiresIn?: number): Promise<string>;
  };

  auditLog: {
    list(schoolId: string, filters?: { userId?: string; resource?: string }): Promise<AuditLog[]>;
    create(data: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog>;
  };

  notifications: {
    list(recipientId: string): Promise<Notification[]>;
    create(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
    markAsSent(id: string): Promise<void>;
  };
}
