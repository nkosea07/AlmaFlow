import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.API_PORT || "4000", 10),
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "dev-access-secret",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "dev-refresh-secret",
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  EMAIL_FROM: process.env.EMAIL_FROM || "AlmaFlow <noreply@almaflow.com>",

  CORS_ORIGINS: (process.env.CORS_ORIGINS || "http://localhost:5173").split(","),

  DO_SPACES_KEY: process.env.DO_SPACES_KEY || "",
  DO_SPACES_SECRET: process.env.DO_SPACES_SECRET || "",
  DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT || "",
  DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET || "",
  DO_SPACES_REGION: process.env.DO_SPACES_REGION || "",
} as const;
