import type { Metadata } from "next";
import "./globals.css";
import { trajanPro, inter } from "@/lib/fonts";

const INSTITUTION_FULL =
  "School of Business and Management (MBA), Bangalore Central Campus, CHRIST (Deemed to be University)";
const TAGLINE = "One Battlefield, Endless Possibilities";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "USHUS 2026",
  description: `USHUS 2026 — ${TAGLINE}. The flagship national MBA Management Fest of the ${INSTITUTION_FULL}.`,
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "USHUS 2026",
    description: `USHUS 2026 — ${TAGLINE}.`,
    siteName: "USHUS 2026",
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
    <html lang="en" suppressHydrationWarning className={`${trajanPro.variable} ${inter.variable}`}>
      <body
        className="min-h-screen antialiased"
        style={{
          backgroundColor: "#0B132B",
          color: "#F5ECD7",
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
      </body>
    </html>
  );
}
