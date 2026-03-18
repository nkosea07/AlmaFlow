import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";

const BADGE_TYPE_COLORS: Record<string, string> = {
  ALUMNI: "bg-blue-100 text-blue-800",
  STAFF: "bg-green-100 text-green-800",
  VIP: "bg-purple-100 text-purple-800",
  VENDOR: "bg-orange-100 text-orange-800",
  MEDIA: "bg-yellow-100 text-yellow-800",
};

type Tab = "badges" | "logs";

export default function AccessControlPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("badges");
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  // Badges query
  const badgesQuery = useQuery({
    queryKey: ["badges", page, typeFilter, activeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (typeFilter) params.set("type", typeFilter);
      if (activeFilter) params.set("isActive", activeFilter);
      const { data } = await api.get(`/access/badges?${params}`);
      return data;
    },
    enabled: tab === "badges",
  });

  // Access logs query
  const logsQuery = useQuery({
    queryKey: ["access-logs", page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "50" });
      const { data } = await api.get(`/access/logs?${params}`);
      return data;
    },
    enabled: tab === "logs",
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/access/badges/${id}/revoke`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["badges"] });
    },
  });

  const badges = badgesQuery.data?.data ?? [];
  const logs = logsQuery.data?.data ?? [];
  const activePagination = tab === "badges"
    ? badgesQuery.data?.pagination ?? { page: 1, totalPages: 1, total: 0 }
    : logsQuery.data?.pagination ?? { page: 1, totalPages: 1, total: 0 };
  const isLoading = tab === "badges" ? badgesQuery.isLoading : logsQuery.isLoading;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Access Control</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage badges, scan access, and review entry/exit logs
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-md p-1 w-fit">
        <button
          onClick={() => { setTab("badges"); setPage(1); }}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            tab === "badges" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Badges
        </button>
        <button
          onClick={() => { setTab("logs"); setPage(1); }}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            tab === "logs" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Access Logs
        </button>
      </div>

      {/* Filters for badges */}
      {tab === "badges" && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Types</option>
            <option value="ALUMNI">Alumni</option>
            <option value="STAFF">Staff</option>
            <option value="VIP">VIP</option>
            <option value="VENDOR">Vendor</option>
            <option value="MEDIA">Media</option>
          </select>
          <select
            value={activeFilter}
            onChange={(e) => { setActiveFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All</option>
            <option value="true">Active</option>
            <option value="false">Revoked</option>
          </select>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : tab === "badges" ? (
          badges.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Shield className="w-10 h-10 mb-3" />
              <p className="text-sm">No badges found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium">User</th>
                    <th className="text-left px-4 py-3 font-medium">Type</th>
                    <th className="text-left px-4 py-3 font-medium">QR Code</th>
                    <th className="text-left px-4 py-3 font-medium">Status</th>
                    <th className="text-left px-4 py-3 font-medium">Issued</th>
                    <th className="text-left px-4 py-3 font-medium">Scans</th>
                    <th className="text-left px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {badges.map((badge: any) => (
                    <tr key={badge.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {badge.user?.firstName} {badge.user?.lastName}
                        <div className="text-xs text-muted-foreground">{badge.user?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${BADGE_TYPE_COLORS[badge.type] ?? "bg-gray-100"}`}>
                          {badge.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{badge.qrCode?.slice(0, 16)}...</code>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badge.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {badge.isActive ? "Active" : "Revoked"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(badge.issuedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">{badge._count?.accessLogs ?? 0}</td>
                      <td className="px-4 py-3">
                        {badge.isActive && (
                          <button
                            onClick={() => revokeMutation.mutate(badge.id)}
                            disabled={revokeMutation.isPending}
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                          >
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Shield className="w-10 h-10 mb-3" />
              <p className="text-sm">No access logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium">User</th>
                    <th className="text-left px-4 py-3 font-medium">Badge</th>
                    <th className="text-left px-4 py-3 font-medium">Action</th>
                    <th className="text-left px-4 py-3 font-medium">Location</th>
                    <th className="text-left px-4 py-3 font-medium">Granted</th>
                    <th className="text-left px-4 py-3 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: any) => (
                    <tr key={log.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {log.user?.firstName} {log.user?.lastName}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${BADGE_TYPE_COLORS[log.badge?.type] ?? "bg-gray-100"}`}>
                          {log.badge?.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">{log.action}</td>
                      <td className="px-4 py-3">{log.location}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${log.granted ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {log.granted ? "Granted" : "Denied"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(log.scannedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {activePagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Page {activePagination.page} of {activePagination.totalPages} ({activePagination.total} total)
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="p-1 rounded hover:bg-accent disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage((p) => Math.min(activePagination.totalPages, p + 1))} disabled={page >= activePagination.totalPages} className="p-1 rounded hover:bg-accent disabled:opacity-50">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
