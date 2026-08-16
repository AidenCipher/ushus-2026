import Link from "next/link";
import { Shield } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 relative z-10 bg-[#0B132B]"
      style={{ color: "#F5ECD7" }}
    >
      <div className="text-center max-w-md space-y-6">
        {/* Tactical 404 badge */}
        <div
          className="w-28 h-28 rounded-2xl mx-auto flex flex-col items-center justify-center border"
          style={{
            background: "rgba(201, 168, 76, 0.1)",
            borderColor: "rgba(201, 168, 76, 0.45)",
            boxShadow: "0 0 30px rgba(201, 168, 76, 0.15)",
          }}
        >
          <span
            className="text-4xl font-black"
            style={{ fontFamily: "'Cinzel', serif", color: "#C9A84C" }}
          >
            404
          </span>
        </div>

        <div>
          <h1
            className="text-2xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "'Cinzel', serif", color: "#F5ECD7" }}
          >
            Sector Coordinates Not Found
          </h1>
          <p className="text-sm leading-relaxed text-neutral-300">
            The command theater you are looking for has not been logged in the tactical archives. Return to the command bridge of USHUS 2026: IMPERIUM.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-md px-6 py-3 text-sm font-bold transition-all shadow-lg"
            style={{
              background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
              color: "#050200",
              fontFamily: "'Cinzel', serif",
            }}
          >
            Return to Bridge
          </Link>
          <Link
            href="/events"
            className="rounded-md border px-6 py-3 text-sm font-semibold transition-all hover:bg-amber-500/10"
            style={{
              borderColor: "rgba(201, 168, 76, 0.35)",
              color: "#C9A84C",
              background: "transparent",
              fontFamily: "'Cinzel', serif",
            }}
          >
            Browse Arenas
          </Link>
        </div>
      </div>
    </div>
  );
}
