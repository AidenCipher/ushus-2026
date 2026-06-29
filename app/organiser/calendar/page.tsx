"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Loader2, Clock, MapPin, Trash2, Edit } from "lucide-react";
import LoadingAnimation from "@/components/shared/LoadingAnimation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as React from "react";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";

interface CalendarEventData {
  id: string;
  title: string;
  description: string | null;
  startDatetime: string;
  endDatetime: string;
  status: string;
  colorCode: string | null;
  eventId: string | null;
  verticalId: string | null;
  event: { id: string; name: string } | null;
  vertical: { id: string; name: string } | null;
}

interface EventData {
  id: string;
  name: string;
  verticalId: string;
  vertical: {
    name: string;
    colorCode: string;
  };
}

export default function OrganiserCalendarPage() {
  const { data: session } = useSession();
  const [events, setEvents] = React.useState<CalendarEventData[]>([]);
  const [availableEvents, setAvailableEvents] = React.useState<EventData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  // Form State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formTitle, setFormTitle] = React.useState("");
  const [formDesc, setFormDesc] = React.useState("");
  const [formStart, setFormStart] = React.useState("");
  const [formEnd, setFormEnd] = React.useState("");
  const [formStatus, setFormStatus] = React.useState("PLANNED");
  const [formEventId, setFormEventId] = React.useState("none");
  const [submitting, setSubmitting] = React.useState(false);

  const userRole = session?.user?.role;
  const canManage = userRole === "ORGANISER" || userRole === "ADMIN";

  const fetchCalendarData = React.useCallback(async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const start = new Date(year, month - 1, 1).toISOString();
      const end = new Date(year, month + 2, 0).toISOString();

      const [calRes, eventsRes] = await Promise.all([
        fetch(`/api/v1/calendar?start=${start}&end=${end}`),
        fetch("/api/v1/events")
      ]);

      if (calRes.ok) {
        const calJson = await calRes.json();
        setEvents(calJson.data || []);
      }
      if (eventsRes.ok) {
        const eventsJson = await eventsRes.json();
        setAvailableEvents(eventsJson.data || []);
      }
    } catch (err) {
      console.error("Failed to load calendar data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  React.useEffect(() => {
    fetchCalendarData();
  }, [fetchCalendarData]);

  // Calendar rendering helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Pad previous month days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(e => {
      const start = new Date(e.startDatetime);
      const end = new Date(e.endDatetime);
      const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      
      const eventStartDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const eventEndDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      
      return target >= eventStartDay && target <= eventEndDay;
    });
  };

  async function handleCreateEvent() {
    if (!formTitle || !formStart || !formEnd) return;
    setSubmitting(true);
    try {
      const selectedEvent = availableEvents.find(e => e.id === formEventId);
      const payload = {
        title: formTitle,
        description: formDesc || undefined,
        startDatetime: new Date(formStart).toISOString(),
        endDatetime: new Date(formEnd).toISOString(),
        status: formStatus,
        eventId: formEventId === "none" ? undefined : formEventId,
        verticalId: selectedEvent ? selectedEvent.verticalId : (session?.user?.verticalId || undefined),
      };

      const res = await fetch("/api/v1/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormTitle("");
        setFormDesc("");
        setFormStart("");
        setFormEnd("");
        setFormStatus("PLANNED");
        setFormEventId("none");
        setIsDialogOpen(false);
        await fetchCalendarData();
      }
    } catch (err) {
      console.error("Failed to create calendar event:", err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteEvent(id: string) {
    if (!confirm("Are you sure you want to delete this schedule entry?")) return;
    try {
      const res = await fetch(`/api/v1/calendar/${id}`, { method: "DELETE" });
      if (res.ok) {
        await fetchCalendarData();
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
    }
  }

  const days = getDaysInMonth(currentMonth);
  const selectedDayEvents = getEventsForDay(selectedDate);

  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case "COMPLETED": return "border-success/50 text-success bg-success/10";
      case "IN_PROGRESS": return "border-blue-500/50 text-blue-400 bg-blue-500/10";
      case "DELAYED": return "border-danger/50 text-danger bg-danger/10";
      case "CANCELLED": return "border-white/20 text-muted-foreground line-through";
      default: return "border-indigo-500/50 text-indigo-400 bg-indigo-500/10";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation message="Syncing calendar schedules..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage global and event-specific schedules.</p>
        </div>
        {canManage && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                <Plus className="w-4 h-4 mr-2" /> Add Event Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="glass border-white/15">
              <DialogHeader>
                <DialogTitle>Add Event Schedule</DialogTitle>
                <DialogDescription>Create a new schedule item on the fest calendar.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Title</label>
                  <Input 
                    placeholder="e.g. Round 1 Case Presentation / Opening Ceremony" 
                    className="bg-background/50 border-white/10"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Description (optional)</label>
                  <Textarea 
                    placeholder="Add extra details, venue instructions, etc." 
                    className="bg-background/50 border-white/10 min-h-[80px]"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Start Datetime</label>
                    <Input 
                      type="datetime-local" 
                      className="bg-background/50 border-white/10"
                      value={formStart}
                      onChange={(e) => setFormStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">End Datetime</label>
                    <Input 
                      type="datetime-local" 
                      className="bg-background/50 border-white/10"
                      value={formEnd}
                      onChange={(e) => setFormEnd(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Status</label>
                    <Select value={formStatus} onValueChange={setFormStatus}>
                      <SelectTrigger className="bg-background/50 border-white/10">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="DELAYED">Delayed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Linked Event (optional)</label>
                    <Select value={formEventId} onValueChange={setFormEventId}>
                      <SelectTrigger className="bg-background/50 border-white/10">
                        <SelectValue placeholder="Select Event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Global Event)</SelectItem>
                        {availableEvents.map(ev => (
                          <SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" className="border-white/10" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateEvent} disabled={submitting || !formTitle || !formStart || !formEnd}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Add Schedule
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Month View Card */}
        <Card className="glass border-white/10 lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-8 w-8 border-white/10" onClick={handlePrevMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <CardTitle className="text-lg">
                {currentMonth.toLocaleString("en-IN", { month: "long", year: "numeric" })}
              </CardTitle>
              <Button variant="outline" size="icon" className="h-8 w-8 border-white/10" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Event Scheduled</span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-7 gap-1 text-center mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
                const dayEvents = getEventsForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                const hasEvents = dayEvents.length > 0;
                
                return (
                  <button 
                    key={i}
                    onClick={() => setSelectedDate(day)}
                    className={`aspect-square rounded-md border flex flex-col items-center justify-center relative transition-all duration-200 ${
                      isSelected 
                        ? 'border-indigo-500 bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.3)]' 
                        : hasEvents 
                          ? 'border-white/15 bg-white/5 hover:border-indigo-500/50' 
                          : 'border-white/5 bg-white/[0.02] hover:bg-white/5 text-muted-foreground'
                    }`}
                  >
                    <span className={`text-sm ${isSelected ? 'font-bold text-indigo-400' : hasEvents ? 'font-medium text-foreground' : ''}`}>
                      {day.getDate()}
                    </span>
                    {hasEvents && (
                      <div className="absolute bottom-1.5 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((_, idx) => (
                          <div key={idx} className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Agenda */}
        <Card className="glass border-white/10">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-400" />
              Agenda for {selectedDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {selectedDayEvents.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm space-y-2">
                <Clock className="w-8 h-8 mx-auto opacity-30 text-indigo-400" />
                <p>No events scheduled for this day.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDayEvents.map((item) => {
                  const startStr = new Date(item.startDatetime).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit"
                  });
                  return (
                    <div key={item.id} className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all duration-200 space-y-2 relative group">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm leading-tight pr-4">{item.title}</h4>
                        {canManage && (
                          <button 
                            onClick={() => handleDeleteEvent(item.id)}
                            className="text-muted-foreground hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 items-center justify-between pt-1 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-indigo-400" /> {startStr}
                        </span>
                        <Badge variant="outline" className={`px-1.5 py-0.2 ${getStatusBadgeClass(item.status)}`}>
                          {item.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
