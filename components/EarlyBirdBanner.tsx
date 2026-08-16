"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, X, Clock } from "lucide-react";
import { EARLY_BIRD_DEADLINE, isEarlyBird } from "@/lib/pricing";

export function EarlyBirdBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateCountdown = () => {
      const now = new Date();
      const diff = EARLY_BIRD_DEADLINE.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft({ days, hours, mins });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted || dismissed || !isEarlyBird()) return null;

  return (
    <div
      className="relative z-50 w-full py-2.5 px-4 text-xs md:text-sm font-medium border-b flex items-center justify-between transition-all"
      style={{
        background: "linear-gradient(90deg, #0A1128 0%, #1C2541 50%, #0A1128 100%)",
        borderColor: "rgba(201, 168, 76, 0.35)",
        color: "#F5ECD7",
      }}
    >
      <div className="container mx-auto flex items-center justify-center gap-3 md:gap-6 flex-wrap text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
          <Sparkles className="w-3 h-3 text-amber-400" />
          EARLY BIRD TACTICAL OFFER
        </div>

        <div className="flex items-center gap-2">
          <span>
            <strong className="text-amber-300">50% OFF</strong> Contingent (₹7,500) ·{" "}
            <strong className="text-amber-300">40% OFF</strong> Individual Events (₹900)
          </span>
          {timeLeft && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-neutral-300 bg-black/40 px-2 py-0.5 rounded border border-white/10">
              <Clock className="w-3 h-3 text-amber-400" />
              {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m left
            </span>
          )}
        </div>

        <Link
          href="/register"
          className="inline-flex items-center gap-1 font-bold text-xs uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors underline underline-offset-4"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Claim Rate <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
        aria-label="Dismiss early bird banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
