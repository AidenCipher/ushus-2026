"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FEST_CONTENT, EventInfo } from "@/lib/content";
import {
  ArrowRight,
  Trophy,
  Users,
  Calendar,
  MapPin,
  Shield,
  Crosshair,
  CreditCard,
  Sparkles,
  Eye,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { EventCinematicShowcase } from "@/components/EventCinematicShowcase";
import { Commander3DViewer } from "@/components/Commander3DViewer";

export default function EventsPage() {
  const events = FEST_CONTENT.events;
  const [selected3DEvent, setSelected3DEvent] = React.useState<EventInfo | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B132B]" style={{ color: "#F5ECD7" }}>
      <Navbar />

      <main className="flex-grow">
        {/* ================================================================
            CINEMATIC SCROLL SHOWCASE — Temporal Watchers 3D Motion
        ================================================================ */}
        <section className="pt-12 md:pt-16 relative z-10">
          {/* Section Header */}
          <div className="text-center pt-8 pb-6 px-4">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 border"
              style={{
                background: "rgba(201, 168, 76, 0.12)",
                borderColor: "rgba(201, 168, 76, 0.35)",
                color: "#C9A84C",
                fontFamily: "'Cinzel', serif",
              }}
            >
              USHUS 2026: IMPERIUM // THE THEATERS OF WAR
            </div>
            <h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight block"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              <span style={{ color: "#F5ECD7" }}>Ten Arenas.</span>{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #FFFFFF 0%, #E8C875 40%, #C9A84C 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Ten Commanders.
              </span>
            </h1>
            <p
              className="mt-3 text-xs md:text-sm max-w-xl mx-auto text-neutral-300"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Scroll through space and time. Master the doctrine. Claim your theater of victory.
            </p>
          </div>

          {/* The 3D motion cinematic showcase */}
          <EventCinematicShowcase />
        </section>

        {/* ================================================================
            TACTICAL MATRIX GRID — All 10 Arenas
        ================================================================ */}
        <section
          className="py-24 px-4 relative z-10 border-t"
          style={{
            background: "rgba(10, 17, 40, 0.95)",
            borderColor: "rgba(201, 168, 76, 0.2)",
          }}
        >
          <div className="container mx-auto max-w-6xl">
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <div className="text-xs font-mono tracking-widest uppercase text-amber-400">
                TACTICAL DEPLOYMENT MATRIX
              </div>
              <h2
                className="text-3xl md:text-5xl font-bold"
                style={{ fontFamily: "'Cinzel', serif", color: "#F5ECD7" }}
              >
                Choose Your Battleground
              </h2>
              <div
                className="h-0.5 w-16 rounded mx-auto"
                style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
              />
              <p className="text-sm text-neutral-300">
                Every event runs a standardized three-era doctrine: Era I (Manual Prelims), Era II (Live Simulation), and Era III (AI-Augmented Stage Finals).
              </p>
            </div>

            {/* Events grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.map((event) => {
                const slug = event.name.toLowerCase().split(" ")[0].replace(/[^a-z0-9]/g, "");

                return (
                  <div
                    key={event.name}
                    className="rounded-xl overflow-hidden group transition-all duration-300 flex flex-col border"
                    style={{
                      background: "rgba(16, 26, 54, 0.85)",
                      borderColor: "rgba(201, 168, 76, 0.22)",
                      backdropFilter: "blur(12px)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201, 168, 76, 0.6)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 35px rgba(201, 168, 76, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201, 168, 76, 0.22)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Header Strip */}
                    <div
                      className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                        <div>
                          <p
                            className="text-xs font-bold tracking-widest uppercase text-amber-400"
                            style={{ fontFamily: "'Cinzel', serif" }}
                          >
                            {event.leader}
                          </p>
                          <p className="text-[11px] text-neutral-300">
                            {event.doctrine}
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] font-mono text-amber-300">
                        {event.vertical}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-1 gap-4">
                      {/* Arena Name & Codename */}
                      <div className="flex items-center justify-between">
                        <h3
                          className="text-2xl md:text-3xl font-black tracking-wide"
                          style={{ fontFamily: "'Cinzel', serif", color: "#F5ECD7" }}
                        >
                          {event.name}
                        </h3>
                        <span className="text-[11px] font-mono font-bold text-amber-400 px-2 py-0.5 rounded bg-black/40 border border-amber-500/30">
                          {event.sealLetter} // {event.codename}
                        </span>
                      </div>

                      {/* Hook */}
                      <p className="text-xs md:text-sm italic text-amber-100/90">
                        &ldquo;{event.hook}&rdquo;
                      </p>

                      {/* Description */}
                      <p className="text-xs leading-relaxed line-clamp-2 text-neutral-300">
                        {event.description}
                      </p>

                      {/* 3-Era Round Structure Badge */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0B132B]/80 border border-amber-500/20 text-xs">
                        <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-neutral-300 text-[11px]">
                          <strong>3-Era Structure:</strong> Prelims → Simulation → Stage Finals
                        </span>
                      </div>

                      {/* Meta Parameters Grid */}
                      <div
                        className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-white/5"
                      >
                        <div className="flex items-center gap-2 text-neutral-300">
                          <Trophy className="w-4 h-4 flex-shrink-0 text-amber-400" />
                          <div className="leading-tight">
                            <span className="text-[10px] text-neutral-400 block">Prize Pool</span>
                            <strong className="text-amber-200">1st: ₹{event.prizeFirst.toLocaleString()}</strong>
                            {event.prizeSecond && (
                              <span className="text-[10px] text-neutral-400 block">2nd: ₹{event.prizeSecond.toLocaleString()}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-neutral-300">
                          <Users className="w-4 h-4 flex-shrink-0 text-amber-400" />
                          <div className="leading-tight">
                            <span className="text-[10px] text-neutral-400 block">Squad</span>
                            <strong className="text-amber-200">{event.teamSize}</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-neutral-300">
                          <CreditCard className="w-4 h-4 flex-shrink-0 text-amber-400" />
                          <div className="leading-tight">
                            <span className="text-[10px] text-neutral-400 block">Fee per Entry</span>
                            <span className="line-through text-neutral-400 text-[10px] mr-1">₹1,500</span>
                            <strong className="text-amber-300 text-xs">₹900 (Early Bird)</strong>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-neutral-300">
                          <MapPin className="w-4 h-4 flex-shrink-0 text-amber-400" />
                          <div className="leading-tight">
                            <span className="text-[10px] text-neutral-400 block">Venue</span>
                            <strong className="text-amber-200">Central Campus</strong>
                          </div>
                        </div>
                      </div>

                      {/* Accommodation Notice */}
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 pt-1">
                        <AlertCircle className="w-3 h-3 text-amber-400/80 shrink-0" />
                        <span>Accommodation inside campus: First-come-first-served (not guaranteed).</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 mt-auto">
                        <button
                          onClick={() => setSelected3DEvent(event)}
                          className="h-10 px-3 rounded-md text-xs font-semibold tracking-wider transition-all border border-amber-500/40 text-amber-300 hover:bg-amber-500/15 flex items-center gap-1.5 cursor-pointer"
                          style={{ fontFamily: "'Cinzel', serif" }}
                        >
                          <Eye className="w-3.5 h-3.5" /> 3D View
                        </button>

                        <Link href={`/events/${slug}`} className="flex-1">
                          <button
                            className="w-full h-10 rounded-md text-xs font-semibold tracking-wider transition-all border border-white/15 text-neutral-200 hover:bg-white/5 cursor-pointer"
                            style={{ fontFamily: "'Cinzel', serif" }}
                          >
                            Protocols
                          </button>
                        </Link>

                        <Link href="/register">
                          <button
                            className="h-10 px-4 rounded-md text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer"
                            style={{
                              background: "linear-gradient(135deg, #E8C875, #C9A84C)",
                              color: "#050200",
                              fontFamily: "'Cinzel', serif",
                            }}
                          >
                            Deploy <ArrowRight className="w-3 h-3" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-16 text-center space-y-4">
              <Link href="/register">
                <button
                  className="h-14 px-10 text-sm font-bold tracking-widest uppercase rounded-md transition-all duration-300 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
                    color: "#050200",
                    fontFamily: "'Cinzel', serif",
                    boxShadow: "0 0 35px rgba(201, 168, 76, 0.3)",
                  }}
                >
                  REGISTER FOR USHUS 2026: IMPERIUM
                </button>
              </Link>
              <p className="text-xs text-neutral-400">
                50% off full contingent (all 10 events for ₹7,500) · 40% off individual event (₹900) before Sept 30.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Interactive 3D Commander Viewer Modal ──────────────────────────── */}
      {selected3DEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[88vh]">
            <Commander3DViewer event={selected3DEvent} onClose={() => setSelected3DEvent(null)} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
