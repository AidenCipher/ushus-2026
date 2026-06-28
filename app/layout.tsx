import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-surface antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
