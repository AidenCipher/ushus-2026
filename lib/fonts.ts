import localFont from "next/font/local";
import { Inter } from "next/font/google";

// Poster display face — self-hosted, replaces the previous Google Fonts Cinzel import.
export const trajanPro = localFont({
  src: [
    { path: "../app/fonts/TrajanPro-Regular.ttf", weight: "400", style: "normal" },
    { path: "../app/fonts/TrajanPro-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-trajan",
  display: "swap",
});

// Body face — self-hosted via next/font/google (no runtime request to Google).
export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});
