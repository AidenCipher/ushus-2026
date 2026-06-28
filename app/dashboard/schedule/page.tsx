"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";

export default function SchedulePage() {
  const schedule = [
    {
      date: "Day 1 - Jan 20",
      events: [
        { time: "09:00 AM", title: "Opening Ceremony", venue: "Main Auditorium", type: "Global" },
        { time: "11:00 AM", title: "Best Manager: Round 1", venue: "Block A, Room 402", type: "Event" },
        { time: "02:00 PM", title: "Lunch Break", venue: "Cafeteria", type: "Global" },
        { time: "03:30 PM", title: "Best Manager: Round 2", venue: "Block A, Room 402", type: "Event" },
      ]
    },
    {
      date: "Day 2 - Jan 21",
      events: [
        { time: "09:30 AM", title: "Best Manager: Round 3", venue: "Block B, Room 201", type: "Event" },
        { time: "01:00 PM", title: "Networking Session", venue: "Central Campus Grounds", type: "Global" },
        { time: "03:00 PM", title: "Best Manager: Finals", venue: "Main Auditorium", type: "Event" },
        { time: "06:00 PM", title: "Valedictory & Prize Distribution", venue: "Main Auditorium", type: "Global" },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground mt-1">Your personalised itinerary for USHUS 2026.</p>
      </div>

      <div className="space-y-8">
        {schedule.map((day) => (
          <div key={day.date} className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">{day.date}</h2>
            <Card className="glass border-white/10">
              <CardContent className="p-0">
                <div className="divide-y divide-white/10">
                  {day.events.map((event, idx) => (
                    <div key={idx} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 hover:bg-white/5 transition-colors">
                      <div className="sm:w-32 shrink-0 flex items-start sm:items-center gap-2 text-muted-foreground font-medium">
                        <Clock className="w-4 h-4" />
                        {event.time}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <h3 className="font-semibold text-lg">{event.title}</h3>
                          <Badge variant="outline" className={event.type === "Global" ? "border-purple-500/50 text-purple-400 bg-purple-500/10 w-fit" : "border-primary/50 text-primary bg-primary/10 w-fit"}>
                            {event.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {event.venue}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
