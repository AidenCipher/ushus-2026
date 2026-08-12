import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { auth } from "@/lib/auth";
import { getSystemConfig } from "@/lib/system_config";
import { headers } from "next/headers";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    default: "USHUS 2026 — Christ University MBA Management Fest",
    template: "%s | USHUS 2026",
  },
  description:
    "USHUS 2026 — the flagship MBA Management Fest of Christ University, Bangalore Central Campus. November 4–5, 2026.",
  keywords: [
    "USHUS 2026",
    "Christ University",
    "MBA fest",
    "management fest",
    "Bangalore",
    "business school event",
  ],
  authors: [{ name: "USHUS 2026 Organising Committee" }],
  openGraph: {
    title: "USHUS 2026 — Christ University MBA Management Fest",
    description:
      "The flagship MBA Management Fest of Christ University, Bangalore Central Campus. November 4–5, 2026.",
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
      <body className="min-h-screen bg-background antialiased text-foreground">
        <SessionProvider>
          {showMaintenance ? (
            <div className="min-h-screen w-full flex items-center justify-center px-4 bg-background">
              <div className="max-w-md w-full rounded-xl p-8 sm:p-10 text-center space-y-6 border border-border bg-card shadow-lg">
                <AlertTriangle className="w-10 h-10 text-warning mx-auto" />

                <div className="space-y-2">
                  <h1 className="text-2xl font-bold tracking-tight">Under Maintenance</h1>
                  <p className="text-sm text-muted-foreground">
                    USHUS 2026 is undergoing scheduled maintenance. Please check back shortly.
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">Estimated downtime: &lt; 30 mins</p>

                <Link
                  href="/login"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Admin / Staff sign in →
                </Link>
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
