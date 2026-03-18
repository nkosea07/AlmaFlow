import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthLayout from "@/layouts/AuthLayout";
import DashboardLayout from "@/layouts/DashboardLayout";
import LoginPage from "@/features/auth/LoginPage";
import RegisterPage from "@/features/auth/RegisterPage";
import DashboardPage from "@/features/dashboard/DashboardPage";
import BookingsListPage from "@/features/bookings/BookingsListPage";
import BookingCreatePage from "@/features/bookings/BookingCreatePage";
import BookingDetailPage from "@/features/bookings/BookingDetailPage";
import RoomsPage from "@/features/rooms/RoomsPage";
import CheckInPage from "@/features/checkin/CheckInPage";
import MealsPage from "@/features/meals/MealsPage";
import EventsPage from "@/features/events/EventsPage";
import IncidentsPage from "@/features/incidents/IncidentsPage";
import InventoryPage from "@/features/inventory/InventoryPage";
import HousekeepingPage from "@/features/housekeeping/HousekeepingPage";
import MaintenancePage from "@/features/maintenance/MaintenancePage";
import NotificationsPage from "@/features/notifications/NotificationsPage";
import AccessControlPage from "@/features/access/AccessControlPage";
import PowerPage from "@/features/power/PowerPage";
import SpacesPage from "@/features/spaces/SpacesPage";
import ReportsPage from "@/features/reports/ReportsPage";
import UsersPage from "@/features/users/UsersPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AppRoutes() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Protected dashboard routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/bookings" element={<BookingsListPage />} />
        <Route path="/bookings/new" element={<BookingCreatePage />} />
        <Route path="/bookings/:id" element={<BookingDetailPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/checkin" element={<CheckInPage />} />
        <Route path="/housekeeping" element={<HousekeepingPage />} />
        <Route path="/meals" element={<MealsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/access" element={<AccessControlPage />} />
        <Route path="/power" element={<PowerPage />} />
        <Route path="/spaces" element={<SpacesPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/users" element={<UsersPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
