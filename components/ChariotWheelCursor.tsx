"use client";

import * as React from "react";

// ─── VIRENZA Chariot Wheel Mouse Cursor Companion ────────────────────────────
// A Konark-style chariot wheel (6 spokes) that follows the mouse.
// When moving: spokes fragment outward in random directions toward the cursor.
// When still:  spokes converge back and re-form the complete wheel.

const SPOKE_COUNT = 6;
const WHEEL_RADIUS = 18;
const SPOKE_LENGTH = 14;
const HUB_RADIUS = 4;
const GOLD = "#D4AF37";
const GOLD_GLOW = "rgba(212, 175, 55, 0.55)";
const GOLD_DIM = "rgba(212, 175, 55, 0.25)";

interface SpokeState {
  angle: number;        // Home angle (fixed, in a full wheel)
  currentAngle: number; // Current animated angle
  dist: number;         // Current radial distance from hub
  targetAngle: number;
  targetDist: number;
  vAngle: number;
  vDist: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function ChariotWheelCursor() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animRef = React.useRef<number | null>(null);
  const mouseRef = React.useRef({ x: -999, y: -999 });
  const lerpPosRef = React.useRef({ x: -999, y: -999 });
  const movingRef = React.useRef(false);
  const moveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const spokesRef = React.useRef<SpokeState[]>([]);
  const clickRippleRef = React.useRef<{ r: number; maxR: number; alpha: number } | null>(null);
  const hoverRef = React.useRef(false);
  const wheelAngleRef = React.useRef(0); // slow rotation of the whole wheel when idle

