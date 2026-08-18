"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FEST_CONTENT } from "@/lib/content";
import { Commander3DViewer } from "@/components/Commander3DViewer";
import { getLogoByCodename } from "@/lib/logos";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft,
  Trophy,
  Users,
  Calendar,
  MapPin,
  BookOpen,
  AlertCircle,
  FileText,
  Zap,
  Leaf,
  Crosshair,
  Shield,
  Layers,
  CreditCard,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function EventDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || "";
  const { registerCtaHref } = useAuth();

  // Match event by slug, short name, or codename
  const event = React.useMemo(() => {
    const normalized = slug.toLowerCase().replace(/[^a-z0-9]/g, "");
    return FEST_CONTENT.events.find((e) => {
      const fullSlug = e.name.toLowerCase().replace(/[^a-z0-9]/g, "");
      const shortSlug = e.name.toLowerCase().split(" ")[0].replace(/[^a-z0-9]/g, "");
      const codeSlug = e.codename.toLowerCase().replace(/[^a-z0-9]/g, "");
      return fullSlug === normalized || shortSlug === normalized || codeSlug === normalized;
    });
  }, [slug]);

  // Not found
  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0B132B]" style={{ color: "#F5ECD7" }}>
        <Navbar />
        <main className="flex-grow relative z-10 pt-32 pb-24 flex items-center justify-center">
          <div className="container mx-auto px-4 text-center max-w-md">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-red-500/10 border border-red-500/30 text-red-400"
            >
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1
              className="text-3xl font-bold tracking-tight mb-4 text-[#F5ECD7]"
              style={{ fontFamily: "var(--font-trajan), serif" }}
            >
              Arena Not Found
            </h1>
            <p className="mb-8 text-neutral-400">
              The tactical arena you seek does not exist or has been redeployed.
            </p>
            <div className="flex flex-col gap-3">
              <Link href="/events">
                <button
                  className="w-full h-11 rounded-md text-sm font-bold bg-amber-500 text-black hover:bg-amber-400"
                  style={{ fontFamily: "var(--font-trajan), serif" }}
                >
                  Browse All Arenas
                </button>
              </Link>
              <Link href="/">
                <button
                  className="w-full h-11 rounded-md text-sm font-semibold border border-amber-500/40 text-amber-400 bg-transparent hover:bg-amber-500/10"
                  style={{ fontFamily: "var(--font-trajan), serif" }}
                >
                  Back to Command Bridge
                </button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const crest = getLogoByCodename(event.codename);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B132B]" style={{ color: "#F5ECD7" }}>
      <Navbar />

      <main className="flex-grow relative z-10 pt-28 pb-24">
        <div className="container mx-auto px-4 max-w-6xl space-y-8">
          {/* Back link */}
          <Link
            href="/events"
            className="inline-flex items-center gap-2 group transition-colors text-neutral-400 hover:text-amber-400"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-mono tracking-wider">
              RETURN TO ARENAS MATRIX
            </span>
          </Link>

          {/* Event title + crest */}
          <div className="flex items-center gap-4">
            {crest && (
              <div className="w-14 h-14 rounded-lg bg-black/40 border border-amber-500/40 flex items-center justify-center overflow-hidden shrink-0">
                <Image src={crest.src} alt={`${event.codename} crest`} width={crest.width} height={crest.height} className="w-full h-full object-contain p-1" />
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-wide" style={{ fontFamily: "var(--font-trajan), serif", color: "#F5ECD7" }}>
                {event.name}
              </h1>
              <span className="text-xs font-mono font-bold text-amber-400">{event.codename} — {event.vertical}</span>
            </div>
          </div>

          {/* ── Top Section: 3D Commander Viewer Canvas ────────────────────────── */}
          <div className="w-full">
            <Commander3DViewer event={event} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pt-6">
            {/* ── Left 2 Columns: Deep Doctrine & 3-Era Round Structure ───────── */}
            <div className="lg:col-span-2 space-y-8">

              {/* Historical Doctrine Foundation */}
              <div
                className="rounded-xl p-6 border bg-[#101A36]/80 border-amber-500/20 backdrop-blur-md flex flex-col sm:flex-row items-center sm:items-start gap-6"
              >
                <div className="relative w-28 h-36 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 bg-black/40 shadow-xl">
                  <Image
                    src={event.leaderImage}
                    alt={event.leader}
                    fill
                    className="object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101A36] via-transparent to-transparent" />
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-center">
                    <span className="text-[9px] font-mono font-bold text-amber-300 uppercase tracking-wider block truncate">
                      {event.leader.split(" ")[0]}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-amber-400" />
                    <h2
                      className="text-xs font-bold tracking-widest uppercase text-amber-400"
                      style={{ fontFamily: "var(--font-trajan), serif" }}
                    >
                      Historical Command Doctrine ({event.doctrine})
                    </h2>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-300">
                    {event.historicalFact}
                  </p>
                </div>
              </div>

              {/* 3-Era Round Structure Details */}
              <div
                className="rounded-xl p-6 space-y-6 border bg-[#101A36]/90 border-amber-500/30 backdrop-blur-md"
              >
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    <h2
                      className="text-lg font-bold text-[#F5ECD7]"
                      style={{ fontFamily: "var(--font-trajan), serif" }}
                    >
                      3-Era Gauntlet &amp; Round Breakdown
                    </h2>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    10–14 TOTAL ROUNDS
                  </span>
                </div>

                {/* Era 1 */}
                <div className="space-y-2.5 p-4 rounded-lg bg-[#0B132B]/80 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-300 font-mono uppercase">
                      {event.era1.title}
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-mono">PHASE 1</span>
                  </div>
                  <p className="text-xs italic text-amber-200/80">{event.era1.subtitle}</p>
                  <p className="text-xs text-neutral-300 leading-relaxed">{event.era1.description}</p>
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono block mb-1">
                      OPERATIONAL ROUNDS:
                    </span>
                    <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1">
                      {event.era1.rounds.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Era 2 */}
                <div className="space-y-2.5 p-4 rounded-lg bg-[#0B132B]/80 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-300 font-mono uppercase">
                      {event.era2.title}
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-mono">PHASE 2</span>
                  </div>
                  <p className="text-xs italic text-amber-200/80">{event.era2.subtitle}</p>
                  <p className="text-xs text-neutral-300 leading-relaxed">{event.era2.description}</p>
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono block mb-1">
                      OPERATIONAL ROUNDS:
                    </span>
                    <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1">
                      {event.era2.rounds.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Era 3 */}
                <div className="space-y-2.5 p-4 rounded-lg bg-[#0B132B]/80 border border-amber-500/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-amber-300 font-mono uppercase">
                      {event.era3.title}
                    </h3>
                    <span className="text-[10px] text-neutral-400 font-mono">PHASE 3 (FINALS)</span>
                  </div>
                  <p className="text-xs italic text-amber-200/80">{event.era3.subtitle}</p>
                  <p className="text-xs text-neutral-300 leading-relaxed">{event.era3.description}</p>
                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono block mb-1">
                      OPERATIONAL ROUNDS:
                    </span>
                    <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1">
                      {event.era3.rounds.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI & Sustainability lenses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className="rounded-xl p-5 space-y-2 border bg-amber-500/5 border-amber-500/25"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span
                      className="text-xs font-bold tracking-widest uppercase text-amber-400"
                      style={{ fontFamily: "var(--font-trajan), serif" }}
                    >
                      AI Tactical Lens
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-300">
                    {event.aiLens}
                  </p>
                </div>
                <div
                  className="rounded-xl p-5 space-y-2 border bg-emerald-500/5 border-emerald-500/25"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <span
                      className="text-xs font-bold tracking-widest uppercase text-emerald-400"
                      style={{ fontFamily: "var(--font-trajan), serif" }}
                    >
                      Long-Horizon Statecraft
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-300">
                    {event.sustainabilityLens}
                  </p>
                </div>
              </div>

              {/* Rules of Engagement */}
              <div
                className="rounded-xl p-6 space-y-4 border bg-[#101A36]/80 border-amber-500/20"
              >
                <h2
                  className="text-lg font-bold flex items-center gap-2.5 text-neutral-100"
                  style={{ fontFamily: "var(--font-trajan), serif" }}
                >
                  <FileText className="w-5 h-5 text-amber-400" />
                  Rules of Engagement
                </h2>
                <ul className="space-y-2.5 text-xs md:text-sm list-disc pl-5 text-neutral-300">
                  <li>All crew members must be bona fide students of the same registered institution.</li>
                  <li>Interdisciplinary tactical units are permitted and encouraged.</li>
                  <li>Participants must present digital confirmation passes and college IDs on arrival.</li>
                  <li>All submissions and AI simulation inputs must be finalized within the designated windows.</li>
                  <li>The decision of the supreme board of adjudicators is sovereign and final.</li>
                </ul>
              </div>
            </div>

            {/* ── Right Column: Sidebar Telemetry & Actions ─────────────────── */}
            <div className="space-y-6">
              {/* Mission Telemetry Card */}
              <div
                className="rounded-xl overflow-hidden border bg-[#101A36]/90 border-amber-500/30 backdrop-blur-md shadow-2xl"
              >
                <div className="px-6 py-4 border-b border-amber-500/20 flex items-center justify-between">
                  <h3
                    className="font-bold text-xs tracking-widest uppercase text-amber-400 font-mono"
                  >
                    MISSION TELEMETRY
                  </h3>
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                    STATUS: ACTIVE
                  </span>
                </div>
                <div className="p-6 space-y-5">
                  {/* Prize 1st / Solo Bounty */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-400 border border-amber-500/30 bg-amber-500/10">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
                        {event.prizeSecond ? "1st Place Bounty" : "Grand Champion Bounty (Solo Title)"}
                      </p>
                      <p className="text-base font-black text-amber-300">
                        ₹{event.prizeFirst.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Prize 2nd */}
                  {event.prizeSecond ? (
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-300 border border-amber-500/30 bg-amber-500/10">
                        <Trophy className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
                          2nd Place Bounty
                        </p>
                        <p className="text-base font-black text-amber-200">
                          ₹{event.prizeSecond.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] font-mono px-3 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      ★ Sole Victor Standard: ₹25,000 Winner Takes All
                    </div>
                  )}

                  {/* Pricing Breakdown */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-400 border border-amber-500/30 bg-amber-500/10">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
                        Registration Fee
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="line-through text-neutral-400 text-xs">₹1,500</span>
                        <span className="text-base font-black text-amber-300">₹900 (Early Bird)</span>
                      </div>
                      <span className="text-[10px] text-amber-400/80 block mt-0.5">
                        *50% off if registering all 10 events (₹7,500 total)
                      </span>
                    </div>
                  </div>

                  {/* Squad Capacity */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-400 border border-amber-500/30 bg-amber-500/10">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
                        Squad Size
                      </p>
                      <p className="text-sm font-bold text-neutral-100">
                        {event.teamSize}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-400 border border-amber-500/30 bg-amber-500/10">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
                        Operational Dates
                      </p>
                      <p className="text-sm font-bold text-neutral-100">
                        November 4–5, 2026
                      </p>
                    </div>
                  </div>

                  {/* Venue */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-amber-400 border border-amber-500/30 bg-amber-500/10">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
                        Venue
                      </p>
                      <p className="text-sm font-bold text-neutral-100">
                        {FEST_CONTENT.venue}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Accommodation Notice */}
                <div className="p-4 mx-6 mb-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-neutral-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Accommodation:</strong> First-come-first-served inside the CHRIST (Deemed to be University) campus, subject to availability.
                  </span>
                </div>

                {/* Action CTA */}
                <div className="p-6 border-t border-amber-500/20 space-y-3">
                  <Link href={registerCtaHref} className="block w-full">
                    <button
                      className="w-full h-12 rounded-md text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                      style={{
                        background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
                        color: "#050200",
                        fontFamily: "var(--font-trajan), serif",
                        boxShadow: "0 0 25px rgba(201, 168, 76, 0.3)",
                      }}
                    >
                      DEPLOY CREW FOR {event.name.toUpperCase()} <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                  <p className="text-center text-[10px] font-mono text-neutral-400">
                    EARLY BIRD DEADLINE: 30 SEPT 2026, 23:59 IST
                  </p>
                </div>
              </div>

              {/* Eligibility */}
              <div
                className="rounded-xl p-5 flex items-start gap-4 border bg-amber-500/5 border-amber-500/20"
              >
                <Shield className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <h4
                    className="font-semibold text-xs mb-1 uppercase tracking-wider text-amber-300 font-mono"
                  >
                    CREW ELIGIBILITY
                  </h4>
                  <p className="text-xs leading-relaxed text-neutral-300">
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
