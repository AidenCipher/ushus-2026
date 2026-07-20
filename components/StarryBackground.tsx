"use client";

import * as React from "react";

// ─── VIRENZA Animated Background ─────────────────────────────────────────────
// Replaces the retired FIRMAMENT constellation background.
// Renders on a <canvas>:
//  1. Antique-gold dust motes drifting upward (candlelit warmth, no stars)
//  2. Gold filigree curve-work slowly tracing/redrawing at edges
//  3. Dynasty royal-seal medallions fading in as large watermarks, then dissolving

const DUST_COLORS = [
  "rgba(212, 175, 55, ",
  "rgba(201, 168, 76, ",
  "rgba(245, 220, 160, ",
  "rgba(196, 150, 50, ",
  "rgba(160, 120, 40, ",
];

const DYNASTY_LETTERS = ["M", "A", "G", "S", "M", "V", "P", "C", "K", "C"];
const DYNASTY_NAMES = [
  "MAURYA","ASHTAPRADHAN","GUPTA","SATAVAHANA",
  "MUGHAL","VIJAYANAGARA","PALLAVA","CHOLA","KAKATIYA","CHALUKYA"
];

interface DustMote {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  opacity: number;
  opacityTarget: number;
  opacitySpeed: number;
  colorBase: string;
  twinklePhase: number;
}

interface FiligreePath {
  points: { x: number; y: number }[];
  progress: number;
  speed: number;
  opacity: number;
  color: string;
  lineWidth: number;
  phase: "draw" | "fade";
  fadeProgress: number;
}

interface SealMedallion {
  x: number; y: number;
  letter: string;
  radius: number;
  opacity: number;
  phase: "fadein" | "hold" | "fadeout";
  phaseProgress: number;
  drift: { x: number; y: number };
  rotation: number;
  rotationSpeed: number;
}

function randomFiligreePoints(width: number, height: number): { x: number; y: number }[] {
  const edge = Math.floor(Math.random() * 4);
  const points: { x: number; y: number }[] = [];
  const n = Math.floor(Math.random() * 6) + 6;
  const margin = Math.random() * 120 + 30;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    let bx: number, by: number;
    if (edge === 0) { bx = t * width; by = margin * (0.5 + Math.sin(t * Math.PI * 3) * 0.5); }
    else if (edge === 1) { bx = width - margin * (0.5 + Math.sin(t * Math.PI * 3) * 0.5); by = t * height; }
    else if (edge === 2) { bx = t * width; by = height - margin * (0.5 + Math.sin(t * Math.PI * 3) * 0.5); }
    else { bx = margin * (0.5 + Math.sin(t * Math.PI * 3) * 0.5); by = t * height; }
    points.push({ x: bx, y: by });
  }
  return points;
}

