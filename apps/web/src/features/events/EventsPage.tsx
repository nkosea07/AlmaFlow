import { useQuery } from "@tanstack/react-query";
import { Calendar, MapPin, Building2, CalendarCheck, UtensilsCrossed } from "lucide-react";
import api from "@/lib/api";

export default function EventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data } = await api.get("/events");
      return data;
    },
  });

  const events = data?.data ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage alumni weekend events and schedules
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-white rounded-lg border border-border">
          <Calendar className="w-10 h-10 mb-3" />
          <p className="text-sm">No events found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {events.map((event: any) => (
            <div key={event.id} className="bg-white rounded-lg border border-border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold">{event.name}</h2>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          event.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {event.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-muted-foreground text-sm mt-1">{event.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.startDate).toLocaleDateString()} — {new Date(event.endDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {event.venue}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CalendarCheck className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Bookings</p>
                      <p className="text-lg font-bold">{event._count?.bookings ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Building2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Buildings</p>
                      <p className="text-lg font-bold">{event._count?.buildings ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <UtensilsCrossed className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Meals</p>
                      <p className="text-lg font-bold">{event._count?.meals ?? 0}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-muted-foreground">Schedule Items</p>
                      <p className="text-lg font-bold">{event._count?.scheduleItems ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
