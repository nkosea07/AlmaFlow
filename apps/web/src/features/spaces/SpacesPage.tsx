import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Map, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  OUTDOOR: "bg-green-100 text-green-800",
  INDOOR: "bg-blue-100 text-blue-800",
  PARKING: "bg-gray-100 text-gray-800",
  CEREMONY: "bg-purple-100 text-purple-800",
  RECREATION: "bg-orange-100 text-orange-800",
};

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  RESERVED: "bg-blue-100 text-blue-800",
  IN_USE: "bg-yellow-100 text-yellow-800",
  UNDER_SETUP: "bg-orange-100 text-orange-800",
  CLEARED: "bg-gray-100 text-gray-800",
};

export default function SpacesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["spaces", page, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get(`/spaces?${params}`);
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/spaces/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });

  const spaces = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Spaces & Grounds</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage outdoor and indoor spaces, structures, and event grounds
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Types</option>
          <option value="OUTDOOR">Outdoor</option>
          <option value="INDOOR">Indoor</option>
          <option value="PARKING">Parking</option>
          <option value="CEREMONY">Ceremony</option>
          <option value="RECREATION">Recreation</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="RESERVED">Reserved</option>
          <option value="IN_USE">In Use</option>
          <option value="UNDER_SETUP">Under Setup</option>
          <option value="CLEARED">Cleared</option>
        </select>
      </div>

      {/* Spaces grid */}
      {isLoading ? (
        <div className="bg-white rounded-lg border border-border flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : spaces.length === 0 ? (
        <div className="bg-white rounded-lg border border-border flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Map className="w-10 h-10 mb-3" />
          <p className="text-sm">No spaces found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space: any) => (
            <div key={space.id} className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{space.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[space.status] ?? "bg-gray-100"}`}>
                    {space.status?.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[space.type] ?? "bg-gray-100"}`}>
                    {space.type}
                  </span>
                  {space.capacity && (
                    <span className="text-xs text-muted-foreground">Capacity: {space.capacity}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{space.location}</p>
                {space.notes && (
                  <p className="text-xs text-muted-foreground italic mb-3">{space.notes}</p>
                )}
                <div className="text-xs text-muted-foreground mb-3">
                  {space._count?.structures ?? space.structures?.length ?? 0} structure(s)
                </div>

                {/* Structures list */}
                {space.structures?.length > 0 && (
                  <div className="border-t border-border/50 pt-2 mb-3">
                    <p className="text-xs font-medium mb-1">Structures:</p>
                    {space.structures.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between text-xs py-1">
                        <span>{s.type} {s.dimensions ? `(${s.dimensions})` : ""}</span>
                        <span className={`px-1.5 py-0.5 rounded ${s.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Status actions */}
                <div className="flex gap-1 flex-wrap">
                  {["AVAILABLE", "RESERVED", "IN_USE", "UNDER_SETUP", "CLEARED"].map((s) => (
                    <button
                      key={s}
                      disabled={space.status === s || updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ id: space.id, status: s })}
                      className="px-2 py-1 rounded text-xs font-medium disabled:opacity-20 bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 bg-white rounded-lg border border-border px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1 rounded hover:bg-accent disabled:opacity-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages} className="p-1 rounded hover:bg-accent disabled:opacity-50">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
