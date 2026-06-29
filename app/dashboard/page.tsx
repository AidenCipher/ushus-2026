"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Users, 
  Calendar, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Download
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import * as React from "react";
import { generateConfirmationPDF } from "@/lib/pdf";
import LoadingAnimation from "@/components/shared/LoadingAnimation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface RegistrationData {
  id: string;
  teamName: string | null;
  teamMembers: any;
  status: string;
  confirmationCode: string;
  registrationDate: string;
  event: {
    id: string;
    name: string;
    dateStart: string | null;
    venue: string | null;
    vertical: {
      name: string;
    };
  };
}

interface AnnouncementData {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

interface EventListItem {
  id: string;
  name: string;
  description: string | null;
  status: string;
  maxParticipants: number | null;
  verticalId: string;
  vertical: {
    name: string;
    colorCode: string;
  };
  eventHead: { name: string } | null;
  venue: string | null;
  dateStart: string | null;
  dateEnd: string | null;
}

export default function DashboardOverview() {
  const { data: session } = useSession();
  const [registrations, setRegistrations] = React.useState<RegistrationData[]>([]);
  const [announcements, setAnnouncements] = React.useState<AnnouncementData[]>([]);
  const [events, setEvents] = React.useState<EventListItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Registration Form States
  const [selectedEventId, setSelectedEventId] = React.useState<string>("");
  const [teamName, setTeamName] = React.useState("");
  const [newMemberName, setNewMemberName] = React.useState("");
  const [newMemberEmail, setNewMemberEmail] = React.useState("");
  const [teamMembers, setTeamMembers] = React.useState<{ name: string; email: string }[]>([]);
  const [notes, setNotes] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submittingReg, setSubmittingReg] = React.useState(false);
  const [triggerFetch, setTriggerFetch] = React.useState(0);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [regRes, annRes, eventsRes] = await Promise.all([
          fetch("/api/v1/registrations"),
          fetch("/api/v1/announcements?limit=5"),
          fetch("/api/v1/events")
        ]);

