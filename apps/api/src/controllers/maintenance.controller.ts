import { Request, Response, NextFunction } from "express";
import * as maintenanceService from "../services/maintenance.service.js";

export async function createRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const request = await maintenanceService.createRequest(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
}

export async function listRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { roomId, status, severity, page, limit } = req.query;
    const result = await maintenanceService.listRequests({
      roomId: roomId as string | undefined,
      status: status as any,
      severity: severity as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.requests,
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

export async function getRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const request = await maintenanceService.getRequest(id);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
}

export async function updateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const request = await maintenanceService.updateRequest(id, req.body);
    res.json({ success: true, data: request });
  } catch (error) {
    next(error);
  }
}
