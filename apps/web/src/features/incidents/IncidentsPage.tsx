import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-red-100 text-red-800",
  INVESTIGATING: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  ESCALATED: "bg-orange-100 text-orange-800",
};

const SEVERITY_COLORS: Record<string, string> = {
  LOW: "text-blue-600",
  NORMAL: "text-gray-600",
  HIGH: "text-orange-600",
  URGENT: "text-red-600",
};

export default function IncidentsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["incidents", page, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (statusFilter) params.set("status", statusFilter);
      if (typeFilter) params.set("type", typeFilter);
      const { data } = await api.get(`/incidents?${params}`);
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/incidents/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
    },
  });

  const incidents = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Incidents</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track and resolve guest complaints, security issues, and operational incidents
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="ESCALATED">Escalated</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Types</option>
          <option value="GUEST_COMPLAINT">Guest Complaint</option>
          <option value="SECURITY">Security</option>
          <option value="MAINTENANCE">Maintenance</option>
          <option value="MEDICAL">Medical</option>
          <option value="CATERING">Catering</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Incidents list */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <AlertTriangle className="w-10 h-10 mb-3" />
            <p className="text-sm">No incidents found</p>
          </div>
        ) : (
          <div>
            {incidents.map((incident: any) => (
              <div
                key={incident.id}
                className="border-b border-border last:border-0"
              >
                <div
                  className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-bold text-sm ${SEVERITY_COLORS[incident.severity] ?? ""}`}>
                          [{incident.severity}]
                        </span>
                        <h3 className="font-medium text-sm truncate">{incident.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{incident.type.replace("_", " ")}</span>
                        <span>{new Date(incident.createdAt).toLocaleString()}</span>
                        <span>by {incident.reporter?.firstName} {incident.reporter?.lastName}</span>
                        {incident.location && <span>@ {incident.location}</span>}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[incident.status] ?? "bg-gray-100"}`}>
                      {incident.status}
                    </span>
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedId === incident.id && (
                  <div className="px-4 pb-4 border-t border-border/50 bg-gray-50">
                    <p className="text-sm mt-3 mb-3">{incident.description}</p>
                    <div className="flex gap-2">
                      {incident.status === "OPEN" && (
                        <button
                          onClick={() => updateMutation.mutate({ id: incident.id, status: "INVESTIGATING" })}
                          className="px-3 py-1.5 bg-yellow-600 text-white rounded text-xs font-medium hover:bg-yellow-700"
                        >
                          Start Investigation
                        </button>
                      )}
                      {(incident.status === "OPEN" || incident.status === "INVESTIGATING") && (
                        <>
                          <button
                            onClick={() => updateMutation.mutate({ id: incident.id, status: "RESOLVED" })}
                            className="px-3 py-1.5 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700"
                          >
                            Mark Resolved
                          </button>
                          <button
                            onClick={() => updateMutation.mutate({ id: incident.id, status: "ESCALATED" })}
                            className="px-3 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700"
                          >
                            Escalate
                          </button>
                        </>
                      )}
                      {incident.status === "RESOLVED" && (
                        <button
                          onClick={() => updateMutation.mutate({ id: incident.id, status: "CLOSED" })}
                          className="px-3 py-1.5 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700"
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
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
    </div>
  );
}
