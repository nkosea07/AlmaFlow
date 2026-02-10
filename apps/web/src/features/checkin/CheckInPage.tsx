import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardCheck, UserCheck, UserX, Search } from "lucide-react";
import api from "@/lib/api";

export default function CheckInPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["checkins", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50" });
      if (statusFilter) params.set("status", statusFilter);
      const { data } = await api.get(`/checkin?${params}`);
      return data;
    },
  });

  const checkInMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post("/checkin/in", {
        bookingId: id,
        method: "STAFF_ASSISTED",
      });
    },
    onSuccess: () => {
      setSuccess("Guest checked in successfully");
      setError("");
      setBookingId("");
      queryClient.invalidateQueries({ queryKey: ["checkins"] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Check-in failed");
      setSuccess("");
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post("/checkin/out", { bookingId: id });
    },
    onSuccess: () => {
      setSuccess("Guest checked out successfully");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["checkins"] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Check-out failed");
      setSuccess("");
    },
  });

  const checkIns = data?.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Check-In / Check-Out</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Process guest arrivals and departures
        </p>
      </div>

      {/* Quick check-in by booking ID */}
      <div className="bg-white rounded-lg border border-border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-3">Quick Check-In</h2>
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Enter Booking ID..."
              value={bookingId}
              onChange={(e) => setBookingId(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={() => bookingId && checkInMutation.mutate(bookingId)}
            disabled={!bookingId || checkInMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            Check In
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All</option>
          <option value="checked_in">Currently Checked In</option>
          <option value="checked_out">Checked Out</option>
        </select>
      </div>

      {/* Check-in list */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : checkIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <ClipboardCheck className="w-10 h-10 mb-3" />
            <p className="text-sm">No check-in records</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium">Guest</th>
                  <th className="text-left px-4 py-3 font-medium">Room</th>
                  <th className="text-left px-4 py-3 font-medium">Method</th>
                  <th className="text-left px-4 py-3 font-medium">Checked In</th>
                  <th className="text-left px-4 py-3 font-medium">Checked Out</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {checkIns.map((ci: any) => (
                  <tr key={ci.id} className="border-b border-border last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {ci.booking.user.firstName} {ci.booking.user.lastName}
                      </div>
                      <div className="text-muted-foreground text-xs">{ci.booking.user.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {ci.booking.room ? (
                        <span>{ci.booking.room.building?.name} - {ci.booking.room.number ?? ci.booking.room.roomType?.name}</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                        {ci.method.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(ci.checkedInAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {ci.checkedOutAt ? (
                        new Date(ci.checkedOutAt).toLocaleString()
                      ) : (
                        <span className="text-green-600 font-medium text-xs">Currently In</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {!ci.checkedOutAt && (
                        <button
                          onClick={() => checkOutMutation.mutate(ci.booking.id)}
                          disabled={checkOutMutation.isPending}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
