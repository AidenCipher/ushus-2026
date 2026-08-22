"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { EVENTS } from "@/lib/logos";

/* ─── Pricing constants ─────────────────────────────────────── */
const BASE_PRICE = 1500;          // per event, full price
const CONTINGENT_BASE = 15000;    // 10 × ₹1,500

const SLABS = [
  {
    label: "Early Bird",
    badge: "40% OFF",
    individual: Math.round(BASE_PRICE * 0.60),        // ₹900
    contingent: Math.round(CONTINGENT_BASE * 0.60),   // ₹9,000
    indivDisc: 40,
    contDisc: 40,
    from: null,
    to: "30 Sep 2026",
  },
  {
    label: "Slab 1",
    badge: "20% OFF",
    individual: Math.round(BASE_PRICE * 0.80),        // ₹1,200
    contingent: Math.round(CONTINGENT_BASE * 0.80),   // ₹12,000
    indivDisc: 20,
    contDisc: 20,
    from: "01 Oct 2026",
    to: "20 Oct 2026",
  },
  {
    label: "Slab 2",
    badge: "Full Price",
    individual: BASE_PRICE,                            // ₹1,500
    contingent: CONTINGENT_BASE,                       // ₹15,000
    indivDisc: 0,
    contDisc: 0,
    from: "21 Oct 2026",
    to: "04 Nov 2026",
  },
];

/* Active slab = Early Bird (index 0) — change index when slabs advance */
const ACTIVE_SLAB_INDEX = 0;
const ACTIVE = SLABS[ACTIVE_SLAB_INDEX];

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

