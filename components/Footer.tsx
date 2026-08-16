import Link from "next/link";
import { Instagram, Linkedin, Twitter, Shield } from "lucide-react";

export function Footer() {
  return (
    <footer
      className="pt-16 pb-8 relative z-10 overflow-hidden border-t"
      style={{
        background: "rgba(10, 17, 40, 0.95)",
        borderColor: "rgba(201, 168, 76, 0.2)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Decorative gold top line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[1px]"
        style={{ background: "linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.6), transparent)" }}
      />

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* ── Brand Column ────────────────────────────────────────────── */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center border"
                style={{
                  background: "rgba(201, 168, 76, 0.12)",
                  borderColor: "rgba(201, 168, 76, 0.4)",
                }}
              >
                <Shield className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex flex-col leading-none">
                <span
                  className="text-xs font-semibold tracking-[0.2em] uppercase text-neutral-400"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  CHRIST UNIVERSITY
                </span>
                <span
                  className="text-lg font-black tracking-wide text-amber-400"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  USHUS 2026: IMPERIUM
                </span>
              </div>
            </div>
            <p className="max-w-sm leading-relaxed text-xs text-neutral-300">
              The flagship national-level MBA management fest hosted by School of Business and Management, Christ University, Bangalore Central Campus.
              Ten arenas. Ten commanders.
              <br />
              <strong className="text-amber-400 mt-1 inline-block">Wars Evolve. So Do We.</strong>
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-amber-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-amber-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-amber-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* ── Navigation Column ───────────────────────────────────────── */}
          <div>
            <h3
              className="font-semibold mb-5 text-sm tracking-[0.15em] uppercase text-amber-400"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { href: "/#about", label: "About IMPERIUM" },
                { href: "/events", label: "The 10 Arenas" },
                { href: "/register", label: "Deploy Crew" },
                { href: "/#contact", label: "Command Support" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-xs text-neutral-300 hover:text-amber-300 transition-colors tracking-wide"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Theaters Column ─────────────────────────────────────────── */}
          <div>
            <h3
              className="font-semibold mb-5 text-sm tracking-[0.15em] uppercase text-amber-400"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              Featured Arenas
            </h3>
            <ul className="space-y-2.5 text-xs text-neutral-300">
              <li>
                <Link href="/events/thronium" className="hover:text-amber-300 transition-colors">
                  Thronium <span className="text-neutral-400">(Napoleon Bonaparte)</span>
                </Link>
              </li>
              <li>
                <Link href="/events/venturium" className="hover:text-amber-300 transition-colors">
                  Venturium <span className="text-neutral-400">(Dwight D. Eisenhower)</span>
                </Link>
              </li>
              <li>
                <Link href="/events/algorium" className="hover:text-amber-300 transition-colors">
                  Algorium <span className="text-neutral-400">(Alan Turing)</span>
                </Link>
              </li>
              <li>
                <Link href="/events/aurium" className="hover:text-amber-300 transition-colors">
                  Aurium <span className="text-neutral-400">(Alexander Hamilton)</span>
                </Link>
              </li>
              <li>
                <Link href="/events/kaizenium" className="hover:text-amber-300 transition-colors">
                  Kaizenium <span className="text-neutral-400">(Alexander the Great)</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom Strip ─────────────────────────────────────────────── */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-400 border-t"
          style={{ borderColor: "rgba(201, 168, 76, 0.15)" }}
        >
          <p>© 2026 USHUS: IMPERIUM · School of Business and Management, Christ University, Bengaluru.</p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">
              Rules &amp; Code of Conduct
            </Link>
            <span className="text-amber-400 font-mono">PRIZE POOL: ₹2,41,000</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