  // Initialize spokes
  React.useEffect(() => {
    // Touch / coarse pointer: skip entirely
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Init spokes
    spokesRef.current = Array.from({ length: SPOKE_COUNT }, (_, i) => {
      const angle = (i / SPOKE_COUNT) * Math.PI * 2;
      return {
        angle,
        currentAngle: angle,
        dist: SPOKE_LENGTH,
        targetAngle: angle,
        targetDist: SPOKE_LENGTH,
        vAngle: 0,
        vDist: 0,
      };
    });

    // Mouse tracking
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      movingRef.current = true;

      // Set spokes to exploded state
      for (const s of spokesRef.current) {
        // Randomize direction and distance when moving
        const randomDir = Math.random() * Math.PI * 2;
        const randomDist = Math.random() * 22 + 8;
        s.targetAngle = randomDir;
        s.targetDist = randomDist;
      }

      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      moveTimerRef.current = setTimeout(() => {
        movingRef.current = false;
        // Return spokes to home positions
        for (let i = 0; i < SPOKE_COUNT; i++) {
          spokesRef.current[i].targetAngle = spokesRef.current[i].angle;
          spokesRef.current[i].targetDist = SPOKE_LENGTH;
        }
      }, 120);
    };

    const onClick = () => {
      clickRippleRef.current = { r: 0, maxR: 28, alpha: 0.7 };
    };

    const onEnterInteractive = () => { hoverRef.current = true; };
    const onLeaveInteractive = () => { hoverRef.current = false; };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("click", onClick);

    // Hook hover on interactive elements
    const addHoverListeners = () => {
      document.querySelectorAll("a, button, [role=button], [tabindex]").forEach(el => {
        el.addEventListener("mouseenter", onEnterInteractive);
        el.addEventListener("mouseleave", onLeaveInteractive);
      });
    };
    addHoverListeners();
    // Re-attach after 2s for dynamically added elements
    const hoverTimer = setTimeout(addHoverListeners, 2000);

    // Draw loop
    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const mouse = mouseRef.current;
      if (mouse.x < 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Precise alignment to actual mouse position
      const x = mouse.x;
      const y = mouse.y;

      // Idle wheel rotation
      if (!movingRef.current) {
        wheelAngleRef.current += 0.005;
      }
      const baseRot = wheelAngleRef.current;

      // Update spoke physics (spring)
      for (const s of spokesRef.current) {
        const springK = movingRef.current ? 0.10 : 0.07;
        const damp = 0.82;
        // Angle spring
        let angleDiff = s.targetAngle - s.currentAngle;
        // Normalize to [-π, π]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        s.vAngle = (s.vAngle + angleDiff * springK) * damp;
        s.currentAngle += s.vAngle;
        // Distance spring
        s.vDist = (s.vDist + (s.targetDist - s.dist) * springK) * damp;
        s.dist = clamp(s.dist + s.vDist, 0, WHEEL_RADIUS + 10);
      }

      // ── Draw wheel ────────────────────────────────────────────────────────
      const hoverScale = hoverRef.current ? 1.35 : 1.0;
      const idlePulse = !movingRef.current ? (1 + Math.sin(Date.now() * 0.003) * 0.06) : 1;
      const scale = hoverScale * idlePulse;

      ctx.save();
      ctx.translate(x, y);
      ctx.scale(scale, scale);

      // Outer rim glow
      const rimGrad = ctx.createRadialGradient(0, 0, WHEEL_RADIUS - 3, 0, 0, WHEEL_RADIUS + 5);
      rimGrad.addColorStop(0, GOLD_GLOW);
      rimGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(0, 0, WHEEL_RADIUS + 5, 0, Math.PI * 2);
      ctx.fill();

      // Outer rim
      ctx.strokeStyle = movingRef.current ? GOLD_DIM : GOLD;
      ctx.lineWidth = movingRef.current ? 0.8 : 1.5;
      ctx.globalAlpha = movingRef.current ? 0.4 : 0.9;
      ctx.beginPath();
      ctx.arc(0, 0, WHEEL_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      // Rim dot decorations (only when assembled)
      if (!movingRef.current) {
        for (let i = 0; i < 24; i++) {
          const a = baseRot + (i / 24) * Math.PI * 2;
          ctx.fillStyle = i % 4 === 0 ? GOLD : GOLD_DIM;
          ctx.globalAlpha = i % 4 === 0 ? 0.9 : 0.35;
          ctx.beginPath();
          ctx.arc(Math.cos(a) * WHEEL_RADIUS, Math.sin(a) * WHEEL_RADIUS, i % 4 === 0 ? 1.5 : 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Spokes
      for (let i = 0; i < SPOKE_COUNT; i++) {
        const s = spokesRef.current[i];
        const a = s.currentAngle + (movingRef.current ? 0 : baseRot);
        const tipX = Math.cos(a) * s.dist;
        const tipY = Math.sin(a) * s.dist;

        ctx.globalAlpha = movingRef.current ? 0.35 : 0.85;
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = movingRef.current ? 0.8 : 1.2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        // Spoke tip nub
        if (!movingRef.current) {
          ctx.fillStyle = GOLD;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Exploded fragment glow
          const fragGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 5);
          fragGrad.addColorStop(0, "rgba(212, 175, 55, 0.5)");
          fragGrad.addColorStop(1, "rgba(212, 175, 55, 0)");
          ctx.fillStyle = fragGrad;
          ctx.globalAlpha = 0.6;
          ctx.beginPath();
          ctx.arc(tipX, tipY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Hub
      const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, HUB_RADIUS + 2);
      hubGrad.addColorStop(0, "#F5E6C8");
      hubGrad.addColorStop(0.5, GOLD);
      hubGrad.addColorStop(1, "rgba(201, 168, 76, 0)");
      ctx.fillStyle = hubGrad;
      ctx.globalAlpha = movingRef.current ? 0.5 : 1;
      ctx.beginPath();
      ctx.arc(0, 0, HUB_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Click ripple
      const ripple = clickRippleRef.current;
      if (ripple) {
        ripple.r += 1.5;
        ripple.alpha *= 0.88;
        ctx.save();
        ctx.translate(x, y);
        ctx.strokeStyle = `rgba(212, 175, 55, ${ripple.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = ripple.alpha;
        ctx.beginPath();
        ctx.arc(0, 0, ripple.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        if (ripple.alpha < 0.02 || ripple.r > ripple.maxR) {
          clickRippleRef.current = null;
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("click", onClick);
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      clearTimeout(hoverTimer);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Don't render on touch devices
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[99999] block w-full h-full"
      aria-hidden="true"
      style={{ cursor: "none" }}
    />
  );
}
