import type { SupabaseClient } from '@supabase/supabase-js';
import type { StorageAdapter } from './adapter';
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
import { validateInput, schemas } from '@repo/shared/validation';

export class SupabaseAdapter implements StorageAdapter {
  constructor(private supabase: SupabaseClient) {}

  schools = {
    list: async (): Promise<School[]> => {
      const { data, error } = await this.supabase.from('schools').select('*');
      if (error) throw error;
      return data.map(this.mapSchool);
    },

    get: async (id: string): Promise<School | null> => {
      const { data, error } = await this.supabase
        .from('schools')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return this.mapSchool(data);
    },

    create: async (input: Omit<School, 'id' | 'createdAt' | 'updatedAt'>): Promise<School> => {
      // Validate input
      const validated = validateInput(schemas.createSchool, input);
      
      const { data, error } = await this.supabase
        .from('schools')
        .insert(this.unmapSchool(validated))
        .select()
        .single();
      if (error) throw error;
      return this.mapSchool(data);
    },

    update: async (id: string, input: Partial<School>): Promise<School> => {
      const { data, error } = await this.supabase
        .from('schools')
        .update(this.unmapSchool(input))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.mapSchool(data);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await this.supabase.from('schools').delete().eq('id', id);
      if (error) throw error;
    },
  };

