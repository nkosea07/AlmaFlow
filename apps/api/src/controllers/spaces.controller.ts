import { Request, Response, NextFunction } from "express";
import * as spacesService from "../services/spaces.service.js";

export async function createSpace(req: Request, res: Response, next: NextFunction) {
  try {
    const space = await spacesService.createSpace(req.body);
    res.status(201).json({ success: true, data: space });
  } catch (error) {
    next(error);
  }
}

export async function listSpaces(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, type, status, page, limit } = req.query;
    const result = await spacesService.listSpaces({
      eventId: eventId as string | undefined,
      type: type as any,
      status: status as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.spaces,
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

export async function getSpace(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const space = await spacesService.getSpace(id);
    res.json({ success: true, data: space });
  } catch (error) {
    next(error);
  }
}

export async function updateSpace(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const space = await spacesService.updateSpace(id, req.body);
    res.json({ success: true, data: space });
  } catch (error) {
    next(error);
  }
}

export async function createStructure(req: Request, res: Response, next: NextFunction) {
  try {
    const structure = await spacesService.createStructure(req.body);
    res.status(201).json({ success: true, data: structure });
  } catch (error) {
    next(error);
  }
}

export async function updateStructureStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const structure = await spacesService.updateStructureStatus(id, status);
    res.json({ success: true, data: structure });
  } catch (error) {
    next(error);
  }
}
