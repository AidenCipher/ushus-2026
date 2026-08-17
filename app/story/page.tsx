"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Landmark, BookOpen, Quote, ArrowRight, Shield, Crosshair } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FEST_CONTENT } from "@/lib/content";

export default function StoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B132B]" style={{ color: "#F5ECD7" }}>
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-4 md:py-24">
        <div className="max-w-4xl mx-auto space-y-20">

          {/* Navigation & eyebrow */}
          <div className="flex justify-between items-center">
            <Link href="/">
              <button
                className="flex items-center gap-2 text-sm text-neutral-400 hover:text-amber-400 transition-colors"
                style={{ fontFamily: "var(--font-trajan), serif" }}
              >
                <ArrowLeft className="w-4 h-4" /> Back to Home
              </button>
            </Link>
            <div
              className="text-xs font-semibold tracking-widest uppercase text-amber-400"
              style={{ fontFamily: "var(--font-trajan), serif" }}
            >
              USHUS LEGACY
            </div>
          </div>

          {/* Hero title */}
          <div
            className="text-center space-y-6 pb-16 border-b border-amber-500/20"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border border-amber-500/35 bg-amber-500/10 text-amber-300"
              style={{ fontFamily: "var(--font-trajan), serif" }}
            >
              The Evolution of Warfare · IMPERIUM 2026
            </div>
            <h1
              className="text-4xl md:text-6xl font-extrabold tracking-tight text-[#F5ECD7]"
              style={{ fontFamily: "var(--font-trajan), serif" }}
            >
              The Journey of USHUS
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed text-neutral-300">
              Originating from the Sanskrit word meaning &quot;dawn,&quot; USHUS marks the inception of new eras,
              visionary leadership, and elite strategic mastery — &ldquo;Wars Evolve. So Do We.&rdquo;
            </p>
          </div>

          {/* Foundation narrative */}
          <section className="space-y-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border border-amber-500/30 bg-amber-500/10 text-amber-400"
                >
                  <Landmark className="w-6 h-6" />
                </div>
                <h2
                  className="text-2xl md:text-3xl font-bold text-[#F5ECD7]"
                  style={{ fontFamily: "var(--font-trajan), serif" }}
                >
                  Our Foundation
                </h2>
                <div
                  className="h-1 w-10 rounded bg-gradient-to-r from-amber-400 to-transparent"
                />
                <p className="leading-relaxed text-neutral-300">
                  USHUS is the flagship management festival of the School of Business and Management (MBA),
                  Bangalore Central Campus, CHRIST (Deemed to be University). A crucible for future executive
                  leaders — USHUS integrates academic theory with real-time battlefield crisis conditions.
                </p>
                <p className="leading-relaxed text-neutral-300">
                  Over the years, the fest has grown into a premier national gathering, attracting Tier-1 business schools
                  from across India to compete across ten distinct arenas of management excellence.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: "10+", label: "Years of Legacy", desc: "Forging elite corporate strategists." },
                  { stat: "100+", label: "Institutions", desc: "Colleges participating across India." },
                  { stat: "5000+", label: "Alumni", desc: "Graduates holding top global roles." },
                  { stat: "₹2.41L", label: "Prize Pool", desc: "Total prize bounty for USHUS 2026." },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-5 rounded-xl space-y-2 border border-amber-500/20 bg-[#101A36]/80"
                  >
                    <div
                      className="text-3xl font-black text-amber-300"
                      style={{ fontFamily: "var(--font-trajan), serif" }}
                    >
                      {item.stat}
                    </div>
                    <div className="text-sm font-semibold text-[#F5ECD7]">
                      {item.label}
                    </div>
                    <p className="text-xs text-neutral-400">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Commander Doctrines */}
          <section className="space-y-8">
            <div
              className="flex items-center gap-3 pb-4 border-b border-amber-500/20"
            >
              <BookOpen className="w-6 h-6 text-amber-400" />
              <h2
                className="text-2xl font-bold text-[#F5ECD7]"
                style={{ fontFamily: "var(--font-trajan), serif" }}
              >
                IMPERIUM — The Strategic Command Framework
              </h2>
            </div>
            <p className="leading-relaxed text-neutral-300">
              IMPERIUM draws inspiration from 3,000 years of warfare and executive doctrine. Every competition maps to a legendary commander whose battlefield breakthroughs shaped human civilization. Ten arenas. Ten commanders. One supreme victory.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {FEST_CONTENT.about.themeInspirations.map((insp) => (
                <div
                  key={insp.vertical}
                  className="p-5 rounded-xl space-y-2 border border-amber-500/20 bg-[#101A36]/80"
                >
                  <p
                    className="text-xs font-bold tracking-widest uppercase text-amber-400"
                    style={{ fontFamily: "var(--font-trajan), serif" }}
                  >
                    {insp.metaphor}
                  </p>
                  <p className="text-sm leading-relaxed text-neutral-300">
                    {insp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Testimonials */}
          <section className="space-y-8">
            <div
              className="flex items-center gap-3 pb-4 border-b border-amber-500/20"
            >
              <Quote className="w-6 h-6 text-amber-400" />
              <h2
                className="text-2xl font-bold text-[#F5ECD7]"
                style={{ fontFamily: "var(--font-trajan), serif" }}
              >
                Testimonials from the Arena
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {[
                {
                  quote:
                    "Competing in the Thronium (Best Manager) event at USHUS pushed my decision-making to the absolute limit. The crisis simulations and AI-augmented wargaming rounds set a new standard for MBA competitions.",
                  name: "Rahul Menon",
                  college: "IIM Kozhikode",
                  event: "Thronium Finalist",
                },
                {
                  quote:
                    "The analytical telemetry and real-time cryptography rounds in Algorium were unlike anything we had seen before. CHRIST (Deemed to be University) orchestrates an unforgettable tactical challenge.",
                  name: "Sneha Reddy",
                  college: "NMIMS Mumbai",
                  event: "Algorium Competitor",
                },
              ].map((t) => (
                <div
                  key={t.name}
                  className="p-6 rounded-xl flex flex-col justify-between space-y-6 border border-amber-500/20 bg-[#101A36]/80"
                >
                  <p className="text-sm italic leading-relaxed text-neutral-300">
                    &quot;{t.quote}&quot;
                  </p>
                  <div
                    className="flex items-center gap-3 pt-4 border-t border-amber-500/15"
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border border-amber-500/30 bg-amber-500/15 text-amber-300"
                      style={{ fontFamily: "var(--font-trajan), serif" }}
                    >
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#F5ECD7]">{t.name}</h4>
                      <p className="text-[11px] text-neutral-400">
                        {t.college} · {t.event}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div
            className="text-center pt-12 mt-4 space-y-6 border-t border-amber-500/20"
          >
            <h2
              className="text-2xl md:text-3xl font-bold text-[#F5ECD7]"
              style={{ fontFamily: "var(--font-trajan), serif" }}
            >
              Ready to command your battleground?
            </h2>
            <p className="text-sm max-w-md mx-auto text-neutral-300">
              USHUS 2026: IMPERIUM, November 4–5. Join 600+ competitors from India&apos;s top business schools.
            </p>
            <Link href="/register">
              <button
                className="h-12 px-10 text-sm font-bold uppercase rounded-md transition-all duration-300 cursor-pointer shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
                  color: "#050200",
                  fontFamily: "var(--font-trajan), serif",
                  letterSpacing: "0.08em",
                  boxShadow: "0 0 30px rgba(201, 168, 76, 0.25)",
                }}
              >
                DEPLOY FOR USHUS 2026 <ArrowRight className="inline w-4 h-4 ml-1" />
              </button>
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
