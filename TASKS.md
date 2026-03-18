# AlmaFlow — Task Tracker

## System Overview

Alumni Weekend Accommodation & Operations Management System (Web + Mobile)
**Stack:** Express.js + Prisma + PostgreSQL | React 19 + Vite + TailwindCSS | pnpm monorepo + Turborepo

---

## Phase 1 — Foundation (COMPLETE)

- [x] Monorepo setup (pnpm workspaces, Turborepo, Docker Compose)
- [x] Database schema — 26+ models with full relations and enums
- [x] Database seed script (admin user, room types, event, building, rooms, meals, schedule)
- [x] Shared package — Zod validators, types, constants, RBAC role definitions
- [x] API middleware — JWT auth, RBAC, validation, error handling, rate limiting, CORS, Helmet
- [x] Auth service — register, login, JWT refresh with rotation, logout
- [x] Auth API routes — POST register/login/refresh/logout, GET /me
- [x] User management service + controller + routes (CRUD, role assign/remove)
- [x] Web app shell — Vite, React Router, TanStack Query, Zustand, Axios interceptors
- [x] Web auth pages — Login, Register with Zod validation
- [x] Web dashboard layout — Sidebar navigation, mobile responsive, user profile

## Phase 2 — Booking & Rooms (COMPLETE)

- [x] Booking service — CRUD, double-booking prevention, auto room assignment, group bookings, meal entitlement generation
- [x] Room service — CRUD, availability engine, building/floor hierarchy, room types, status + cleanliness tracking
- [x] Booking API routes + controller (8 endpoints)
- [x] Room API routes + controller (10 endpoints)
- [x] Booking validators — create, update, assign room, group booking
- [x] Room validators — create room/building/room type, update, availability query
- [x] Web: Bookings list page — search, status filter, pagination
- [x] Web: Booking create page — event select, date pickers, available room dropdown
- [x] Web: Booking detail page — guest info, stay details, room, meal entitlements, cancel action
- [x] Web: Rooms page — grid view grouped by building, status/cleanliness indicators, guest names

## Phase 3 — Core Operations (COMPLETE)

### Check-In / Check-Out
- [x] Service — check-in (room → OCCUPIED), check-out (room → DIRTY, auto housekeeping task)
- [x] Controller + routes (POST /in, POST /out, GET list, GET /:bookingId)
- [x] Validator — checkInSchema, checkOutSchema
- [x] Web UI — quick check-in by booking ID, check-in/out list, check-out action

### Meals
- [x] Service — CRUD, entitlement-based redemption with duplicate prevention, meal stats
- [x] Controller + routes (GET list, POST create, GET /:id, GET /:id/stats, POST /redeem)
- [x] Web UI — meal cards with type filters, redemption progress bars

### Events
- [x] Service — CRUD, schedule items, aggregated counts
- [x] Controller + routes (GET list, POST create, GET /:id, PATCH /:id, schedule CRUD)
- [x] Validator — createEvent, updateEvent, createScheduleItem
- [x] Web UI — event cards with stats (bookings, buildings, meals, schedule items)

### Incidents
- [x] Service — CRUD, status workflow (OPEN → INVESTIGATING → RESOLVED → CLOSED)
- [x] Controller + routes (GET list, POST create, GET /:id, PATCH /:id)
- [x] Web UI — expandable list, inline status actions, type/severity filters

### Inventory
- [x] Service — CRUD, stock logging with auto-adjustment, low-stock detection
- [x] Controller + routes (GET list, POST create, GET /:id, PATCH /:id, POST /log)
- [x] Validator — createInventoryItem, updateInventoryItem, inventoryLog
- [x] Web UI — table with low-stock alerts, category filters

### Housekeeping
- [x] Service — task management, auto-updates room cleanStatus on state changes
- [x] Controller + routes (GET list, POST create, GET /:id, PATCH /:id)
- [x] Web UI — task table with Start/Complete/Escalate actions, priority/status filters

### Maintenance
- [x] Service — request management, auto room MAINTENANCE status on CRITICAL severity
- [x] Controller + routes (GET list, POST create, GET /:id, PATCH /:id)
- [x] Validator — createMaintenanceRequest, updateMaintenanceRequest
- [x] Web UI — request table with severity badges, status workflow actions

## Phase 4 — Advanced Features (COMPLETE)

