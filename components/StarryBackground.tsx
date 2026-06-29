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

interface Comet {
  x: number;
  y: number;
  dx: number;
  dy: number;
  length: number;
  speed: number;
  width: number;
  maxLife: number;
  life: number;
}

interface RevolvingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  color: string;
  glowColor: string;
}

export function StarryBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const mouseRef = React.useRef<{ x: number; y: number } | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const starsRef = React.useRef<Star[]>([]);
  const cometsRef = React.useRef<Comet[]>([]);
  
  // 3-body revolving stars around cursor position (or screen center by default)
  const revolvingStarsRef = React.useRef<RevolvingStar[]>([]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize revolving stars (3-body problem physics bodies)
    const initRevolvingStars = (width: number, height: number) => {
      const cx = width / 2;
      const cy = height / 2;
      revolvingStarsRef.current = [
        { 
          x: cx - 40, 
          y: cy - 40, 
          vx: 2.0, 
          vy: -1.5, 
          mass: 150, 
          color: "rgba(129, 140, 248, 0.9)", // Indigo star
          glowColor: "rgba(99, 102, 241, 0.4)"
        },
        { 
          x: cx + 45, 
          y: cy - 30, 
          vx: -1.5, 
          vy: 2.0, 
          mass: 150, 
          color: "rgba(244, 63, 94, 0.9)",  // Rose star
          glowColor: "rgba(251, 113, 133, 0.4)"
        },
        { 
          x: cx, 
          y: cy + 50, 
          vx: -0.5, 
          vy: -0.5, 
          mass: 150, 
          color: "rgba(245, 166, 35, 0.9)",  // Amber/Gold star
          glowColor: "rgba(245, 158, 11, 0.4)"
        }
      ];
    };

    const initStars = (width: number, height: number) => {
      const count = Math.floor((width * height) / 6000);
      const stars: Star[] = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.4 + 0.8,
          baseOpacity: Math.random() * 0.45 + 0.15,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars(canvas.width, canvas.height);
      if (revolvingStarsRef.current.length === 0) {
        initRevolvingStars(canvas.width, canvas.height);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

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

    // Physics constants for 3-body simulation
    const G = 0.12;          // Gravity perturbation
    const epsilon = 15;      // Softening parameter
    const pullK = 0.018;     // Spring pull constant
    const damping = 0.965;   // Viscous drag

    // Individual orbit configurations to give each star its own distinct orbit path
    const rDists = [45, 70, 95];      // Concentric radii shell distances
    const thrusts = [0.20, -0.16, 0.12]; // Alternating directions (clockwise vs counter-clockwise) and speeds

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      const stars = starsRef.current;
      const comets = cometsRef.current;
      const revs = revolvingStarsRef.current;

      // Attractor target is either current mouse position or center of screen
      const tx = mouse ? mouse.x : canvas.width / 2;
      const ty = mouse ? mouse.y : canvas.height / 2;

      // 1. Calculate 3-body physics for revolving stars
      if (revs.length === 3) {
        // Calculate forces
        const ax = [0, 0, 0];
        const ay = [0, 0, 0];

        for (let i = 0; i < 3; i++) {
          const sI = revs[i];
          const rDist = rDists[i];
          const thrust = thrusts[i];
          
          // 1.1 Gravity perturbation from other revolving stars
          for (let j = 0; j < 3; j++) {
            if (i === j) continue;
            const sJ = revs[j];
            const dx = sJ.x - sI.x;
            const dy = sJ.y - sI.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);
            
            const force = (G * sI.mass * sJ.mass) / (distSq + epsilon * epsilon);
            
            if (dist > 0.1) {
              ax[i] += (force * (dx / dist)) / sI.mass;
              ay[i] += (force * (dy / dist)) / sI.mass;
            }
          }

          // 1.2 Elastic spring pull to target (mouse) with its specific rest length
          const px = tx - sI.x;
          const py = ty - sI.y;
          const distToTarget = Math.sqrt(px * px + py * py);
          if (distToTarget > 0.1) {
            // Spring pull to individual orbit radius
            const force = (distToTarget - rDist) * pullK;
            ax[i] += (px / distToTarget) * force;
            ay[i] += (py / distToTarget) * force;

            // 1.2.1 Tangential push forcing rotation in its own direction/speed
            const perpX = -py / distToTarget;
            const perpY = px / distToTarget;
            ax[i] += perpX * thrust;
            ay[i] += perpY * thrust;
          }

          // 1.3 Add mild repulsion to prevent clumping
          for (let j = 0; j < 3; j++) {
            if (i === j) continue;
            const sJ = revs[j];
            const dx = sI.x - sJ.x; 
            const dy = sI.y - sJ.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 30 && dist > 0.1) {
              const repulsionStrength = ((30 - dist) / 30) * 0.12;
              ax[i] += (dx / dist) * repulsionStrength;
              ay[i] += (dy / dist) * repulsionStrength;
            }
          }
        }

        // 1.4 Update velocities and positions
        for (let i = 0; i < 3; i++) {
          const s = revs[i];
          s.vx = (s.vx + ax[i]) * damping;
          s.vy = (s.vy + ay[i]) * damping;

          const speed = Math.sqrt(s.vx * s.vx + s.vy * s.vy);
          const maxSpeed = 3.5; // Smooth flowing speed ceiling
          if (speed > maxSpeed) {
            s.vx = (s.vx / speed) * maxSpeed;
            s.vy = (s.vy / speed) * maxSpeed;
          }

          s.x += s.vx;
          s.y += s.vy;
        }
      }

      // 2. Update and Draw Background Stars
      const starMultipliers = new Array(stars.length).fill(1.0);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.twinklePhase += star.twinkleSpeed;
        const twinkleFactor = Math.sin(star.twinklePhase) * 0.15 + 0.85;

        let brightnessMultiplier = 1.0;

        // Glow brighter based on proximity to mouse cursor
        if (mouse) {
          const dx = star.x - mouse.x;
          const dy = star.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 200;
          if (dist < maxDist) {
            const proximity = 1 - dist / maxDist;
            brightnessMultiplier = 1.0 + proximity * 3.5;
          }
        }

        // Also glow brighter if any revolving 3-body star is nearby
        for (let r = 0; r < revs.length; r++) {
          const rS = revs[r];
          const dx = star.x - rS.x;
          const dy = star.y - rS.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;
          if (dist < maxDist) {
            const proximity = 1 - dist / maxDist;
            brightnessMultiplier = Math.max(brightnessMultiplier, 1.0 + proximity * 2.5);
          }
        }

        starMultipliers[i] = brightnessMultiplier;

        const finalOpacity = Math.min(
          1.0,
          star.baseOpacity * twinkleFactor * brightnessMultiplier
        );

        ctx.fillStyle = `rgba(255, 255, 255, ${finalOpacity})`;
        ctx.beginPath();
        const scale = brightnessMultiplier > 1.0 ? 1.0 + (brightnessMultiplier - 1.0) * 0.15 : 1.0;
        ctx.arc(star.x, star.y, star.size * scale, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Constellations (Background star meshes)
      const maxConnectDistance = 85;
      for (let i = 0; i < stars.length; i++) {
        const starA = stars[i];
        const multA = starMultipliers[i];

        for (let j = i + 1; j < stars.length; j++) {
          const starB = stars[j];
          const multB = starMultipliers[j];

          const dx = starA.x - starB.x;
          const dy = starA.y - starB.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxConnectDistance) {
            const baseLineOpacity = (1 - dist / maxConnectDistance) * 0.08;
            const avgMultiplier = (multA + multB) / 2;
            const finalLineOpacity = Math.min(0.6, baseLineOpacity * avgMultiplier);

            if (finalLineOpacity > 0.01) {
              ctx.strokeStyle = `rgba(255, 255, 255, ${finalLineOpacity})`;
              ctx.lineWidth = 0.5 * (avgMultiplier > 1.0 ? 1.0 + (avgMultiplier - 1.0) * 0.2 : 1.0);
              ctx.beginPath();
              ctx.moveTo(starA.x, starA.y);
              ctx.lineTo(starB.x, starB.y);
              ctx.stroke();
            }
          }
        }
      }

      // 4. Draw 3-body revolving stars and connections
      if (revs.length === 3) {
        // 4.1 Draw connecting lines between the 3 revolving bodies (forming a dynamic triangle mesh)
        ctx.strokeStyle = "rgba(165, 180, 252, 0.25)";
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(revs[0].x, revs[0].y);
        ctx.lineTo(revs[1].x, revs[1].y);
        ctx.lineTo(revs[2].x, revs[2].y);
        ctx.closePath();
        ctx.stroke();

        // 4.2 Draw thin connection threads from revolving bodies to nearby background stars
        for (let i = 0; i < 3; i++) {
          const rS = revs[i];
          for (let j = 0; j < stars.length; j++) {
            const bgS = stars[j];
            const dx = rS.x - bgS.x;
            const dy = rS.y - bgS.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < 100) {
              const lineOpacity = (1 - dist / 100) * 0.15;
              ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`;
              ctx.lineWidth = 0.4;
              ctx.beginPath();
              ctx.moveTo(rS.x, rS.y);
              ctx.lineTo(bgS.x, bgS.y);
              ctx.stroke();
            }
          }
        }

        // 4.3 Render the 3 revolving stars as clean dots (no glow/halos)
        for (let i = 0; i < 3; i++) {
          const s = revs[i];
          
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 5. Update and Draw Comets
      if (comets.length < 2 && Math.random() < 0.006) {
        comets.push({
          x: Math.random() * canvas.width,
          y: Math.random() * (canvas.height * 0.5),
          dx: Math.random() * 4 - 6,
          dy: Math.random() * 3 + 2,
          length: Math.random() * 100 + 60,
          speed: Math.random() * 2 + 3,
          width: Math.random() * 1.5 + 0.8,
          maxLife: Math.random() * 50 + 50,
          life: 0,
        });
      }

      for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i];
        comet.life++;

        if (comet.life >= comet.maxLife) {
          comets.splice(i, 1);
          continue;
        }

        comet.x += comet.dx * comet.speed;
        comet.y += comet.dy * comet.speed;

        const lifeRatio = comet.life / comet.maxLife;
        const currentOpacity = lifeRatio < 0.2 
          ? (lifeRatio / 0.2) * 0.7 
          : (1 - (lifeRatio - 0.2) / 0.8) * 0.7;

        const tailX = comet.x - comet.dx * comet.length * (1 - lifeRatio * 0.2);
        const tailY = comet.y - comet.dy * comet.length * (1 - lifeRatio * 0.2);

        const gradient = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.strokeStyle = gradient;
        ctx.lineWidth = comet.width;
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity * 1.3})`;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.width * 1.3, 0, Math.PI * 2);
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
