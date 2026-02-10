import { useAuthStore } from "@/stores/auth.store";
import {
  BedDouble,
  CalendarCheck,
  UtensilsCrossed,
  AlertTriangle,
  Users,
  Brush,
} from "lucide-react";

const stats = [
  { label: "Total Bookings", value: "—", icon: CalendarCheck, color: "bg-blue-500" },
  { label: "Rooms Occupied", value: "—", icon: BedDouble, color: "bg-green-500" },
  { label: "Meals Served", value: "—", icon: UtensilsCrossed, color: "bg-orange-500" },
  { label: "Open Incidents", value: "—", icon: AlertTriangle, color: "bg-red-500" },
  { label: "Checked-In Guests", value: "—", icon: Users, color: "bg-purple-500" },
  { label: "Pending Tasks", value: "—", icon: Brush, color: "bg-yellow-500" },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg border border-border p-6 flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}
            >
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <p className="text-muted-foreground text-sm">
            Activity feed will appear here once events are active.
          </p>
        </div>
        <div className="bg-white rounded-lg border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-md bg-accent hover:bg-accent/80 text-sm transition-colors">
              Check in a guest
            </button>
            <button className="w-full text-left px-4 py-3 rounded-md bg-accent hover:bg-accent/80 text-sm transition-colors">
              Create a booking
            </button>
            <button className="w-full text-left px-4 py-3 rounded-md bg-accent hover:bg-accent/80 text-sm transition-colors">
              Report an incident
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
