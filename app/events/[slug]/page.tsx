"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StarryBackground } from "@/components/StarryBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FEST_CONTENT } from "@/lib/content";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Users, Calendar, MapPin, Sparkles, BookOpen, AlertCircle, FileText } from "lucide-react";

export default function EventDetailOrCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  // 1. Check if the slug corresponds to a vertical category page
  const vertical = React.useMemo(() => {
    // Normalise slug
    const normalized = slug.toLowerCase();
    
    // Find matching vertical (handle special aliases like human-resources -> HR)
    return FEST_CONTENT.verticals.find((v) => {
      const vName = v.name.toLowerCase();
      if (normalized === "human-resources" && vName === "hr") return true;
      return vName === normalized;
    });
  }, [slug]);

  // Get events belonging to this vertical if it is a category page
  const verticalEvents = React.useMemo(() => {
    if (!vertical) return [];
    return FEST_CONTENT.events.filter(
      (e) => e.vertical.toLowerCase() === vertical.name.toLowerCase()
    );
  }, [vertical]);

  // 2. Check if the slug corresponds to a specific event detail page
  const event = React.useMemo(() => {
    if (vertical) return null; // If it's a vertical, it's not a single event

    const normalized = slug.toLowerCase();
    return FEST_CONTENT.events.find((e) => {
      const eventSlug = e.name.toLowerCase().replace(/\s+/g, "-");
      return eventSlug === normalized;
    });
  }, [slug, vertical]);

  // Find color code based on context
  const activeColor = React.useMemo(() => {
    let verticalName = "";
    if (vertical) {
      verticalName = vertical.name;
    } else if (event) {
      verticalName = event.vertical;
    }
    const info = FEST_CONTENT.verticals.find(
      (v) => v.name.toLowerCase() === verticalName.toLowerCase()
    );
    return info?.colorCode || "#003580";
  }, [vertical, event]);

  // Render Vertical Category Hub
  if (vertical) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden selection:bg-primary/30 relative">
        <StarryBackground />
        <Navbar />

        <main className="flex-grow relative z-10 pt-32 pb-24">
          <div className="container mx-auto px-4">
            <Link href="/events" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 group transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to all events</span>
            </Link>

            <div className="max-w-4xl mb-16">
              <div className="flex items-center gap-4 mb-4">
                <span 
                  className="w-3 h-6 rounded-full" 
                  style={{ backgroundColor: activeColor, boxShadow: `0 0 10px ${activeColor}` }}
                />
                <span className="text-sm font-semibold tracking-wider uppercase text-muted-foreground">Domain Vertical</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                {vertical.name} <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Events</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Compete and showcase your expertise in the {vertical.name} domain. Learn more about the challenges prepared by our organizing committees.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {verticalEvents.map((evt) => {
                const evtSlug = evt.name.toLowerCase().replace(/\s+/g, "-");
                return (
                  <Card 
                    key={evt.name}
                    className="glass border-white/5 hover:border-primary/30 transition-all duration-300 group overflow-hidden relative"
                  >
                    <div 
                      className="absolute -top-24 -right-24 w-48 h-48 rounded-full filter blur-[60px] opacity-0 group-hover:opacity-25 transition-opacity duration-500"
                      style={{ backgroundColor: activeColor }}
                    />
                    <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
                      <div>
                        <h3 className="text-2xl font-bold tracking-tight mb-4 group-hover:text-primary transition-colors duration-300">
                          {evt.name}
                        </h3>
                        <p className="text-muted-foreground mb-8 leading-relaxed line-clamp-3">
                          {evt.description}
                        </p>
                      </div>

                      <div className="space-y-6 pt-4 border-t border-white/5 mt-auto">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Trophy className="w-4 h-4 text-primary shrink-0" />
                            <span>Prize: <strong className="text-foreground">{evt.prizePool}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Users className="w-4 h-4 text-primary shrink-0" />
                            <span>Team: <strong className="text-foreground">{evt.teamSize}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary shrink-0" />
                            <span>Date: <strong className="text-foreground">{evt.dateRange}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4 text-primary shrink-0" />
                            <span>Venue: <strong className="text-foreground">Campus</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                          <Link href={`/events/${evtSlug}`} className="flex-1">
                            <Button className="w-full bg-white/5 hover:bg-white/10 text-foreground border border-white/10 group-hover:border-primary/50 transition-colors duration-300">
                              View Event Rules
                            </Button>
                          </Link>
                          <Link href="/register">
                            <Button className="shrink-0">
                              Register Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Render Specific Event Detail Page
  if (event) {
    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden selection:bg-primary/30 relative">
        <StarryBackground />
        <Navbar />

        <main className="flex-grow relative z-10 pt-32 pb-24">
          <div className="container mx-auto px-4">
            <Link href="/events" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 group transition-colors">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Back to all events</span>
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              {/* Event Showcase & Rules Description */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex flex-wrap items-center gap-3">
                  <span 
                    className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                    style={{ borderColor: `${activeColor}40`, color: activeColor, backgroundColor: `${activeColor}10` }}
                  >
                    {event.vertical} Vertical
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-muted-foreground">
                    Christ University
                  </span>
                </div>

                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                  {event.name}
                </h1>

                <div className="glass border-white/5 rounded-2xl p-8 space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2.5 text-foreground">
                    <BookOpen className="w-5 h-5 text-primary" />
                    Event Description
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-base">
                    {event.description}
                  </p>
                </div>

                <div className="glass border-white/5 rounded-2xl p-8 space-y-6">
                  <h2 className="text-xl font-bold flex items-center gap-2.5 text-foreground">
                    <FileText className="w-5 h-5 text-primary" />
                    General Event Rules & Guidelines
                  </h2>
                  <ul className="space-y-4 text-muted-foreground text-sm list-disc pl-5">
                    <li>All team members must be from the same college/institution.</li>
                    <li>Cross-specialization teams are permitted and highly encouraged.</li>
                    <li>Participants must carry their physical college ID cards throughout the fest.</li>
                    <li>Specific event submissions must be uploaded via the portal or submitted on-campus as instructed by the committee.</li>
                    <li>Decisions of the judges and organizing committee are final and binding in all cases.</li>
                    <li>Rules might be updated/refined close to the event date. Registered teams will be notified via email.</li>
                  </ul>
                </div>
              </div>

              {/* Quick Info & Register CTA sidebar */}
              <div className="space-y-8">
                <Card className="glass border-white/5 overflow-hidden relative">
                  <div 
                    className="absolute -top-16 -right-16 w-32 h-32 rounded-full filter blur-[50px] opacity-20"
                    style={{ backgroundColor: activeColor }}
                  />
                  <CardContent className="p-8 space-y-8 relative z-10">
                    <h3 className="text-lg font-bold border-b border-white/10 pb-4">Event Quick Info</h3>

                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Prize Pool</p>
                          <p className="text-lg font-bold text-foreground">{event.prizePool}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Team Size</p>
                          <p className="text-lg font-bold text-foreground">{event.teamSize}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Event Date</p>
                          <p className="text-lg font-bold text-foreground">{event.dateRange}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Venue</p>
                          <p className="text-lg font-bold text-foreground">{FEST_CONTENT.venue}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 space-y-4 border-t border-white/10">
                      <Link href="/register" className="w-full block">
                        <Button className="w-full text-base h-12 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                          Register for USHUS
                        </Button>
                      </Link>
                      <p className="text-center text-xs text-muted-foreground">
                        Registrations close on {FEST_CONTENT.registrationDeadline}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Eligibility criteria notice */}
                <div className="glass border-white/5 rounded-2xl p-6 flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Eligibility Note</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {event.eligibility}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Fallback: Event or Category not found
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden selection:bg-primary/30 relative">
      <StarryBackground />
      <Navbar />

      <main className="flex-grow relative z-10 pt-32 pb-24 flex items-center justify-center">
        <div className="container mx-auto px-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6 text-red-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The event or category you are looking for does not exist or has been removed from the schedule.
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/events">
              <Button className="w-full">
                Browse All Events
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Back to Home Page
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
