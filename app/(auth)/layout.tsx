"use client";

import { ReactNode } from "react";
import Link from "next/link";

// ── Lotus SVG Icon ──────────────────────────────────────────────────────────
function LotusIcon({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 24 C18 24 4 16 4 6 C4 2 10 0 18 7 C26 0 32 2 32 6 C32 16 18 24 18 24Z"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
      <path d="M18 24 C18 24 8 14 8 6 C8 2 12 0 18 6 C24 0 28 2 28 6 C28 14 18 24 18 24Z"
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.9" />
      <path d="M18 23 C18 23 12 13 12 6 C12 2 15 0 18 4 C21 0 24 2 24 6 C24 13 18 23 18 23Z"
        fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="0.8" />
      <line x1="18" y1="23" x2="18" y2="26" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden p-4"
      style={{ color: "#F5ECD7" }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201, 168, 76, 0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & heading */}
        <div className="flex flex-col items-center mb-8 space-y-3">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
              style={{
                background: "rgba(201, 168, 76, 0.1)",
                border: "1px solid rgba(201, 168, 76, 0.45)",
              }}
            >
              <LotusIcon className="w-6 h-5" style={{ color: "#C9A84C" }} />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="text-xs font-semibold tracking-[0.18em] uppercase"
                style={{ color: "#A89070", fontFamily: "'Cinzel', serif" }}
              >
                USHUS 2026
              </span>
              <span
                className="text-lg font-black tracking-wide"
                style={{ color: "#C9A84C", fontFamily: "'Cinzel', serif" }}
              >
                IMPERIUM
              </span>
            </div>
          </Link>
        </div>

        {children}

        <div className="mt-8 text-center text-xs" style={{ color: "#4A3820" }}>
          <p>© 2025–2026 Christ University, Bengaluru. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
