import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { auth } from "@/lib/auth";
import { getSystemConfig } from "@/lib/system_config";
import { headers } from "next/headers";
import { Sparkles, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { CursorProvider } from "@/components/CursorProvider";

export const metadata: Metadata = {
  title: {
    default: "USHUS 2026 — VIRENZA | Ancient Strategies. Modern Leaders.",
    template: "%s | USHUS 2026 VIRENZA",
  },
  description:
    "USHUS 2026 VIRENZA — the flagship MBA Management Fest of Christ University, Bangalore Central Campus. Inspired by the timeless legacy of India's greatest dynasties. Ancient Wisdom. Modern Leaders. November 4–5, 2026.",
  keywords: [
    "USHUS 2026",
    "VIRENZA",
    "Christ University",
    "MBA fest",
    "management fest",
    "Bangalore",
    "business school event",
    "ancient strategies modern leaders",
    "Indian dynasty theme",
  ],
  authors: [{ name: "USHUS 2026 Organising Committee" }],
  openGraph: {
    title: "USHUS 2026 — VIRENZA | Ancient Strategies. Modern Leaders.",
    description:
      "The flagship MBA Management Fest of Christ University. Inspired by India's greatest dynasties. November 4–5, 2026.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://ushus2026.com",
    siteName: "USHUS 2026 VIRENZA",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const systemConfig = getSystemConfig();
  const session = await auth();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  const isAdmin = session?.user?.role === "ADMIN";
  const isExcludedRoute = 
    pathname === "/login" || 
    pathname.startsWith("/admin") || 
    pathname.startsWith("/api/");

  const showMaintenance = systemConfig.maintenance && !isAdmin && !isExcludedRoute;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-surface antialiased text-slate-100">
        <SessionProvider>
          <CursorProvider />
          {showMaintenance ? (
            <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4" style={{ background: "#1C0F00" }}>
              {/* Warm ambient glows */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(201, 168, 76, 0.08)", filter: "blur(120px)" }} />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(107, 30, 46, 0.07)", filter: "blur(120px)" }} />

              <div
                className="max-w-md w-full rounded-2xl p-8 sm:p-10 text-center relative z-10 space-y-6"
                style={{
                  background: "rgba(36, 18, 4, 0.8)",
                  border: "1px solid rgba(201, 168, 76, 0.22)",
                  backdropFilter: "blur(24px)",
                  boxShadow: "0 0 60px rgba(201, 168, 76, 0.08)",
                }}
              >
                <div className="flex justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center animate-pulse"
                    style={{
                      background: "rgba(201, 168, 76, 0.1)",
                      border: "1px solid rgba(201, 168, 76, 0.35)",
                      boxShadow: "0 0 24px rgba(201, 168, 76, 0.2)",
                    }}
                  >
                    <Sparkles className="w-7 h-7" style={{ color: "#C9A84C" }} />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1
                    className="text-3xl font-extrabold tracking-tight"
                    style={{ fontFamily: "'Cinzel', Georgia, serif", color: "#F5E6C8" }}
                  >
                    Forging the Legacy
                  </h1>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest"
                    style={{ color: "#C9A84C", fontFamily: "'Cinzel', serif", letterSpacing: "0.2em" }}
                  >
                    VIRENZA Under Maintenance
                  </p>
                </div>

                <p className="text-sm leading-relaxed" style={{ color: "#A89070" }}>
                  We are fine-tuning the USHUS 2026 VIRENZA fest experience. The system is undergoing
                  scheduled configuration upgrades. Please return in a short while.
                </p>

                <div
                  className="pt-4 flex flex-col items-center gap-3"
                  style={{ borderTop: "1px solid rgba(201, 168, 76, 0.1)" }}
                >
                  <div
                    className="flex items-center gap-2 text-xs py-1.5 px-3 rounded-lg font-mono"
                    style={{
                      color: "#A89070",
                      background: "rgba(201, 168, 76, 0.05)",
                      border: "1px solid rgba(201, 168, 76, 0.12)",
                    }}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#C9A84C" }} />
                    <span>Estimated downtime: &lt; 30 mins</span>
                  </div>

                  <Link
                    href="/login"
                    className="text-[11px] font-semibold hover:underline font-mono transition-colors"
                    style={{ color: "#8B6914" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#8B6914")}
                  >
                    Admin / Staff Portal Sign In &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            children
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
