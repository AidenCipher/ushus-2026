"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getVerticalLogo } from "@/lib/logos";
import { Loader2, AlertCircle, Shield, ArrowRight, Trophy, Users } from "lucide-react";
import Image from "next/image";

interface EventData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  prizePool: string | null;
  teamSize: number;
  venue: string | null;
  vertical: { id: string; name: string; colorCode: string };
}

export default function RegisterEntryPage() {
  const [loading, setLoading] = React.useState(true);
  const [allowReg, setAllowReg] = React.useState(true);
  const [events, setEvents] = React.useState<EventData[]>([]);

  React.useEffect(() => {
    async function load() {
      try {
        const [configRes, eventsRes] = await Promise.all([
          fetch("/api/v1/config"),
          fetch("/api/v1/events?status=REGISTRATION_OPEN"),
        ]);
        if (configRes.ok) {
          const json = await configRes.json();
          setAllowReg(json.data?.allowReg ?? true);
        }
        if (eventsRes.ok) {
          const json = await eventsRes.json();
          setEvents(json.data || []);
        }
      } catch {
        // If config fails to load, default to allowing registration rather
        // than silently locking out every visitor.
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B132B]" style={{ color: "#F5ECD7" }}>
      <Navbar />
      <main className="flex-grow pt-28 pb-24 px-4">
        <div className="container mx-auto max-w-5xl space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="text-xs font-mono tracking-widest uppercase text-amber-400">
              USHUS 2026: IMPERIUM // DEPLOYMENT
            </div>
            <h1
              className="text-3xl md:text-5xl font-bold"
              style={{ fontFamily: "var(--font-trajan), serif", color: "#F5ECD7" }}
            >
              Register for USHUS 2026
            </h1>
            <p className="text-sm text-neutral-300">
              Pick your path — register your whole college as a contingent, or enter a single event.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-neutral-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm">Loading the event registry...</p>
            </div>
          ) : !allowReg ? (
            <div className="max-w-md mx-auto rounded-xl p-8 text-center space-y-4 border border-amber-500/25 bg-[#1c0f00]/60">
              <AlertCircle className="w-10 h-10 mx-auto text-amber-400" />
              <h2 className="text-xl font-bold">Registrations Closed</h2>
              <p className="text-sm text-neutral-300 leading-relaxed">
                The registration portal is currently inactive. Contact the CHRIST (Deemed to be University) CUSB Organising Committee if you believe this is in error.
              </p>
              <Link href="/login" className="inline-block text-sm font-medium text-amber-400 hover:underline">
                Sign in with an existing account
              </Link>
            </div>
          ) : (
            <>
              {/* Contingent entry point */}
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-amber-500/15 flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Registering a full college delegation?</h3>
                    <p className="text-sm text-neutral-300 max-w-xl mt-0.5">
                      Create your account once, register your teams for every event in one guided flow, then pay once for the whole contingent.
                    </p>
                  </div>
                </div>
                <Link href="/register/contingent">
                  <button
                    className="h-11 px-6 text-xs font-bold tracking-wider uppercase rounded-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    style={{ background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)", color: "#050200" }}
                  >
                    Register Full Contingent <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>

              {/* Individual events */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold border-b border-white/10 pb-2">Or register for a single event</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((evt) => {
                    const crest = getVerticalLogo(evt.vertical);
                    return (
                      <Link key={evt.id} href={`/register/event/${evt.id}`}>
                        <div
                          className="h-full rounded-xl border p-4 flex flex-col gap-3 transition-all hover:border-amber-500/40"
                          style={{ borderColor: "rgba(201, 168, 76, 0.2)", background: "rgba(16, 26, 54, 0.85)" }}
                        >
                          <div className="flex items-center gap-2.5">
                            {crest ? (
                              <span className="w-9 h-9 rounded-full overflow-hidden border border-white/10 shrink-0 bg-black/30">
                                <Image src={crest.src} alt="" width={crest.width} height={crest.height} className="w-full h-full object-contain p-0.5" />
                              </span>
                            ) : (
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: evt.vertical.colorCode }} />
                            )}
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: evt.vertical.colorCode }}>
                              {evt.vertical.name}
                            </span>
                          </div>
                          <h3 className="font-bold text-base leading-snug">{evt.name}</h3>
                          <div className="grid grid-cols-2 gap-2 text-[10px] text-neutral-400 mt-auto pt-2 border-t border-white/5">
                            <span className="flex items-center gap-1.5"><Trophy className="w-3 h-3 text-amber-400" /> {evt.prizePool || "₹ -"}</span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3 h-3 text-amber-400" /> {evt.teamSize === 1 ? "Solo event" : `Team of ${evt.teamSize}`}
                            </span>
                          </div>
                          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                            Register <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="text-center text-sm text-neutral-400">
                Already have an account?{" "}
                <Link href="/login" className="text-amber-400 font-medium hover:underline">Sign in</Link>{" "}
                to register from your dashboard.
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
