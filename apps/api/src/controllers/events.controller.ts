import { Request, Response, NextFunction } from "express";
import * as eventService from "../services/event.service.js";

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { isActive, page, limit } = req.query;
    const result = await eventService.listEvents({
      isActive: isActive === "true" ? true : isActive === "false" ? false : undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.events,
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

export async function getEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const event = await eventService.getEvent(id);
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const event = await eventService.updateEvent(id, req.body);
    res.json({ success: true, data: event });
  } catch (error) {
    next(error);
  }
}

export async function createScheduleItem(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await eventService.createScheduleItem(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}

export async function listScheduleItems(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = req.params.eventId as string;
    const items = await eventService.listScheduleItems(eventId);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
}

export async function deleteScheduleItem(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await eventService.deleteScheduleItem(id);
    res.json({ success: true, message: "Schedule item deleted" });
  } catch (error) {
    next(error);
  }
}
