"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 relative z-10"
      style={{ color: "#F5ECD7" }}
    >
      <div className="text-center max-w-md space-y-6">
        {/* Seal-style 500 */}
        <div
          className="w-28 h-28 rounded-full mx-auto flex flex-col items-center justify-center"
          style={{
            background: "rgba(248, 113, 113, 0.06)",
            border: "1.5px solid rgba(248, 113, 113, 0.35)",
            boxShadow: "0 0 30px rgba(248, 113, 113, 0.08)",
          }}
        >
          <span
            className="text-4xl font-black"
            style={{ fontFamily: "'Cinzel', serif", color: "#F87171" }}
          >
            500
          </span>
        </div>

        <div>
          <h1
            className="text-2xl font-bold tracking-tight mb-3"
            style={{ fontFamily: "'Cinzel', serif", color: "#F5ECD7" }}
          >
            The Archive is Momentarily Unavailable
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "#A89070" }}>
            An unexpected error occurred. The organising committee has been notified. Try again or contact us if
            the issue persists.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-md px-6 py-3 text-sm font-bold transition-all"
            style={{
              background: "linear-gradient(135deg, #C9A84C, #8B6914)",
              color: "#1A0A00",
              fontFamily: "'Cinzel', serif",
            }}
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-md border px-6 py-3 text-sm font-semibold transition-all"
            style={{
              border: "1px solid rgba(201, 168, 76, 0.35)",
              color: "#C9A84C",
              background: "transparent",
              fontFamily: "'Cinzel', serif",
            }}
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
