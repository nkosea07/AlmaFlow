import { Request, Response, NextFunction } from "express";
import * as bookingService from "../services/booking.service.js";

export async function createBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const booking = await bookingService.createBooking(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, userId, status, page, limit, search } = req.query;
    const result = await bookingService.listBookings({
      eventId: eventId as string | undefined,
      userId: userId as string | undefined,
      status: status as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search: search as string | undefined,
    });
    res.json({
      success: true,
      data: result.bookings,
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

export async function getBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const booking = await bookingService.getBooking(id);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

export async function updateBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const booking = await bookingService.updateBooking(id, req.body);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

export async function assignRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const booking = await bookingService.assignRoom(id, req.body.roomId);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const booking = await bookingService.cancelBooking(id);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

export async function autoAssignRooms(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = req.params.eventId as string;
    const results = await bookingService.autoAssignRooms(eventId);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
}

export async function createGroupBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const group = await bookingService.createGroupBooking(req.body);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
}