  users = {
    list: async (schoolId?: string): Promise<User[]> => {
      let query = this.supabase.from('users').select('*');
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data.map(this.mapUser);
    },

    get: async (id: string): Promise<User | null> => {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return this.mapUser(data);
    },

    getByFirebaseUid: async (firebaseUid: string): Promise<User | null> => {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();
      if (error) return null;
      return this.mapUser(data);
    },

    getByLineUserId: async (lineUserId: string): Promise<User | null> => {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('line_user_id', lineUserId)
        .single();
      if (error) return null;
      return this.mapUser(data);
    },

    create: async (input: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
      const { data, error } = await this.supabase
        .from('users')
        .insert(this.unmapUser(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapUser(data);
    },

    update: async (id: string, input: Partial<User>): Promise<User> => {
      const { data, error } = await this.supabase
        .from('users')
        .update(this.unmapUser(input))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.mapUser(data);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await this.supabase.from('users').delete().eq('id', id);
      if (error) throw error;
    },
  };

  vehicles = {
    list: async (schoolId: string): Promise<Vehicle[]> => {
      const { data, error } = await this.supabase
        .from('vehicles')
        .select('*')
        .eq('school_id', schoolId);
      if (error) throw error;
      return data.map(this.mapVehicle);
    },

    get: async (id: string): Promise<Vehicle | null> => {
      const { data, error } = await this.supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return this.mapVehicle(data);
    },

    create: async (input: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> => {
      const { data, error } = await this.supabase
        .from('vehicles')
        .insert(this.unmapVehicle(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapVehicle(data);
    },

    update: async (id: string, input: Partial<Vehicle>): Promise<Vehicle> => {
      const { data, error } = await this.supabase
        .from('vehicles')
        .update(this.unmapVehicle(input))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.mapVehicle(data);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await this.supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
    },
  };

  drivers = {
    list: async (schoolId: string): Promise<Driver[]> => {
      const { data, error } = await this.supabase
        .from('drivers')
        .select('*')
        .eq('school_id', schoolId);
      if (error) throw error;
      return data.map(this.mapDriver);
    },

    get: async (id: string): Promise<Driver | null> => {
      const { data, error } = await this.supabase
        .from('drivers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return this.mapDriver(data);
    },

    getByUserId: async (userId: string): Promise<Driver | null> => {
      const { data, error } = await this.supabase
        .from('drivers')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) return null;
      return this.mapDriver(data);
    },

    create: async (input: Omit<Driver, 'id' | 'createdAt' | 'updatedAt'>): Promise<Driver> => {
      const { data, error } = await this.supabase
        .from('drivers')
        .insert(this.unmapDriver(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapDriver(data);
    },

    update: async (id: string, input: Partial<Driver>): Promise<Driver> => {
      const { data, error } = await this.supabase
        .from('drivers')
        .update(this.unmapDriver(input))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.mapDriver(data);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await this.supabase.from('drivers').delete().eq('id', id);
      if (error) throw error;
    },
  };

  passengers = {
    list: async (schoolId: string): Promise<Passenger[]> => {
      const { data, error } = await this.supabase
        .from('passengers')
        .select('*')
        .eq('school_id', schoolId);
      if (error) throw error;
      return data.map(this.mapPassenger);
    },

    get: async (id: string): Promise<Passenger | null> => {
      const { data, error } = await this.supabase
        .from('passengers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return this.mapPassenger(data);
    },

    create: async (input: Omit<Passenger, 'id' | 'createdAt' | 'updatedAt'>): Promise<Passenger> => {
      const { data, error } = await this.supabase
        .from('passengers')
        .insert(this.unmapPassenger(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapPassenger(data);
    },

    update: async (id: string, input: Partial<Passenger>): Promise<Passenger> => {
      const { data, error } = await this.supabase
        .from('passengers')
        .update(this.unmapPassenger(input))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.mapPassenger(data);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await this.supabase.from('passengers').delete().eq('id', id);
      if (error) throw error;
    },
  };

  routes = {
    list: async (schoolId: string): Promise<Route[]> => {
      const { data, error } = await this.supabase
        .from('routes')
        .select('*')
        .eq('school_id', schoolId);
      if (error) throw error;
      return data.map(this.mapRoute);
    },

    get: async (id: string): Promise<Route | null> => {
      const { data, error } = await this.supabase
        .from('routes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return this.mapRoute(data);
    },

    create: async (input: Omit<Route, 'id' | 'createdAt' | 'updatedAt'>): Promise<Route> => {
      const { data, error } = await this.supabase
        .from('routes')
        .insert(this.unmapRoute(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapRoute(data);
    },

    update: async (id: string, input: Partial<Route>): Promise<Route> => {
      const { data, error } = await this.supabase
        .from('routes')
        .update(this.unmapRoute(input))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.mapRoute(data);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await this.supabase.from('routes').delete().eq('id', id);
      if (error) throw error;
    },
  };

  stops = {
    list: async (routeId: string): Promise<Stop[]> => {
      const { data, error } = await this.supabase
        .from('stops')
        .select('*')
        .eq('route_id', routeId)
        .order('sequence');
      if (error) throw error;
      return data.map(this.mapStop);
    },

    get: async (id: string): Promise<Stop | null> => {
      const { data, error } = await this.supabase
        .from('stops')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return this.mapStop(data);
    },

    create: async (input: Omit<Stop, 'id' | 'createdAt' | 'updatedAt'>): Promise<Stop> => {
      const { data, error } = await this.supabase
        .from('stops')
        .insert(this.unmapStop(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapStop(data);
    },

    update: async (id: string, input: Partial<Stop>): Promise<Stop> => {
      const { data, error } = await this.supabase
        .from('stops')
        .update(this.unmapStop(input))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.mapStop(data);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await this.supabase.from('stops').delete().eq('id', id);
      if (error) throw error;
    },
  };

  trips = {
    list: async (schoolId: string, filters?: { date?: Date; status?: string }): Promise<Trip[]> => {
      let query = this.supabase.from('trips').select('*').eq('school_id', schoolId);
      
      if (filters?.date) {
        query = query.eq('date', filters.date.toISOString().split('T')[0]);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(this.mapTrip);
    },

    get: async (id: string): Promise<Trip | null> => {
      const { data, error } = await this.supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return this.mapTrip(data);
    },

    create: async (input: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trip> => {
      const { data, error } = await this.supabase
        .from('trips')
        .insert(this.unmapTrip(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapTrip(data);
    },

    update: async (id: string, input: Partial<Trip>): Promise<Trip> => {
      const { data, error } = await this.supabase
        .from('trips')
        .update(this.unmapTrip(input))
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return this.mapTrip(data);
    },

    delete: async (id: string): Promise<void> => {
      const { error } = await this.supabase.from('trips').delete().eq('id', id);
      if (error) throw error;
    },
  };

  tripEvents = {
    list: async (tripId: string): Promise<TripEvent[]> => {
      const { data, error } = await this.supabase
        .from('trip_events')
        .select('*')
        .eq('trip_id', tripId)
        .order('timestamp');
      if (error) throw error;
      return data.map(this.mapTripEvent);
    },

    get: async (id: string): Promise<TripEvent | null> => {
      const { data, error } = await this.supabase
        .from('trip_events')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return this.mapTripEvent(data);
    },

    create: async (input: Omit<TripEvent, 'id' | 'createdAt'>): Promise<TripEvent> => {
      const { data, error } = await this.supabase
        .from('trip_events')
        .insert(this.unmapTripEvent(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapTripEvent(data);
    },
  };

  photos = {
    get: async (id: string): Promise<Photo | null> => {
      const { data, error } = await this.supabase
        .from('photos')
        .select('*')
        .eq('id', id)
        .single();
      if (error) return null;
      return this.mapPhoto(data);
    },

    create: async (input: Omit<Photo, 'id' | 'createdAt'>): Promise<Photo> => {
      const { data, error } = await this.supabase
        .from('photos')
        .insert(this.unmapPhoto(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapPhoto(data);
    },

    uploadFile: async (file: File, path: string): Promise<string> => {
      const { data, error } = await this.supabase.storage
        .from('photos')
        .upload(path, file);
      if (error) throw error;
      return data.path;
    },

    getSignedUrl: async (path: string, expiresIn = 3600): Promise<string> => {
      const { data, error } = await this.supabase.storage
        .from('photos')
        .createSignedUrl(path, expiresIn);
      if (error) throw error;
      return data.signedUrl;
    },
  };

  auditLog = {
    list: async (schoolId: string, filters?: { userId?: string; resource?: string }): Promise<AuditLog[]> => {
      let query = this.supabase.from('audit_log').select('*').eq('school_id', schoolId);
      
      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.resource) {
        query = query.eq('resource', filters.resource);
      }

      const { data, error } = await query.order('timestamp', { ascending: false }).limit(100);
      if (error) throw error;
      return data.map(this.mapAuditLog);
    },

    create: async (input: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> => {
      const { data, error } = await this.supabase
        .from('audit_log')
        .insert(this.unmapAuditLog(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapAuditLog(data);
    },
  };

  notifications = {
    list: async (recipientId: string): Promise<Notification[]> => {
      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data.map(this.mapNotification);
    },

    create: async (input: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> => {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert(this.unmapNotification(input))
        .select()
        .single();
      if (error) throw error;
      return this.mapNotification(data);
    },

    markAsSent: async (id: string): Promise<void> => {
      const { error } = await this.supabase
        .from('notifications')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
  };

  private mapSchool = (row: any): School => ({
    id: row.id,
    name: row.name,
    nameEn: row.name_en,
    address: row.address,
    location: this.parseLocation(row.location),
    primaryColor: row.primary_color,
    logoUrl: row.logo_url,
    telegramBotToken: row.telegram_bot_token,
    lineChannelAccessToken: row.line_channel_access_token,
    lineChannelSecret: row.line_channel_secret,
    config: row.config,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  private unmapSchool = (input: any): any => ({
    name: input.name,
    name_en: input.nameEn,
    address: input.address,
    location: input.location ? `POINT(${input.location.lng} ${input.location.lat})` : undefined,
    primary_color: input.primaryColor,
    logo_url: input.logoUrl,
    telegram_bot_token: input.telegramBotToken,
    line_channel_access_token: input.lineChannelAccessToken,
    line_channel_secret: input.lineChannelSecret,
    config: input.config,
  });

  private mapUser = (row: any): User => ({
    id: row.id,
    schoolId: row.school_id,
    role: row.role,
    email: row.email,
    phoneNumber: row.phone_number,
    lineUserId: row.line_user_id,
    displayName: row.display_name,
    pictureUrl: row.picture_url,
    title: row.title,
    firstName: row.first_name,
    lastName: row.last_name,
    status: row.status || 'active',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    lastVerifiedAt: row.last_verified_at ? new Date(row.last_verified_at) : undefined,
    lastLoginAt: row.last_login_at ? new Date(row.last_login_at) : undefined,
  });

  private unmapUser = (input: any): any => ({
    school_id: input.schoolId,
    firebase_uid: input.firebaseUid,
    line_user_id: input.lineUserId,
    role: input.role,
    email: input.email,
    phone_number: input.phoneNumber,
    display_name: input.displayName,
    picture_url: input.pictureUrl,
    title: input.title,
    first_name: input.firstName,
    last_name: input.lastName,
    status: input.status,
    last_verified_at: input.lastVerifiedAt?.toISOString(),
    last_login_at: input.lastLoginAt?.toISOString(),
  });

  private mapVehicle = (row: any): Vehicle => ({
    id: row.id,
    schoolId: row.school_id,
    name: row.name,
    type: row.type,
    licensePlate: row.license_plate,
    maxPassengers: row.max_passengers,
    telegramChatId: row.telegram_chat_id,
    lineGroupId: row.line_group_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  private unmapVehicle = (input: any): any => ({
    school_id: input.schoolId,
    name: input.name,
    type: input.type,
    license_plate: input.licensePlate,
    max_passengers: input.maxPassengers,
    telegram_chat_id: input.telegramChatId,
    line_group_id: input.lineGroupId,
  });

  private mapDriver = (row: any): Driver => ({
    id: row.id,
    userId: row.user_id,
    schoolId: row.school_id,
    vehicleId: row.vehicle_id,
    licenseNumber: row.license_number,
    licenseExpiry: new Date(row.license_expiry),
    emergencyContact: row.emergency_contact,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  private unmapDriver = (input: any): any => ({
    user_id: input.userId,
    school_id: input.schoolId,
    vehicle_id: input.vehicleId,
    license_number: input.licenseNumber,
    license_expiry: input.licenseExpiry instanceof Date ? input.licenseExpiry.toISOString().split('T')[0] : input.licenseExpiry,
    emergency_contact: input.emergencyContact,
  });

  private mapPassenger = (row: any): Passenger => ({
    id: row.id,
    schoolId: row.school_id,
    title: row.title,
    firstName: row.first_name,
    lastName: row.last_name,
    phoneNumber: row.phone_number,
    address: row.address,
    location: this.parseLocation(row.location),
    grade: row.grade,
    guardians: row.guardians || [],
    vehicleId: row.vehicle_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  private unmapPassenger = (input: any): any => ({
    school_id: input.schoolId,
    title: input.title,
    first_name: input.firstName,
    last_name: input.lastName,
    phone_number: input.phoneNumber,
    address: input.address,
    location: input.location ? `POINT(${input.location.lng} ${input.location.lat})` : undefined,
    grade: input.grade,
    guardians: input.guardians,
    vehicle_id: input.vehicleId,
  });

  private mapRoute = (row: any): Route => ({
    id: row.id,
    schoolId: row.school_id,
    vehicleId: row.vehicle_id,
    name: row.name,
    type: row.type as 'pickup' | 'dropoff',
    stops: row.stops || [],
    totalDistance: row.total_distance,
    estimatedDuration: row.estimated_duration,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  private unmapRoute = (input: any): any => ({
    school_id: input.schoolId,
    vehicle_id: input.vehicleId,
    name: input.name,
    type: input.type,
    stops: input.stops,
    total_distance: input.totalDistance,
    estimated_duration: input.estimatedDuration,
    is_active: input.isActive,
  });

  private mapStop = (row: any): Stop => ({
    id: row.id,
    routeId: row.route_id,
    passengerId: row.passenger_id,
    sequence: row.sequence,
    location: this.parseLocation(row.location),
    estimatedArrival: row.estimated_arrival ? new Date(row.estimated_arrival) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  private unmapStop = (input: any): any => ({
    route_id: input.routeId,
    passenger_id: input.passengerId,
    sequence: input.sequence,
    location: input.location ? `POINT(${input.location.lng} ${input.location.lat})` : undefined,
    estimated_arrival: input.estimatedArrival?.toISOString(),
  });

  private mapTrip = (row: any): Trip => ({
    id: row.id,
    schoolId: row.school_id,
    routeId: row.route_id,
    driverId: row.driver_id,
    vehicleId: row.vehicle_id,
    date: new Date(row.date),
    startTime: row.start_time ? new Date(row.start_time) : undefined,
    endTime: row.end_time ? new Date(row.end_time) : undefined,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });

  private unmapTrip = (input: any): any => ({
    school_id: input.schoolId,
    route_id: input.routeId,
    driver_id: input.driverId,
    vehicle_id: input.vehicleId,
    date: input.date instanceof Date ? input.date.toISOString().split('T')[0] : input.date,
    start_time: input.startTime?.toISOString(),
    end_time: input.endTime?.toISOString(),
    status: input.status,
  });

  private mapTripEvent = (row: any): TripEvent => ({
    id: row.id,
    tripId: row.trip_id,
    stopId: row.stop_id,
    passengerId: row.passenger_id,
    type: row.type,
    timestamp: new Date(row.timestamp),
    location: row.location ? this.parseLocation(row.location) : undefined,
    photoUrl: row.photo_url,
    notes: row.notes,
    createdAt: new Date(row.created_at),
  });

  private unmapTripEvent = (input: any): any => ({
    trip_id: input.tripId,
    stop_id: input.stopId,
    passenger_id: input.passengerId,
    type: input.type,
    timestamp: input.timestamp?.toISOString() || new Date().toISOString(),
    location: input.location ? `POINT(${input.location.lng} ${input.location.lat})` : undefined,
    photo_url: input.photoUrl,
    notes: input.notes,
  });

  private mapPhoto = (row: any): Photo => ({
    id: row.id,
    tripEventId: row.trip_event_id,
    url: row.url,
    thumbnailUrl: row.thumbnail_url,
    location: this.parseLocation(row.location),
    timestamp: new Date(row.timestamp),
    metadata: row.metadata || {},
    createdAt: new Date(row.created_at),
  });

  private unmapPhoto = (input: any): any => ({
    trip_event_id: input.tripEventId,
    url: input.url,
    thumbnail_url: input.thumbnailUrl,
    location: input.location ? `POINT(${input.location.lng} ${input.location.lat})` : undefined,
    timestamp: input.timestamp?.toISOString() || new Date().toISOString(),
    metadata: input.metadata,
  });

  private mapAuditLog = (row: any): AuditLog => ({
    id: row.id,
    schoolId: row.school_id,
    userId: row.user_id,
    action: row.action,
    resource: row.resource,
    resourceId: row.resource_id,
    changes: row.changes,
    timestamp: new Date(row.timestamp),
  });

  private unmapAuditLog = (input: any): any => ({
    school_id: input.schoolId,
    user_id: input.userId,
    action: input.action,
    resource: input.resource,
    resource_id: input.resourceId,
    changes: input.changes,
  });

  private mapNotification = (row: any): Notification => ({
    id: row.id,
    schoolId: row.school_id,
    recipientId: row.recipient_id,
    channel: row.channel,
    type: row.type,
    title: row.title,
    body: row.body,
    data: row.data,
    sentAt: row.sent_at ? new Date(row.sent_at) : undefined,
    status: row.status,
    createdAt: new Date(row.created_at),
  });

  private unmapNotification = (input: any): any => ({
    school_id: input.schoolId,
    recipient_id: input.recipientId,
    channel: input.channel,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data,
    sent_at: input.sentAt?.toISOString(),
    status: input.status,
  });

  private parseLocation(geom: any): { lat: number; lng: number } {
    if (!geom) return { lat: 0, lng: 0 };
    if (typeof geom === 'string') {
      const match = geom.match(/POINT\(([^ ]+) ([^ ]+)\)/);
      if (match) {
        return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) };
      }
    }
    if (geom.coordinates) {
      return { lng: geom.coordinates[0], lat: geom.coordinates[1] };
    }
    return { lat: 0, lng: 0 };
  }
}
