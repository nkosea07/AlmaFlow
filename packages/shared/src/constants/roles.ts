export const RoleName = {
  ALUMNI_GUEST: "ALUMNI_GUEST",
  ACCOMMODATION_ADMIN: "ACCOMMODATION_ADMIN",
  HOUSEKEEPING_STAFF: "HOUSEKEEPING_STAFF",
  CATERING_STAFF: "CATERING_STAFF",
  SECURITY_ACCESS: "SECURITY_ACCESS",
  EVENT_COORDINATOR: "EVENT_COORDINATOR",
  FINANCE_ADMIN: "FINANCE_ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

export type RoleNameType = (typeof RoleName)[keyof typeof RoleName];

export const PermissionAction = {
  CREATE: "CREATE",
  READ: "READ",
  UPDATE: "UPDATE",
  DELETE: "DELETE",
} as const;

export type PermissionActionType =
  (typeof PermissionAction)[keyof typeof PermissionAction];

export const RESOURCES = {
  BOOKINGS: "bookings",
  ROOMS: "rooms",
  HOUSEKEEPING: "housekeeping",
  MEALS: "meals",
  MEAL_REDEMPTIONS: "meal_redemptions",
  INCIDENTS: "incidents",
  ACCESS: "access",
  POWER: "power",
  SPACES: "spaces",
  REPORTS: "reports",
  USERS: "users",
  EVENTS: "events",
  INVENTORY: "inventory",
  MAINTENANCE: "maintenance",
  NOTIFICATIONS: "notifications",
} as const;

export type ResourceType = (typeof RESOURCES)[keyof typeof RESOURCES];

/**
 * Default permissions per role.
 * Used by the seed script to populate the Permission table.
 */
export const ROLE_PERMISSIONS: Record<
  RoleNameType,
  Array<{ resource: ResourceType; actions: PermissionActionType[] }>
> = {
  ALUMNI_GUEST: [
    { resource: RESOURCES.BOOKINGS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.ROOMS, actions: ["READ"] },
    { resource: RESOURCES.MEALS, actions: ["READ"] },
    { resource: RESOURCES.MEAL_REDEMPTIONS, actions: ["READ"] },
    { resource: RESOURCES.INCIDENTS, actions: ["CREATE", "READ"] },
    { resource: RESOURCES.ACCESS, actions: ["READ"] },
    { resource: RESOURCES.EVENTS, actions: ["READ"] },
    { resource: RESOURCES.NOTIFICATIONS, actions: ["READ"] },
  ],
  ACCOMMODATION_ADMIN: [
    { resource: RESOURCES.BOOKINGS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.ROOMS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.HOUSEKEEPING, actions: ["READ"] },
    { resource: RESOURCES.MEALS, actions: ["READ"] },
    { resource: RESOURCES.MEAL_REDEMPTIONS, actions: ["READ"] },
    { resource: RESOURCES.INCIDENTS, actions: ["READ"] },
    { resource: RESOURCES.ACCESS, actions: ["READ"] },
    { resource: RESOURCES.POWER, actions: ["READ"] },
    { resource: RESOURCES.SPACES, actions: ["READ"] },
    { resource: RESOURCES.REPORTS, actions: ["READ"] },
    { resource: RESOURCES.EVENTS, actions: ["READ"] },
    { resource: RESOURCES.INVENTORY, actions: ["READ"] },
    { resource: RESOURCES.MAINTENANCE, actions: ["READ"] },
  ],
  HOUSEKEEPING_STAFF: [
    { resource: RESOURCES.BOOKINGS, actions: ["READ"] },
    { resource: RESOURCES.ROOMS, actions: ["READ"] },
    { resource: RESOURCES.HOUSEKEEPING, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.INCIDENTS, actions: ["CREATE", "READ"] },
    { resource: RESOURCES.INVENTORY, actions: ["READ", "UPDATE"] },
    { resource: RESOURCES.MAINTENANCE, actions: ["CREATE", "READ"] },
  ],
  CATERING_STAFF: [
    { resource: RESOURCES.MEALS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.MEAL_REDEMPTIONS, actions: ["CREATE", "READ", "UPDATE"] },
    { resource: RESOURCES.INCIDENTS, actions: ["CREATE", "READ"] },
    { resource: RESOURCES.INVENTORY, actions: ["READ", "UPDATE"] },
    { resource: RESOURCES.REPORTS, actions: ["READ"] },
  ],
  SECURITY_ACCESS: [
    { resource: RESOURCES.BOOKINGS, actions: ["READ"] },
    { resource: RESOURCES.ROOMS, actions: ["READ"] },
    { resource: RESOURCES.MEALS, actions: ["READ"] },
    { resource: RESOURCES.MEAL_REDEMPTIONS, actions: ["READ"] },
    { resource: RESOURCES.INCIDENTS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.ACCESS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.REPORTS, actions: ["READ"] },
  ],
  EVENT_COORDINATOR: [
    { resource: RESOURCES.BOOKINGS, actions: ["READ"] },
    { resource: RESOURCES.ROOMS, actions: ["READ"] },
    { resource: RESOURCES.HOUSEKEEPING, actions: ["READ"] },
    { resource: RESOURCES.MEALS, actions: ["READ"] },
    { resource: RESOURCES.MEAL_REDEMPTIONS, actions: ["READ"] },
    { resource: RESOURCES.INCIDENTS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.ACCESS, actions: ["READ"] },
    { resource: RESOURCES.POWER, actions: ["READ"] },
    { resource: RESOURCES.SPACES, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.REPORTS, actions: ["READ"] },
    { resource: RESOURCES.EVENTS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
  ],
  FINANCE_ADMIN: [
    { resource: RESOURCES.BOOKINGS, actions: ["READ"] },
    { resource: RESOURCES.ROOMS, actions: ["READ"] },
    { resource: RESOURCES.HOUSEKEEPING, actions: ["READ"] },
    { resource: RESOURCES.MEALS, actions: ["READ"] },
    { resource: RESOURCES.MEAL_REDEMPTIONS, actions: ["READ"] },
    { resource: RESOURCES.INCIDENTS, actions: ["READ"] },
    { resource: RESOURCES.ACCESS, actions: ["READ"] },
    { resource: RESOURCES.POWER, actions: ["READ"] },
    { resource: RESOURCES.SPACES, actions: ["READ"] },
    { resource: RESOURCES.REPORTS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.INVENTORY, actions: ["READ"] },
    { resource: RESOURCES.MAINTENANCE, actions: ["READ"] },
  ],
  SUPER_ADMIN: [
    { resource: RESOURCES.BOOKINGS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.ROOMS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.HOUSEKEEPING, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.MEALS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.MEAL_REDEMPTIONS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.INCIDENTS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.ACCESS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.POWER, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.SPACES, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.REPORTS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.USERS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.EVENTS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.INVENTORY, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.MAINTENANCE, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: RESOURCES.NOTIFICATIONS, actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
  ],
};
