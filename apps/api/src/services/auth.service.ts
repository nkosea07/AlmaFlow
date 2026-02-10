import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "@almaflow/database";
import { env } from "../config/env.js";
import { AppError } from "../middleware/error.js";
import type { JwtPayload } from "../middleware/auth.js";
import type { RegisterInput, LoginInput } from "@almaflow/shared";

const BCRYPT_ROUNDS = 12;

export async function registerUser(input: RegisterInput) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existing) {
    throw new AppError(409, "A user with this email already exists");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  // Find the ALUMNI_GUEST role
  const alumniRole = await prisma.role.findUnique({
    where: { name: "ALUMNI_GUEST" },
  });

  if (!alumniRole) {
    throw new AppError(500, "Default role not configured. Please seed the database.");
  }

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      graduationYear: input.graduationYear,
      roles: {
        create: { roleId: alumniRole.id },
      },
    },
    include: {
      roles: { include: { role: true } },
    },
  });

  const tokens = await generateTokens(user.id, user.email, user.roles.map((r) => r.role.name));

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles.map((r) => r.role.name),
    },
    tokens,
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    include: {
      roles: { include: { role: true } },
    },
  });

  if (!user || !user.isActive) {
    throw new AppError(401, "Invalid email or password");
  }

  const validPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!validPassword) {
    throw new AppError(401, "Invalid email or password");
  }

  const roles = user.roles.map((r) => r.role.name);
  const tokens = await generateTokens(user.id, user.email, roles);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
    },
    tokens,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: {
      user: {
        include: {
          roles: { include: { role: true } },
        },
      },
    },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
    }
    throw new AppError(401, "Invalid or expired refresh token");
  }

  // Delete old token and create new one (rotation)
  await prisma.refreshToken.delete({ where: { id: stored.id } });

  const roles = stored.user.roles.map((r) => r.role.name);
  const tokens = await generateTokens(stored.user.id, stored.user.email, roles);

  return {
    user: {
      id: stored.user.id,
      email: stored.user.email,
      firstName: stored.user.firstName,
      lastName: stored.user.lastName,
      roles,
    },
    tokens,
  };
}

export async function logoutUser(refreshToken: string) {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

async function generateTokens(
  userId: string,
  email: string,
  roles: string[]
) {
  const payload: JwtPayload = { userId, email, roles };

  const accessToken = jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as string & jwt.SignOptions["expiresIn"],
  });

  const refreshToken = crypto.randomBytes(64).toString("hex");

  // Parse refresh token expiry
  const expiresIn = env.JWT_REFRESH_EXPIRES_IN;
  const ms = parseDuration(expiresIn);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: new Date(Date.now() + ms),
    },
  });

  return { accessToken, refreshToken };
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case "s": return value * 1000;
    case "m": return value * 60 * 1000;
    case "h": return value * 60 * 60 * 1000;
    case "d": return value * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}
