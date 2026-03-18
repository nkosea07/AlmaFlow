import { Request, Response, NextFunction } from "express";
import * as reportingService from "../services/reporting.service.js";

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = req.query.eventId as string | undefined;
    const stats = await reportingService.getDashboardStats(eventId);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}

export async function getFinancialReport(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = req.query.eventId as string | undefined;
    const report = await reportingService.getFinancialReport(eventId);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function getOccupancyReport(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = req.query.eventId as string | undefined;
    const report = await reportingService.getOccupancyReport(eventId);
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}

export async function getIncidentReport(_req: Request, res: Response, next: NextFunction) {
  try {
    const report = await reportingService.getIncidentReport();
    res.json({ success: true, data: report });
  } catch (error) {
    next(error);
  }
}
