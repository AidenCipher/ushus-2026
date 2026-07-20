"use client";

import React from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StarryBackground } from "@/components/StarryBackground";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Users, ChevronRight } from "lucide-react";

// ── Lotus SVG Motif ──────────────────────────────────────────────────────────
function LotusIcon({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 60 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 40 C30 40 6 28 6 10 C6 4 14 0 30 10 C46 0 54 4 54 10 C54 28 30 40 30 40Z"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="1.4" />
      <path d="M30 40 C30 40 10 26 10 10 C10 4 17 0 30 9 C43 0 50 4 50 10 C50 26 30 40 30 40Z"
        fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.1" />
      <path d="M30 39 C30 39 15 24 15 10 C15 4 21 0 30 7 C39 0 45 4 45 10 C45 24 30 39 30 39Z"
        fill="currentColor" fillOpacity="0.28" stroke="currentColor" strokeWidth="0.9" />
      <line x1="30" y1="39" x2="30" y2="44" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// ── Decorative Gold Divider ──────────────────────────────────────────────────
function GoldDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.45))" }} />
      <span className="text-xs" style={{ color: "rgba(201, 168, 76, 0.6)" }}>✦</span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(201, 168, 76, 0.45), transparent)" }} />
    </div>
  );
}

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: "easeOut" as const },
  },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.13 },
  },
};

// ── Data ─────────────────────────────────────────────────────────────────────
const pillars = ["Strategy", "Governance", "Innovation", "Alliance", "Legacy", "Knowledge"];

