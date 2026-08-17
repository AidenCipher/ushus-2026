"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Download, Clock, AlertCircle, Loader2, Sparkles, MapPin, Users, ArrowRight, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { getVerticalLogo } from "@/lib/logos";

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
  payment?: {
    paymentStatus: "NOT_SUBMITTED" | "SUBMITTED" | "VERIFIED" | "REJECTED";
    transactionRef?: string;
    rejectionReason?: string | null;
  } | null;
}

interface EventData {
  id: string;
  name: string;
  description: string | null;
  rulesDocumentUrl: string | null;
  status: string;
  prizePool: string | null;
  maxParticipants: number | null;
  teamSize: number;
  venue: string | null;
  vertical: {
    id: string;
    name: string;
    colorCode: string;
  };
}

export default function EventsDetailsPage() {
  const [registrations, setRegistrations] = React.useState<RegistrationData[]>([]);
  const [allEvents, setAllEvents] = React.useState<EventData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRegistryData() {
      try {
        const [regRes, eventRes] = await Promise.all([
          fetch("/api/v1/registrations"),
          fetch("/api/v1/events"),
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
    }
    fetchRegistryData();
  }, []);

  const isRegistered = (eventId: string) => registrations.some((reg) => reg.event.id === eventId);

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
    if (!groupedEvents[key]) groupedEvents[key] = [];
    groupedEvents[key].push(evt);
  });

  return (
    <div className="space-y-12 max-w-5xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Registry & Guidelines</h1>
        <p className="text-muted-foreground mt-1">
          Explore all USHUS 2026 competitions, check your registered events, download rulebooks, and manage your team status.
        </p>
      </div>

      {/* Contingent entry point */}
      <Card className="glass border-amber-500/30 bg-amber-500/5 relative overflow-hidden">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Registering a full college delegation?</h3>
              <p className="text-sm text-muted-foreground max-w-xl mt-0.5">
                Register your college&apos;s teams for every event in one guided flow, then pay once for the whole contingent.
              </p>
            </div>
          </div>
          <Link href="/dashboard/register/contingent">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold shrink-0">
              Register Full Contingent <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>

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
              <Card key={reg.id} className="glass border-indigo-500/20 relative overflow-hidden shadow-lg hover:shadow-indigo-500/5 transition-all">
                <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: reg.event.vertical.colorCode }} />
                <CardHeader className="pl-6 pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" style={{ borderColor: reg.event.vertical.colorCode, color: reg.event.vertical.colorCode }}>
                          {reg.event.vertical.name}
                        </Badge>
                        <Badge variant="outline" className="border-success/50 text-success bg-success/10 font-bold uppercase tracking-wider text-[10px]">
                          {reg.status}
                        </Badge>
                        {reg.payment && (
                          <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                            Payment: {reg.payment.paymentStatus.replace(/_/g, " ")}
                          </Badge>
                        )}
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
                  <div className="p-4 bg-[#0c101d]/60 border border-white/5 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> Registered Competitors
                    </h4>
                    {Array.isArray(reg.teamMembers) && reg.teamMembers.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {reg.teamMembers.map((member: any, i: number) => (
                          <Badge key={i} variant="secondary" className="bg-white/10 hover:bg-white/15 py-1 px-2 text-xs">
                            {member.name} ({member.registerNumber ?? member.email})
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

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
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: EXPLORE ALL COMPETITIONS */}
      <div className="space-y-8">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold">Explore All Competition Verticals</h2>
        </div>

        {Object.keys(groupedEvents).map((verticalName) => {
          const eventsList = groupedEvents[verticalName];
          const colorCode = eventsList[0]?.vertical?.colorCode || "#6366f1";
          const crest = getVerticalLogo({ name: verticalName });

          return (
            <div key={verticalName} className="space-y-4">
              <h3 className="text-base font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: colorCode }}>
                {crest ? (
                  <span className="w-6 h-6 rounded-full overflow-hidden border border-white/10 shrink-0 bg-black/30">
                    <Image src={crest.src} alt="" width={crest.width} height={crest.height} className="w-full h-full object-contain p-0.5" />
                  </span>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorCode }} />
                )}
                {verticalName}
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsList.map((evt) => {
                  const isReg = isRegistered(evt.id);
                  const isRegistrationClosed = evt.status !== "REGISTRATION_OPEN";

                  return (
                    <Card key={evt.id} className="glass border-white/10 overflow-hidden flex flex-col justify-between hover:border-indigo-500/20 transition-all duration-200 shadow-md relative">
                      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: colorCode }} />
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
                            <Users className="w-3.5 h-3.5 text-indigo-400" />
                            {evt.teamSize === 1 ? "Solo event" : `Team of ${evt.teamSize}`}
                          </span>
                        </div>

                        {isReg ? (
                          <Button variant="secondary" className="w-full text-xs font-semibold bg-white/5 text-muted-foreground border border-white/5 cursor-default hover:bg-white/5">
                            Registered & Secured
                          </Button>
                        ) : isRegistrationClosed ? (
                          <Button variant="outline" className="w-full text-xs text-muted-foreground border-white/10" disabled>
                            Registrations Closed
                          </Button>
                        ) : (
                          <Link href={`/dashboard/register/event/${evt.id}`}>
                            <Button className="w-full text-xs bg-indigo-600 hover:bg-indigo-700 shadow-md group">
                              Register for Competition
                              <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </Link>
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
    </div>
  );
}
