import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { canAccessRoute, getDashboardPath } from "@/lib/permissions";
import type { Role } from "@prisma/client";

/**
 * USHUS 2026 — Route Protection Middleware
 *
 * Enforces authentication and RBAC on all protected routes:
 * - /dashboard/* → requires authentication + correct role
 * - /api/v1/* → requires authentication (role checked in each route handler)
 * - /login → redirects to dashboard if already authenticated
 *
 * Security rules:
 * 1. Unauthenticated → redirect to /login
 * 2. Wrong role → 403 Forbidden page (NEVER redirect to another dashboard)
 * 3. Already authenticated on /login → redirect to their dashboard
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ─── Already-authenticated users on login page → redirect to dashboard ───
  if (pathname === "/login" && session?.user) {
    const dashboardPath = getDashboardPath(session.user.role as Role);
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  // ─── Protected routes (dashboard, admin, organiser portals) ────────────────
  const isProtectedRoute = 
    pathname.startsWith("/dashboard") || 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/organiser");

  if (isProtectedRoute) {
    // Not authenticated → redirect to login
    if (!session?.user) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user account is active
    if (!session.user.isActive) {
      return NextResponse.redirect(new URL("/login?error=deactivated", req.url));
    }

    // If an authenticated ADMIN or ORGANISER hits generic /dashboard, redirect to their role-specific home
    if (pathname === "/dashboard") {
      const userRole = session.user.role as Role;
      if (userRole !== "PARTICIPANT") {
        const dashboardPath = getDashboardPath(userRole);
        return NextResponse.redirect(new URL(dashboardPath, req.url));
      }
    }

    // Check role-based access
    const userRole = session.user.role as Role;
    if (!canAccessRoute(userRole, pathname)) {
      // Return 403 Forbidden — NEVER redirect to another dashboard
      return NextResponse.rewrite(new URL("/forbidden", req.url));
    }
  }

  // ─── Protected API routes ───────────────────────────────────────────────
  if (pathname.startsWith("/api/v1")) {
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: 401 },
        { status: 401 }
      );
    }

    if (!session.user.isActive) {
      return NextResponse.json(
        { success: false, error: "Account deactivated", code: 403 },
        { status: 403 }
      );
    }
  }

  // ─── Cron routes — verify CRON_SECRET ───────────────────────────────────
  if (pathname.startsWith("/api/cron")) {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: 401 },
        { status: 401 }
      );
    }
  }

  // ─── Security headers ──────────────────────────────────────────────────
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/organiser/:path*",
    "/api/v1/:path*",
    "/api/cron/:path*",
    "/login",
  ],
};
