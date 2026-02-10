import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, AlertCircle } from "lucide-react";
import api from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  TOILETRY: "bg-blue-100 text-blue-800",
  LINEN: "bg-purple-100 text-purple-800",
  CONSUMABLE: "bg-green-100 text-green-800",
  FURNITURE: "bg-orange-100 text-orange-800",
  EQUIPMENT: "bg-gray-100 text-gray-800",
};

export default function InventoryPage() {
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", categoryFilter, lowStockOnly],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "100" });
      if (categoryFilter) params.set("category", categoryFilter);
      if (lowStockOnly) params.set("lowStock", "true");
      const { data } = await api.get(`/inventory?${params}`);
      return data;
    },
  });

  const items = data?.data ?? [];
  const lowStockCount = items.filter((i: any) => i.totalStock <= i.minThreshold).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track toiletries, linens, consumables, and equipment
          </p>
        </div>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            <AlertCircle className="w-4 h-4" />
            {lowStockCount} item{lowStockCount > 1 ? "s" : ""} low on stock
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All Categories</option>
          <option value="TOILETRY">Toiletry</option>
          <option value="LINEN">Linen</option>
          <option value="CONSUMABLE">Consumable</option>
          <option value="FURNITURE">Furniture</option>
          <option value="EQUIPMENT">Equipment</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded border-border"
          />
          Low stock only
        </label>
      </div>

      {/* Inventory table */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Package className="w-10 h-10 mb-3" />
            <p className="text-sm">No inventory items found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium">Item</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Stock</th>
                  <th className="text-left px-4 py-3 font-medium">Min Threshold</th>
                  <th className="text-left px-4 py-3 font-medium">Unit</th>
                  <th className="text-left px-4 py-3 font-medium">Cost/Unit</th>
                  <th className="text-left px-4 py-3 font-medium">Allocations</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any) => {
                  const isLow = item.totalStock <= item.minThreshold;
                  return (
                    <tr key={item.id} className={`border-b border-border last:border-0 hover:bg-gray-50 ${isLow ? "bg-red-50/50" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isLow && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${CATEGORY_COLORS[item.category] ?? "bg-gray-100"}`}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={isLow ? "text-red-600 font-bold" : ""}>
                          {item.totalStock}
                        </span>
                      </td>
                      <td className="px-4 py-3">{item.minThreshold}</td>
                      <td className="px-4 py-3">{item.unit}</td>
                      <td className="px-4 py-3">${item.costPerUnit.toFixed(2)}</td>
                      <td className="px-4 py-3">{item._count?.roomAllocations ?? 0} rooms</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
