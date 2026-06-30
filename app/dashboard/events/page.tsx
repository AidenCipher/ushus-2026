"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, FileText, Download, Clock, AlertCircle, Loader2, CreditCard, Sparkles, MapPin, Users, HelpCircle, ArrowRight, UserPlus, Trash2, X, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface RegistrationData {
  id: string;
  teamName: string | null;
  teamMembers: any;
  status: string;
  event: {
    id: string;
    name: string;
    description: string | null;
    rulesDocumentUrl: string | null;
    prizePool: string | null;
    maxParticipants: number | null;
    vertical: {
      name: string;
      colorCode: string;
    };
  };
}

interface EventData {
  id: string;
  name: string;
  description: string | null;
  rulesDocumentUrl: string | null;
  status: string;
  prizePool: string | null;
  maxParticipants: number | null;
  venue: string | null;
  vertical: {
    id: string;
    name: string;
    colorCode: string;
  };
}

interface TeamMemberInput {
  name: string;
  email: string;
  phone: string;
}

export default function EventsDetailsPage() {
  const { data: session } = useSession();
  
  // Data loading states
  const [registrations, setRegistrations] = React.useState<RegistrationData[]>([]);
  const [allEvents, setAllEvents] = React.useState<EventData[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Dialog / Modal states
  const [registeringEvent, setRegisteringEvent] = React.useState<EventData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = React.useState(false);
  const [paymentEventName, setPaymentEventName] = React.useState("");

  // Registration Form state
  const [teamName, setTeamName] = React.useState("");
  const [teamMembers, setTeamMembers] = React.useState<TeamMemberInput[]>([]);
  const [notes, setNotes] = React.useState("");
  const [regError, setRegError] = React.useState<string | null>(null);
  const [submittingReg, setSubmittingReg] = React.useState(false);

  const fetchRegistryData = React.useCallback(async () => {
    try {
      const [regRes, eventRes] = await Promise.all([
        fetch("/api/v1/registrations"),
        fetch("/api/v1/events")
      ]);

      if (regRes.ok) {
        const json = await regRes.json();
        setRegistrations(json.data || []);
      }

      if (eventRes.ok) {
        const json = await eventRes.json();
        setAllEvents(json.data || []);
      }
    } catch (error) {
      console.error("Failed to load participant event records:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRegistryData();
  }, [fetchRegistryData]);

  // Check if participant is registered for event ID
  const isRegistered = (eventId: string) => {
    return registrations.some((reg) => reg.event.id === eventId);
  };

  const getRegistrationDetails = (eventId: string) => {
    return registrations.find((reg) => reg.event.id === eventId);
  };

  const handleAddMemberInput = () => {
    setTeamMembers([...teamMembers, { name: "", email: "", phone: "" }]);
  };

  const handleRemoveMemberInput = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const handleMemberChange = (index: number, field: keyof TeamMemberInput, value: string) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  // Submit registration form
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registeringEvent) return;

    setSubmittingReg(true);
    setRegError(null);

    // Filter out blank team members
    const cleanMembers = teamMembers.filter((m) => m.name && m.email && m.phone);

    try {
      const res = await fetch("/api/v1/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          eventId: registeringEvent.id,
          teamName: teamName || null,
          teamMembers: cleanMembers.length > 0 ? cleanMembers : null,
          notes: notes || null,
        }),
      });

      const json = await res.json();

      if (res.ok) {
        setPaymentEventName(registeringEvent.name);
        setRegisteringEvent(null);
        setTeamName("");
        setTeamMembers([]);
        setNotes("");
        setShowPaymentModal(true);
        await fetchRegistryData();
      } else {
        setRegError(json.error || "Failed to submit registration. Check details.");
      }
    } catch {
      setRegError("Network error. Please try again later.");
    } finally {
      setSubmittingReg(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Syncing event registry...</p>
      </div>
    );
  }

  // Group events by vertical name
  const groupedEvents: Record<string, EventData[]> = {};
  allEvents.forEach((evt) => {
    const key = evt.vertical.name;
    if (!groupedEvents[key]) {
      groupedEvents[key] = [];
    }
    groupedEvents[key].push(evt);
  });

  return (
    <div className="space-y-12 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Registry & Guidelines</h1>
        <p className="text-muted-foreground mt-1">
          Explore all USHUS 2027 competitions, check your registered events, download rulebooks, and manage your team status.
        </p>
      </div>

      {/* SECTION 1: YOUR ACTIVE REGISTRATIONS */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Trophy className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold">Your Registered Events ({registrations.length})</h2>
        </div>

        {registrations.length === 0 ? (
          <Card className="glass border-white/5 bg-white/5">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-3">
              <Clock className="w-12 h-12 text-muted-foreground opacity-40 animate-pulse" />
              <div>
                <h3 className="font-semibold text-muted-foreground">Not Registered for Any Competitions</h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  Browse the list of events below to choose your competitions and secure your slots.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {registrations.map((reg) => (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="glass border-indigo-500/20 relative overflow-hidden shadow-lg hover:shadow-indigo-500/5 transition-all">
                  <div 
                    className="absolute top-0 left-0 w-1.5 h-full"
                    style={{ backgroundColor: reg.event.vertical.colorCode }}
                  />
                  <CardHeader className="pl-6 pb-2">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            style={{ borderColor: reg.event.vertical.colorCode, color: reg.event.vertical.colorCode }}
                          >
                            {reg.event.vertical.name}
                          </Badge>
                          <Badge variant="outline" className="border-success/50 text-success bg-success/10 font-bold uppercase tracking-wider text-[10px]">
                            {reg.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl mt-1 font-bold">{reg.event.name}</CardTitle>
                      </div>
                      {reg.event.prizePool && (
                        <div className="text-right bg-white/5 p-2 rounded-lg border border-white/5">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Prize Pool</p>
                          <p className="text-lg font-bold text-indigo-400">{reg.event.prizePool}</p>
                        </div>
                      )}
                    </div>
                    {reg.event.description && (
                      <CardDescription className="text-sm mt-2 text-foreground/80 leading-relaxed max-w-3xl">
                        {reg.event.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pl-6 pt-2 space-y-4">
                    {/* Team roster information */}
                    <div className="p-4 bg-[#0c101d]/60 border border-white/5 rounded-xl space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Team Registration Information
                      </h4>
                      <div className="grid sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-muted-foreground">Team Roster Type:</span>{" "}
                          <span className="font-semibold">{reg.teamName ? "Group / Team Competition" : "Individual Entry"}</span>
                        </div>
                        {reg.teamName && (
                          <div>
                            <span className="text-muted-foreground">Team Name:</span>{" "}
                            <span className="font-bold text-foreground">{reg.teamName}</span>
                          </div>
                        )}
                        {Array.isArray(reg.teamMembers) && reg.teamMembers.length > 0 && (
                          <div className="sm:col-span-2 space-y-1.5 pt-2 border-t border-white/5 mt-2">
                            <span className="text-muted-foreground">Registered Team Members:</span>
                            <div className="flex flex-wrap gap-2">
                              {reg.teamMembers.map((member: any, i: number) => (
                                <Badge key={i} variant="secondary" className="bg-white/10 hover:bg-white/15 py-1 px-2 text-xs">
                                  {member.name} ({member.email})
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {reg.event.rulesDocumentUrl ? (
                        <Card className="glass border-white/5 bg-white/5 p-4 flex flex-col justify-between gap-4">
                          <div>
                            <h5 className="font-semibold text-sm">Official Rulebook & Format</h5>
                            <p className="text-xs text-muted-foreground mt-1">Read the complete details on rules, timeline and rounds formatting.</p>
                          </div>
                          <a href={reg.event.rulesDocumentUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" className="w-full border-white/10 text-xs">
                              <Download className="w-4 h-4 mr-2" /> Download Document
                            </Button>
                          </a>
                        </Card>
                      ) : (
                        <Card className="glass border-white/5 bg-white/5 p-4 flex flex-col justify-between gap-3">
                          <div>
                            <h5 className="font-semibold text-sm">Rulebook Pending</h5>
                            <p className="text-xs text-muted-foreground mt-1">The detailed rulebook for this vertical will be uploaded by the coordinators soon.</p>
                          </div>
                          <Button variant="outline" className="w-full border-white/15" disabled>
                            <AlertCircle className="w-4 h-4 mr-2" /> Rules details TBD
                          </Button>
                        </Card>
                      )}

                      <Card className="glass border-white/5 bg-white/5 p-4 flex flex-col justify-between gap-4">
                        <div>
                          <h5 className="font-semibold text-sm">Coordinators & Support</h5>
                          <p className="text-xs text-muted-foreground mt-1">Need clarifications? Access contact directories directly.</p>
                        </div>
                        <Link href="/dashboard/contacts">
                          <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs shadow-md">
                            View Support Contacts
                          </Button>
                        </Link>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: EXPLORE ALL FESS COMPETITIONS */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold">Explore All Competition Verticals</h2>
        </div>

        {Object.keys(groupedEvents).map((verticalName) => {
          const eventsList = groupedEvents[verticalName];
          const colorCode = eventsList[0]?.vertical?.colorCode || "#6366f1";
          
          return (
            <div key={verticalName} className="space-y-4">
              <h3 
                className="text-base font-bold uppercase tracking-wider flex items-center gap-2"
                style={{ color: colorCode }}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorCode }} />
                {verticalName}
              </h3>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsList.map((evt) => {
                  const reg = getRegistrationDetails(evt.id);
                  const isReg = !!reg;
                  const isRegistrationClosed = evt.status !== "REGISTRATION_OPEN";

                  return (
                    <Card key={evt.id} className="glass border-white/10 overflow-hidden flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-200 shadow-md relative">
                      <div 
                        className="absolute top-0 left-0 w-full h-1"
                        style={{ backgroundColor: colorCode }}
                      />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-2">
                          <Badge variant="outline" style={{ borderColor: colorCode, color: colorCode }}>
                            {evt.vertical.name}
                          </Badge>
                          {isReg ? (
                            <Badge variant="outline" className="border-success/50 text-success bg-success/10 font-semibold text-[10px]">
                              Registered
                            </Badge>
                          ) : isRegistrationClosed ? (
                            <Badge variant="outline" className="border-danger/50 text-danger bg-danger/10 text-[10px]">
                              Closed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-indigo-500/50 text-indigo-400 bg-indigo-500/10 text-[10px]">
                              Open
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base font-bold mt-2 leading-snug">{evt.name}</CardTitle>
                        {evt.description && (
                          <CardDescription className="text-xs line-clamp-3 mt-1 leading-relaxed">
                            {evt.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground border-t border-white/5 pt-3">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {evt.venue || "TBD"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Trophy className="w-3.5 h-3.5 text-indigo-400" /> {evt.prizePool || "₹ -"}
                          </span>
                          <span className="flex items-center gap-1.5 col-span-2">
                            <Users className="w-3.5 h-3.5 text-indigo-400" /> Capacity: {evt.maxParticipants || "Unlimited"}
                          </span>
                        </div>

                        {isReg ? (
                          <Button 
                            variant="secondary" 
                            className="w-full text-xs font-semibold bg-white/5 text-muted-foreground border border-white/5 cursor-default hover:bg-white/5"
                          >
                            Registered & Secured
                          </Button>
                        ) : isRegistrationClosed ? (
                          <Button 
                            variant="outline" 
                            className="w-full text-xs text-muted-foreground border-white/10"
                            disabled
                          >
                            Registrations Closed
                          </Button>
                        ) : (
                          <Button 
                            onClick={() => {
                              setRegisteringEvent(evt);
                              setTeamName("");
                              setTeamMembers([]);
                              setNotes("");
                              setRegError(null);
                            }}
                            className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 shadow-md group"
                          >
                            Register for Competition 
                            <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modals */}
      <AnimatePresence>
        {registeringEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRegisteringEvent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-lg p-6 overflow-hidden relative z-10 space-y-4 shadow-2xl max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Register for Event</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{registeringEvent.name} ({registeringEvent.vertical.name})</p>
                </div>
                <button
                  onClick={() => setRegisteringEvent(null)}
                  className="p-1.5 rounded-full hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {regError && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-3 rounded-md flex items-center gap-2 shrink-0">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Form Content Scrollable */}
              <form onSubmit={handleRegisterSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1 pb-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Team Name (Required for Group Events)</label>
                  <Input 
                    placeholder="e.g. Finance Avengers" 
                    className="bg-background/50 border-white/10"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>

                {/* Team Members */}
                <div className="space-y-3 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-indigo-400">Additional Team Members ({teamMembers.length})</label>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={handleAddMemberInput}
                      className="text-xs text-indigo-400 hover:text-indigo-300"
                    >
                      <UserPlus className="w-3.5 h-3.5 mr-1" /> Add Member
                    </Button>
                  </div>
                  
                  {teamMembers.length === 0 ? (
                    <p className="text-[10px] text-muted-foreground bg-white/5 p-3 rounded-lg border border-dashed border-white/10 text-center">
                      No members added yet. Add team members if registering as a team. Leave empty for individual registrations.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {teamMembers.map((member, index) => (
                        <div key={index} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => handleRemoveMemberInput(index)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-danger p-1 rounded hover:bg-white/5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          
                          <p className="text-[10px] font-bold text-muted-foreground">MEMBER #{index + 1}</p>
                          <div className="grid grid-cols-3 gap-2">
                            <Input 
                              placeholder="Name" 
                              className="bg-background/50 border-white/10 text-xs h-8"
                              value={member.name}
                              onChange={(e) => handleMemberChange(index, "name", e.target.value)}
                              required
                            />
                            <Input 
                              placeholder="Email" 
                              type="email"
                              className="bg-background/50 border-white/10 text-xs h-8"
                              value={member.email}
                              onChange={(e) => handleMemberChange(index, "email", e.target.value)}
                              required
                            />
                            <Input 
                              placeholder="Phone" 
                              className="bg-background/50 border-white/10 text-xs h-8"
                              value={member.phone}
                              onChange={(e) => handleMemberChange(index, "phone", e.target.value)}
                              required
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1 pt-2 border-t border-white/5">
                  <label className="text-xs font-semibold text-muted-foreground">Notes / Queries (Optional)</label>
                  <Textarea 
                    placeholder="Enter any special requests, dietary preferences, or scheduling clarifications..." 
                    className="bg-background/50 border-white/10 min-h-[60px] text-xs"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex gap-2 pt-4 border-t border-white/10 shrink-0">
                  <Button 
                    type="submit" 
                    disabled={submittingReg} 
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-md"
                  >
                    {submittingReg ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Submit Roster & Register
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="border-white/10" 
                    onClick={() => setRegisteringEvent(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Gateway Coming Soon Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0b0f19] border border-white/10 rounded-2xl w-full max-w-sm p-6 text-center overflow-hidden relative z-10 space-y-4 shadow-2xl"
            >
              <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <CreditCard className="w-8 h-8 animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-bold tracking-tight text-foreground">Payment Gateway Pending</h3>
                <Badge variant="secondary" className="bg-white/5 border border-white/10 mt-1 font-semibold text-xs px-2 py-0.5">
                  Provisional Spot Reserved
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Your registration details for <strong>{paymentEventName}</strong> have been submitted! 
                <br /><br />
                The Christ University registration payment link is being initialized. For now, your registration remains in **PENDING** verification. We will send you an email once the gateway is live to complete payment.
              </p>

              <Button 
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-md font-semibold text-xs"
              >
                Understood, Proceed
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
