"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { StarryBackground } from "@/components/StarryBackground";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary/30 p-4">
      {/* Interactive Starry Background */}
      <StarryBackground />

      {/* Ambient Background Blobs */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group relative z-50 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 relative overflow-hidden">
               <div className="absolute inset-0 bg-primary/30 mix-blend-overlay animate-pulse" />
               <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-center">
            USHUS <span className="text-primary font-light">2026</span>
          </h1>
        </div>

        {children}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>© 2026 Christ University, Bangalore.</p>
        </div>
      </div>
    </div>
  );
}

