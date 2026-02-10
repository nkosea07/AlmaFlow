import { Request, Response, NextFunction } from "express";
import * as roomService from "../services/room.service.js";

export async function listRooms(req: Request, res: Response, next: NextFunction) {
  try {
    const { buildingId, eventId, status, cleanStatus, page, limit } = req.query;
    const result = await roomService.listRooms({
      buildingId: buildingId as string | undefined,
      eventId: eventId as string | undefined,
      status: status as any,
      cleanStatus: cleanStatus as any,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.rooms,
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

export async function getRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const room = await roomService.getRoom(id);
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
}

export async function createRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const room = await roomService.createRoom(req.body);
    res.status(201).json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
}

export async function updateRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const room = await roomService.updateRoom(id, req.body);
    res.json({ success: true, data: room });
  } catch (error) {
    next(error);
  }
}

export async function deleteRoom(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await roomService.deleteRoom(id);
    res.json({ success: true, message: "Room deleted successfully" });
  } catch (error) {
    next(error);
  }
}

export async function getAvailableRooms(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, arrivalDate, departureDate, roomTypeId, buildingId } = req.query;
    const rooms = await roomService.getAvailableRooms({
      eventId: eventId as string,
      arrivalDate: new Date(arrivalDate as string),
      departureDate: new Date(departureDate as string),
      roomTypeId: roomTypeId as string | undefined,
      buildingId: buildingId as string | undefined,
    });
    res.json({ success: true, data: rooms });
  } catch (error) {
    next(error);
  }
}

export async function listBuildings(req: Request, res: Response, next: NextFunction) {
  try {
    const eventId = req.query.eventId as string | undefined;
    const buildings = await roomService.listBuildings(eventId);
    res.json({ success: true, data: buildings });
  } catch (error) {
    next(error);
  }
}

export async function createBuilding(req: Request, res: Response, next: NextFunction) {
  try {
    const building = await roomService.createBuilding(req.body);
    res.status(201).json({ success: true, data: building });
  } catch (error) {
    next(error);
  }
}

export async function listRoomTypes(_req: Request, res: Response, next: NextFunction) {
  try {
    const types = await roomService.listRoomTypes();
    res.json({ success: true, data: types });
  } catch (error) {
    next(error);
  }
}

export async function createRoomType(req: Request, res: Response, next: NextFunction) {
  try {
    const type = await roomService.createRoomType(req.body);
    res.status(201).json({ success: true, data: type });
  } catch (error) {
    next(error);
  }
}
