"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Users, ChevronRight } from "lucide-react";

// ── Data ─────────────────────────────────────────────────────────────────────
const pillars = ["Strategy", "Governance", "Innovation", "Alliance", "Legacy", "Knowledge"];

const events = [
  {
    name: "Best Manager",
    slug: "best-manager",
    pillar: "Leadership",
    desc: "The ultimate flagship event — a comprehensive test of individual leadership, strategy, and business acumen.",
    glyph: "👤",
  },
  {
    name: "Best Management Team",
    slug: "best-management-team",
    pillar: "Collaboration",
    desc: "A cross-functional executive team challenge evaluating synergistic decision making.",
    glyph: "👥",
  },
  {
    name: "Finance",
    slug: "finance",
    pillar: "Governance",
    desc: "Financial engineering, asset valuations, and portfolio defence.",
    glyph: "📈",
  },
  {
    name: "HR",
    slug: "hr",
    pillar: "Alliance",
    desc: "Simulated boardroom negotiations, talent optimisation, and people strategy.",
    glyph: "🤝",
  },
  {
    name: "Marketing",
    slug: "marketing",
    pillar: "Strategy",
    desc: "Brand campaigns, product launches, and growth strategy.",
    glyph: "🎯",
  },
  {
    name: "Business Plan",
    slug: "business-plan",
    pillar: "Innovation",
    desc: "Build a scalable business from a single founding idea.",
    glyph: "💡",
  },
  {
    name: "B-Quiz",
    slug: "b-quiz",
    pillar: "Knowledge",
    desc: "A battle of business intelligence, current affairs, and industry knowledge.",
    glyph: "🧠",
  },
  {
    name: "Business Analytics (BA)",
    slug: "business-analytics",
    pillar: "Data",
    desc: "Extract commercial insights from data and build predictive models.",
    glyph: "📊",
  },
  {
    name: "Logistics, Operations & Systems (LOS)",
    slug: "logistics-operations-systems",
    pillar: "Operations",
    desc: "Complex logistics, lean process design, and systems optimisation.",
    glyph: "⚙️",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-grow">
        {/* ================================================================
            HERO SECTION
        ================================================================ */}
        <section className="pt-32 pb-20 md:pt-44 md:pb-32 px-4">
          <div className="container mx-auto max-w-5xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-widest uppercase">
              The Flagship Management Fest
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
              USHUS 2026
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We challenge today&apos;s minds to think with strategy, lead with purpose, and build a legacy that lasts. Join the premier management festival of Christ University.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-12 px-8 text-sm font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  REGISTER NOW <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="#events" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto h-12 px-8 text-sm font-semibold rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                  EXPLORE EVENTS
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 mt-8 border-t border-border text-left">
              {[
                { icon: <Calendar className="w-5 h-5 text-primary" />, label: "Dates", value: "November 4–5, 2026" },
                { icon: <MapPin className="w-5 h-5 text-primary" />, label: "Location", value: "Christ University, Bangalore" },
                { icon: <Users className="w-5 h-5 text-primary" />, label: "Attendees", value: "500+ Expected" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{stat.label}</h4>
                    <p className="text-sm text-muted-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pillars bar */}
        <div className="w-full py-6 bg-muted/50 border-y border-border">
          <div className="container mx-auto px-4 flex items-center justify-center gap-4 md:gap-12 flex-wrap">
            {pillars.map((pillar, i) => (
              <React.Fragment key={pillar}>
                {i > 0 && <span className="hidden md:block text-muted-foreground/30">•</span>}
                <span className="text-xs md:text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                  {pillar}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ================================================================
            ABOUT SECTION
        ================================================================ */}
        <section id="about" className="py-24 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-block text-xs font-semibold tracking-widest text-primary uppercase">
                  About the Fest
                </div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Legacy & Leadership
                </h2>
                <div className="h-1 w-12 bg-primary rounded" />
                <p className="text-lg text-muted-foreground leading-relaxed">
                  USHUS is the flagship national-level management fest hosted by the School
                  of Business and Management Studies at Christ University, Bangalore Central
                  Campus.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We bring together the brightest minds from top business schools across the country to compete, collaborate, and showcase their management prowess in high-pressure, real-world simulated scenarios.
                </p>
                <Link href="/story" className="inline-block pt-4">
                  <button className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group">
                    READ OUR STORY
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>

              <div className="aspect-square md:aspect-[4/3] rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-border">
                <div className="text-center space-y-4 p-8">
                  <p className="text-4xl font-black text-foreground/20">
                    USHUS 2026
                  </p>
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">
                    Christ University
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================
            FEATURED EVENTS SECTION
        ================================================================ */}
        <section id="events" className="py-24 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
              <div className="text-xs font-semibold tracking-widest text-primary uppercase">
                The Arenas
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Featured Events
              </h2>
              <div className="h-1 w-12 bg-primary rounded mx-auto" />
              <p className="text-muted-foreground">
                Compete across multiple domains and showcase your expertise.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.name}
                  className="bg-card border border-border rounded-xl p-8 hover:border-primary/50 transition-colors shadow-sm"
                >
                  <div className="text-3xl mb-4">{event.glyph}</div>
                  <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-2 block">
                    {event.pillar}
                  </span>
                  <h3 className="text-xl font-bold mb-3">{event.name}</h3>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    {event.desc}
                  </p>
                  <Link
                    href={`/events/${event.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
                  >
                    View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link href="/events">
                <button className="h-12 px-8 text-sm font-semibold rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                  VIEW ALL EVENTS
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            CTA SECTION
        ================================================================ */}
        <section id="contact" className="py-24 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-10 md:p-16 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to compete?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Registrations are closing soon. Claim your place among the top management students and build your legacy at USHUS 2026.
              </p>
              <Link href="/register" className="inline-block">
                <button className="h-14 px-10 text-sm font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  REGISTER NOW
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
