"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StarryBackground } from "@/components/StarryBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FEST_CONTENT } from "@/lib/content";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, Users, Calendar, MapPin, Sparkles } from "lucide-react";

export default function EventsPage() {
  // Group events by vertical
  const eventsByVertical = React.useMemo(() => {
    const groups: { [key: string]: typeof FEST_CONTENT.events } = {};
    FEST_CONTENT.events.forEach((event) => {
      if (!groups[event.vertical]) {
        groups[event.vertical] = [];
      }
      groups[event.vertical].push(event);
    });
    return groups;
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden selection:bg-primary/30 relative">
      <StarryBackground />
      <Navbar />

      <main className="flex-grow relative z-10 pt-32 pb-24">
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[35rem] h-[35rem] bg-primary/10 rounded-full mix-blend-screen filter blur-[130px] animate-pulse" />
        </div>

        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-primary mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">USHUS 2026 Arena</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
            >
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Arena of Events</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg"
            >
              Explore our lineup of 10 competitive events across 5 core management verticals. Choose your battleground and register today.
            </motion.p>
          </div>

          {/* Render by Vertical groups */}
          <div className="space-y-24">
            {Object.entries(eventsByVertical).map(([verticalName, events], verticalIdx) => {
              // Find matching color code from content config
              const verticalInfo = FEST_CONTENT.verticals.find(
                (v) => v.name.toLowerCase() === verticalName.toLowerCase()
              );
              const colorCode = verticalInfo?.colorCode || "#003580";

              return (
                <motion.section
                  key={verticalName}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6 }}
                  className="relative"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 pb-4 border-b border-white/10 gap-4">
                    <div className="flex items-center gap-4">
                      <span 
                        className="w-4 h-8 rounded-full" 
                        style={{ backgroundColor: colorCode, boxShadow: `0 0 15px ${colorCode}` }}
                      />
                      <h2 className="text-3xl font-bold tracking-tight">{verticalName}</h2>
                    </div>
                    <Link href={`/events/${verticalName.toLowerCase().replace(/\s+/g, "-")}`}>
                      <Button variant="ghost" className="hover:bg-white/5 text-primary">
                        View Vertical Hub <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {events.map((event, idx) => {
                      const slug = event.name.toLowerCase().replace(/\s+/g, "-");
                      return (
                        <Card 
                          key={event.name}
                          className="glass border-white/5 hover:border-primary/30 transition-all duration-300 group overflow-hidden relative"
                        >
                          <div 
                            className="absolute -top-24 -right-24 w-48 h-48 rounded-full filter blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                            style={{ backgroundColor: colorCode }}
                          />
                          <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
                            <div>
                              <div className="flex justify-between items-start gap-4 mb-4">
                                <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors duration-300">
                                  {event.name}
                                </h3>
                                <span 
                                  className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                                  style={{ borderColor: `${colorCode}40`, color: colorCode, backgroundColor: `${colorCode}10` }}
                                >
                                  {event.vertical}
                                </span>
                              </div>
                              <p className="text-muted-foreground mb-8 leading-relaxed line-clamp-3">
                                {event.description}
                              </p>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-white/5 mt-auto">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                  <Trophy className="w-4 h-4 text-primary shrink-0" />
                                  <span>Prize: <strong className="text-foreground">{event.prizePool}</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                  <Users className="w-4 h-4 text-primary shrink-0" />
                                  <span>Team: <strong className="text-foreground">{event.teamSize}</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                                  <span>Date: <strong className="text-foreground">{event.dateRange}</strong></span>
                                </div>
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                                  <span>Campus: <strong className="text-foreground">Central</strong></span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 pt-2">
                                <Link href={`/events/${slug}`} className="flex-1">
                                  <Button className="w-full bg-white/5 hover:bg-white/10 text-foreground border border-white/10 group-hover:border-primary/50 transition-colors duration-300">
                                    View Event Details
                                  </Button>
                                </Link>
                                <Link href="/register">
                                  <Button className="shrink-0 aspect-square p-3">
                                    <ArrowRight className="w-4 h-4" />
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </motion.section>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
