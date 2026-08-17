"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Users, ChevronRight, Crosshair, Shield, Cpu } from "lucide-react";
import { FEST_CONTENT } from "@/lib/content";
import { EventShowcasePreview } from "@/components/EventCinematicShowcase";
import { getLogoByCodename } from "@/lib/logos";
import Image from "next/image";

// ── Brand pillars ─────────────────────────────────────────────────────────────
const BRAND_PILLARS = [
  {
    name: "Strategy",
    desc: "Ancient doctrine forged in the crucible of military history.",
  },
  {
    name: "Command",
    desc: "Executive decision-making tested under supreme tactical pressure.",
  },
  {
    name: "Velocity",
    desc: "Amplified by artificial intelligence and predictive telemetry.",
  },
];

export default function LandingPage() {
  const events = FEST_CONTENT.events;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ color: "#F5ECD7" }}
    >
      <Navbar />

      <main className="flex-grow">
        {/* ================================================================
            HERO SECTION — Sci-Fi & Evolution of Warfare
        ================================================================ */}
        <section className="pt-36 pb-24 md:pt-52 md:pb-36 px-4 relative overflow-hidden">
          {/* Subtle Sci-Fi Grid lines */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(201,168,76,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.1) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />

          <div className="container mx-auto max-w-5xl text-center space-y-8 relative z-10">
            {/* Eyebrow badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border"
              style={{
                background: "rgba(201, 168, 76, 0.1)",
                borderColor: "rgba(201, 168, 76, 0.35)",
                color: "#C9A84C",
                fontFamily: "var(--font-trajan), serif",
              }}
            >
              <Crosshair className="w-3.5 h-3.5" />
              Evolution of Warfare · CUSB Bengaluru Central
            </div>

            {/* Main heading */}
            <div className="space-y-2">
              <p
                className="text-base md:text-lg tracking-[0.25em] uppercase font-semibold text-amber-400"
                style={{ fontFamily: "var(--font-trajan), serif" }}
              >
                USHUS 2026
              </p>
              <h1
                className="text-6xl md:text-8xl font-black tracking-tight leading-none"
                style={{
                  fontFamily: "var(--font-trajan), serif",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #E8C875 35%, #C9A84C 70%, #8B6914 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                IMPERIUM
              </h1>
              <p
                className="text-lg md:text-xl tracking-widest uppercase font-medium text-neutral-300"
                style={{ fontFamily: "var(--font-trajan), serif" }}
              >
                {FEST_CONTENT.tagline}
              </p>
            </div>

            {/* Theme narrative */}
            <p
              className="text-base md:text-lg max-w-2xl mx-auto leading-relaxed text-neutral-300"
            >
              Every business discipline is a theater of warfare. Ten arenas. Ten legendary commanders. From Sun Tzu to Alan Turing —{" "}
              <em style={{ color: "#C9A84C" }}>master the doctrine, command the battleground.</em>
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <button
                  className="w-full sm:w-auto h-12 px-8 text-sm font-bold tracking-widest uppercase rounded-md transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
                    color: "#050200",
                    fontFamily: "var(--font-trajan), serif",
                    boxShadow: "0 0 30px rgba(201, 168, 76, 0.35)",
                  }}
                >
                  DEPLOY YOUR CREW <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/events" className="w-full sm:w-auto">
                <button
                  className="w-full sm:w-auto h-12 px-8 text-sm font-semibold tracking-wider rounded-md transition-all duration-300 border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                  style={{
                    fontFamily: "var(--font-trajan), serif",
                  }}
                >
                  ENTER 3D SHOWCASE
                </button>
              </Link>
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 mt-8 text-left border-t border-amber-500/20"
            >
              {[
                {
                  icon: <Calendar className="w-5 h-5 text-amber-400" />,
                  label: "Operational Dates",
                  value: "November 6–7, 2026",
                },
                {
                  icon: <MapPin className="w-5 h-5 text-amber-400" />,
                  label: "Theater Venue",
                  value: "CHRIST (Deemed to be University), Bangalore Central Campus",
                },
                {
                  icon: <Users className="w-5 h-5 text-amber-400" />,
                  label: "Elite Competitors",
                  value: "600+ Expected",
                },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-amber-500/20 bg-amber-500/10"
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <h4
                      className="font-mono text-xs text-neutral-400 tracking-wider"
                    >
                      {stat.label.toUpperCase()}
                    </h4>
                    <p className="text-sm font-semibold text-neutral-100">
                      {stat.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            BRAND PILLARS BAR
        ================================================================ */}
        <div
          className="w-full py-8 border-y border-amber-500/15"
          style={{
            background: "rgba(16, 26, 54, 0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="container mx-auto px-4 flex items-start justify-center gap-6 md:gap-20 flex-wrap">
            {BRAND_PILLARS.map((pillar, i) => (
              <React.Fragment key={pillar.name}>
                {i > 0 && (
                  <span
                    className="hidden md:block text-lg mt-1 text-amber-500/30"
                  >
                    ✦
                  </span>
                )}
                <div className="text-center">
                  <p
                    className="text-sm font-bold tracking-widest uppercase mb-1 text-amber-400"
                    style={{ fontFamily: "var(--font-trajan), serif" }}
                  >
                    {pillar.name}
                  </p>
                  <p className="text-xs max-w-[180px] text-neutral-300">
                    {pillar.desc}
                  </p>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ================================================================
            TEN ARENAS — Crest Grid
        ================================================================ */}
        <section className="py-20 px-4 border-t border-amber-500/10">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
              <div className="text-xs font-mono tracking-widest uppercase text-amber-400">
                {"// TEN ARENAS OF IMPERIUM"}
              </div>
              <h2
                className="text-3xl md:text-5xl font-bold"
                style={{ fontFamily: "var(--font-trajan), serif", color: "#F5ECD7" }}
              >
                Choose Your Theater
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
              {events.map((event) => {
                const crest = getLogoByCodename(event.codename);
                return (
                  <Link
                    key={event.codename}
                    href={`/events/${event.name.toLowerCase().split(" ")[0].replace(/[^a-z0-9]/g, "")}`}
                    className="flex flex-col items-center text-center gap-2 group"
                  >
                    <div
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center overflow-hidden border-2 transition-transform duration-300 group-hover:scale-105"
                      style={{
                        borderColor: "rgba(201, 168, 76, 0.4)",
                        background: "rgba(16, 26, 54, 0.9)",
                        boxShadow: "0 0 20px rgba(201, 168, 76, 0.1)",
                      }}
                    >
                      {crest ? (
                        <Image
                          src={crest.src}
                          alt={`${event.codename} crest`}
                          width={crest.width}
                          height={crest.height}
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <span className="text-xs font-mono font-bold text-amber-300">{event.sealLetter}</span>
                      )}
                    </div>
                    <span
                      className="text-[11px] sm:text-xs font-bold tracking-wider uppercase text-neutral-300 group-hover:text-amber-400 transition-colors"
                      style={{ fontFamily: "var(--font-trajan), serif" }}
                    >
                      {event.vertical}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================================================================
            FEATURED COMMANDERS — 3D Motion Preview Section
        ================================================================ */}
        <section className="py-28 px-4">
          <div className="container mx-auto max-w-6xl space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <div className="text-xs font-mono tracking-widest uppercase text-amber-400">
                {"// COMMAND ARCHIVE PREVIEW"}
              </div>
              <h2
                className="text-3xl md:text-5xl font-bold"
                style={{ fontFamily: "var(--font-trajan), serif", color: "#F5ECD7" }}
              >
                Featured Theaters of War
              </h2>
              <p className="text-sm text-neutral-300">
                Experience the 3D commander monument archives.
              </p>
            </div>

            {/* 3D Preview Cards */}
            <EventShowcasePreview />

            <div className="text-center pt-4">
              <Link href="/events">
                <button
                  className="h-12 px-8 text-sm font-semibold tracking-wider rounded-md transition-all duration-300 border border-amber-500/40 text-amber-400 hover:bg-amber-500/10 cursor-pointer"
                  style={{ fontFamily: "var(--font-trajan), serif" }}
                >
                  EXPLORE ALL 10 COMMANDERS IN 3D →
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            ABOUT SECTION
        ================================================================ */}
        <section id="about" className="py-24 px-4 border-t border-amber-500/10 bg-[#0A1128]/60">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div
                  className="inline-block text-xs font-mono tracking-widest uppercase text-amber-400"
                >
                  {"// ABOUT IMPERIUM"}
                </div>
                <h2
                  className="text-3xl md:text-4xl font-bold"
                  style={{ fontFamily: "var(--font-trajan), serif", color: "#F5ECD7" }}
                >
                  The Evolution of Warfare &amp; Executive Command
                </h2>
                <div
                  className="h-0.5 w-14 rounded"
                  style={{ background: "linear-gradient(90deg, #C9A84C, transparent)" }}
                />
                <p className="text-sm md:text-base leading-relaxed text-neutral-300">
                  USHUS is the flagship annual MBA Management Fest of the School of Business and Management (MBA), Bangalore Central Campus, CHRIST (Deemed to be University). Born from the Sanskrit word meaning &ldquo;dawn,&rdquo; USHUS represents the inception of visionary leadership.
                </p>
                <p className="text-sm md:text-base leading-relaxed text-neutral-300">
                  <strong className="text-amber-400">IMPERIUM</strong> draws from three millennia of strategic warfare. From the Phalanx of Alexander to the Enigma decryption of Alan Turing, we translate history&apos;s greatest battlefield breakthroughs into high-stakes modern management challenges.
                </p>
                <Link href="/events" className="inline-block pt-2">
                  <button
                    className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-amber-400 hover:text-amber-300 transition-colors"
                    style={{ fontFamily: "var(--font-trajan), serif" }}
                  >
                    DEPLOY TO ARENAS
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {/* Commander doctrines list */}
              <div className="space-y-3">
                {FEST_CONTENT.about.themeInspirations.map((insp) => (
                  <div
                    key={insp.vertical}
                    className="rounded-xl p-4 flex items-start gap-4 border"
                    style={{
                      background: "rgba(16, 26, 54, 0.8)",
                      borderColor: "rgba(201, 168, 76, 0.2)",
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 border border-amber-500/40 text-amber-300 bg-amber-500/10"
                    >
                      <Crosshair className="w-4 h-4" />
                    </div>
                    <div>
                      <p
                        className="text-xs font-bold tracking-widest uppercase mb-0.5 text-amber-400"
                        style={{ fontFamily: "var(--font-trajan), serif" }}
                      >
                        {insp.metaphor}
                      </p>
                      <p className="text-xs leading-relaxed text-neutral-300">
                        {insp.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            CTA SECTION
        ================================================================ */}
        <section id="contact" className="py-28 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div
              className="rounded-2xl p-10 md:p-16 space-y-8 border"
              style={{
                background: "rgba(16, 26, 54, 0.85)",
                borderColor: "rgba(201, 168, 76, 0.3)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div
                className="text-xs font-mono tracking-widest uppercase mb-2 text-amber-400"
              >
                NOVEMBER 6–7, 2026 // CHRIST (DEEMED TO BE UNIVERSITY) BENGALURU
              </div>
              <h2
                className="text-3xl md:text-5xl font-bold"
                style={{ fontFamily: "var(--font-trajan), serif", color: "#F5ECD7" }}
              >
                The command bridge awaits your orders.
              </h2>
              <p className="text-sm md:text-base max-w-xl mx-auto leading-relaxed text-neutral-300">
                Registrations close {FEST_CONTENT.registrationDeadline}. Claim your place among India&apos;s most formidable management strategists. Lead. Prevail. Conquer.
              </p>
              <Link href="/register" className="inline-block">
                <button
                  className="h-14 px-10 text-sm font-bold tracking-widest uppercase rounded-md transition-all duration-300 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
                    color: "#050200",
                    fontFamily: "var(--font-trajan), serif",
                    boxShadow: "0 0 40px rgba(201, 168, 76, 0.35)",
                  }}
                >
                  REGISTER FOR USHUS 2026: IMPERIUM
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
