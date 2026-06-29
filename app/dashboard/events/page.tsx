"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, FileText, Download, Clock, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
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

export default function EventsDetailsPage() {
  const { data: session } = useSession();
  const [registrations, setRegistrations] = React.useState<RegistrationData[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRegistrations() {
      try {
        const res = await fetch("/api/v1/registrations");
        if (res.ok) {
          const json = await res.json();
          setRegistrations(json.data || []);
        }
      } catch (error) {
        console.error("Failed to load registered events details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Details & Guidelines</h1>
        <p className="text-muted-foreground mt-1">Information, rules, and guidelines for your registered events.</p>
      </div>

      {registrations.length === 0 ? (
        <Card className="glass border-white/10">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <Trophy className="w-12 h-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">No Registered Events</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                Details will appear here once you are registered and confirmed for an event.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {registrations.map((reg) => (
            <motion.div
              key={reg.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card className="glass border-white/10 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-2 h-full"
                  style={{ backgroundColor: reg.event.vertical.colorCode }}
                />
                <CardHeader className="pl-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge 
                          variant="outline" 
                          style={{ borderColor: reg.event.vertical.colorCode, color: reg.event.vertical.colorCode }}
                        >
                          {reg.event.vertical.name}
                        </Badge>
                        <Badge variant="outline" className="border-success/50 text-success bg-success/10">
                          {reg.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-2xl mt-2">{reg.event.name}</CardTitle>
                    </div>
                    {reg.event.prizePool && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Prize Pool</p>
                        <p className="text-lg font-bold text-primary">{reg.event.prizePool}</p>
                      </div>
                    )}
                  </div>
                  {reg.event.description && (
                    <CardDescription className="text-sm mt-3 leading-relaxed text-foreground/80">
                      {reg.event.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pl-6 space-y-6">
                  {/* Team details */}
                  <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
                    <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                      <FileText className="w-4 h-4" /> Team Information
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Team Name:</span>{" "}
                        <span className="font-semibold">{reg.teamName || "Individual Participant"}</span>
                      </div>
                      {Array.isArray(reg.teamMembers) && reg.teamMembers.length > 0 && (
                        <div className="sm:col-span-2">
                          <span className="text-muted-foreground block mb-1">Team Members:</span>
                          <div className="flex flex-wrap gap-2">
                            {reg.teamMembers.map((member: any, i: number) => (
                              <Badge key={i} variant="secondary" className="bg-white/10">
                                {member.name || member}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rules and guidelines */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold">Guidelines & Resources</h4>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {reg.event.rulesDocumentUrl ? (
                        <Card className="glass border-white/5 bg-white/5 p-4 flex flex-col justify-between gap-4">
                          <div>
                            <h5 className="font-semibold text-sm">Official Rulebook</h5>
                            <p className="text-xs text-muted-foreground mt-1">Read the complete rules, format, and round details.</p>
                          </div>
                          <a href={reg.event.rulesDocumentUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                            <Button variant="outline" className="w-full border-white/10">
                              <Download className="w-4 h-4 mr-2" /> Download Rulebook
                            </Button>
                          </a>
                        </Card>
                      ) : (
                        <Card className="glass border-white/5 bg-white/5 p-4 flex flex-col justify-between gap-2">
                          <div>
                            <h5 className="font-semibold text-sm">Guidelines Pending</h5>
                            <p className="text-xs text-muted-foreground mt-1">The detailed rulebook for this event will be uploaded soon.</p>
                          </div>
                          <Button variant="outline" className="w-full border-white/10" disabled>
                            <AlertCircle className="w-4 h-4 mr-2" /> TBD
                          </Button>
                        </Card>
                      )}

                      <Card className="glass border-white/5 bg-white/5 p-4 flex flex-col justify-between gap-4">
                        <div>
                          <h5 className="font-semibold text-sm">Need Help?</h5>
                          <p className="text-xs text-muted-foreground mt-1">Contact the student coordinators for this event.</p>
                        </div>
                        <Link href="/dashboard/contacts">
                          <Button className="w-full bg-primary hover:bg-primary/80">
                            View Contact Directory
                          </Button>
                        </Link>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