/* ─── Event card ─────────────────────────────────────────────── */
function EventCard({ event, index }: { event: (typeof EVENTS)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="flex flex-col rounded-2xl overflow-hidden transition-all duration-700"
      style={{
        background: "rgba(16, 26, 54, 0.85)",
        border: "1px solid rgba(201,168,76,0.2)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transitionDelay: `${(index % 3) * 80}ms`,
      }}
    >
      {/* Logo area */}
      <div
        className="relative flex items-center justify-center py-8 px-6"
        style={{ background: "rgba(201,168,76,0.04)", borderBottom: "1px solid rgba(201,168,76,0.12)" }}
      >
        {event.logo ? (
          <Image
            src={event.logo.src}
            alt={`${event.codename} logo`}
            width={event.logo.width}
            height={event.logo.height}
            className="w-28 h-28 object-contain"
          />
        ) : (
          <div className="w-28 h-28 rounded-full" style={{ background: "rgba(201,168,76,0.12)" }} />
        )}

        {/* Team size badge */}
        <span
          className="absolute top-3 right-3 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
          style={{ background: "rgba(201,168,76,0.12)", color: "rgba(201,168,76,0.9)", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          {event.teamSize === 1 ? "Solo" : `${event.teamSize} Members`}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5 gap-4">
        {/* Names */}
        <div>
          <p
            className="text-[10px] font-extrabold uppercase tracking-[0.18em] mb-0.5"
            style={{ color: "#C9A84C", fontFamily: "var(--font-trajan), serif" }}
          >
            {event.codename}
          </p>
          <p
            className="text-base font-bold leading-snug"
            style={{ color: "#F5ECD7", fontFamily: "var(--font-trajan), serif" }}
          >
            {event.name}
          </p>
        </div>

        {/* Description */}
        <p className="text-xs leading-relaxed flex-1" style={{ color: "rgba(245,236,215,0.62)" }}>
          {event.description}
        </p>

        {/* Active pricing — Discount % → MRP strikethrough → Discounted price */}
        <div
          className="rounded-xl px-4 py-3 flex items-center justify-between gap-3"
          style={{ background: "rgba(201,168,76,0.07)", border: "1px solid rgba(201,168,76,0.15)" }}
        >
          {/* Badge + deadline */}
          <div className="flex flex-col gap-0.5">
            <span
              className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md self-start"
              style={{ background: "rgba(201,168,76,0.2)", color: "#C9A84C" }}
            >
              {ACTIVE.badge}
            </span>
            {ACTIVE.to && (
              <span className="text-[11px] font-semibold" style={{ color: "rgba(245,236,215,0.75)" }}>
                Until {ACTIVE.to}
              </span>
            )}
          </div>

          {/* Price: strikethrough → discounted */}
          <div className="flex flex-col items-end ml-auto">
            <div className="flex items-baseline gap-2">
              {ACTIVE.indivDisc > 0 && (
                <span className="text-xs font-semibold line-through" style={{ color: "rgba(245,236,215,0.35)" }}>
                  {fmt(BASE_PRICE)}
                </span>
              )}
              <span
                className="text-xl font-black"
                style={{ color: "#C9A84C", fontFamily: "var(--font-trajan), serif" }}
              >
                {fmt(ACTIVE.individual)}
              </span>
            </div>
            <span className="text-xs font-semibold mt-0.5" style={{ color: "rgba(245,236,215,0.7)" }}>per team</span>
          </div>
        </div>

        {/* Register button */}
        <a
          href="https://forms.gle/sZYqFY8SaXQi1W6m6"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center text-xs font-extrabold uppercase tracking-[0.18em] py-3 rounded-xl transition-all duration-200"
          style={{
            background: "rgba(201,168,76,0.12)",
            border: "1px solid rgba(201,168,76,0.35)",
            color: "#C9A84C",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "#C9A84C";
            (e.currentTarget as HTMLElement).style.color = "#0B132B";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.12)";
            (e.currentTarget as HTMLElement).style.color = "#C9A84C";
          }}
        >
          Register
        </a>
      </div>
    </div>
  );
}

/* ─── Pricing slab table ─────────────────────────────────────── */
function PricingSlabs() {
  return (
    <div className="mt-6 rounded-2xl overflow-x-auto" style={{ border: "1px solid rgba(201,168,76,0.22)" }}>
      {/* Table header */}
      <div
        className="grid grid-cols-[1fr_1.2fr_1.5fr_1.5fr] min-w-[700px] text-xs md:text-sm font-extrabold uppercase tracking-widest px-4 py-3"
        style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C" }}
      >
        <span>Period</span>
        <span className="text-center">Dates</span>
        <span className="text-center">Per Event</span>
        <span className="text-center">Contingent</span>
      </div>

      {SLABS.map((slab, i) => {
        const isActive = i === ACTIVE_SLAB_INDEX;
        return (
          <div
            key={slab.label}
            className="grid grid-cols-[1fr_1.2fr_1.5fr_1.5fr] min-w-[700px] items-center px-4 py-4 border-t text-sm md:text-base gap-2 whitespace-nowrap"
            style={{
              borderColor: "rgba(201,168,76,0.12)",
              background: isActive ? "rgba(201,168,76,0.07)" : "transparent",
            }}
          >
            {/* Label + badge */}
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-white">
                {slab.label}
                {isActive && (
                  <span
                    className="ml-1.5 text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ background: "#C9A84C", color: "#0B132B" }}
                  >
                    Active
                  </span>
                )}
              </span>
            </div>

            {/* Date range */}
            <div className="text-center text-white font-medium">
              {slab.from ? (
                <span>{slab.from} &ndash; {slab.to}</span>
              ) : (
                <span>Until {slab.to}</span>
              )}
            </div>

            {/* Per event price */}
            <div className="text-center text-white font-medium">
              {slab.indivDisc > 0 ? (
                <span>{fmt(slab.individual)} ({slab.indivDisc}% OFF)</span>
              ) : (
                <span>{fmt(slab.individual)}</span>
              )}
            </div>

            {/* Contingent price */}
            <div className="text-center text-white font-medium">
              {slab.contDisc > 0 ? (
                <span>{fmt(slab.contingent)} ({slab.contDisc}% OFF)</span>
              ) : (
                <span>{fmt(slab.contingent)}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main section ───────────────────────────────────────────── */
export function EventsGrid() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHeaderVisible(true); observer.disconnect(); } },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="events"
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "#0B132B" }}
      aria-label="Events and Registration"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(201,168,76,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative container mx-auto px-4 max-w-6xl">
        {/* Section header */}
        <div ref={headerRef} className="mb-14">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-black tracking-wide mb-6 transition-all duration-700 delay-100"
            style={{
              fontFamily: "var(--font-trajan), serif",
              color: "#F5ECD7",
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            Events &amp; Registration
          </h2>

          {/* Contingent CTA banner */}
          <div
            className="rounded-2xl px-6 py-5 flex flex-col items-center justify-center gap-5 transition-all duration-700 delay-200"
            style={{
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.28)",
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? "translateY(0)" : "translateY(20px)",
            }}
          >
            <div className="w-full">
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className="text-xs font-extrabold uppercase tracking-widest px-3 py-1 rounded-full"
                  style={{ background: "rgba(201,168,76,0.25)", color: "#C9A84C" }}
                >
                  {ACTIVE.label}
                </span>
                <span className="text-sm font-semibold" style={{ color: "#F5ECD7" }}>
                  Valid until {ACTIVE.to}
                </span>
              </div>

              {/* Contingent: discount % → full strikethrough → discounted (Removed) */}
              
              {/* Per-event: discount % → full strikethrough → discounted → per team (Removed) */}
              
              {/* 3-slab pricing table */}
              <div className="mt-4">
                <PricingSlabs />
              </div>
            </div>

            {/* Contingent CTA button */}
            <a
              href="https://forms.gle/sZYqFY8SaXQi1W6m6"
              target="_blank"
              rel="noopener noreferrer"
              id="register-contingent-btn"
              className="shrink-0 text-xs font-extrabold uppercase tracking-[0.18em] px-7 py-3.5 rounded-xl transition-all duration-200"
              style={{
                background: "#C9A84C",
                color: "#0B132B",
                letterSpacing: "0.15em",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#E8C875"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#C9A84C"; }}
            >
              Register as a Contingent
            </a>
          </div>
        </div>

        {/* Events grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EVENTS.map((event, i) => (
            <EventCard key={event.codename} event={event} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
