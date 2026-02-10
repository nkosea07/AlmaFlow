import { Request, Response, NextFunction } from "express";
import { prisma } from "@almaflow/database";
import type { PermissionAction as PermActionEnum } from "@almaflow/database";

type PermissionActionType = PermActionEnum;

/**
 * RBAC middleware that checks if the authenticated user
 * has the required permission for a given resource and action.
 */
export function authorize(resource: string, action: PermissionActionType) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    try {
      // Find all permissions for this user's roles
      const userRoles = await prisma.userRole.findMany({
        where: { userId: req.user.userId },
        include: {
          role: {
            include: {
              permissions: {
                where: {
                  resource,
                  action,
                },
              },
            },
          },
        },
      });

      const hasPermission = userRoles.some(
        (ur) => ur.role.permissions.length > 0
      );

      if (!hasPermission) {
        res.status(403).json({ success: false, error: "Insufficient permissions" });
        return;
      }

      next();
    } catch {
      res.status(500).json({ success: false, error: "Authorization check failed" });
    }
  };
}

/**
 * Checks if the user has any of the specified roles.
 */
export function requireRole(...roleNames: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const hasRole = req.user.roles.some((role) => roleNames.includes(role));

    if (!hasRole) {
      res.status(403).json({ success: false, error: "Insufficient role" });
      return;
    }

    next();
  };
}
