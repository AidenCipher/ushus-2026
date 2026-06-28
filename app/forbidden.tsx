import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-danger/10 p-6">
            <ShieldX className="h-16 w-16 text-danger" />
          </div>
        </div>
        <div className="mb-2">
          <span className="text-5xl font-bold text-danger font-display">403</span>
        </div>
        <h1 className="text-2xl font-bold text-text mb-3">Access Forbidden</h1>
        <p className="text-text-muted mb-8 leading-relaxed">
          You do not have permission to access this page. If you believe this is
          an error, contact your team organiser or an administrator.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/"
            className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-light"
          >
            Go to Homepage
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-surface-alt"
          >
            Login as Different User
          </Link>
        </div>
      </div>
    </div>
  );
}
