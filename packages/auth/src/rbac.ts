import type { Role } from '@repo/shared';

export const ROLE_HIERARCHY: Record<Role, number> = {
  superadmin: 5,
  admin: 4,
  staff: 3,
  driver: 2,
  parent: 1,
};

export function hasPermission(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function canAccessSchool(userRole: Role, userSchoolId: string, targetSchoolId: string): boolean {
  if (userRole === 'superadmin') return true;
  return userSchoolId === targetSchoolId;
}

export const PERMISSIONS = {
  schools: {
    create: ['superadmin'],
    read: ['superadmin', 'admin', 'staff', 'driver', 'parent'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin'],
  },
  users: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  vehicles: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff', 'driver', 'parent'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  drivers: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  passengers: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff', 'driver', 'parent'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  routes: {
    create: ['superadmin', 'admin'],
    read: ['superadmin', 'admin', 'staff', 'driver', 'parent'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
  trips: {
    create: ['superadmin', 'admin', 'driver'],
    read: ['superadmin', 'admin', 'staff', 'driver', 'parent'],
    update: ['superadmin', 'admin', 'driver'],
    delete: ['superadmin', 'admin'],
  },
  tripEvents: {
    create: ['superadmin', 'admin', 'driver'],
    read: ['superadmin', 'admin', 'staff', 'driver', 'parent'],
    update: ['superadmin', 'admin'],
    delete: ['superadmin', 'admin'],
  },
} as const;

export function canPerformAction(
  userRole: Role,
  resource: keyof typeof PERMISSIONS,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  const allowedRoles = PERMISSIONS[resource]?.[action] || [];
  return allowedRoles.includes(userRole);
}
