import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <span className="text-7xl font-bold text-primary font-display">404</span>
        </div>
        <h1 className="text-2xl font-bold text-text mb-3">Page Not Found</h1>
        <p className="text-text-muted mb-8 leading-relaxed">
          The page you are looking for does not exist or has been moved.
          Check the URL or navigate back to the homepage.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            Back to Home
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-alt"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
