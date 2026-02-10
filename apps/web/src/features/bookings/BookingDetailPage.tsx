import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarCheck,
  User,
  BedDouble,
  UtensilsCrossed,
} from "lucide-react";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  CHECKED_IN: "bg-green-100 text-green-800",
  CHECKED_OUT: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-orange-100 text-orange-800",
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["booking", id],
    queryFn: async () => {
      const { data } = await api.get(`/bookings/${id}`);
      return data.data;
    },
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/bookings/${id}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Booking not found</p>
        <button
          onClick={() => navigate("/bookings")}
          className="mt-4 text-primary hover:underline text-sm"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const booking = data;

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate("/bookings")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Bookings
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Booking Details</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Created {new Date(booking.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[booking.status] ?? "bg-gray-100 text-gray-800"}`}
        >
          {booking.status.replace("_", " ")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guest Info */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Guest Information</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">
                {booking.user.firstName} {booking.user.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{booking.user.email}</dd>
            </div>
            {booking.user.phone && (
              <div>
                <dt className="text-muted-foreground">Phone</dt>
                <dd>{booking.user.phone}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Stay Info */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Stay Details</h2>
          </div>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-muted-foreground">Event</dt>
              <dd className="font-medium">{booking.event?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Arrival</dt>
              <dd>{new Date(booking.arrivalDate).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Departure</dt>
              <dd>{new Date(booking.departureDate).toLocaleString()}</dd>
            </div>
            {booking.specialRequirements && (
              <div>
                <dt className="text-muted-foreground">Special Requirements</dt>
                <dd>{booking.specialRequirements}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Room Info */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <BedDouble className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Room Assignment</h2>
          </div>
          {booking.room ? (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Building</dt>
                <dd className="font-medium">{booking.room.building?.name}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Room</dt>
                <dd>Room {booking.room.number}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Type</dt>
                <dd>{booking.room.roomType?.name} (capacity: {booking.room.roomType?.capacity})</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Floor</dt>
                <dd>{booking.room.floor}</dd>
              </div>
            </dl>
          ) : (
            <p className="text-sm text-muted-foreground">No room assigned yet</p>
          )}
        </div>

        {/* Meal Entitlements */}
        <div className="bg-white rounded-lg border border-border p-6">
          <div className="flex items-center gap-2 mb-4">
            <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Meal Entitlements</h2>
          </div>
          {booking.mealEntitlements?.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {booking.mealEntitlements.map((me: any) => (
                <li
                  key={me.id}
                  className="flex items-center justify-between py-1"
                >
                  <span>
                    {me.meal?.name} — {me.meal?.type}{" "}
                    <span className="text-muted-foreground">
                      ({new Date(me.meal?.date).toLocaleDateString()})
                    </span>
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${me.isRedeemed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                  >
                    {me.isRedeemed ? "Redeemed" : "Available"}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No meal entitlements yet
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      {booking.status !== "CANCELLED" && booking.status !== "CHECKED_OUT" && (
        <div className="mt-6 flex gap-3">
          {booking.status === "PENDING" || booking.status === "CONFIRMED" ? (
            <button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel Booking"}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
