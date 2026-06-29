"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { useSession } from "next-auth/react";

interface CalendarEventData {
  id: string;
  title: string;
  description: string | null;
  startDatetime: string;
  endDatetime: string;
  status: string;
  colorCode: string | null;
  event: {
    id: string;
    name: string;
  } | null;
  vertical: {
    id: string;
    name: string;
  } | null;
}

interface RegistrationData {
  eventId: string;
  event: {
    name: string;
  };
}

export default function SchedulePage() {
  const { data: session } = useSession();
  const [events, setEvents] = React.useState<CalendarEventData[]>([]);
  const [registrations, setRegistrations] = React.useState<RegistrationData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterMode, setFilterMode] = React.useState<"all" | "my">("all");
  const [timeLeft, setTimeLeft] = React.useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Default fest start date: Nov 6, 2027
  const festStartDate = React.useMemo(() => new Date("2027-11-06T09:00:00"), []);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [calRes, regRes] = await Promise.all([
          fetch("/api/v1/calendar"),
          fetch("/api/v1/registrations")
        ]);

        if (calRes.ok) {
          const calJson = await calRes.json();
          setEvents(calJson.data || []);
        }
        if (regRes.ok) {
          const regJson = await regRes.json();
          setRegistrations(regJson.data || []);
        }
      } catch (error) {
        console.error("Failed to load schedule data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Countdown timer logic
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const difference = festStartDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft(null);
        clearInterval(timer);
        return;
      }

      // Check if more than 24 hours away
      if (difference > 24 * 60 * 60 * 1000) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [festStartDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter events based on active selection
  const registeredEventIds = new Set(registrations.map(r => r.eventId));
  const filteredEvents = events.filter(e => {
    if (filterMode === "all") return true;
    // For "my", show only events that belong to their registered event or are global (no specific eventId)
    return e.event ? registeredEventIds.has(e.event.id) : true;
  });

  // Group events by day
  const eventsByDay: { [key: string]: CalendarEventData[] } = {};
  filteredEvents.forEach(e => {
    const dateObj = new Date(e.startDatetime);
    const dayStr = dateObj.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
    if (!eventsByDay[dayStr]) {
      eventsByDay[dayStr] = [];
    }
    eventsByDay[dayStr].push(e);
  });

  function getStatusColor(status: string): string {
    switch (status) {
      case "COMPLETED": return "border-success/50 text-success bg-success/10";
      case "IN_PROGRESS": return "border-blue-500/50 text-blue-400 bg-blue-500/10";
      case "DELAYED": return "border-danger/50 text-danger bg-danger/10";
      case "CANCELLED": return "border-white/20 text-muted-foreground line-through";
      default: return "border-white/20 text-primary";
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">Your personalised itinerary for USHUS 2026.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterMode === "all" ? "default" : "outline"}
            size="sm"
            className={filterMode === "all" ? "bg-primary text-primary-foreground" : "border-white/10"}
            onClick={() => setFilterMode("all")}
          >
            All Events
          </Button>
          <Button
            variant={filterMode === "my" ? "default" : "outline"}
            size="sm"
            className={filterMode === "my" ? "bg-primary text-primary-foreground" : "border-white/10"}
            onClick={() => setFilterMode("my")}
          >
            My Events
          </Button>
        </div>
      </div>

      {/* Countdown Timer */}
      {timeLeft && (
        <Card className="glass border-primary/30 bg-primary/5 text-center p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full filter blur-xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold tracking-wider uppercase text-primary">Countdown to USHUS 2026</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center gap-4 sm:gap-6 pt-2">
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-primary">{String(timeLeft.days).padStart(2, "0")}</span>
              <span className="text-[10px] text-muted-foreground uppercase mt-1">Days</span>
            </div>
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-primary">{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className="text-[10px] text-muted-foreground uppercase mt-1">Hours</span>
            </div>
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-primary">{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className="text-[10px] text-muted-foreground uppercase mt-1">Mins</span>
            </div>
            <span className="text-2xl font-bold text-muted-foreground">:</span>
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono text-primary">{String(timeLeft.seconds).padStart(2, "0")}</span>
              <span className="text-[10px] text-muted-foreground uppercase mt-1">Secs</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule timeline */}
      {Object.keys(eventsByDay).length === 0 ? (
        <Card className="glass border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-1">No events scheduled</h3>
            <p className="text-sm text-muted-foreground">
              {filterMode === "my" ? "You are not registered for any events today." : "Check back later for updates."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(eventsByDay).map(([dayStr, dayEvents]) => (
            <div key={dayStr} className="space-y-4">
              <h2 className="text-xl font-semibold text-primary">{dayStr}</h2>
              <Card className="glass border-white/10">
                <CardContent className="p-0">
                  <div className="divide-y divide-white/10">
                    {dayEvents.map((event, idx) => {
                      const startTime = new Date(event.startDatetime).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit"
                      });
                      return (
                        <div key={idx} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 hover:bg-white/5 transition-colors">
                          <div className="sm:w-32 shrink-0 flex items-start sm:items-center gap-2 text-muted-foreground font-medium">
                            <Clock className="w-4 h-4" />
                            {startTime}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              <div className="flex gap-2">
                                <Badge variant="outline" className={getStatusColor(event.status)}>
                                  {event.status.replace(/_/g, " ")}
                                </Badge>
                                {event.event && (
                                  <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
                                    {event.event.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {event.description && (
                              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              Christ University, Bangalore Central Campus
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
