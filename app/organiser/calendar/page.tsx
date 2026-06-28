"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

export default function OrganiserCalendarPage() {
  const schedule = [
    { time: "09:00 AM", title: "Opening Ceremony", type: "Global" },
    { time: "11:00 AM", title: "Best Manager: Round 1", type: "Event" },
    { time: "02:00 PM", title: "Lunch Break", type: "Global" },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage global and event-specific schedules.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
          <Plus className="w-4 h-4 mr-2" /> Add Event Schedule
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass border-white/10 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
              <CardTitle className="text-lg">January 2026</CardTitle>
              <Button variant="outline" size="icon" className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
            </div>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-purple-500" /> Global</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Event</span>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mock Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2 text-sm font-medium text-muted-foreground">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const isEventDay = day === 20 || day === 21;
                return (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-md border flex flex-col items-center justify-center relative cursor-pointer hover:bg-white/5 transition-colors ${
                      isEventDay ? 'border-indigo-500/50 bg-indigo-500/10' : 'border-white/5 bg-white/5'
                    }`}
                  >
                    <span className={`text-sm ${isEventDay ? 'font-bold text-indigo-400' : ''}`}>{day}</span>
                    {isEventDay && <div className="absolute bottom-2 flex gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-500"/><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"/></div>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle>Schedule for Jan 20</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {schedule.map((item, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${
                    item.type === 'Global' ? 'bg-purple-500' : 'bg-indigo-500'
                  }`}>
                    <CalendarIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg bg-white/5 border border-white/10 shadow">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-sm">{item.title}</h4>
                      <time className="text-xs text-muted-foreground">{item.time}</time>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
