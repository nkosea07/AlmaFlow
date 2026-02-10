import { Request, Response, NextFunction } from "express";
import * as incidentService from "../services/incident.service.js";

export async function createIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await incidentService.createIncident(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
}

export async function listIncidents(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, status, severity, page, limit } = req.query;
    const result = await incidentService.listIncidents({
      type: type as any,
      status: status as any,
      severity: severity as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.incidents,
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

export async function getIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const incident = await incidentService.getIncident(id);
    res.json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
}

export async function updateIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const incident = await incidentService.updateIncident(id, req.body);
    res.json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
}
