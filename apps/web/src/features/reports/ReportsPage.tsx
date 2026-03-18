import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";
import api from "@/lib/api";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

type Tab = "financial" | "occupancy" | "incidents";

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("financial");

  const financialQuery = useQuery({
    queryKey: ["report-financial"],
    queryFn: async () => {
      const { data } = await api.get("/reports/financial");
      return data.data;
    },
    enabled: tab === "financial",
  });

  const occupancyQuery = useQuery({
    queryKey: ["report-occupancy"],
    queryFn: async () => {
      const { data } = await api.get("/reports/occupancy");
      return data.data;
    },
    enabled: tab === "occupancy",
  });

  const incidentQuery = useQuery({
    queryKey: ["report-incidents"],
    queryFn: async () => {
      const { data } = await api.get("/reports/incidents");
      return data.data;
    },
    enabled: tab === "incidents",
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Financial summaries, occupancy data, and incident analysis
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-md p-1 w-fit">
        {(["financial", "occupancy", "incidents"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Financial Report */}
      {tab === "financial" && (
        financialQuery.isLoading ? (
          <LoadingState />
        ) : !financialQuery.data ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard
                title="Catering"
                items={[
                  { label: "Meals Served", value: financialQuery.data.catering.totalMealsServed },
                  { label: "Avg Cost/Head", value: `$${financialQuery.data.catering.avgCostPerHead.toFixed(2)}` },
                  { label: "Total Cost", value: `$${financialQuery.data.catering.totalCost.toFixed(2)}` },
                ]}
              />
              <SummaryCard
                title="Maintenance"
                items={[
                  { label: "Completed", value: financialQuery.data.maintenance.completedRequests },
                  { label: "Actual Cost", value: `$${financialQuery.data.maintenance.totalActualCost.toFixed(2)}` },
                  { label: "Est. Cost", value: `$${financialQuery.data.maintenance.totalEstimatedCost.toFixed(2)}` },
                ]}
              />
              <SummaryCard
                title="Per Guest"
                items={[
                  { label: "Total Bookings", value: financialQuery.data.guests.totalBookings },
                  { label: "Cost/Guest", value: `$${financialQuery.data.guests.costPerGuest.toFixed(2)}` },
                ]}
              />
            </div>

            {/* Financial bar chart */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="font-medium mb-4">Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { name: "Catering", cost: financialQuery.data.catering.totalCost },
                  { name: "Maintenance", cost: financialQuery.data.maintenance.totalActualCost },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Bar dataKey="cost" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )
      )}

      {/* Occupancy Report */}
      {tab === "occupancy" && (
        occupancyQuery.isLoading ? (
          <LoadingState />
        ) : !occupancyQuery.data ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Room Status Pie */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="font-medium mb-4">Rooms by Status</h3>
              {occupancyQuery.data.byStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={occupancyQuery.data.byStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ status, count }: any) => `${status}: ${count}`}
                    >
                      {occupancyQuery.data.byStatus.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No data</p>
              )}
            </div>

            {/* Clean Status Pie */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="font-medium mb-4">Rooms by Clean Status</h3>
              {occupancyQuery.data.byCleanStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={occupancyQuery.data.byCleanStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ status, count }: any) => `${status}: ${count}`}
                    >
                      {occupancyQuery.data.byCleanStatus.map((_: any, i: number) => (
                        <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No data</p>
              )}
            </div>
          </div>
        )
      )}

      {/* Incidents Report */}
      {tab === "incidents" && (
        incidentQuery.isLoading ? (
          <LoadingState />
        ) : !incidentQuery.data ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* By Type Bar */}
            <div className="bg-white rounded-lg border border-border p-6">
              <h3 className="font-medium mb-4">Incidents by Type</h3>
              {incidentQuery.data.byType.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={incidentQuery.data.byType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No data</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* By Status Pie */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="font-medium mb-4">Incidents by Status</h3>
                {incidentQuery.data.byStatus.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={incidentQuery.data.byStatus}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {incidentQuery.data.byStatus.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-12">No data</p>
                )}
              </div>

              {/* By Severity Pie */}
              <div className="bg-white rounded-lg border border-border p-6">
                <h3 className="font-medium mb-4">Incidents by Severity</h3>
                {incidentQuery.data.bySeverity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={incidentQuery.data.bySeverity}
                        dataKey="count"
                        nameKey="severity"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {incidentQuery.data.bySeverity.map((_: any, i: number) => (
                          <Cell key={i} fill={COLORS[(i + 4) % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-12">No data</p>
                )}
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}

function SummaryCard({ title, items }: { title: string; items: { label: string; value: string | number }[] }) {
  return (
    <div className="bg-white rounded-lg border border-border p-5">
      <h3 className="font-medium text-sm mb-3">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="font-medium text-sm">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white rounded-lg border border-border flex items-center justify-center py-12">
      <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-white rounded-lg border border-border flex flex-col items-center justify-center py-12 text-muted-foreground">
      <BarChart3 className="w-10 h-10 mb-3" />
      <p className="text-sm">No report data available</p>
    </div>
  );
}
