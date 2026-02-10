import { PrismaClient, RoleName, PermissionAction } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const ROLE_PERMISSIONS: Record<
  RoleName,
  Array<{ resource: string; actions: PermissionAction[] }>
> = {
  ALUMNI_GUEST: [
    { resource: "bookings", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "rooms", actions: ["READ"] },
    { resource: "meals", actions: ["READ"] },
    { resource: "meal_redemptions", actions: ["READ"] },
    { resource: "incidents", actions: ["CREATE", "READ"] },
    { resource: "access", actions: ["READ"] },
    { resource: "events", actions: ["READ"] },
    { resource: "notifications", actions: ["READ"] },
  ],
  ACCOMMODATION_ADMIN: [
    { resource: "bookings", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "rooms", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "housekeeping", actions: ["READ"] },
    { resource: "meals", actions: ["READ"] },
    { resource: "incidents", actions: ["READ"] },
    { resource: "reports", actions: ["READ"] },
    { resource: "events", actions: ["READ"] },
    { resource: "inventory", actions: ["READ"] },
    { resource: "maintenance", actions: ["READ"] },
  ],
  HOUSEKEEPING_STAFF: [
    { resource: "rooms", actions: ["READ"] },
    { resource: "housekeeping", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "incidents", actions: ["CREATE", "READ"] },
    { resource: "inventory", actions: ["READ", "UPDATE"] },
    { resource: "maintenance", actions: ["CREATE", "READ"] },
  ],
  CATERING_STAFF: [
    { resource: "meals", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "meal_redemptions", actions: ["CREATE", "READ", "UPDATE"] },
    { resource: "incidents", actions: ["CREATE", "READ"] },
    { resource: "inventory", actions: ["READ", "UPDATE"] },
    { resource: "reports", actions: ["READ"] },
  ],
  SECURITY_ACCESS: [
    { resource: "bookings", actions: ["READ"] },
    { resource: "rooms", actions: ["READ"] },
    { resource: "incidents", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "access", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "reports", actions: ["READ"] },
  ],
  EVENT_COORDINATOR: [
    { resource: "bookings", actions: ["READ"] },
    { resource: "rooms", actions: ["READ"] },
    { resource: "housekeeping", actions: ["READ"] },
    { resource: "incidents", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "spaces", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "reports", actions: ["READ"] },
    { resource: "events", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
  ],
  FINANCE_ADMIN: [
    { resource: "bookings", actions: ["READ"] },
    { resource: "rooms", actions: ["READ"] },
    { resource: "meals", actions: ["READ"] },
    { resource: "incidents", actions: ["READ"] },
    { resource: "reports", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "inventory", actions: ["READ"] },
    { resource: "maintenance", actions: ["READ"] },
  ],
  SUPER_ADMIN: [
    { resource: "bookings", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "rooms", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "housekeeping", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "meals", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "meal_redemptions", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "incidents", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "access", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "power", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "spaces", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "reports", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "users", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "events", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "inventory", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "maintenance", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
    { resource: "notifications", actions: ["CREATE", "READ", "UPDATE", "DELETE"] },
  ],
};

async function main() {
  console.log("Seeding database...");

  // ─── Roles & Permissions ─────────────────────────────────

  for (const [roleName, permissions] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.upsert({
      where: { name: roleName as RoleName },
      update: {},
      create: {
        name: roleName as RoleName,
        description: formatRoleName(roleName),
      },
    });

    for (const perm of permissions) {
      for (const action of perm.actions) {
        await prisma.permission.upsert({
          where: {
            roleId_resource_action: {
              roleId: role.id,
              resource: perm.resource,
              action,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            resource: perm.resource,
            action,
          },
        });
      }
    }

    console.log(`  Role '${roleName}' seeded with ${permissions.length} resource groups`);
  }

  // ─── Super Admin User ────────────────────────────────────

  const adminPassword = await hash("Admin123!", 12);
  const superAdminRole = await prisma.role.findUnique({
    where: { name: "SUPER_ADMIN" },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@almaflow.com" },
    update: {},
    create: {
      email: "admin@almaflow.com",
      passwordHash: adminPassword,
      firstName: "System",
      lastName: "Admin",
      isActive: true,
    },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: superAdminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: superAdminRole.id },
    });
  }

  console.log("  Super Admin user created: admin@almaflow.com / Admin123!");

  // ─── Room Types ──────────────────────────────────────────

  const roomTypes = [
    { name: "Single", capacity: 1 },
    { name: "Double", capacity: 2 },
    { name: "Suite", capacity: 3 },
    { name: "Dormitory", capacity: 6 },
  ];

  for (const rt of roomTypes) {
    await prisma.roomType.upsert({
      where: { name: rt.name },
      update: {},
      create: rt,
    });
  }

  console.log("  Room types seeded");

  // ─── Sample Event ────────────────────────────────────────

  const event = await prisma.event.upsert({
    where: { id: "sample-event-2025" },
    update: {},
    create: {
      id: "sample-event-2025",
      name: "Alumni Weekend 2025",
      startDate: new Date("2025-10-03T14:00:00Z"),
      endDate: new Date("2025-10-05T12:00:00Z"),
      venue: "University Main Campus",
      description: "Annual alumni weekend celebration and homecoming event.",
      isActive: true,
    },
  });

  console.log(`  Sample event created: ${event.name}`);

  // ─── Sample Building & Rooms ─────────────────────────────

  const building = await prisma.building.upsert({
    where: { id: "sample-building-1" },
    update: {},
    create: {
      id: "sample-building-1",
      name: "Alumni Hall",
      eventId: event.id,
      floors: 3,
      location: "North Campus",
    },
  });

  const singleType = await prisma.roomType.findUnique({ where: { name: "Single" } });
  const doubleType = await prisma.roomType.findUnique({ where: { name: "Double" } });

  if (singleType && doubleType) {
    for (let floor = 1; floor <= 3; floor++) {
      for (let room = 1; room <= 5; room++) {
        const roomNumber = `${floor}0${room}`;
        const roomTypeId = room <= 3 ? singleType.id : doubleType.id;

        await prisma.room.upsert({
          where: {
            number_buildingId: {
              number: roomNumber,
              buildingId: building.id,
            },
          },
          update: {},
          create: {
            number: roomNumber,
            buildingId: building.id,
            roomTypeId,
            floor,
          },
        });
      }
    }
    console.log("  15 sample rooms created in Alumni Hall");
  }

  // ─── Sample Meals ────────────────────────────────────────

  const meals = [
    {
      name: "Friday Dinner",
      type: "DINNER" as const,
      date: new Date("2025-10-03"),
      startTime: new Date("2025-10-03T18:00:00Z"),
      endTime: new Date("2025-10-03T20:00:00Z"),
      venue: "Main Dining Hall",
    },
    {
      name: "Saturday Breakfast",
      type: "BREAKFAST" as const,
      date: new Date("2025-10-04"),
      startTime: new Date("2025-10-04T07:00:00Z"),
      endTime: new Date("2025-10-04T09:00:00Z"),
      venue: "Main Dining Hall",
    },
    {
      name: "Saturday Lunch",
      type: "LUNCH" as const,
      date: new Date("2025-10-04"),
      startTime: new Date("2025-10-04T12:00:00Z"),
      endTime: new Date("2025-10-04T14:00:00Z"),
      venue: "Outdoor Pavilion",
    },
    {
      name: "Saturday Gala Dinner",
      type: "DINNER" as const,
      date: new Date("2025-10-04"),
      startTime: new Date("2025-10-04T19:00:00Z"),
      endTime: new Date("2025-10-04T22:00:00Z"),
      venue: "Grand Hall",
    },
    {
      name: "Sunday Breakfast",
      type: "BREAKFAST" as const,
      date: new Date("2025-10-05"),
      startTime: new Date("2025-10-05T07:00:00Z"),
      endTime: new Date("2025-10-05T09:00:00Z"),
      venue: "Main Dining Hall",
    },
  ];

  for (const meal of meals) {
    await prisma.meal.create({
      data: {
        eventId: event.id,
        ...meal,
        costPerHead: 10.0,
      },
    });
  }

  console.log("  5 sample meals created");

  // ─── Sample Schedule Items ───────────────────────────────

  const scheduleItems = [
    {
      title: "Welcome & Registration",
      location: "Main Lobby",
      startTime: new Date("2025-10-03T14:00:00Z"),
      endTime: new Date("2025-10-03T17:00:00Z"),
      category: "Registration",
    },
    {
      title: "Opening Ceremony",
      location: "Grand Hall",
      startTime: new Date("2025-10-03T17:30:00Z"),
      endTime: new Date("2025-10-03T18:00:00Z"),
      category: "Ceremony",
      isRequired: true,
    },
    {
      title: "Campus Tour",
      location: "Meet at Main Entrance",
      startTime: new Date("2025-10-04T09:30:00Z"),
      endTime: new Date("2025-10-04T11:30:00Z"),
      category: "Activity",
    },
    {
      title: "Class Reunions",
      location: "Various Classrooms",
      startTime: new Date("2025-10-04T14:30:00Z"),
      endTime: new Date("2025-10-04T16:30:00Z"),
      category: "Social",
    },
    {
      title: "Farewell Brunch",
      location: "Main Dining Hall",
      startTime: new Date("2025-10-05T09:30:00Z"),
      endTime: new Date("2025-10-05T11:00:00Z"),
      category: "Social",
    },
  ];

  for (const item of scheduleItems) {
    await prisma.scheduleItem.create({
      data: {
        eventId: event.id,
        ...item,
      },
    });
  }

  console.log("  5 sample schedule items created");

  console.log("\nSeed completed successfully!");
}

function formatRoleName(name: string): string {
  return name
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