function drawSealMedallion(ctx: CanvasRenderingContext2D, seal: SealMedallion, alpha: number) {
  const { x, y, letter, radius, rotation } = seal;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = alpha;

  ctx.strokeStyle = "rgba(212, 175, 55, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    ctx.fillStyle = `rgba(212, 175, 55, ${i % 3 === 0 ? 0.9 : 0.35})`;
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, i % 3 === 0 ? 2 : 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(201, 168, 76, 0.5)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    ctx.fillStyle = "rgba(212, 175, 55, 0.6)";
    ctx.beginPath();
    ctx.arc(Math.cos(angle) * radius * 0.75, Math.sin(angle) * radius * 0.75, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = "rgba(201, 168, 76, 0.4)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.62, 0, Math.PI * 2);
  ctx.stroke();

  ctx.font = `bold ${radius * 0.65}px Georgia, serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(212, 175, 55, 0.85)";
  ctx.fillText(letter, 0, 0);

  ctx.restore();
}

export function StarryBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = React.useRef<number | null>(null);
  const dustRef = React.useRef<DustMote[]>([]);
  const filigreeRef = React.useRef<FiligreePath[]>([]);
  const sealsRef = React.useRef<SealMedallion[]>([]);
  const frameRef = React.useRef(0);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const initDust = () => {
      const { width, height } = canvas;
      const isMobile = width < 768;
      const count = isMobile
        ? Math.floor((width * height) / 20000)
        : Math.floor((width * height) / 7500);
      dustRef.current = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -(Math.random() * 0.22 + 0.05),
        size: Math.random() * 1.8 + 0.4,
        opacity: Math.random() * 0.22 + 0.04,
        opacityTarget: Math.random() * 0.28 + 0.06,
        opacitySpeed: Math.random() * 0.003 + 0.001,
        colorBase: DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)],
        twinklePhase: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDust();
    };

    resize();
    window.addEventListener("resize", resize);

    const spawnFiligree = () => {
      if (filigreeRef.current.length >= 4) return;
      const pts = randomFiligreePoints(canvas.width, canvas.height);
      filigreeRef.current.push({
        points: pts,
        progress: 0,
        speed: Math.random() * 0.003 + 0.0008,
        opacity: Math.random() * 0.18 + 0.05,
        color: Math.random() > 0.5 ? "rgba(212, 175, 55, 1)" : "rgba(201, 168, 76, 1)",
        lineWidth: Math.random() * 0.6 + 0.3,
        phase: "draw",
        fadeProgress: 0,
      });
    };

    const spawnSeal = () => {
      if (sealsRef.current.length >= 2) return;
      const idx = Math.floor(Math.random() * DYNASTY_LETTERS.length);
      const radius = (Math.random() * 80 + 90) * (canvas.width < 768 ? 0.6 : 1);
      sealsRef.current.push({
        x: Math.random() * (canvas.width - radius * 2) + radius,
        y: Math.random() * (canvas.height - radius * 2) + radius,
        letter: DYNASTY_LETTERS[idx],
        radius,
        opacity: 0,
        phase: "fadein",
        phaseProgress: 0,
        drift: { x: (Math.random() - 0.5) * 0.06, y: (Math.random() - 0.5) * 0.04 },
        rotation: Math.random() * Math.PI * 0.1 - Math.PI * 0.05,
        rotationSpeed: (Math.random() - 0.5) * 0.0002,
      });
    };

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      frameRef.current++;
      const f = frameRef.current;

      if (!prefersReducedMotion) {
        // 1. Dust motes
        for (const d of dustRef.current) {
          d.twinklePhase += 0.012;
          const twinkle = Math.sin(d.twinklePhase) * 0.08 + 0.92;
          if (Math.abs(d.opacity - d.opacityTarget) < 0.001) {
            d.opacityTarget = Math.random() * 0.28 + 0.04;
          }
          d.opacity += (d.opacityTarget - d.opacity) * d.opacitySpeed;
          d.x += d.vx;
          d.y += d.vy;
          if (d.y < -5) d.y = height + 5;
          if (d.x < -5) d.x = width + 5;
          if (d.x > width + 5) d.x = -5;
          const opacity = Math.min(0.9, d.opacity * twinkle);
          ctx.fillStyle = `${d.colorBase}${opacity})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Gold filigree
        if (f % 200 === 1) spawnFiligree();
        for (let i = filigreeRef.current.length - 1; i >= 0; i--) {
          const fil = filigreeRef.current[i];
          if (fil.phase === "draw") {
            fil.progress = Math.min(1, fil.progress + fil.speed);
            if (fil.progress >= 1) { fil.phase = "fade"; }
          } else {
            fil.fadeProgress += 0.0025;
            if (fil.fadeProgress >= 1) { filigreeRef.current.splice(i, 1); continue; }
          }
          const alpha = fil.phase === "draw"
            ? fil.opacity * Math.min(1, fil.progress * 5)
            : fil.opacity * (1 - fil.fadeProgress);
          if (alpha < 0.005) continue;
          const pts = fil.points;
          const drawUpTo = Math.floor(fil.progress * (pts.length - 1));
          ctx.save();
          ctx.lineWidth = fil.lineWidth;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          const colorAlpha = fil.color.replace("1)", `${alpha})`);
          ctx.strokeStyle = colorAlpha;
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let p = 1; p <= drawUpTo && p < pts.length; p++) {
            const cpx = (pts[p - 1].x + pts[p].x) / 2;
            const cpy = (pts[p - 1].y + pts[p].y) / 2;
            ctx.quadraticCurveTo(pts[p - 1].x, pts[p - 1].y, cpx, cpy);
          }
          ctx.stroke();
          for (let p = 0; p <= drawUpTo && p < pts.length; p++) {
            ctx.fillStyle = fil.color.replace("1)", `${Math.min(1, alpha * 1.5)})`);
            ctx.beginPath();
            ctx.arc(pts[p].x, pts[p].y, fil.lineWidth * 1.8, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }

        // 3. Dynasty seal medallions
        if (f % 450 === 100) spawnSeal();
        for (let i = sealsRef.current.length - 1; i >= 0; i--) {
          const seal = sealsRef.current[i];
          seal.x += seal.drift.x;
          seal.y += seal.drift.y;
          seal.rotation += seal.rotationSpeed;
          seal.phaseProgress += 0.0035;
          let targetOpacity = 0;
          if (seal.phase === "fadein") {
            targetOpacity = 0.042;
            if (seal.phaseProgress >= 1) { seal.phase = "hold"; seal.phaseProgress = 0; }
          } else if (seal.phase === "hold") {
            targetOpacity = 0.042;
            if (seal.phaseProgress >= 1) { seal.phase = "fadeout"; seal.phaseProgress = 0; }
          } else {
            targetOpacity = 0;
            if (seal.phaseProgress >= 1) { sealsRef.current.splice(i, 1); continue; }
          }
          seal.opacity += (targetOpacity - seal.opacity) * 0.012;
          if (seal.opacity < 0.002) continue;
          drawSealMedallion(ctx, seal, seal.opacity);
        }
      } else {
        // Reduced motion: static parchment tint
        ctx.fillStyle = "rgba(212, 175, 55, 0.015)";
        ctx.fillRect(0, 0, width, height);
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block w-full h-full"
      aria-hidden="true"
    />
  );
}
