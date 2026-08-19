import Image from "next/image";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Trophy, Users } from "lucide-react";
import { EVENTS } from "@/lib/logos";

const REGISTER_FORM_URL = "https://forms.gle/hVrVWSvu6XnfKQur5";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ color: "#F5ECD7" }}>
      <Navbar />

      <main className="flex-grow">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section id="top" className="pt-24 pb-16 md:pt-32 md:pb-24 px-4 text-center">
          <div className="container mx-auto max-w-3xl space-y-5">
            <p
              className="text-sm md:text-base tracking-[0.25em] uppercase font-semibold text-amber-400"
              style={{ fontFamily: "var(--font-trajan), serif" }}
            >
              USHUS 2026
            </p>
            <h1
              className="text-4xl md:text-6xl font-black tracking-tight"
              style={{
                fontFamily: "var(--font-trajan), serif",
                background: "linear-gradient(135deg, #FFFFFF 0%, #E8C875 40%, #C9A84C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              One Battlefield, Endless Possibilities
            </h1>
            <p className="text-sm text-neutral-300">
              School of Business and Management (MBA), Bangalore Central Campus, CHRIST (Deemed to be University)
            </p>
          </div>
        </section>

        {/* ── Contingent offer ──────────────────────────────────────────── */}
        <section className="px-4 pb-12">
          <div className="container mx-auto max-w-4xl">
            <div
              className="rounded-2xl border p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
              style={{ borderColor: "rgba(201, 168, 76, 0.4)", background: "rgba(201, 168, 76, 0.08)" }}
            >
              <div className="text-center md:text-left">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">Full Contingent</p>
                <h2 className="text-xl md:text-2xl font-bold" style={{ fontFamily: "var(--font-trajan), serif" }}>
                  Register your college for all 10 events
                </h2>
                <p className="text-sm text-neutral-300 mt-1">
                  <span className="line-through text-neutral-500 mr-2">₹15,000</span>
                  <span className="text-amber-300 font-bold text-lg">₹7,500</span>
                  <span className="text-amber-400 text-xs font-semibold ml-2">50% OFF</span>
                </p>
              </div>
              <a href={REGISTER_FORM_URL} target="_blank" rel="noopener noreferrer" className="shrink-0 w-full md:w-auto">
                <Button
                  className="w-full md:w-auto h-12 px-8 text-sm font-bold tracking-widest uppercase"
                  style={{
                    background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
                    color: "#050200",
                    fontFamily: "var(--font-trajan), serif",
                  }}
                >
                  Register Contingent <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* ── Events ────────────────────────────────────────────────────── */}
        <section id="events" className="px-4 pb-24">
          <div className="container mx-auto max-w-5xl">
            <h2
              className="text-2xl md:text-3xl font-bold text-center mb-10"
              style={{ fontFamily: "var(--font-trajan), serif" }}
            >
              The 10 Events
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {EVENTS.map((event) => (
                <div
                  key={event.name}
                  className="glass rounded-xl p-5 flex flex-col gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-14 h-14 rounded-full overflow-hidden border border-amber-500/30 bg-black/30 shrink-0 flex items-center justify-center">
                      {event.logo ? (
                        <Image
                          src={event.logo.src}
                          alt={`${event.name} logo`}
                          width={event.logo.width}
                          height={event.logo.height}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Trophy className="w-6 h-6 text-amber-400" />
                      )}
                    </span>
                    <div>
                      <h3 className="font-bold text-base leading-snug">{event.name}</h3>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {event.teamSize === 1 ? "Solo event" : `Team of ${event.teamSize}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                    <div className="text-sm">
                      <span className="line-through text-neutral-500 mr-1.5">₹1,500</span>
                      <span className="text-amber-300 font-bold">₹900</span>
                      <span className="text-amber-400 text-[10px] font-semibold ml-1.5">40% OFF</span>
                    </div>
                    <a href={REGISTER_FORM_URL} target="_blank" rel="noopener noreferrer">
                      <Button
                        size="sm"
                        className="text-xs font-bold uppercase tracking-wider"
                        style={{
                          background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
                          color: "#050200",
                          fontFamily: "var(--font-trajan), serif",
                        }}
                      >
                        Register
                      </Button>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
