import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { auth } from "@/lib/auth";
import { getSystemConfig } from "@/lib/system_config";
import { headers } from "next/headers";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { EarlyBirdBanner } from "@/components/EarlyBirdBanner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: {
    default: "USHUS 2026: IMPERIUM — The Evolution of Warfare",
    template: "%s | USHUS 2026: IMPERIUM",
  },
  description:
    "USHUS 2026: IMPERIUM — 'Wars Evolve. So Do We.' The flagship national MBA Management Fest of Christ University School of Business and Management, Bengaluru Central Campus. Ten arenas. Ten commanders. November 4–5, 2026.",
  keywords: [
    "USHUS",
    "USHUS 2026",
    "IMPERIUM",
    "MBA Fest",
    "Christ University",
    "Management Fest",
    "Best Manager",
    "Business Analytics",
    "Finance Competition",
    "Marketing Fest",
    "B-School Competitions India",
    "Bengaluru MBA Fest",
  ],
  authors: [{ name: "School of Business and Management, Christ University" }],
  creator: "Christ University MBA Program",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://ushus2026.christuniversity.in",
    title: "USHUS 2026: IMPERIUM — The Evolution of Warfare",
    description:
      "USHUS 2026: IMPERIUM — Ten arenas. Ten legendary commanders. November 4–5, 2026. Christ University, Bengaluru.",
    siteName: "USHUS 2026: IMPERIUM",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "USHUS 2026: IMPERIUM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "USHUS 2026: IMPERIUM — The Evolution of Warfare",
    description:
      "USHUS 2026: IMPERIUM — The flagship MBA Management Fest of Christ University, Bengaluru. November 4–5, 2026.",
    images: ["/og-image.png"],
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
      <head>
        {/* Cinzel + Inter typography */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen antialiased bg-[#0B132B] text-[#F5ECD7]"
        style={{
          backgroundColor: "#0B132B",
          color: "#F5ECD7",
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <SessionProvider session={session}>
          {/* Global Early Bird Offer Callout */}
          <EarlyBirdBanner />

          {showMaintenance ? (
            <div
              className="min-h-screen w-full flex items-center justify-center px-4 relative z-10"
            >
              <div
                className="max-w-md w-full rounded-xl p-8 sm:p-10 text-center space-y-6"
                style={{
                  background: "rgba(16, 26, 54, 0.95)",
                  border: "1px solid rgba(201, 168, 76, 0.3)",
                  backdropFilter: "blur(16px)",
                }}
              >
                <AlertTriangle className="w-10 h-10 mx-auto text-amber-400" />

                <div className="space-y-2">
                  <h1
                    className="text-2xl font-bold tracking-tight text-amber-200"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    System Maintenance
                  </h1>
                  <p className="text-sm text-neutral-300">
                    USHUS 2026: IMPERIUM command systems are undergoing scheduled maintenance. Please check back shortly.
                  </p>
                </div>

                <p className="text-xs text-neutral-400">
                  Estimated downtime: &lt; 30 mins
                </p>

                <Link
                  href="/login"
                  className="text-xs font-semibold hover:underline text-amber-400"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  Admin / Staff sign in →
                </Link>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex min-h-screen flex-col">
              {children}
            </div>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
