import { Navbar } from "@/components/Navbar";
import { AboutUniversity } from "@/components/sections/AboutUniversity";
import { AboutMBA } from "@/components/sections/AboutMBA";
import { AboutUshus } from "@/components/sections/AboutUshus";
import { EventsGrid } from "@/components/sections/EventsGrid";
import { CreditsSection } from "@/components/sections/CreditsSection";

/** Inline sword SVG — more detailed, matches poster's downward-pointing sword */
function SwordIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 80"
      className={className}
      style={style}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="#D4AF37"
    >
      {/* Pommel */}
      <circle cx="12" cy="4" r="3" />
      {/* Grip */}
      <rect x="10.5" y="7" width="3" height="10" />
      {/* Crossguard */}
      <path d="M 4 17 L 20 17 L 20 20 L 14 19 L 14 21 L 10 21 L 10 19 L 4 20 Z" />
      {/* Blade */}
      <path d="M 10 21 L 14 21 L 13 75 L 12 79 L 11 75 Z" />
      {/* Blade center fuller / ridge for depth */}
      <line x1="12" y1="21" x2="12" y2="75" stroke="#FFDF73" strokeWidth="0.5" opacity="0.6" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <>
      <Navbar />

      {/* ── Hero ── */}
      <section
        id="top"
        className="min-h-[90vh] flex flex-col items-center justify-center px-4 text-center relative overflow-hidden pt-10 pb-16"
        style={{ background: "#0B132B" }}
        aria-label="USHUS 2026 IMPERIUM"
      >
        {/* Subtle radial glow behind text */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 50% 50%, rgba(201,168,76,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Top Text from Poster */}
        <div className="mb-10 z-10 flex flex-col items-center justify-center gap-1.5 mt-8">
          <p className="text-sm sm:text-lg font-semibold tracking-[0.15em] uppercase" style={{ color: "#FFFFFF", fontFamily: "var(--font-trajan), serif" }}>
            School of Business and Management
          </p>
          <p className="text-xl sm:text-2xl font-black tracking-[0.15em] uppercase" style={{ color: "#FFFFFF", fontFamily: "var(--font-trajan), serif" }}>
            Master of Business Administration
          </p>
          <p className="text-sm sm:text-lg font-semibold tracking-[0.15em] uppercase" style={{ color: "#FFFFFF", fontFamily: "var(--font-trajan), serif" }}>
            Bangalore Central Campus
          </p>
        </div>

        {/* USHUS '26 */}
        <h1
          className="relative text-6xl sm:text-7xl md:text-8xl lg:text-[140px] font-black uppercase leading-none z-10"
          style={{
            fontFamily: "var(--font-trajan), serif",
            color: "#FFDF73",
            textShadow: "0px 4px 20px rgba(212,175,55,0.4), 0px 1px 3px rgba(0,0,0,0.8)",
            letterSpacing: "0.02em"
          }}
        >
          USHUS &lsquo;26
        </h1>

        {/* IMPERIUM — sword replaces second I */}
        <div
          className="relative flex items-center justify-center mt-2 md:mt-6 z-10"
          style={{ fontFamily: "var(--font-trajan), serif" }}
        >
          <span
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-black uppercase leading-none"
            style={{
              color: "#FFDF73",
              textShadow: "0px 4px 20px rgba(212,175,55,0.4), 0px 1px 3px rgba(0,0,0,0.8)",
              letterSpacing: "0.15em",
              marginRight: "-0.05em" // Pull closer to sword
            }}
          >
            IMPER
          </span>
          {/* Sword in place of second I */}
          <SwordIcon className="inline-block mx-1 sm:mx-2 drop-shadow-xl" style={{ height: "8em", width: "2.4em", transform: "translateY(-0.05em)" }} />
          <span
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[80px] font-black uppercase leading-none"
            style={{
              color: "#FFDF73",
              textShadow: "0px 4px 20px rgba(212,175,55,0.4), 0px 1px 3px rgba(0,0,0,0.8)",
              letterSpacing: "0.15em",
              marginLeft: "0.1em" // Space from sword
            }}
          >
            UM
          </span>
        </div>

        {/* NOVEMBER 4th & 5th */}
        <p
          className="mt-6 md:mt-10 text-lg sm:text-2xl md:text-3xl lg:text-[40px] font-black uppercase leading-none z-10"
          style={{ color: "#FFFFFF", fontFamily: "var(--font-trajan), serif", textShadow: "0px 2px 10px rgba(0,0,0,0.5)", letterSpacing: "0.05em" }}
        >
          November 4<sup className="text-[0.5em]">th</sup> &amp; 5<sup className="text-[0.5em]">th</sup>
        </p>
      </section>

      {/* ── About sections ── */}
      <AboutUniversity />
      <AboutMBA />
      <AboutUshus />

      {/* ── Events & Registration ── */}
      <EventsGrid />

      {/* ── Team USHUS 2026 Credits ── */}
      <CreditsSection />
    </>
  );
}
