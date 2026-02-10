import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { UtensilsCrossed, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  BREAKFAST: "bg-yellow-100 text-yellow-800",
  LUNCH: "bg-orange-100 text-orange-800",
  DINNER: "bg-purple-100 text-purple-800",
  SNACK: "bg-blue-100 text-blue-800",
  REFRESHMENTS: "bg-green-100 text-green-800",
};

export default function MealsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["meals", page, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (typeFilter) params.set("type", typeFilter);
      const { data } = await api.get(`/meals?${params}`);
      return data;
    },
  });

  const meals = data?.data ?? [];
  const pagination = data?.pagination ?? { page: 1, totalPages: 1, total: 0 };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meals</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage meal schedules and track redemptions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Types</option>
          <option value="BREAKFAST">Breakfast</option>
          <option value="LUNCH">Lunch</option>
          <option value="DINNER">Dinner</option>
          <option value="SNACK">Snack</option>
          <option value="REFRESHMENTS">Refreshments</option>
        </select>
      </div>

      {/* Meals grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : meals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-white rounded-lg border border-border">
          <UtensilsCrossed className="w-10 h-10 mb-3" />
          <p className="text-sm">No meals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meals.map((meal: any) => {
            const redeemed = meal._count?.redemptions ?? 0;
            const entitled = meal._count?.entitlements ?? 0;
            const pct = entitled > 0 ? Math.round((redeemed / entitled) * 100) : 0;

            return (
              <div
                key={meal.id}
                className="bg-white rounded-lg border border-border p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{meal.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${TYPE_COLORS[meal.type] ?? "bg-gray-100"}`}
                  >
                    {meal.type}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>{new Date(meal.date).toLocaleDateString()}</div>
                  <div>
                    {new Date(meal.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" — "}
                    {new Date(meal.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  {meal.venue && <div>Venue: {meal.venue}</div>}
                  <div>Cost: ${meal.costPerHead}/head</div>
                </div>

                {/* Redemption progress */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>{redeemed} / {entitled} redeemed</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1 rounded hover:bg-accent disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={page >= pagination.totalPages}
              className="p-1 rounded hover:bg-accent disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
