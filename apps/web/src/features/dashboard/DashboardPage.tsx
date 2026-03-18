import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import {
  BedDouble,
  CalendarCheck,
  UtensilsCrossed,
  AlertTriangle,
  Users,
  Brush,
  Wrench,
} from "lucide-react";
import api from "@/lib/api";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/reports/dashboard");
      return data.data;
    },
    refetchInterval: 30_000,
  });

  const stats = [
    {
      label: "Total Bookings",
      value: data?.bookings?.total ?? "—",
      sub: data ? `${data.bookings.confirmed} confirmed` : undefined,
      icon: CalendarCheck,
      color: "bg-blue-500",
    },
    {
      label: "Rooms Occupied",
      value: data?.rooms?.occupied ?? "—",
      sub: data ? `${data.rooms.available} available / ${data.rooms.total} total` : undefined,
      icon: BedDouble,
      color: "bg-green-500",
    },
    {
      label: "Meals Served",
      value: data?.meals?.served ?? "—",
      icon: UtensilsCrossed,
      color: "bg-orange-500",
    },
    {
      label: "Open Incidents",
      value: data?.incidents?.open ?? "—",
      icon: AlertTriangle,
      color: "bg-red-500",
    },
    {
      label: "Checked-In Guests",
      value: data?.bookings?.checkedIn ?? "—",
      icon: Users,
      color: "bg-purple-500",
    },
    {
      label: "Pending Housekeeping",
      value: data?.housekeeping?.pending ?? "—",
      icon: Brush,
      color: "bg-yellow-500",
    },
    {
      label: "Pending Maintenance",
      value: data?.maintenance?.pending ?? "—",
      icon: Wrench,
      color: "bg-cyan-500",
    },
    {
      label: "Rooms in Maintenance",
      value: data?.rooms?.maintenance ?? "—",
      icon: BedDouble,
      color: "bg-gray-500",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your alumni weekend event.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-border p-5 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center shrink-0`}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">
                {isLoading ? (
                  <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" />
                ) : (
                  stat.value
                )}
              </p>
              {stat.sub && (
                <p className="text-xs text-muted-foreground truncate">{stat.sub}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate("/checkin")}
              className="w-full text-left px-4 py-3 rounded-md bg-accent hover:bg-accent/80 text-sm transition-colors"
            >
              Check in a guest
            </button>
            <button
              onClick={() => navigate("/bookings/new")}
              className="w-full text-left px-4 py-3 rounded-md bg-accent hover:bg-accent/80 text-sm transition-colors"
            >
              Create a booking
            </button>
            <button
              onClick={() => navigate("/incidents")}
              className="w-full text-left px-4 py-3 rounded-md bg-accent hover:bg-accent/80 text-sm transition-colors"
            >
              Report an incident
            </button>
            <button
              onClick={() => navigate("/reports")}
              className="w-full text-left px-4 py-3 rounded-md bg-accent hover:bg-accent/80 text-sm transition-colors"
            >
              View reports
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : data ? (
            <div className="space-y-3">
              <StatusRow
                label="Room Occupancy"
                value={data.rooms.total > 0 ? `${Math.round((data.rooms.occupied / data.rooms.total) * 100)}%` : "0%"}
                color={data.rooms.occupied / data.rooms.total > 0.9 ? "text-red-600" : "text-green-600"}
              />
              <StatusRow
                label="Open Incidents"
                value={String(data.incidents.open)}
                color={data.incidents.open > 5 ? "text-red-600" : data.incidents.open > 0 ? "text-yellow-600" : "text-green-600"}
              />
              <StatusRow
                label="Pending Housekeeping"
                value={String(data.housekeeping.pending)}
                color={data.housekeeping.pending > 10 ? "text-red-600" : data.housekeeping.pending > 0 ? "text-yellow-600" : "text-green-600"}
              />
              <StatusRow
                label="Pending Maintenance"
                value={String(data.maintenance.pending)}
                color={data.maintenance.pending > 5 ? "text-red-600" : data.maintenance.pending > 0 ? "text-yellow-600" : "text-green-600"}
              />
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Unable to load system status.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-semibold text-sm ${color}`}>{value}</span>
    </div>
  );
}
