import { Request, Response, NextFunction } from "express";
import { prisma } from "@almaflow/database";
import { AppError } from "../middleware/error.js";

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" as const } },
            { lastName: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          graduationYear: true,
          isActive: true,
          createdAt: true,
          roles: { include: { role: { select: { name: true } } } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const data = users.map((u) => ({
      ...u,
      roles: u.roles.map((r) => r.role.name),
    }));

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        graduationYear: true,
        profilePhoto: true,
        isActive: true,
        createdAt: true,
        roles: { include: { role: { select: { name: true } } } },
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    res.json({
      success: true,
      data: { ...user, roles: user.roles.map((r) => r.role.name) },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { firstName, lastName, phone, graduationYear } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone }),
        ...(graduationYear !== undefined && { graduationYear }),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        graduationYear: true,
      },
    });

    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
}

export async function assignRole(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.userId as string;
    const { roleName } = req.body;

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      throw new AppError(404, `Role '${roleName}' not found`);
    }

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId: role.id } },
      create: { userId, roleId: role.id },
      update: {},
    });

    res.json({ success: true, message: `Role '${roleName}' assigned successfully` });
  } catch (error) {
    next(error);
  }
}

export async function removeRole(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.params.userId as string;
    const { roleName } = req.body;

    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      throw new AppError(404, `Role '${roleName}' not found`);
    }

    await prisma.userRole.deleteMany({
      where: { userId, roleId: role.id },
    });

    res.json({ success: true, message: `Role '${roleName}' removed successfully` });
  } catch (error) {
    next(error);
  }
}
