"use client";

import * as React from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

export function StarryBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const mouseRef = React.useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const starsRef = React.useRef<Star[]>([]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initStars = (width: number, height: number) => {
      // Density: approx 1 star per 6000 square pixels of screen viewport
      const count = Math.floor((width * height) / 6000);
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          // Sizes ranging from 0.8px to 2.2px
          size: Math.random() * 1.4 + 0.8,
          // Base opacity between 0.15 and 0.6
          baseOpacity: Math.random() * 0.45 + 0.15,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };

    const resizeCanvas = () => {
      // Size canvas to exact viewport dimension (since background is fixed)
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
    };

    // Initialize dimensions
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse coordinates directly on screen viewport (since canvas is fixed)
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const stars = starsRef.current;

      for (const star of stars) {
        // Update twinkling phase
        star.twinklePhase += star.twinkleSpeed;
        const twinkleFactor = Math.sin(star.twinklePhase) * 0.15 + 0.85; // oscillates between 0.7 and 1.0

        let brightnessMultiplier = 1.0;

        if (mouse) {
          const dx = star.x - mouse.x;
          const dy = star.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 200; // Radius of mouse influence (200px)
          if (dist < maxDist) {
            // Closer to cursor = brighter (scaled up to 4x original brightness)
            const proximity = 1 - dist / maxDist; // 0 to 1
            brightnessMultiplier = 1.0 + proximity * 3.5;
          }
        }

        const finalOpacity = Math.min(
          1.0,
          star.baseOpacity * twinkleFactor * brightnessMultiplier
        );

        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.beginPath();
        // Slightly enlarge stars that are illuminated by the cursor for a richer 3D glow effect
        const scale = brightnessMultiplier > 1.0 ? 1.0 + (brightnessMultiplier - 1.0) * 0.15 : 1.0;
        ctx.arc(star.x, star.y, star.size * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 block w-full h-full"
    />
  );
}
