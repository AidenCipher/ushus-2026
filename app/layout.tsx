import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { auth } from "@/lib/auth";
import { getSystemConfig } from "@/lib/system_config";
import { headers } from "next/headers";
import { Sparkles, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "USHUS 2026 — Constellation | Christ University MBA Management Fest",
    template: "%s | USHUS 2026",
  },
  description:
    "USHUS 2026 is the flagship MBA Management Fest of Christ University, Bangalore Central Campus. Theme: Constellation — Illuminate your potential. November 20-21, 2026.",
  keywords: [
    "USHUS 2026",
    "Christ University",
    "MBA fest",
    "management fest",
    "Bangalore",
    "business school event",
    "Constellation",
  ],
  authors: [{ name: "USHUS 2026 Organising Committee" }],
  openGraph: {
    title: "USHUS 2026 — Constellation",
    description:
      "The flagship MBA Management Fest of Christ University. November 20-21, 2026.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://ushus2026.com",
    siteName: "USHUS 2026",
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
          {showMaintenance ? (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#030014] relative overflow-hidden px-4 selection:bg-indigo-500/30">
              {/* Glow effects */}
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[120px] pointer-events-none" />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full filter blur-[120px] pointer-events-none" />
              
              <div className="max-w-md w-full glass border border-white/10 rounded-2xl p-8 sm:p-10 text-center relative z-10 shadow-[0_0_50px_rgba(99,102,241,0.15)] bg-slate-950/40 backdrop-blur-2xl space-y-6">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.2)] animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-200">
                    Aligning the Stars
                  </h1>
                  <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest font-mono">
                    Constellation Under Maintenance
                  </p>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed">
                  We are fine-tuning the USHUS 2026 fest experience. The system is undergoing scheduled configuration upgrades. Please return in a short while.
                </p>

                <div className="pt-4 border-t border-white/5 flex flex-col items-center gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/5 border border-white/5 py-1.5 px-3 rounded-lg font-mono">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Estimated downtime: &lt; 30 mins</span>
                  </div>

                  <Link href="/login" className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold hover:underline font-mono transition-colors">
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
