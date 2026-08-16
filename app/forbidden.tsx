import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 relative z-10"
      style={{ color: "#F5ECD7" }}
    >
      <div className="text-center max-w-md space-y-6">
        {/* 403 seal medallion */}
        <div
          className="w-28 h-28 rounded-full mx-auto flex flex-col items-center justify-center"
          style={{
            background: "rgba(248, 113, 113, 0.06)",
            border: "1.5px solid rgba(248, 113, 113, 0.35)",
            boxShadow: "0 0 30px rgba(248, 113, 113, 0.08)",
          }}
        >
          <ShieldX className="w-10 h-10" style={{ color: "#F87171" }} />
        </div>

        <div>
          <div className="mb-2">
            <span
              className="text-4xl font-bold"
              style={{ fontFamily: "'Cinzel', serif", color: "#F87171" }}
            >
              403
            </span>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "'Cinzel', serif", color: "#F5ECD7" }}
          >
            Access Restricted
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#A89070" }}>
            You do not hold the authority to enter this domain. If you believe this is in error, contact
            your team organiser or an administrator.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-md px-6 py-3 text-sm font-bold transition-all"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #8B6914)",
              color: "#1A0A00",
              fontFamily: "'Cinzel', serif",
            }}
          >
            Return Home
          </Link>
          <Link
            href="/login"
            className="rounded-md border px-6 py-3 text-sm font-semibold transition-all"
            style={{
              border: "1px solid rgba(201, 168, 76, 0.35)",
              color: "#C9A84C",
              background: "transparent",
              fontFamily: "'Cinzel', serif",
            }}
          >
            Sign In Again
          </Link>
        </div>
      </div>
    </div>
  );
}
