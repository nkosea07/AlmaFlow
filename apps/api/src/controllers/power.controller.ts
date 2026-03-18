import { Request, Response, NextFunction } from "express";
import * as powerService from "../services/power.service.js";

export async function createGenerator(req: Request, res: Response, next: NextFunction) {
  try {
    const gen = await powerService.createGenerator(req.body);
    res.status(201).json({ success: true, data: gen });
  } catch (error) {
    next(error);
  }
}

export async function listGenerators(_req: Request, res: Response, next: NextFunction) {
  try {
    const generators = await powerService.listGenerators();
    res.json({ success: true, data: generators });
  } catch (error) {
    next(error);
  }
}

export async function getGenerator(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const gen = await powerService.getGenerator(id);
    res.json({ success: true, data: gen });
  } catch (error) {
    next(error);
  }
}

export async function updateGenerator(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const gen = await powerService.updateGenerator(id, req.body);
    res.json({ success: true, data: gen });
  } catch (error) {
    next(error);
  }
}

export async function logFuel(req: Request, res: Response, next: NextFunction) {
  try {
    const log = await powerService.logFuel(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    next(error);
  }
}

export async function createPowerIncident(req: Request, res: Response, next: NextFunction) {
  try {
    const incident = await powerService.createPowerIncident(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
}

export async function listPowerIncidents(req: Request, res: Response, next: NextFunction) {
  try {
    const { page, limit } = req.query;
    const result = await powerService.listPowerIncidents(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined
    );
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
