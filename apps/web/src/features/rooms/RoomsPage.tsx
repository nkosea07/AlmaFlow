import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BedDouble, Search } from "lucide-react";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, { bg: string; dot: string; text: string }> = {
  AVAILABLE: { bg: "bg-green-50", dot: "bg-green-500", text: "text-green-700" },
  OCCUPIED: { bg: "bg-blue-50", dot: "bg-blue-500", text: "text-blue-700" },
  RESERVED: { bg: "bg-yellow-50", dot: "bg-yellow-500", text: "text-yellow-700" },
  OUT_OF_SERVICE: { bg: "bg-red-50", dot: "bg-red-500", text: "text-red-700" },
  MAINTENANCE: { bg: "bg-orange-50", dot: "bg-orange-500", text: "text-orange-700" },
};

const CLEAN_COLORS: Record<string, string> = {
  CLEAN: "text-green-600",
  DIRTY: "text-red-600",
  IN_PROGRESS: "text-yellow-600",
  INSPECTED: "text-blue-600",
};

export default function RoomsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [cleanFilter, setCleanFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["rooms", statusFilter, cleanFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (statusFilter) params.set("status", statusFilter);
      if (cleanFilter) params.set("cleanStatus", cleanFilter);
      const { data } = await api.get(`/rooms?${params}`);
      return data;
    },
  });

  const allRooms = data?.data ?? [];

  // Client-side search filter on room number / building name
  const rooms = search
    ? allRooms.filter(
        (r: any) =>
          r.number?.toLowerCase().includes(search.toLowerCase()) ||
          r.building?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : allRooms;

  // Group rooms by building
  const grouped = rooms.reduce((acc: Record<string, any[]>, room: any) => {
    const key = room.building?.name ?? "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(room);
    return acc;
  }, {});

  // Stats
  const statusCounts = allRooms.reduce(
    (acc: Record<string, number>, r: any) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {}
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Room status overview and management
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <button
            key={status}
            onClick={() =>
              setStatusFilter((prev) => (prev === status ? "" : status))
            }
            className={`flex items-center gap-2 px-4 py-3 rounded-lg border text-sm transition-colors ${
              statusFilter === status
                ? "border-primary ring-2 ring-ring"
                : "border-border"
            } ${colors.bg}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
            <span className={`font-medium ${colors.text}`}>
              {status.replace("_", " ")}
            </span>
            <span className="ml-auto font-bold">{statusCounts[status] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search rooms or buildings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={cleanFilter}
          onChange={(e) => setCleanFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Cleanliness</option>
          <option value="CLEAN">Clean</option>
          <option value="DIRTY">Dirty</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="INSPECTED">Inspected</option>
        </select>
      </div>

      {/* Room Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-white rounded-lg border border-border">
          <BedDouble className="w-10 h-10 mb-3" />
          <p className="text-sm">No rooms found</p>
        </div>
      ) : (
        Object.entries(grouped).map(([building, buildingRooms]) => (
          <div key={building} className="mb-8">
            <h2 className="text-lg font-semibold mb-3">{building}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {(buildingRooms as any[]).map((room: any) => {
                const colors = STATUS_COLORS[room.status] ?? STATUS_COLORS.AVAILABLE;
                const cleanColor = CLEAN_COLORS[room.cleanStatus] ?? "text-gray-500";
                const guest = room.bookings?.[0]?.user;

                return (
                  <div
                    key={room.id}
                    className={`rounded-lg border border-border p-4 ${colors.bg} transition-shadow hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm">{room.number}</span>
                      <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {room.roomType?.name} (max {room.roomType?.capacity})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Floor {room.floor}
                    </div>
                    <div className={`text-xs mt-1 font-medium ${cleanColor}`}>
                      {room.cleanStatus?.replace("_", " ")}
                    </div>
                    {guest && (
                      <div className="mt-2 pt-2 border-t border-border/50 text-xs truncate">
                        {guest.firstName} {guest.lastName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
