import { Request, Response, NextFunction } from "express";
import * as inventoryService from "../services/inventory.service.js";

export async function createItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await inventoryService.createItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function listItems(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, lowStock, page, limit } = req.query;
    const result = await inventoryService.listItems({
      category: category as any,
      lowStock: lowStock === "true",
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.items,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getItem(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const item = await inventoryService.getItem(id);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function updateItem(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const item = await inventoryService.updateItem(id, req.body);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function logAction(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await inventoryService.logAction(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
}