const events = [
  {
    name: "Best Manager",
    slug: "best-manager",
    dynasty: "MAURYA",
    pillar: "Legacy",
    hook: "One empire. One vision. One decisive mind.",
    desc: "Claim the Maurya title. The ultimate flagship event — a comprehensive test of individual leadership, strategy, and statecraft.",
    glyph: "👑",
  },
  {
    name: "Best Management Team",
    slug: "best-management-team",
    dynasty: "ASHTAPRADHAN",
    pillar: "Alliance",
    hook: "Eight ministers. One kingdom. Zero silos.",
    desc: "Claim the Ashtapradhan title. A cross-functional executive team challenge modelled on Shivaji's legendary council of eight.",
    glyph: "⚙️",
  },
  {
    name: "Finance",
    slug: "finance",
    dynasty: "SATAVAHANA",
    pillar: "Governance",
    hook: "The first rupee had their name on it.",
    desc: "Claim the Satavahana title. Financial engineering, asset valuations, and portfolio defence built on India's first regulated currency.",
    glyph: "⚖",
  },
  {
    name: "HR",
    slug: "hr",
    dynasty: "GUPTA",
    pillar: "Alliance",
    hook: "The age that made talent its treasury.",
    desc: "Claim the Gupta title. Simulated boardroom negotiations, talent optimisation, and people strategy — an empire's real asset is its people.",
    glyph: "🤝",
  },
  {
    name: "Marketing",
    slug: "marketing",
    dynasty: "MUGHAL",
    pillar: "Strategy",
    hook: "An empire that never stopped building its own myth.",
    desc: "Claim the Mughal title. Brand campaigns, product launches, and growth strategy — spectacle and scale as deliberate brand strategy.",
    glyph: "⚔",
  },
  {
    name: "Business Plan",
    slug: "business-plan",
    dynasty: "VIJAYANAGARA",
    pillar: "Innovation",
    hook: "A marketplace so rich, the world came to it.",
    desc: "Claim the Vijayanagara title. Build a scalable business from a single founding idea — modelled on Hampi's legendary bazaars.",
    glyph: "🏛",
  },
  {
    name: "B-Quiz",
    slug: "b-quiz",
    dynasty: "PALLAVA",
    pillar: "Knowledge",
    hook: "They built a capital out of ideas.",
    desc: "Claim the Pallava title. A battle of business intelligence, current affairs, and industry knowledge across the ages.",
    glyph: "📜",
  },
  {
    name: "Business Analytics (BA)",
    slug: "business-analytics",
    dynasty: "CHOLA",
    pillar: "Governance",
    hook: "They governed by the numbers — nine centuries early.",
    desc: "Claim the Chola title. Extract commercial insights from data and build predictive models — governance built on data.",
    glyph: "📊",
  },
  {
    name: "Logistics, Operations & Systems (LOS)",
    slug: "logistics-operations-systems",
    dynasty: "KAKATIYA",
    pillar: "Innovation",
    hook: "An empire run on engineering, not luck.",
    desc: "Claim the Kakatiya title. Complex logistics, lean process design, and systems optimisation — infrastructure as the invisible backbone.",
    glyph: "🏗",
  },
  {
    name: "Strategy",
    slug: "strategy",
    dynasty: "CHALUKYA",
    pillar: "Strategy",
    hook: "The empire that out-thought a larger one.",
    desc: "Claim the Chalukya title. Pulakeshin II halted a mightier foe — not through greater numbers, but through superior strategic positioning.",
    glyph: "♞",
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden relative"
      style={{ background: "#1C0F00", fontFamily: "'EB Garamond', Georgia, serif" }}
    >
      <StarryBackground />
      <Navbar />

      <main className="flex-grow relative z-10">

        {/* ================================================================
            HERO SECTION
        ================================================================ */}
        <section className="relative pt-32 pb-0 md:pt-44 overflow-hidden">
          {/* Ambient glow orbs */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full animate-blob"
              style={{ background: "rgba(201, 168, 76, 0.11)", filter: "blur(110px)" }}
            />
            <div
              className="absolute top-1/3 right-1/4 w-[32rem] h-[32rem] rounded-full animate-blob animation-delay-2000"
              style={{ background: "rgba(107, 30, 46, 0.09)", filter: "blur(130px)" }}
            />
            <div
              className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[44rem] h-[44rem] rounded-full animate-blob animation-delay-4000"
              style={{ background: "rgba(212, 175, 55, 0.07)", filter: "blur(150px)" }}
            />
          </div>

          <div className="container relative z-10 mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-5xl mx-auto text-center"
            >
              {/* Badge */}
              <motion.div
                variants={fadeIn}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-10"
                style={{
                  border: "1px solid rgba(201, 168, 76, 0.3)",
                  background: "rgba(201, 168, 76, 0.07)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span
                  className="text-xs font-semibold tracking-[0.22em] uppercase"
                  style={{ color: "#C9A84C", fontFamily: "'Cinzel', serif" }}
                >
                  USHUS 2026 — The Flagship Management Fest
                </span>
              </motion.div>

              {/* Lotus motif */}
              <motion.div variants={fadeIn} className="flex justify-center mb-5">
                <LotusIcon
                  className="w-14 h-10 animate-float"
                  style={{ color: "#C9A84C" }}
                />
              </motion.div>

              {/* VIRENZA title */}
              <motion.h1
                variants={fadeIn}
                className="font-black leading-none mb-4"
                style={{
                  fontFamily: "'Cinzel', Georgia, serif",
                fontSize: "clamp(4rem, 14vw, 11rem)",
                  background:
                    "linear-gradient(135deg, #F5E6C8 0%, #D4AF37 22%, #C9A84C 52%, #A07820 80%, #C9A84C 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 40px rgba(212,175,55,0.25))",
                  letterSpacing: "0.02em",
                  paddingLeft: "0.1em",
                  paddingRight: "0.1em",
                  overflow: "visible",
                }}
              >
                VIRENZA
              </motion.h1>

              {/* Tagline */}
              <motion.p
                variants={fadeIn}
                className="font-semibold mb-6"
                style={{
                  color: "#A89070",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.3em",
                  fontSize: "clamp(0.65rem, 1.5vw, 0.85rem)",
                }}
              >
                ANCIENT STRATEGIES. MODERN LEADERS.
              </motion.p>

              <GoldDivider className="max-w-lg mx-auto mb-6" />

              {/* Description */}
              <motion.p
                variants={fadeIn}
                className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed italic"
                style={{ color: "#C8B090" }}
              >
                Inspired by the timeless legacy of India&apos;s greatest dynasties, we challenge
                today&apos;s minds to think with strategy, lead with purpose, and build a legacy
                that lasts.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={fadeIn}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              >
                <Link href="/register" className="w-full sm:w-auto">
                  <button
                    className="w-full sm:w-auto h-14 px-10 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all duration-300 hover:brightness-110"
                    style={{
                      background: "linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)",
                      color: "#1C0F00",
                      fontFamily: "'Cinzel', serif",
                      letterSpacing: "0.12em",
                      boxShadow: "0 0 32px rgba(201, 168, 76, 0.28), inset 0 1px 0 rgba(255,255,255,0.12)",
                    }}
                  >
                    REGISTER NOW <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="#events" className="w-full sm:w-auto">
                  <button
                    className="w-full sm:w-auto h-14 px-10 text-sm font-semibold rounded-md transition-all duration-300 hover:bg-[rgba(201,168,76,0.08)]"
                    style={{
                      background: "transparent",
                      color: "#C9A84C",
                      fontFamily: "'Cinzel', serif",
                      letterSpacing: "0.12em",
                      border: "1px solid rgba(201, 168, 76, 0.38)",
                    }}
                  >
                    EXPLORE EVENTS
                  </button>
                </Link>
              </motion.div>

              {/* Stats */}
              <motion.div
                variants={fadeIn}
                className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-0 pt-8 text-left"
                style={{ borderTop: "1px solid rgba(201, 168, 76, 0.12)" }}
              >
                {[
                  {
                    icon: <Calendar className="w-5 h-5" />,
                    label: "Dates",
                    value: "November 4–5, 2026",
                    color: "rgba(201, 168, 76, 0.1)",
                    border: "rgba(201, 168, 76, 0.22)",
                    iconColor: "#C9A84C",
                  },
                  {
                    icon: <MapPin className="w-5 h-5" />,
                    label: "Location",
                    value: "Christ University, Bangalore",
                    color: "rgba(107, 30, 46, 0.12)",
                    border: "rgba(107, 30, 46, 0.28)",
                    iconColor: "#A94060",
                  },
                  {
                    icon: <Users className="w-5 h-5" />,
                    label: "Attendees",
                    value: "500+ Expected",
                    color: "rgba(245, 200, 100, 0.09)",
                    border: "rgba(245, 200, 100, 0.2)",
                    iconColor: "#E8C840",
                  },
                ].map((stat) => (
                  <div key={stat.label} className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: stat.color, border: `1px solid ${stat.border}` }}
                    >
                      <span style={{ color: stat.iconColor }}>{stat.icon}</span>
                    </div>
                    <div>
                      <h4
                        className="font-semibold text-sm mb-0.5"
                        style={{ color: "#F5E6C8", fontFamily: "'Cinzel', serif" }}
                      >
                        {stat.label}
                      </h4>
                      <p className="text-sm" style={{ color: "#A89070" }}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Pillars bar */}
          <div
            className="mt-16 w-full py-4"
            style={{
              background: "rgba(20, 10, 0, 0.65)",
              borderTop: "1px solid rgba(201, 168, 76, 0.18)",
              borderBottom: "1px solid rgba(201, 168, 76, 0.18)",
              backdropFilter: "blur(14px)",
            }}
          >
            <div className="container mx-auto px-4 flex items-center justify-center gap-2 md:gap-10 flex-wrap">
              {pillars.map((pillar, i) => (
                <React.Fragment key={pillar}>
                  {i > 0 && (
                    <span className="hidden md:block text-xs" style={{ color: "rgba(201, 168, 76, 0.35)" }}>
                      ✦
                    </span>
                  )}
                  <span
                    className="text-xs md:text-sm font-semibold tracking-[0.22em] py-1"
                    style={{ color: "#8B6A35", fontFamily: "'Cinzel', serif" }}
                  >
                    {pillar.toUpperCase()}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================
            ABOUT SECTION
        ================================================================ */}
        <section
          id="about"
          className="py-24 relative"
          style={{
            background: "rgba(30, 14, 0, 0.55)",
            borderTop: "1px solid rgba(201, 168, 76, 0.08)",
            borderBottom: "1px solid rgba(201, 168, 76, 0.08)",
          }}
        >
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              {/* Text */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <p
                  className="text-xs font-semibold tracking-[0.3em] mb-4 uppercase"
                  style={{ color: "#C9A84C", fontFamily: "'Cinzel', serif" }}
                >
                  About the Fest
                </p>
                <h2
                  className="text-3xl md:text-5xl font-bold mb-5"
                  style={{ fontFamily: "'Cinzel', serif", color: "#F5E6C8" }}
                >
                  About{" "}
                  <span style={{ color: "#C9A84C" }}>VIRENZA</span>
                </h2>
                <div
                  className="h-px mb-6"
                  style={{
                    background:
                      "linear-gradient(90deg, rgba(201, 168, 76, 0.45), transparent)",
                  }}
                />
                <p className="text-lg mb-5 leading-relaxed" style={{ color: "#C8B090" }}>
                  USHUS is the flagship national-level management fest hosted by the School
                  of Business and Management Studies at Christ University, Bangalore Central
                  Campus.
                </p>
                <p className="text-lg mb-8 leading-relaxed" style={{ color: "#C8B090" }}>
                  The theme for 2026,{" "}
                  <strong style={{ color: "#D4AF37", fontStyle: "italic" }}>VIRENZA</strong>,
                  draws from India&apos;s greatest dynasties — where brilliance was not born but{" "}
                  <em>forged</em> through strategy, governance, and the will to leave a lasting
                  legacy. We challenge modern leaders to rise with the same spirit.
                </p>
                <Link href="/story">
                  <button
                    className="flex items-center gap-2 text-sm font-semibold transition-all duration-300 group"
                    style={{
                      color: "#C9A84C",
                      fontFamily: "'Cinzel', serif",
                      letterSpacing: "0.1em",
                      border: "1px solid rgba(201, 168, 76, 0.3)",
                      padding: "10px 20px",
                      borderRadius: "6px",
                      background: "rgba(201, 168, 76, 0.04)",
                    }}
                  >
                    READ OUR STORY
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </Link>
              </motion.div>

              {/* Decorative visual card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="relative aspect-square md:aspect-[4/3] rounded-xl overflow-hidden p-1"
                style={{
                  border: "1px solid rgba(201, 168, 76, 0.2)",
                  background: "rgba(42, 21, 6, 0.55)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <div
                  className="w-full h-full rounded-lg flex flex-col items-center justify-center relative overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(42,21,6,0.75), rgba(107,30,46,0.18), rgba(201,168,76,0.08))",
                  }}
                >
                  {/* Decorative corner marks */}
                  <div className="absolute top-4 left-4 w-8 h-8" style={{ borderTop: "1.5px solid rgba(201,168,76,0.4)", borderLeft: "1.5px solid rgba(201,168,76,0.4)" }} />
                  <div className="absolute top-4 right-4 w-8 h-8" style={{ borderTop: "1.5px solid rgba(201,168,76,0.4)", borderRight: "1.5px solid rgba(201,168,76,0.4)" }} />
                  <div className="absolute bottom-4 left-4 w-8 h-8" style={{ borderBottom: "1.5px solid rgba(201,168,76,0.4)", borderLeft: "1.5px solid rgba(201,168,76,0.4)" }} />
                  <div className="absolute bottom-4 right-4 w-8 h-8" style={{ borderBottom: "1.5px solid rgba(201,168,76,0.4)", borderRight: "1.5px solid rgba(201,168,76,0.4)" }} />

                  <LotusIcon
                    className="w-20 h-16 mb-6 animate-float"
                    style={{ color: "#C9A84C", opacity: 0.55 }}
                  />
                  <p
                    className="text-4xl md:text-5xl font-black mb-3 animate-float-delayed"
                    style={{
                      fontFamily: "'Cinzel', serif",
                      color: "rgba(201, 168, 76, 0.4)",
                    }}
                  >
                    VIRENZA
                  </p>
                  <div className="h-px w-24 mb-3" style={{ background: "rgba(201,168,76,0.25)" }} />
                  <p
                    className="text-xs tracking-[0.28em]"
                    style={{ color: "rgba(201, 168, 76, 0.28)", fontFamily: "'Cinzel', serif" }}
                  >
                    LEGACY · STRATEGY · LEADERSHIP · IMPACT
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ================================================================
            FEATURED EVENTS SECTION
        ================================================================ */}
        <section id="events" className="py-24 relative overflow-hidden">
          {/* Subtle background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, rgba(201,168,76,0.04) 0%, transparent 70%)" }}
          />

          <div className="container mx-auto px-4 relative z-10">
            {/* Section header */}
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p
                className="text-xs font-semibold tracking-[0.3em] mb-4 uppercase"
                style={{ color: "#C9A84C", fontFamily: "'Cinzel', serif" }}
              >
                The Arenas
              </p>
              <h2
                className="text-3xl md:text-5xl font-bold mb-5"
                style={{ fontFamily: "'Cinzel', serif", color: "#F5E6C8" }}
              >
                Featured{" "}
                <span style={{ color: "#C9A84C" }}>Events</span>
              </h2>
              <GoldDivider className="mb-5" />
              <p className="text-lg" style={{ color: "#A89070" }}>
                Compete across multiple domains. Only the boldest strategists will build their legacy.
              </p>
            </div>

            {/* Event cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event, i) => (
                <motion.div
                  key={event.name}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.09 }}
                >
                  <div
                    className="h-full rounded-xl overflow-hidden relative group transition-all duration-400 p-8 cursor-default"
                    style={{
                      background: "rgba(36, 18, 4, 0.6)",
                      border: "1px solid rgba(201, 168, 76, 0.14)",
                      backdropFilter: "blur(16px)",
                    }}
                  >
                    {/* Hover overlay */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(201,168,76,0.07), rgba(107,30,46,0.05))",
                      }}
                    />
                    {/* Top edge glow on hover */}
                    <div
                      className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.55), transparent)",
                      }}
                    />

                    <div className="relative z-10">
                      <div className="text-3xl mb-4">{event.glyph}</div>
                      <span
                        className="text-xs font-semibold tracking-[0.2em] mb-2 block uppercase"
                        style={{ color: "#7A5C20", fontFamily: "'Cinzel', serif" }}
                      >
                        {event.pillar}
                      </span>
                      <h3
                        className="text-xl font-bold mb-3"
                        style={{ fontFamily: "'Cinzel', serif", color: "#F5E6C8" }}
                      >
                        {event.name}
                      </h3>
                      <p className="mb-6 leading-relaxed" style={{ color: "#A89070" }}>
                        {event.desc}
                      </p>
                      <Link
                        href={`/events/${event.slug}`}
                        className="flex items-center gap-1.5 text-sm font-medium group-hover:gap-2.5 transition-all duration-200"
                        style={{ color: "#C9A84C", fontFamily: "'Cinzel', serif", letterSpacing: "0.06em" }}
                      >
                        View Events <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link href="/events">
                <button
                  className="h-12 px-8 text-xs font-semibold rounded-md transition-all duration-300 hover:bg-[rgba(201,168,76,0.08)]"
                  style={{
                    background: "transparent",
                    color: "#C9A84C",
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: "0.14em",
                    border: "1px solid rgba(201, 168, 76, 0.38)",
                  }}
                >
                  VIEW ALL EVENTS
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================================
            CTA SECTION
        ================================================================ */}
        <section id="contact" className="py-24 relative overflow-hidden">
          {/* Background tint */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(107, 30, 46, 0.04)" }}
          />
          {/* Central glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 rounded-full pointer-events-none"
            style={{ background: "rgba(201, 168, 76, 0.09)", filter: "blur(100px)" }}
          />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl mx-auto rounded-2xl p-10 md:p-14"
              style={{
                background: "rgba(36, 18, 4, 0.72)",
                border: "1px solid rgba(201, 168, 76, 0.24)",
                backdropFilter: "blur(22px)",
                boxShadow: "0 0 60px rgba(201, 168, 76, 0.07)",
              }}
            >
              {/* Corner marks */}
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-10 h-10" style={{ borderTop: "1.5px solid rgba(201,168,76,0.35)", borderLeft: "1.5px solid rgba(201,168,76,0.35)" }} />
                <div className="absolute -bottom-6 -right-6 w-10 h-10" style={{ borderBottom: "1.5px solid rgba(201,168,76,0.35)", borderRight: "1.5px solid rgba(201,168,76,0.35)" }} />
              </div>

              <LotusIcon
                className="w-12 h-9 mx-auto mb-6"
                style={{ color: "#C9A84C", opacity: 0.55 }}
              />

              <h2
                className="text-3xl md:text-5xl font-bold mb-6"
                style={{ fontFamily: "'Cinzel', serif", color: "#F5E6C8" }}
              >
                Ready to build your legacy?
              </h2>

              <p
                className="text-xl mb-8 leading-relaxed"
                style={{ color: "#A89070" }}
              >
                Registrations are closing soon. Claim your place among the strategists,
                leaders, and legacy-builders of VIRENZA.
              </p>

              <Link href="/register">
                <button
                  className="h-14 px-14 text-sm font-bold rounded-md transition-all duration-300 hover:brightness-110"
                  style={{
                    background: "linear-gradient(135deg, #C9A84C 0%, #8B6914 100%)",
                    color: "#1C0F00",
                    fontFamily: "'Cinzel', serif",
                    letterSpacing: "0.14em",
                    boxShadow: "0 0 40px rgba(201, 168, 76, 0.22)",
                  }}
                >
                  REGISTER NOW
                </button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