### Notifications System
- [x] Notification service (create, list by user, mark read, mark all read, unread count)
- [x] Notification validator (createNotificationSchema)
- [x] Controller + routes (GET /, GET /unread-count, POST /, PATCH /:id/read, PATCH /read-all)
- [x] Web UI — full notifications page with unread indicators, mark read/all, type filters, pagination
- [x] Notification bell in header — unread count badge, 15s auto-refresh, links to notifications page

### Access Control & Badge System
- [x] Access service (issueBadge with QR generation, revokeBadge, scanBadge with grant/deny, listBadges, listAccessLogs)
- [x] Access validator (issueBadgeSchema, scanBadgeSchema)
- [x] Controller + routes (GET/POST /badges, POST /badges/:id/revoke, POST /scan, GET /logs)
- [x] Web UI — tabbed Badges + Access Logs, badge type/active filters, revoke action, scan log table

### Power & Utilities
- [x] Power service (generators CRUD, fuel logging with clamped auto-adjust, power incidents)
- [x] Power validator (createGenerator, updateGenerator, fuelLog, powerIncident)
- [x] Controller + routes (GET/POST /generators, GET/PATCH /generators/:id, POST /fuel, GET/POST /incidents)
- [x] Web UI — generator cards with fuel gauge bars, status toggle, tabbed power incidents list

### Spaces & Grounds
- [x] Spaces service (spaces CRUD, structures CRUD, status management)
- [x] Spaces validator (createSpace, updateSpace, createStructure)
- [x] Controller + routes (GET/POST /, GET/PATCH /:id, POST /structures, PATCH /structures/:id/status)
- [x] Web UI — card grid with type/status filters, structures list, inline status actions

### Reporting & Analytics
- [x] Reporting service (dashboard stats, financial report, occupancy report, incident report)
- [x] Controller + routes (GET /dashboard, GET /financial, GET /occupancy, GET /incidents)
- [x] Web UI — 3-tab reports page with Recharts (financial bar chart, occupancy pie charts, incident breakdowns)

### Dashboard & Remaining UI
- [x] Dashboard — live stats from /api/reports/dashboard with 30s auto-refresh, 8 stat cards, system status panel, quick actions
- [x] Users management page — searchable table with role badges, status, pagination
- [x] All placeholder pages replaced with functional pages

## Phase 5 — Remaining Web Features (TODO)

### File Uploads
- [ ] Multer middleware for multipart/form-data
- [ ] Photo upload endpoints (damage photos, housekeeping evidence, incident photos)
- [ ] File storage strategy (local/S3)
- [ ] Web UI — image upload components in relevant pages

### Real-Time Updates (Socket.io)
- [ ] Socket.io server integration in Express
- [ ] Live event broadcasting (new bookings, check-ins, incidents, housekeeping updates)
- [ ] Client-side Socket.io listeners in dashboard and key pages
- [ ] Live notification push (instead of polling)

### Enhanced Workflows
- [ ] Bulk operations (bulk check-in, bulk room assignment)
- [ ] Export to CSV/PDF (reports, guest lists, invoices)
- [ ] Email notifications (booking confirmations, reminders)
- [ ] Audit trail / activity log

### Polish & UX
- [ ] Form modals for creating items inline (instead of separate pages where appropriate)
- [ ] Confirmation dialogs for destructive actions
- [ ] Toast notifications for success/error feedback
- [ ] Dark mode support
- [ ] Loading skeletons (replace spinner with skeleton UI)

## Phase 6 — Mobile Apps (TODO — SEPARATE PHASE)

### Mobile App — Alumni Guest (React Native / Expo)
- [ ] Project setup with Expo
- [ ] Registration & profile
- [ ] Booking details & room info
- [ ] Digital ID / QR badge
- [ ] Meal entitlements & scan status
- [ ] Event schedule & notifications
- [ ] Maps & directions
- [ ] Feedback & issue reporting
- [ ] Offline access to key info

### Mobile App — Staff
- [ ] Role-based login
- [ ] Task lists & assignments
- [ ] QR/NFC scanning
- [ ] Incident reporting
- [ ] Photo uploads
- [ ] Offline-first operation

### Offline Sync Strategy
- [ ] Local mobile data storage
- [ ] Sync service (process SyncQueue)
- [ ] Conflict resolution rules
- [ ] Background sync + manual sync trigger

## Phase 7 — Production Hardening (TODO)

- [ ] Comprehensive test suite (unit + integration)
- [ ] CI/CD pipeline
- [ ] Environment configuration (staging, production)
- [ ] Database migrations strategy
- [ ] Monitoring & logging (production)
- [ ] Security audit
- [ ] Performance optimization & load testing
- [ ] Documentation (API docs, deployment guide)
