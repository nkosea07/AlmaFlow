import { Request, Response, NextFunction } from "express";
import * as housekeepingService from "../services/housekeeping.service.js";

export async function createTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await housekeepingService.createTask(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function listTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const { roomId, assigneeId, status, priority, type, page, limit } = req.query;
    const result = await housekeepingService.listTasks({
      roomId: roomId as string | undefined,
      assigneeId: assigneeId as string | undefined,
      status: status as any,
      priority: priority as any,
      type: type as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.tasks,
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

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const task = await housekeepingService.getTask(id);
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const task = await housekeepingService.updateTask(id, req.body);
    res.json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
}
