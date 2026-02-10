import { z } from "zod";

export const createInventoryItemSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.enum(["TOILETRY", "LINEN", "CONSUMABLE", "FURNITURE", "EQUIPMENT"]),
  unit: z.string().min(1).max(50),
  totalStock: z.number().int().min(0),
  minThreshold: z.number().int().min(0),
  costPerUnit: z.number().min(0).default(0),
});

export const updateInventoryItemSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  totalStock: z.number().int().min(0).optional(),
  minThreshold: z.number().int().min(0).optional(),
  costPerUnit: z.number().min(0).optional(),
});

export const inventoryLogSchema = z.object({
  itemId: z.string().cuid(),
  action: z.enum(["RESTOCK", "CONSUME", "TRANSFER", "WRITE_OFF"]),
  quantity: z.number().int().min(1),
  roomId: z.string().cuid().optional(),
  notes: z.string().max(500).optional(),
});

export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
export type InventoryLogInput = z.infer<typeof inventoryLogSchema>;
