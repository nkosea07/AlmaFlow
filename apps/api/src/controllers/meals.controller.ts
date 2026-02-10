import { Request, Response, NextFunction } from "express";
import * as mealService from "../services/meal.service.js";

export async function createMeal(req: Request, res: Response, next: NextFunction) {
  try {
    const meal = await mealService.createMeal(req.body);
    res.status(201).json({ success: true, data: meal });
  } catch (error) {
    next(error);
  }
}

export async function listMeals(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, type, date, page, limit } = req.query;
    const result = await mealService.listMeals({
      eventId: eventId as string | undefined,
      type: type as string | undefined,
      date: date as string | undefined,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.json({
      success: true,
      data: result.meals,
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

export async function getMeal(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const meal = await mealService.getMeal(id);
    res.json({ success: true, data: meal });
  } catch (error) {
    next(error);
  }
}

export async function redeemMeal(req: Request, res: Response, next: NextFunction) {
  try {
    const redemption = await mealService.redeemMeal({
      ...req.body,
      scannedBy: req.user!.userId,
    });
    res.status(201).json({ success: true, data: redemption });
  } catch (error) {
    next(error);
  }
}

export async function getMealStats(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const stats = await mealService.getMealStats(id);
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}
