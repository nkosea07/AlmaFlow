import { Request, Response, NextFunction } from "express";
import * as checkinService from "../services/checkin.service.js";

export async function checkIn(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await checkinService.checkIn({
      bookingId: req.body.bookingId,
      method: req.body.method,
      checkedInBy: req.user!.userId,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function checkOut(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await checkinService.checkOut({
      bookingId: req.body.bookingId,
      checkedOutBy: req.user!.userId,
      damageNotes: req.body.damageNotes,
      damagePhotos: req.body.damagePhotos,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getCheckIn(req: Request, res: Response, next: NextFunction) {
  try {
    const bookingId = req.params.bookingId as string;
    const result = await checkinService.getCheckIn(bookingId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function listCheckIns(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, status, page, limit } = req.query;
    const result = await checkinService.listCheckIns({
      eventId: eventId as string | undefined,
      status: status as "checked_in" | "checked_out" | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.checkIns,
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
