import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";

// Route imports
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import roomsRoutes from "./routes/rooms.routes.js";
import checkinRoutes from "./routes/checkin.routes.js";
import mealsRoutes from "./routes/meals.routes.js";
import eventsRoutes from "./routes/events.routes.js";
import incidentsRoutes from "./routes/incidents.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import housekeepingRoutes from "./routes/housekeeping.routes.js";
import maintenanceRoutes from "./routes/maintenance.routes.js";
import notificationsRoutes from "./routes/notifications.routes.js";
import accessRoutes from "./routes/access.routes.js";
import powerRoutes from "./routes/power.routes.js";
import spacesRoutes from "./routes/spaces.routes.js";
import reportingRoutes from "./routes/reporting.routes.js";

const app = express();

// ─── Global Middleware ──────────────────────────────────────

app.use(helmet());
app.use(compression());
app.use(
  cors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: "Too many auth attempts, please try again later" },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ─── Health Check ───────────────────────────────────────────

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Routes ─────────────────────────────────────────────────

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/bookings", bookingsRoutes);
app.use("/api/rooms", roomsRoutes);
app.use("/api/checkin", checkinRoutes);
app.use("/api/meals", mealsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/incidents", incidentsRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/housekeeping", housekeepingRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/access", accessRoutes);
app.use("/api/power", powerRoutes);
app.use("/api/spaces", spacesRoutes);
app.use("/api/reports", reportingRoutes);

// ─── Error Handling ─────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
