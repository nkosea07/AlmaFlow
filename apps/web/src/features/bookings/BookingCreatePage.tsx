import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createBookingSchema, type CreateBookingInput } from "@almaflow/shared";
import { ArrowLeft } from "lucide-react";
import api from "@/lib/api";

export default function BookingCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
  });

  // Fetch events for the dropdown
  const { data: eventsData } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      // Use rooms/buildings endpoint to infer events, or direct event query
      const { data } = await api.get("/rooms/buildings/list");
      return data;
    },
  });

  // Fetch available rooms when event + dates are selected
  const eventId = watch("eventId");
  const arrivalDate = watch("arrivalDate");
  const departureDate = watch("departureDate");

  const { data: availableRoomsData } = useQuery({
    queryKey: ["availableRooms", eventId, arrivalDate, departureDate],
    queryFn: async () => {
      const params = new URLSearchParams({
        eventId,
        arrivalDate,
        departureDate,
      });
      const { data } = await api.get(`/rooms/available?${params}`);
      return data;
    },
    enabled: !!eventId && !!arrivalDate && !!departureDate,
  });

  const availableRooms = availableRoomsData?.data ?? [];
  const buildings = eventsData?.data ?? [];

  // Derive unique events from buildings
  const events = buildings.reduce((acc: any[], b: any) => {
    if (b.eventId && !acc.find((e: any) => e.id === b.eventId)) {
      acc.push({ id: b.eventId, name: b.name + " (Event)" });
    }
    return acc;
  }, []);

  const createMutation = useMutation({
    mutationFn: async (data: CreateBookingInput) => {
      const { data: result } = await api.post("/bookings", data);
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      navigate(`/bookings/${data.data.id}`);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || "Failed to create booking");
    },
  });

  const onSubmit = (data: CreateBookingInput) => {
    setError("");
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate("/bookings")}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Bookings
      </button>

      <h1 className="text-2xl font-bold mb-6">Create Booking</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-lg border border-border p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Event</label>
          <select
            {...register("eventId")}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select an event</option>
            {events.map((event: any) => (
              <option key={event.id} value={event.id}>
                {event.name}
              </option>
            ))}
          </select>
          {errors.eventId && (
            <p className="text-red-500 text-xs mt-1">{errors.eventId.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Arrival Date</label>
            <input
              type="datetime-local"
              {...register("arrivalDate")}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.arrivalDate && (
              <p className="text-red-500 text-xs mt-1">{errors.arrivalDate.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Departure Date</label>
            <input
              type="datetime-local"
              {...register("departureDate")}
              className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.departureDate && (
              <p className="text-red-500 text-xs mt-1">{errors.departureDate.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Room (optional)</label>
          <select
            {...register("roomId")}
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Assign later</option>
            {availableRooms.map((room: any) => (
              <option key={room.id} value={room.id}>
                {room.building?.name} - Room {room.number} ({room.roomType?.name}, capacity: {room.roomType?.capacity})
              </option>
            ))}
          </select>
          {errors.roomId && (
            <p className="text-red-500 text-xs mt-1">{errors.roomId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Special Requirements
          </label>
          <textarea
            {...register("specialRequirements")}
            rows={3}
            placeholder="Dietary needs, accessibility, etc."
            className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
          {errors.specialRequirements && (
            <p className="text-red-500 text-xs mt-1">
              {errors.specialRequirements.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting || createMutation.isPending}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {createMutation.isPending ? "Creating..." : "Create Booking"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/bookings")}
            className="px-4 py-2 border border-border rounded-md text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
