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
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-6xl font-bold text-primary font-display">500</span>
        </div>
        <h1 className="text-2xl font-bold text-text mb-3">
          Something went wrong
        </h1>
        <p className="text-text-muted mb-8 leading-relaxed">
          An unexpected error occurred. Our team has been notified.
          Please try again or contact the organisers if the issue persists.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light focus-visible:outline-2 focus-visible:outline-primary"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-alt"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
