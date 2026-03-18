import { Request, Response, NextFunction } from "express";
import * as accessService from "../services/access.service.js";

export async function issueBadge(req: Request, res: Response, next: NextFunction) {
  try {
    const badge = await accessService.issueBadge(req.body);
    res.status(201).json({ success: true, data: badge });
  } catch (error) {
    next(error);
  }
}

export async function revokeBadge(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const badge = await accessService.revokeBadge(id);
    res.json({ success: true, data: badge });
  } catch (error) {
    next(error);
  }
}

export async function scanBadge(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accessService.scanBadge(req.user!.userId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function listBadges(req: Request, res: Response, next: NextFunction) {
  try {
    const { type, isActive, page, limit } = req.query;
    const result = await accessService.listBadges({
      type: type as any,
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.badges,
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

export async function listAccessLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { badgeId, userId, location, page, limit } = req.query;
    const result = await accessService.listAccessLogs({
      badgeId: badgeId as string | undefined,
      userId: userId as string | undefined,
      location: location as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.logs,
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
