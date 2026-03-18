import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, ChevronLeft, ChevronRight, Fuel, AlertTriangle } from "lucide-react";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  RUNNING: "bg-green-100 text-green-800",
  STANDBY: "bg-yellow-100 text-yellow-800",
  MAINTENANCE: "bg-orange-100 text-orange-800",
  OFFLINE: "bg-red-100 text-red-800",
};

type Tab = "generators" | "incidents";

export default function PowerPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("generators");
  const [incidentPage, setIncidentPage] = useState(1);
  const [expandedGen, setExpandedGen] = useState<string | null>(null);

  const generatorsQuery = useQuery({
    queryKey: ["generators"],
    queryFn: async () => {
      const { data } = await api.get("/power/generators");
      return data;
    },
    enabled: tab === "generators",
  });

  const incidentsQuery = useQuery({
    queryKey: ["power-incidents", incidentPage],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(incidentPage), limit: "20" });
      const { data } = await api.get(`/power/incidents?${params}`);
      return data;
    },
    enabled: tab === "incidents",
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await api.patch(`/power/generators/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generators"] });
    },
  });

  const generators = generatorsQuery.data?.data ?? [];
  const incidents = incidentsQuery.data?.data ?? [];
  const incidentPagination = incidentsQuery.data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Power & Utilities</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Monitor generators, fuel levels, and power incidents
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-md p-1 w-fit">
        <button
          onClick={() => setTab("generators")}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            tab === "generators" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Generators
        </button>
        <button
          onClick={() => { setTab("incidents"); setIncidentPage(1); }}
          className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
            tab === "incidents" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Power Incidents
        </button>
      </div>

      {tab === "generators" ? (
        <div className="space-y-4">
          {generatorsQuery.isLoading ? (
            <div className="bg-white rounded-lg border border-border flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : generators.length === 0 ? (
            <div className="bg-white rounded-lg border border-border flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Zap className="w-10 h-10 mb-3" />
              <p className="text-sm">No generators registered</p>
            </div>
          ) : (
            generators.map((gen: any) => {
              const fuelPercent = gen.fuelCapacity > 0
                ? Math.round((gen.currentFuel / gen.fuelCapacity) * 100)
                : 0;
              const fuelColor = fuelPercent > 50 ? "bg-green-500" : fuelPercent > 20 ? "bg-yellow-500" : "bg-red-500";
              const isExpanded = expandedGen === gen.id;

              return (
                <div key={gen.id} className="bg-white rounded-lg border border-border overflow-hidden">
                  <div
                    className="px-4 py-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedGen(isExpanded ? null : gen.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        <div>
                          <h3 className="font-medium">{gen.name}</h3>
                          <p className="text-xs text-muted-foreground">{gen.location}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[gen.status] ?? "bg-gray-100"}`}>
                        {gen.status}
                      </span>
                    </div>

                    {/* Fuel gauge */}
                    <div className="flex items-center gap-3">
                      <Fuel className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className={`${fuelColor} h-3 rounded-full transition-all`}
                          style={{ width: `${fuelPercent}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-20 text-right">
                        {gen.currentFuel}L / {gen.fuelCapacity}L
                      </span>
                    </div>

                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{gen._count?.fuelLogs ?? 0} fuel logs</span>
                      <span>{gen._count?.incidents ?? 0} incidents</span>
                      {gen.criticalAreas?.length > 0 && (
                        <span>Critical: {gen.criticalAreas.join(", ")}</span>
                      )}
                    </div>
                  </div>

                  {/* Expanded actions */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border/50 bg-gray-50">
                      <p className="text-xs text-muted-foreground mt-3 mb-3">Change status:</p>
                      <div className="flex gap-2 flex-wrap">
                        {["RUNNING", "STANDBY", "MAINTENANCE", "OFFLINE"].map((s) => (
                          <button
                            key={s}
                            disabled={gen.status === s || updateStatusMutation.isPending}
                            onClick={() => updateStatusMutation.mutate({ id: gen.id, status: s })}
                            className={`px-3 py-1.5 rounded text-xs font-medium disabled:opacity-30 ${
                              gen.status === s
                                ? "bg-gray-300 text-gray-600"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Power Incidents */
        <div className="bg-white rounded-lg border border-border overflow-hidden">
          {incidentsQuery.isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <AlertTriangle className="w-10 h-10 mb-3" />
              <p className="text-sm">No power incidents</p>
            </div>
          ) : (
            <div>
              {incidents.map((inc: any) => (
                <div key={inc.id} className="px-4 py-4 border-b border-border last:border-0 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">{inc.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {inc.generator && (
                          <span>Generator: {inc.generator.name} ({inc.generator.location})</span>
                        )}
                        <span>{new Date(inc.createdAt).toLocaleString()}</span>
                      </div>
                      {inc.affectedAreas?.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {inc.affectedAreas.map((area: string) => (
                            <span key={area} className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded">
                              {area}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${inc.resolved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {inc.resolved ? "Resolved" : "Active"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {incidentPagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {incidentPagination.page} of {incidentPagination.totalPages} ({incidentPagination.total} total)
              </p>
              <div className="flex gap-2">
                <button onClick={() => setIncidentPage((p) => Math.max(1, p - 1))} disabled={incidentPage <= 1} className="p-1 rounded hover:bg-accent disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setIncidentPage((p) => Math.min(incidentPagination.totalPages, p + 1))} disabled={incidentPage >= incidentPagination.totalPages} className="p-1 rounded hover:bg-accent disabled:opacity-50">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
