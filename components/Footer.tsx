"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { CHRIST_CREST } from "@/lib/logos";

const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about-university" },
  { label: "Events", href: "#events" },
  { label: "Credits", href: "#credits" },
];

export function Footer() {
  return (
    <footer
      className="pt-10 pb-8 relative z-10 border-t"
      style={{
        background: "rgba(5, 9, 24, 0.99)",
        borderColor: "rgba(201, 168, 76, 0.18)",
      }}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Brand + nav + socials */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          {/* Brand mark */}
          <div className="flex items-center gap-3">
            <Image
              src={CHRIST_CREST.src}
              alt="CHRIST (Deemed to be University)"
              width={CHRIST_CREST.width}
              height={CHRIST_CREST.height}
              className="h-8 w-auto"
            />
            <div>
              <p
                className="text-sm font-black tracking-wide"
                style={{ color: "#C9A84C", fontFamily: "var(--font-trajan), serif" }}
              >
                USHUS &lsquo;26 · IMPERIUM
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(245,236,215,0.4)" }}>
                School of Business &amp; Management (MBA), Bengaluru Central Campus
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            {/* Quick links */}
            <nav aria-label="Footer navigation">
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                {NAV_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[11px] font-semibold uppercase tracking-widest transition-colors duration-200"
                      style={{ color: "rgba(245,236,215,0.45)" }}
                      onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#C9A84C")}
                      onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(245,236,215,0.45)")}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Socials */}
            <div className="flex gap-4">
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="transition-colors duration-200" style={{ color: "rgba(245,236,215,0.4)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#C9A84C")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,236,215,0.4)")}
              >
                <Instagram className="w-4 h-4" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                className="transition-colors duration-200" style={{ color: "rgba(245,236,215,0.4)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#C9A84C")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,236,215,0.4)")}
              >
                <Linkedin className="w-4 h-4" />
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter / X"
                className="transition-colors duration-200" style={{ color: "rgba(245,236,215,0.4)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#C9A84C")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,236,215,0.4)")}
              >
                <Twitter className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-6" style={{ background: "rgba(201,168,76,0.1)" }} />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px]" style={{ color: "rgba(245,236,215,0.3)" }}>
          <p>
            For queries:{" "}
            <a
              href="mailto:ushus.sbm@christuniversity.in"
              style={{ color: "rgba(201,168,76,0.7)" }}
              className="transition-colors duration-200 hover:underline"
            >
              ushus.sbm@christuniversity.in
            </a>
          </p>
          <p>© 2026 USHUS — CUSBM, Christ (Deemed to be University), Bengaluru Central Campus</p>
          <p>Built by Abhinav Rotti</p>
        </div>
      </div>
    </footer>
  );
}
