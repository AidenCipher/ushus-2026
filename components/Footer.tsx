import Link from "next/link";
import { Instagram, Linkedin, Twitter } from "lucide-react";

// ── Lotus SVG Icon ─────────────────────────────────────────────────────────
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

export function Footer() {
  return (
    <footer
      className="pt-16 pb-8 relative z-10 overflow-hidden"
      style={{
        background: "rgba(20, 10, 0, 0.8)",
        borderTop: "1px solid rgba(201, 168, 76, 0.15)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Decorative gold top line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.5), transparent)" }}
      />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* ── Brand Column ────────────────────────────────────────────── */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(201, 168, 76, 0.12)",
                  border: "1px solid rgba(201, 168, 76, 0.4)",
                }}
              >
                <LotusIcon className="w-4 h-3.5" style={{ color: "#C9A84C" } as React.CSSProperties} />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="text-xs font-semibold tracking-[0.18em]"
                  style={{ color: "#A89070", fontFamily: "'Cinzel', serif" }}
                >
                  USHUS 2026
                </span>
                <span
                  className="text-lg font-black tracking-wide"
                  style={{ color: "#C9A84C", fontFamily: "'Cinzel', serif" }}
                >
                  VIRENZA
                </span>
              </div>
            </div>
            <p className="max-w-sm leading-relaxed" style={{ color: "#A89070" }}>
              The flagship national-level management fest hosted by Christ University, Bangalore Central Campus.
              Inspired by the timeless legacy of India&apos;s greatest dynasties —
              <em style={{ color: "#C9A84C" }}> Ancient Strategies. Modern Leaders.</em>
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="transition-colors" style={{ color: "#6B5430" }}>
                <Instagram className="w-5 h-5 hover:text-[#C9A84C] transition-colors" />
              </Link>
              <Link href="#" className="transition-colors" style={{ color: "#6B5430" }}>
                <Linkedin className="w-5 h-5 hover:text-[#C9A84C] transition-colors" />
              </Link>
              <Link href="#" className="transition-colors" style={{ color: "#6B5430" }}>
                <Twitter className="w-5 h-5 hover:text-[#C9A84C] transition-colors" />
              </Link>
            </div>
          </div>

          {/* ── Navigation Column ───────────────────────────────────────── */}
          <div>
            <h3
              className="font-semibold mb-5 text-sm tracking-[0.15em] uppercase"
              style={{ color: "#C9A84C", fontFamily: "'Cinzel', serif" }}
            >
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/#about", label: "About VIRENZA" },
                { href: "/#events", label: "The Arenas" },
                { href: "/#schedule", label: "Schedule" },
                { href: "/#faq", label: "FAQs" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors"
                    style={{ color: "#6B5430" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6B5430")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Legal Column ─────────────────────────────────────────────── */}
          <div>
            <h3
              className="font-semibold mb-5 text-sm tracking-[0.15em] uppercase"
              style={{ color: "#C9A84C", fontFamily: "'Cinzel', serif" }}
            >
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/guidelines", label: "Code of Conduct" },
                { href: "/contact", label: "Contact Us" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm transition-colors"
                    style={{ color: "#6B5430" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6B5430")}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Pillars Row ────────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-center gap-2 md:gap-8 flex-wrap py-6 mb-6"
          style={{ borderTop: "1px solid rgba(201, 168, 76, 0.1)", borderBottom: "1px solid rgba(201, 168, 76, 0.1)" }}
        >
          {["Strategy", "Governance", "Innovation", "Alliance", "Legacy"].map((pillar, i) => (
            <span key={pillar} className="flex items-center gap-2 md:gap-8">
              {i > 0 && (
                <span className="hidden md:block text-xs" style={{ color: "rgba(201, 168, 76, 0.35)" }}>
                  ✦
                </span>
              )}
              <span
                className="text-xs font-semibold tracking-[0.18em]"
                style={{ color: "#6B5430", fontFamily: "'Cinzel', serif" }}
              >
                {pillar.toUpperCase()}
              </span>
            </span>
          ))}
        </div>

        {/* ── Bottom Row ────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs" style={{ color: "#4A3820" }}>
          <p>© 2025–2026 Christ University, Bangalore. All rights reserved.</p>
          <p>Designed and Built by Abhinav Rotti for USHUS 2026 — VIRENZA</p>
        </div>
      </div>
    </footer>
  );
}