        if (regRes.ok) {
          const regJson = await regRes.json();
          setRegistrations(regJson.data || []);
        }
        if (annRes.ok) {
          const annJson = await annRes.json();
          setAnnouncements(annJson.data || []);
        }
        if (eventsRes.ok) {
          const eventsJson = await eventsRes.json();
          const openEvents = (eventsJson.data || []).filter(
            (e: any) => e.status === "REGISTRATION_OPEN"
          );
          setEvents(openEvents);
          if (openEvents.length > 0) {
            setSelectedEventId(openEvents[0].id);
          }
        }
      } catch (error) {
        console.error("Error loading participant overview:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [triggerFetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingAnimation message="Syncing registration details..." />
      </div>
    );
  }

  const primaryReg = registrations[0];

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEventId) {
      setFormError("Please select an event.");
      return;
    }
    setFormError(null);
    setSubmittingReg(true);

    try {
      const res = await fetch("/api/v1/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          eventId: selectedEventId,
          teamName: teamName || null,
          teamMembers: teamMembers.length > 0 ? teamMembers : null,
          notes: notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to submit registration. Please try again.");
      } else {
        setTeamName("");
        setTeamMembers([]);
        setNotes("");
        setFormError(null);
        setTriggerFetch(prev => prev + 1);
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmittingReg(false);
    }
  }

  const handleAddMember = () => {
    if (!newMemberName.trim() || !newMemberEmail.trim()) {
      return;
    }
    if (!newMemberEmail.includes("@")) {
      setFormError("Please enter a valid email for the team member.");
      return;
    }
    setTeamMembers(prev => [...prev, { name: newMemberName, email: newMemberEmail }]);
    setNewMemberName("");
    setNewMemberEmail("");
    setFormError(null);
  };

  const handleRemoveMember = (idx: number) => {
    setTeamMembers(prev => prev.filter((_, i) => i !== idx));
  };

  function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }

  function formatEventDate(dateStr: string | null): string {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  const handleDownload = () => {
    if (!primaryReg) return;
    const pdfDataUri = generateConfirmationPDF({
      participantName: session?.user?.name || "Participant",
      confirmationCode: primaryReg.confirmationCode,
      events: registrations.map(r => ({
        name: r.event.name,
        vertical: r.event.vertical.name,
        date: r.event.dateStart ? new Date(r.event.dateStart).toLocaleDateString("en-IN") : "TBD"
      })),
      dateIssued: new Date().toLocaleDateString("en-IN")
    });

    if (pdfDataUri) {
      const link = document.createElement("a");
      link.href = pdfDataUri;
      link.download = `USHUS_2026_Confirmation_${primaryReg.confirmationCode}.pdf`;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user?.name?.split(" ")[0] || "Participant"}!</h1>
          <p className="text-muted-foreground mt-1">Here&apos;s an overview of your USHUS 2026 journey.</p>
        </div>
      </div>

      {primaryReg ? (
        <>
          {/* Quick Stats / Status Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Card className="glass border-primary/20 bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registration Status</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{primaryReg.status}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    For {primaryReg.event.name} ({primaryReg.event.vertical.name})
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
              <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Confirmation Code</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-mono font-bold tracking-wider">{primaryReg.confirmationCode}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Show this at the campus desk
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
              <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">My Team</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold truncate">{primaryReg.teamName || "Individual"}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Array.isArray(primaryReg.teamMembers) ? `${primaryReg.teamMembers.length} members total` : "No team members"}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 pt-4">
            {/* Main Event Card */}
            <Card className="glass border-white/10 lg:col-span-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <CardTitle>My Event</CardTitle>
                </div>
                <CardDescription>Details about your registered event</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <h3 className="text-lg font-bold">{primaryReg.event.name}</h3>
                    <p className="text-sm text-muted-foreground">{primaryReg.event.vertical.name} Domain</p>
                  </div>
                  <div className="mt-4 sm:mt-0 text-left sm:text-right">
                    <div className="text-sm font-medium flex items-center sm:justify-end gap-1">
                      <Calendar className="w-4 h-4" /> {formatEventDate(primaryReg.event.dateStart)}
                    </div>
                    {primaryReg.event.venue && (
                      <p className="text-xs text-muted-foreground mt-1">Venue: {primaryReg.event.venue}</p>
                    )}
                  </div>
                </div>

                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-primary">Need confirmation printout?</h4>
                    <p className="text-xs text-primary/80 mt-1 leading-relaxed">
                      Download the confirmation receipt PDF, print it out, and present it at Christ University entrance for easy entry.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/events">
                    <Button className="shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                      View Event Details <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    className="border-white/10 gap-2"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4" /> Download Confirmation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Updates / Announcements */}
            <Card className="glass border-white/10 lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <CardDescription>Latest announcements from organisers</CardDescription>
              </CardHeader>
              <CardContent>
                {announcements.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No announcements yet. Check back later!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((ann) => (
                      <div key={ann.id} className="flex gap-3 relative pb-4 last:pb-0">
                        <div className="absolute left-1.5 top-5 bottom-0 w-px bg-white/10 last:hidden" />
                        <div className="w-3 h-3 rounded-full bg-primary/50 border-2 border-background z-10 mt-1 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{ann.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{ann.body}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{formatRelativeTime(ann.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Side: Available Events List */}
          <div className="space-y-4 lg:col-span-1">
            <h2 className="text-xl font-bold tracking-tight">Select Event</h2>
            <p className="text-xs text-muted-foreground">Choose a domain vertical to view guidelines and register.</p>
            {events.length === 0 ? (
              <Card className="glass border-white/10">
                <CardContent className="py-8 text-center text-muted-foreground text-sm">
                  Registration is currently closed or events are being configured. Check back soon!
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {events.map((evt) => {
                  const isSelected = evt.id === selectedEventId;
                  return (
                    <div
                      key={evt.id}
                      onClick={() => {
                        setSelectedEventId(evt.id);
                        setFormError(null);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-indigo-600/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                          : "glass border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-sm text-foreground">{evt.name}</h3>
                        <Badge className="text-[10px] scale-90 origin-right bg-white/5 border border-white/10 text-muted-foreground">
                          {evt.vertical.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                        {evt.description || "View details and requirements to register."}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side: Host Info, Event Guidelines, & Registration Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Host Institution Info Banner */}
            <Card className="glass border-indigo-500/20 bg-indigo-950/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none" />
              <CardContent className="p-4 sm:p-5 flex gap-4 items-start relative z-10">
                <Trophy className="w-8 h-8 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm text-foreground">Christ University, Hosur Road Campus</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Hosted by the **Christ University School of Business and Management**. All events comply with national MBA fest standards. Accommodation, refreshments, and competitive case materials are provided on request for verified registrants.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Selected Event Details & Registration form */}
            {(() => {
              const selectedEvent = events.find(e => e.id === selectedEventId);
              if (!selectedEvent) return null;

              return (
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">{selectedEvent.name}</CardTitle>
                    <CardDescription>
                      Vertical Domain: <span className="text-indigo-400 font-semibold">{selectedEvent.vertical.name}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Event Details Card */}
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Guidelines & Details</h4>
                        <p className="text-sm text-foreground mt-1 leading-relaxed">
                          {selectedEvent.description || "Detailed rules are shared upon confirmation by Christ MBA coordinators."}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5 text-xs text-muted-foreground">
                        <div>
                          <span className="font-semibold text-foreground">Venue:</span> {selectedEvent.venue || "Christ Main Campus"}
                        </div>
                        <div>
                          <span className="font-semibold text-foreground">Coordinator:</span> {selectedEvent.eventHead?.name || "Christ Coordinator"}
                        </div>
                      </div>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleRegister} className="space-y-4">
                      {formError && (
                        <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-md flex items-center gap-2 text-xs">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Team / Organisation Name (optional)</label>
                        <Input
                          placeholder="e.g. Elite League / Individual"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          className="bg-background/50 border-white/10"
                        />
                      </div>

                      {/* Team Members List Builder */}
                      <div className="space-y-3 pt-2">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Add Team Members (optional)</h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">
                            For team events, add your team members&apos; names and emails. They will be linked to your entry.
                          </p>
                        </div>

                        {/* List of current members */}
                        {teamMembers.length > 0 && (
                          <div className="space-y-2 max-h-[150px] overflow-y-auto rounded-lg border border-white/5 p-2 bg-white/5">
                            {teamMembers.map((m, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 rounded bg-background/50 border border-white/5 text-xs">
                                <div>
                                  <span className="font-semibold">{m.name}</span> <span className="text-muted-foreground">({m.email})</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => handleRemoveMember(idx)}
                                  className="h-6 px-2 text-danger hover:text-danger hover:bg-danger/10"
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Roster Input row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Input
                            placeholder="Member Name"
                            value={newMemberName}
                            onChange={(e) => setNewMemberName(e.target.value)}
                            className="bg-background/50 border-white/10 text-xs h-9"
                          />
                          <div className="flex gap-2">
                            <Input
                              placeholder="Member Email"
                              value={newMemberEmail}
                              onChange={(e) => setNewMemberEmail(e.target.value)}
                              className="bg-background/50 border-white/10 text-xs h-9"
                            />
                            <Button
                              type="button"
                              onClick={handleAddMember}
                              className="bg-white/5 hover:bg-white/10 border border-white/10 text-xs h-9 shrink-0"
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 pt-2">
                        <label className="text-xs font-semibold text-muted-foreground">Notes / Coordinator Comments (optional)</label>
                        <Textarea
                          placeholder="Include dietary constraints, accommodation requests, etc."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="bg-background/50 border-white/10 min-h-[80px]"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={submittingReg}
                        className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                      >
                        {submittingReg ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting Registration...
                          </>
                        ) : (
                          "Confirm Registration for Event"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
