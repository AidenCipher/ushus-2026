"use client";

import * as React from "react";

interface LoadingAnimationProps {
  message?: string;
  size?: "sm" | "md" | "lg";
}

// ── IMPERIUM Tactical Radar Loading Animation ────────────────────────────────
// A spinning imperial commander crest — concentric tactical rings & rotating coordinates
export default function LoadingAnimation({ message = "Loading...", size = "md" }: LoadingAnimationProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animRef = React.useRef<number | null>(null);
  const angleRef = React.useRef(0);

  const px = size === "sm" ? 44 : size === "lg" ? 96 : 64;
  const textClass = size === "sm" ? "text-[10px]" : size === "lg" ? "text-sm" : "text-xs";

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = px * dpr;
    canvas.height = px * dpr;
    ctx.scale(dpr, dpr);
    const cx = px / 2;
    const cy = px / 2;
    const r = px / 2 - 4;

    const draw = () => {
      ctx.clearRect(0, 0, px, px);
      const a = angleRef.current;
      angleRef.current += 0.022;

      // Outer ring
      ctx.strokeStyle = "rgba(212, 175, 55, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating rim dots (24)
      for (let i = 0; i < 24; i++) {
        const angle = a + (i / 24) * Math.PI * 2;
        const dotR = i % 4 === 0 ? 1.8 : 0.9;
        ctx.fillStyle = i % 4 === 0 ? "rgba(212, 175, 55, 0.95)" : "rgba(201, 168, 76, 0.35)";
        ctx.beginPath();
        ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, dotR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Second inner ring (counter-rotating)
      ctx.strokeStyle = "rgba(201, 168, 76, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.76, 0, Math.PI * 2);
      ctx.stroke();

      // Spokes (6, chariot wheel style)
      const spokeCount = 6;
      for (let i = 0; i < spokeCount; i++) {
        const sa = a * 1.5 + (i / spokeCount) * Math.PI * 2;
        ctx.strokeStyle = "rgba(212, 175, 55, 0.7)";
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(sa) * (r * 0.18), cy + Math.sin(sa) * (r * 0.18));
        ctx.lineTo(cx + Math.cos(sa) * (r * 0.72), cy + Math.sin(sa) * (r * 0.72));
        ctx.stroke();
      }

      // Third ring (faster rotation, opposite)
      ctx.strokeStyle = "rgba(196, 150, 50, 0.3)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing hub
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.22);
      grad.addColorStop(0, "rgba(245, 230, 200, 0.95)");
      grad.addColorStop(0.5, "rgba(212, 175, 55, 0.6)");
      grad.addColorStop(1, "rgba(201, 168, 76, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
      ctx.fill();

      animRef.current = requestAnimationFrame(draw);
    };

    // Workaround: py needs to be accessible in draw
    const py = px;
    void py;
    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [px]);

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <canvas
        ref={canvasRef}
        style={{ width: px, height: px }}
        aria-hidden="true"
      />
      {message && (
        <p
          className={`font-semibold tracking-widest uppercase animate-pulse ${textClass}`}
          style={{ color: "rgba(212, 175, 55, 0.75)", fontFamily: "'Cinzel', Georgia, serif", letterSpacing: "0.18em" }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
