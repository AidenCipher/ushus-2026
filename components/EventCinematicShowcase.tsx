"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Trophy, Users, Calendar, Shield, Crosshair, ChevronLeft, ChevronRight } from "lucide-react";
import { FEST_CONTENT, EventInfo } from "@/lib/content";

interface EventWithSlug extends EventInfo {
  slug: string;
}

const eventsData: EventWithSlug[] = FEST_CONTENT.events.map((event) => ({
  ...event,
  slug: event.name.toLowerCase().split(" ")[0].replace(/[^a-z0-9]/g, ""),
}));

export function EventCinematicShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const currentEvent = eventsData[activeIndex] || eventsData[0];

  const nextEvent = () => {
    setActiveIndex((prev) => (prev + 1) % eventsData.length);
  };

  const prevEvent = () => {
    setActiveIndex((prev) => (prev - 1 + eventsData.length) % eventsData.length);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Featured Commander Card */}
      <div
        className="rounded-2xl overflow-hidden border border-amber-500/30 bg-[#101A36]/90 backdrop-blur-xl shadow-2xl relative"
        style={{
          boxShadow: "0 0 50px rgba(201, 168, 76, 0.15)",
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
          {/* Visual Column */}
          <div className="lg:col-span-5 relative min-h-[320px] lg:min-h-full bg-black/40 overflow-hidden">
            <Image
              src={currentEvent.leaderImage}
              alt={`${currentEvent.leader} - ${currentEvent.name}`}
              fill
              priority
              className="object-cover object-top transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101A36] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#101A36]" />
            
            {/* Era Badge */}
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-md bg-black/70 border border-amber-500/40 text-xs font-mono text-amber-300 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" />
              {currentEvent.doctrine}
            </div>

            {/* Seal / Letter */}
            <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-serif text-2xl font-black text-amber-300 backdrop-blur-md">
              {currentEvent.sealLetter}
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-mono tracking-widest uppercase text-amber-400">
                  SECTOR {activeIndex + 1} OF 10 // {currentEvent.vertical.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  {currentEvent.prizePool} BOUNTY
                </span>
              </div>

              <div>
                <p className="text-sm font-semibold tracking-widest uppercase text-amber-400" style={{ fontFamily: "var(--font-trajan), serif" }}>
                  {currentEvent.leader} &middot; {currentEvent.doctrine}
                </p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5ECD7] mt-1" style={{ fontFamily: "var(--font-trajan), serif" }}>
                  {currentEvent.name}
                </h2>
              </div>

              <p className="text-sm italic text-amber-200/90 font-serif">
                &ldquo;{currentEvent.hook}&rdquo;
              </p>

              <p className="text-sm text-neutral-300 leading-relaxed">
                {currentEvent.description}
              </p>

              {/* Meta Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                  <div className="text-neutral-400 flex items-center gap-1 mb-1">
                    <Users className="w-3.5 h-3.5 text-amber-400" /> Team Size
                  </div>
                  <div className="font-semibold text-[#F5ECD7]">{currentEvent.teamSize}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs">
                  <div className="text-neutral-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" /> Operational Days
                  </div>
                  <div className="font-semibold text-[#F5ECD7]">{currentEvent.dateRange}</div>
                </div>
                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs col-span-2 sm:col-span-1">
                  <div className="text-neutral-400 flex items-center gap-1 mb-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" /> 1st Place
                  </div>
                  <div className="font-semibold text-amber-300">
                    {currentEvent.name === "Vanguard (Best Manager)" ? "₹25,000" : "₹15,000"}
                  </div>
                </div>
              </div>
            </div>

            {/* Controls & Actions */}
            <div className="pt-4 border-t border-amber-500/20 flex items-center justify-between flex-wrap gap-4">
              {/* Pagination indicators */}
              <div className="flex items-center gap-1.5">
                {eventsData.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === activeIndex ? "w-6 bg-amber-400" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                    aria-label={`Go to event ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Navigation & CTA */}
              <div className="flex items-center gap-3">
                <button
                  onClick={prevEvent}
                  className="w-10 h-10 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center justify-center hover:bg-amber-500/20 transition-colors"
                  aria-label="Previous event"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextEvent}
                  className="w-10 h-10 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-center justify-center hover:bg-amber-500/20 transition-colors"
                  aria-label="Next event"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <Link href={`/events/${currentEvent.slug}`}>
                  <button
                    className="h-10 px-5 text-xs font-bold uppercase rounded-lg shadow-lg flex items-center gap-1.5 transition-all duration-300"
                    style={{
                      background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
                      color: "#050200",
                      fontFamily: "var(--font-trajan), serif",
                    }}
                  >
                    ENTER ARENA <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventShowcasePreview() {
  const featured = eventsData.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {featured.map((event) => (
        <div
          key={event.name}
          className="relative rounded-xl overflow-hidden group border border-amber-500/25 bg-[#101A36]/80 backdrop-blur-md transition-all duration-300 hover:border-amber-400/60 shadow-xl"
        >
          {/* Commander Image */}
          <div className="relative h-64 overflow-hidden bg-black/50">
            <Image
              src={event.leaderImage}
              alt={`${event.leader} - ${event.name}`}
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#101A36] via-[#101A36]/40 to-transparent" />
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/70 border border-amber-500/30 text-[10px] font-mono text-amber-300">
              {event.doctrine}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-3">
            <div>
              <p
                className="text-xs font-bold tracking-widest uppercase text-amber-400"
                style={{ fontFamily: "var(--font-trajan), serif" }}
              >
                {event.leader}
              </p>
              <h3
                className="text-2xl font-bold tracking-wide text-neutral-100 mt-0.5"
                style={{ fontFamily: "var(--font-trajan), serif" }}
              >
                {event.name}
              </h3>
            </div>

            <p className="text-xs italic text-neutral-300 line-clamp-2 font-serif">
              &ldquo;{event.hook}&rdquo;
            </p>

            <div className="pt-3 flex items-center justify-between border-t border-amber-500/15 text-xs">
              <span className="text-amber-300 font-bold">{event.prizePool}</span>
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider"
                style={{ fontFamily: "var(--font-trajan), serif" }}
              >
                Deploy <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
