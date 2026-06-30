"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trophy, Search, Plus, Loader2, Calendar, MapPin, DollarSign, Users, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import * as React from "react";
import LoadingAnimation from "@/components/shared/LoadingAnimation";

interface EventData {
  id: string;
  name: string;
  description: string | null;
  verticalId: string;
  vertical: {
    name: string;
    colorCode: string;
  };
  eventHead: { name: string } | null;
  dateStart: string | null;
  dateEnd: string | null;
  venue: string | null;
  maxParticipants: number | null;
  prizePool: string | null;
  status: string;
}

export default function AdminEventsPage() {
  const [events, setEvents] = React.useState<EventData[]>([]);
  const [verticals, setVerticals] = React.useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Create Dialog Form State
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formName, setFormName] = React.useState("");
  const [formDesc, setFormDesc] = React.useState("");
  const [formVerticalId, setFormVerticalId] = React.useState("");
  const [formVenue, setFormVenue] = React.useState("");
  const [formPrize, setFormPrize] = React.useState("");
  const [formMaxPart, setFormMaxPart] = React.useState("");
  const [formStatus, setFormStatus] = React.useState("UPCOMING");

  // Edit Dialog Form State
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingEventId, setEditingEventId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");
  const [editVerticalId, setEditVerticalId] = React.useState("");
  const [editVenue, setEditVenue] = React.useState("");
  const [editPrize, setEditPrize] = React.useState("");
  const [editMaxPart, setEditMaxPart] = React.useState("");
  const [editStatus, setEditStatus] = React.useState("UPCOMING");

  const [submitting, setSubmitting] = React.useState(false);

  const fetchEvents = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/events");
      if (res.ok) {
        const json = await res.json();
        setEvents(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load events matrix:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVerticals = React.useCallback(async () => {
    try {
      const res = await fetch("/api/v1/verticals");
      if (res.ok) {
        const json = await res.json();
        setVerticals(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load verticals:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchEvents();
    fetchVerticals();
  }, [fetchEvents, fetchVerticals]);

  const handleCreateEvent = async () => {
    if (!formName || !formVerticalId) return;
    setSubmitting(true);
    try {
      const payload = {
        name: formName,
        description: formDesc || undefined,
        verticalId: formVerticalId,
        venue: formVenue || undefined,
        prizePool: formPrize || undefined,
        maxParticipants: formMaxPart ? parseInt(formMaxPart) : undefined,
        status: formStatus,
      };

      const res = await fetch("/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setFormName("");
        setFormDesc("");
        setFormVerticalId("");
        setFormVenue("");
        setFormPrize("");
        setFormMaxPart("");
        setFormStatus("UPCOMING");
        setIsDialogOpen(false);
        await fetchEvents();
      }
    } catch (err) {
      console.error("Failed to create event:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (event: EventData) => {
    setEditingEventId(event.id);
    setEditName(event.name);
    setEditDesc(event.description || "");
    setEditVerticalId(event.verticalId);
    setEditVenue(event.venue || "");
    setEditPrize(event.prizePool || "");
    setEditMaxPart(event.maxParticipants ? String(event.maxParticipants) : "");
    setEditStatus(event.status);
    setIsEditOpen(true);
  };

  const handleUpdateEvent = async () => {
    if (!editingEventId || !editName || !editVerticalId) return;
    setSubmitting(true);
    try {
      const payload = {
        name: editName,
        description: editDesc || null,
        verticalId: editVerticalId,
        venue: editVenue || null,
        prizePool: editPrize || null,
        maxParticipants: editMaxPart ? parseInt(editMaxPart) : null,
        status: editStatus,
      };

      const res = await fetch(`/api/v1/events/${editingEventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsEditOpen(false);
        setEditingEventId(null);
        await fetchEvents();
      }
    } catch (err) {
      console.error("Failed to update event:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete event "${name}"? This will delete all associated registrations, tasks, and calendar events.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/v1/events/${eventId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        await fetchEvents();
      } else {
        alert(json.error || "Failed to delete event.");
      }
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert("Error deleting event.");
    }
  };

  const filteredEvents = searchQuery
    ? events.filter(e => 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.vertical.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.venue && e.venue.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : events;

  function getStatusColor(status: string): string {
    switch (status) {
      case "REGISTRATION_OPEN": return "border-success/50 text-success bg-success/10";
      case "REGISTRATION_CLOSED": return "border-danger/50 text-danger bg-danger/10";
      case "ONGOING": return "border-blue-500/50 text-blue-400 bg-blue-500/10";
      case "COMPLETED": return "border-purple-500/50 text-purple-400 bg-purple-500/10";
      default: return "border-white/20 text-muted-foreground";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-rose-50">Event Matrix</h1>
          <p className="text-muted-foreground mt-1">Configure competition parameters, rules, allocations, and edit event properties.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-rose-600 hover:bg-rose-700 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <Plus className="w-4 h-4 mr-2" /> Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/15 max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
              <DialogDescription>Add a competition vertical to the USHUS Management Fest.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Event Name</label>
                <Input 
                  placeholder="e.g. Best Manager" 
                  className="bg-background/50 border-white/10"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Description (optional)</label>
                <Textarea 
                  placeholder="Summarise event rules or criteria..." 
                  className="bg-background/50 border-white/10 min-h-[80px]"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Vertical</label>
                  <Select value={formVerticalId} onValueChange={setFormVerticalId}>
                    <SelectTrigger className="bg-background/50 border-white/10">
                      <SelectValue placeholder="Select Vertical" />
                    </SelectTrigger>
                    <SelectContent>
                      {verticals.map(v => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <Select value={formStatus} onValueChange={setFormStatus}>
                    <SelectTrigger className="bg-background/50 border-white/10">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UPCOMING">Upcoming</SelectItem>
                      <SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
                      <SelectItem value="REGISTRATION_CLOSED">Registration Closed</SelectItem>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">Max Slots</label>
                  <Input 
                    type="number"
                    placeholder="e.g. 50" 
                    className="bg-background/50 border-white/10"
                    value={formMaxPart}
                    onChange={(e) => setFormMaxPart(e.target.value)}
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">Prize Pool</label>
                  <Input 
                    placeholder="e.g. ₹20,000" 
                    className="bg-background/50 border-white/10"
                    value={formPrize}
                    onChange={(e) => setFormPrize(e.target.value)}
                  />
                </div>
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-semibold text-muted-foreground">Venue</label>
                  <Input 
                    placeholder="e.g. Audi A" 
                    className="bg-background/50 border-white/10"
                    value={formVenue}
                    onChange={(e) => setFormVenue(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" className="border-white/10" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleCreateEvent} disabled={submitting || !formName || !formVerticalId}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Create Event
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Event Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="glass border-white/15 max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Event configuration</DialogTitle>
            <DialogDescription>Modify status, allocations, prize pool, and venue properties.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Event Name</label>
              <Input 
                className="bg-background/50 border-white/10"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Description (optional)</label>
              <Textarea 
                className="bg-background/50 border-white/10 min-h-[80px]"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Vertical</label>
                <Select value={editVerticalId} onValueChange={setEditVerticalId}>
                  <SelectTrigger className="bg-background/50 border-white/10">
                    <SelectValue placeholder="Select Vertical" />
                  </SelectTrigger>
                  <SelectContent>
                    {verticals.map(v => (
                      <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="bg-background/50 border-white/10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
                    <SelectItem value="REGISTRATION_CLOSED">Registration Closed</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1">
                <label className="text-xs font-semibold text-muted-foreground">Max Slots</label>
                <Input 
                  type="number"
                  className="bg-background/50 border-white/10"
                  value={editMaxPart}
                  onChange={(e) => setEditMaxPart(e.target.value)}
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-xs font-semibold text-muted-foreground">Prize Pool</label>
                <Input 
                  className="bg-background/50 border-white/10"
                  value={editPrize}
                  onChange={(e) => setEditPrize(e.target.value)}
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-xs font-semibold text-muted-foreground">Venue</label>
                <Input 
                  className="bg-background/50 border-white/10"
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" className="border-white/10" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleUpdateEvent} disabled={submitting || !editName || !editVerticalId}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/75" />
        <Input 
          placeholder="Search competition name, vertical, or venue..." 
          className="pl-9 bg-background/40 border-white/10 focus:border-rose-500/30 transition-all" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid of Events */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingAnimation message="Syncing Event Matrix configuration parameters..." />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="glass border-white/5 bg-white/5">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy className="w-16 h-16 text-rose-500 mb-4 opacity-40 animate-pulse" />
            <h3 className="font-semibold text-rose-100 text-lg">No competition verticals found</h3>
            <p className="text-muted-foreground text-xs mt-1 max-w-sm">No events match your current search criteria. Try modifying your filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map(event => (
            <Card key={event.id} className="glass border-white/15 relative overflow-hidden flex flex-col justify-between hover:border-rose-500/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-rose-500/5 hover:-translate-y-1 transition-all duration-300">
              <div 
                className="absolute top-0 left-0 w-full h-1"
                style={{ backgroundColor: event.vertical.colorCode }}
              />
              <CardHeader className="pb-3 pl-5 pr-5 pt-5">
                <div className="flex justify-between items-start gap-2">
                  <Badge variant="outline" style={{ borderColor: event.vertical.colorCode, color: event.vertical.colorCode }} className="text-[10px] uppercase font-bold tracking-wider bg-white/5">
                    {event.vertical.name}
                  </Badge>
                  <div className="flex items-center gap-1.5 bg-black/30 p-1 rounded-lg border border-white/5">
                    <Badge variant="outline" className={`text-[9px] font-semibold ${getStatusColor(event.status)}`}>
                      {event.status.replace(/_/g, " ")}
                    </Badge>
                    <button
                      onClick={() => handleStartEdit(event)}
                      className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-rose-100 transition-colors"
                      title="Edit event settings"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id, event.name)}
                      className="p-1 rounded hover:bg-rose-500/20 text-muted-foreground hover:text-rose-400 transition-colors"
                      title="Delete event configuration"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <CardTitle className="text-lg font-bold mt-3 leading-snug tracking-tight text-rose-50">{event.name}</CardTitle>
                {event.description && (
                  <CardDescription className="text-xs line-clamp-2 mt-1.5 leading-relaxed text-muted-foreground/80">{event.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="pt-0 pl-5 pr-5 pb-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground/90 border-t border-white/5 pt-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400/80" /> {event.venue || "TBD"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-rose-400/80" /> {event.prizePool || "TBD"}
                  </span>
                  <span className="flex items-center gap-1.5 col-span-2 mt-1">
                    <Users className="w-3.5 h-3.5 text-rose-400/80" /> Capacity Limit: <strong className="text-foreground">{event.maxParticipants || "Unlimited"}</strong>
                  </span>
                </div>
                {event.eventHead && (
                  <div className="bg-[#0b0f19]/80 p-2.5 rounded-lg text-xs flex justify-between items-center border border-white/5 mt-2 shadow-inner">
                    <span className="text-muted-foreground">Event Coordinator:</span>
                    <span className="font-semibold text-rose-200">{event.eventHead.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
