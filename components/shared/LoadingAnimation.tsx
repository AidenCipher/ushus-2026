"use client";

import * as React from "react";

interface LoadingAnimationProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

export default function LoadingAnimation({ message = "Loading...", size = "md" }: LoadingAnimationProps) {
  const containerSizeClass = size === "sm" ? "w-10 h-10" : size === "lg" ? "w-24 h-24" : "w-16 h-16";
  const coreSizeClass = size === "sm" ? "w-2 h-2" : size === "lg" ? "w-5 h-5" : "w-3 h-3";
  const orbitStarSizeClass = size === "sm" ? "w-1 h-1" : size === "lg" ? "w-2.5 h-2.5" : "w-1.5 h-1.5";
  const textClass = size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : "text-xs";

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      {/* 3-Body Constellation Orbit Animation */}
      <div className={`relative ${containerSizeClass} flex items-center justify-center`}>
        {/* Glowing Central Star */}
        <div className={`${coreSizeClass} rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse`} />

        {/* Orbit Path 1 (Indigo) */}
        <div className="absolute inset-0 rounded-full border border-indigo-500/10 animate-[spin_3s_linear_infinite]">
          <div className={`absolute -top-1 left-1/2 -translate-x-1/2 ${orbitStarSizeClass} rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]`} />
        </div>

        {/* Orbit Path 2 (Rose - opposite and slightly offset) */}
        <div className="absolute inset-0 rounded-full border border-rose-500/10 animate-[spin_4s_linear_infinite_reverse] rotate-45 scale-[1.15]">
          <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 ${orbitStarSizeClass} rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.8)]`} />
        </div>

        {/* Orbit Path 3 (Amber - third axis) */}
        <div className="absolute inset-0 rounded-full border border-amber-500/10 animate-[spin_5s_linear_infinite] -rotate-45 scale-[1.3]">
          <div className={`absolute top-1/2 -left-1 -translate-y-1/2 ${orbitStarSizeClass} rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]`} />
        </div>
      </div>

      {message && (
        <p className={`font-medium tracking-wide text-muted-foreground animate-pulse ${textClass}`}>
          {message}
        </p>
      )}
    </div>
  );
}
