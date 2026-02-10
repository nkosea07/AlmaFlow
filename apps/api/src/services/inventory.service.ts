import { prisma } from "@almaflow/database";
import type { InventoryCategory, InventoryAction } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function createItem(data: {
  name: string;
  category: InventoryCategory;
  unit: string;
  totalStock: number;
  minThreshold: number;
  costPerUnit?: number;
}) {
  return prisma.inventoryItem.create({
    data: {
      name: data.name,
      category: data.category,
      unit: data.unit,
      totalStock: data.totalStock,
      minThreshold: data.minThreshold,
      costPerUnit: data.costPerUnit ?? 0,
    },
    include: { _count: { select: { roomAllocations: true } } },
  });
}

export async function listItems(filters: {
  category?: InventoryCategory;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}) {
  const { category, lowStock, page = 1, limit = 50 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (category) where.category = category;

  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      skip,
      take: limit,
      include: { _count: { select: { roomAllocations: true, logs: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.inventoryItem.count({ where }),
  ]);

  const result = lowStock
    ? items.filter((i) => i.totalStock <= i.minThreshold)
    : items;

  return {
    items: result,
    total: lowStock ? result.length : total,
    page,
    limit,
    totalPages: Math.ceil((lowStock ? result.length : total) / limit),
  };
}

export async function getItem(id: string) {
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      roomAllocations: {
        include: {
          room: {
            include: {
              building: { select: { name: true } },
            },
          },
        },
      },
      logs: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!item) throw new AppError(404, "Inventory item not found");
  return item;
}

export async function updateItem(
  id: string,
  data: {
    name?: string;
    totalStock?: number;
    minThreshold?: number;
    costPerUnit?: number;
  }
) {
  return prisma.inventoryItem.update({
    where: { id },
    data,
    include: { _count: { select: { roomAllocations: true } } },
  });
}

export async function logAction(
  staffId: string,
  data: {
    itemId: string;
    action: InventoryAction;
    quantity: number;
    roomId?: string;
    notes?: string;
  }
) {
  const item = await prisma.inventoryItem.findUnique({ where: { id: data.itemId } });
  if (!item) throw new AppError(404, "Inventory item not found");

  // Update stock based on action
  let stockDelta = 0;
  if (data.action === "RESTOCK") stockDelta = data.quantity;
  if (data.action === "CONSUME" || data.action === "WRITE_OFF") stockDelta = -data.quantity;

  if (item.totalStock + stockDelta < 0) {
    throw new AppError(400, "Insufficient stock for this operation");
  }

  const [log] = await prisma.$transaction([
    prisma.inventoryLog.create({
      data: {
        itemId: data.itemId,
        action: data.action,
        quantity: data.quantity,
        roomId: data.roomId,
        staffId,
        notes: data.notes,
      },
      include: {
        item: { select: { name: true, unit: true, totalStock: true } },
      },
    }),
    prisma.inventoryItem.update({
      where: { id: data.itemId },
      data: { totalStock: { increment: stockDelta } },
    }),
  ]);

  return log;
}

export async function getLowStockAlerts() {
  return prisma.inventoryItem.findMany({
    where: {
      totalStock: { lte: prisma.inventoryItem.fields.minThreshold as any },
    },
    orderBy: { totalStock: "asc" },
  });
}
