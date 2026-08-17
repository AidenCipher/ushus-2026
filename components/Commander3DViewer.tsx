"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  X,
  ChevronDown,
  ChevronUp,
  Shield,
  Crosshair,
  Trophy,
  Users,
  Calendar,
  CreditCard,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileText,
  AlertCircle,
} from "lucide-react";
import * as THREE from "three";
import { EventInfo } from "@/lib/content";
import { calculatePricing } from "@/lib/pricing";

interface Commander3DViewerProps {
  event: EventInfo;
  onClose?: () => void;
}

export function Commander3DViewer({ event, onClose }: Commander3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeEra, setActiveEra] = useState<number>(1);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // References for Three.js manipulation
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  const pricing = calculatePricing("INDIVIDUAL_EVENT", 1);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setAutoRotate(false);
    }

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x0b132b, 0.035);

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 7.5);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.9);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xe8c875, 2.5);
    goldKeyLight.position.set(5, 8, 6);
    scene.add(goldKeyLight);

    const navyFillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    navyFillLight.position.set(-6, -4, -4);
    scene.add(navyFillLight);

    const rimLight = new THREE.PointLight(0xc9a84c, 3, 20);
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // Group for the 3D monument
    const monumentGroup = new THREE.Group();
    meshGroupRef.current = monumentGroup;
    scene.add(monumentGroup);

    // ── 3D Monument Geometry with Commander Portrait Hologram ──────────────
    // 1. Central Double-Sided Commander Portrait Tablet
    const textureLoader = new THREE.TextureLoader();
    const commanderTexture = textureLoader.load(event.leaderImage);
    commanderTexture.colorSpace = THREE.SRGBColorSpace;

    const portraitGeo = new THREE.PlaneGeometry(2.0, 2.6);
    const portraitMat = new THREE.MeshStandardMaterial({
      map: commanderTexture,
      side: THREE.DoubleSide,
      roughness: 0.25,
      metalness: 0.1,
    });
    const portraitMesh = new THREE.Mesh(portraitGeo, portraitMat);
    monumentGroup.add(portraitMesh);

    // 2. Ornate Golden Frame around portrait
    const frameBorderGeo = new THREE.BoxGeometry(2.15, 2.75, 0.06);
    const frameBorderMat = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      metalness: 0.9,
      roughness: 0.15,
      wireframe: true,
    });
    const frameBorderMesh = new THREE.Mesh(frameBorderGeo, frameBorderMat);
    monumentGroup.add(frameBorderMesh);

    // 3. Floating Orbital Rings
    const ringGeo1 = new THREE.TorusGeometry(2.3, 0.035, 16, 100);
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      metalness: 0.95,
      roughness: 0.15,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    monumentGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(2.6, 0.025, 16, 100);
    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    monumentGroup.add(ring2);

    // 4. Tactical Pedestal
    const pedestalGeo = new THREE.CylinderGeometry(2.0, 2.4, 0.3, 8);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0x1c2541,
      metalness: 0.7,
      roughness: 0.4,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -2.3;
    monumentGroup.add(pedestal);

    // 5. Background Tactical Particle Grid
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 16;
      positions[i + 1] = (Math.random() - 0.5) * 16;
      positions[i + 2] = (Math.random() - 0.5) * 16;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc9a84c,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // ── Animation Loop ────────────────────────────────────────────────────
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && monumentGroup) {
        monumentGroup.rotation.y += 0.006;
        ring1.rotation.z += 0.008;
        ring2.rotation.x += 0.005;
      }

      particleSystem.rotation.y -= 0.001;

      renderer.render(scene, camera);
    };
    animate();

    // ── Mouse & Touch Drag Controls ───────────────────────────────────────
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isDraggingRef.current = true;
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isDraggingRef.current || !monumentGroup) return;

      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = clientX - previousMousePositionRef.current.x;
      const deltaY = clientY - previousMousePositionRef.current.y;

      monumentGroup.rotation.y += deltaX * 0.008;
      monumentGroup.rotation.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isDraggingRef.current = false;
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", onPointerDown);
    domElement.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    domElement.addEventListener("touchstart", onPointerDown, { passive: true });
    domElement.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);

    // ── Resize handler ────────────────────────────────────────────────────
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      domElement.removeEventListener("mousedown", onPointerDown);
      domElement.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      domElement.removeEventListener("touchstart", onPointerDown);
      domElement.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
    };
  }, [autoRotate]);

  // View Controls
  const handleResetView = () => {
    if (meshGroupRef.current && cameraRef.current) {
      meshGroupRef.current.rotation.set(0, 0, 0);
      cameraRef.current.position.set(0, 0, 7.5);
      setZoomLevel(1);
    }
  };

  const handleZoom = (delta: number) => {
    if (cameraRef.current) {
      const newZ = Math.min(Math.max(cameraRef.current.position.z + delta, 4), 12);
      cameraRef.current.position.z = newZ;
      setZoomLevel(7.5 / newZ);
    }
  };

  return (
    <div className="relative w-full h-[90vh] min-h-[640px] max-h-[920px] bg-[#0A1128] overflow-hidden rounded-2xl border border-amber-500/30 shadow-2xl select-none">
      {/* ── Glowing Corner Brackets ────────────────────────────────────────── */}
      <div className="tactical-bracket-tl shadow-[0_0_12px_rgba(201,168,76,0.8)]" />
      <div className="tactical-bracket-tr shadow-[0_0_12px_rgba(201,168,76,0.8)]" />
      <div className="tactical-bracket-bl shadow-[0_0_12px_rgba(201,168,76,0.8)]" />
      <div className="tactical-bracket-br shadow-[0_0_12px_rgba(201,168,76,0.8)]" />

      {/* ── Top-Center Floating Pill Toolbar ───────────────────────────────── */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0B132B]/90 border border-amber-500/40 backdrop-blur-md shadow-lg">
        <button
          onClick={handleResetView}
          className="p-1.5 rounded-full hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer"
          title="Reset View"
          aria-label="Reset View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <span className="w-[1px] h-3.5 bg-amber-500/30" />
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-full transition-colors cursor-pointer ${
            autoRotate ? "bg-amber-500/20 text-amber-300" : "hover:bg-amber-500/20 text-neutral-400"
          }`}
          title={autoRotate ? "Pause Auto-Rotate" : "Start Auto-Rotate"}
          aria-label="Toggle Auto-Rotate"
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <span className="w-[1px] h-3.5 bg-amber-500/30" />
        <div className="px-2 text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase">
          3D COMMAND MONUMENT // {event.codename}
        </div>
      </div>

      {/* ── Top-Left Codename Crest Panel ─────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-30 p-3 rounded-xl bg-[#0B132B]/90 border border-amber-500/30 backdrop-blur-md max-w-[290px] shadow-2xl hidden sm:flex items-center gap-3">
        <div className="relative w-14 h-16 rounded-lg overflow-hidden border border-amber-500/40 shrink-0 bg-black/40">
          <Image
            src={event.leaderImage}
            alt={event.leader}
            fill
            className="object-cover object-top"
          />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold font-mono text-[10px]">
              {event.sealLetter}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-amber-400 uppercase truncate">
              {event.vertical}
            </span>
          </div>
          <h3 className="text-xs font-bold text-[#F5ECD7] truncate" style={{ fontFamily: "var(--font-trajan), serif" }}>
            {event.name}
          </h3>
          <p className="text-[10px] text-neutral-300 truncate">
            Commander: <strong className="text-amber-300">{event.leader}</strong>
          </p>
        </div>
      </div>

      {/* ── Top-Right Viewer Controls ──────────────────────────────────────── */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        <div className="flex items-center rounded-lg bg-[#0B132B]/85 border border-amber-500/30 backdrop-blur-md p-1 shadow-lg">
          <button
            onClick={() => handleZoom(-1.2)}
            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded transition-colors cursor-pointer"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(1.2)}
            className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded transition-colors cursor-pointer"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#0B132B]/85 border border-amber-500/30 hover:border-amber-400 text-neutral-300 hover:text-white backdrop-blur-md transition-all shadow-lg cursor-pointer"
            aria-label="Close 3D Viewer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Left Sidebar: Collapsible EVENT BRIEFING (3-Era Rounds) ───────── */}
      <div className="absolute top-24 left-4 z-30 w-72 max-h-[calc(100%-190px)] overflow-y-auto rounded-xl bg-[#0B132B]/90 border border-amber-500/30 backdrop-blur-md p-3.5 shadow-2xl hidden md:block space-y-2.5">
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
          <div className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5" />
            EVENT BRIEFING &amp; ERAS
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">
            3-ERA GAUNTLET
          </span>
        </div>

        {/* Era I Accordion */}
        <div className="rounded-lg border border-white/10 bg-[#1C2541]/70 overflow-hidden">
          <button
            onClick={() => setActiveEra(activeEra === 1 ? 0 : 1)}
            className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-bold text-amber-200 hover:bg-white/5 transition-colors"
          >
            <span>{event.era1.title}</span>
            {activeEra === 1 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {activeEra === 1 && (
            <div className="px-3 pb-3 text-[11px] space-y-1.5 text-neutral-300 border-t border-white/5 pt-2">
              <p className="text-[10px] italic text-amber-300/80">{event.era1.subtitle}</p>
              <p className="leading-relaxed">{event.era1.description}</p>
              <ul className="list-disc list-inside text-[10px] text-neutral-300 space-y-0.5 pt-1">
                {event.era1.rounds.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Era II Accordion */}
        <div className="rounded-lg border border-white/10 bg-[#1C2541]/70 overflow-hidden">
          <button
            onClick={() => setActiveEra(activeEra === 2 ? 0 : 2)}
            className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-bold text-amber-200 hover:bg-white/5 transition-colors"
          >
            <span>{event.era2.title}</span>
            {activeEra === 2 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {activeEra === 2 && (
            <div className="px-3 pb-3 text-[11px] space-y-1.5 text-neutral-300 border-t border-white/5 pt-2">
              <p className="text-[10px] italic text-amber-300/80">{event.era2.subtitle}</p>
              <p className="leading-relaxed">{event.era2.description}</p>
              <ul className="list-disc list-inside text-[10px] text-neutral-300 space-y-0.5 pt-1">
                {event.era2.rounds.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Era III Accordion */}
        <div className="rounded-lg border border-white/10 bg-[#1C2541]/70 overflow-hidden">
          <button
            onClick={() => setActiveEra(activeEra === 3 ? 0 : 3)}
            className="w-full px-3 py-2 text-left flex items-center justify-between text-xs font-bold text-amber-200 hover:bg-white/5 transition-colors"
          >
            <span>{event.era3.title}</span>
            {activeEra === 3 ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {activeEra === 3 && (
            <div className="px-3 pb-3 text-[11px] space-y-1.5 text-neutral-300 border-t border-white/5 pt-2">
              <p className="text-[10px] italic text-amber-300/80">{event.era3.subtitle}</p>
              <p className="leading-relaxed">{event.era3.description}</p>
              <ul className="list-disc list-inside text-[10px] text-neutral-300 space-y-0.5 pt-1">
                {event.era3.rounds.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Center Stage: Three.js Canvas Container ────────────────────────── */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ── Bottom-Center Carousel: Quick-Fact Chips ───────────────────────── */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
        <div className="flex items-center justify-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          {/* Team Size */}
          <div className="px-3 py-1.5 rounded-lg bg-[#0B132B]/90 border border-amber-500/30 backdrop-blur-md flex items-center gap-2 flex-shrink-0">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <div className="text-left leading-none">
              <span className="text-[9px] text-neutral-400 uppercase font-mono block">Squad</span>
              <strong className="text-xs text-amber-200">{event.teamSize}</strong>
            </div>
          </div>

          {/* 1st Prize */}
          <div className="px-3 py-1.5 rounded-lg bg-[#0B132B]/90 border border-amber-500/30 backdrop-blur-md flex items-center gap-2 flex-shrink-0">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <div className="text-left leading-none">
              <span className="text-[9px] text-neutral-400 uppercase font-mono block">1st Place</span>
              <strong className="text-xs text-amber-200">₹{event.prizeFirst.toLocaleString()}</strong>
            </div>
          </div>

          {/* 2nd Prize */}
          {event.prizeSecond && (
            <div className="px-3 py-1.5 rounded-lg bg-[#0B132B]/90 border border-amber-500/30 backdrop-blur-md flex items-center gap-2 flex-shrink-0">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <div className="text-left leading-none">
                <span className="text-[9px] text-neutral-400 uppercase font-mono block">2nd Place</span>
                <strong className="text-xs text-amber-200">₹{event.prizeSecond.toLocaleString()}</strong>
              </div>
            </div>
          )}

          {/* Registration Fee */}
          <div className="px-3 py-1.5 rounded-lg bg-[#0B132B]/90 border border-amber-500/30 backdrop-blur-md flex items-center gap-2 flex-shrink-0">
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <div className="text-left leading-none">
              <span className="text-[9px] text-neutral-400 uppercase font-mono block">Fee</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] line-through text-neutral-400">₹1,500</span>
                <strong className="text-xs text-amber-300">₹900 (Early Bird)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Toolbar & Action Bar ────────────────────────────────────── */}
      <div className="absolute bottom-3 left-0 right-0 z-30 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <span className="hidden sm:inline-flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            Accommodation: First-come-first-served
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href={`/events/${event.name.toLowerCase()}`}>
            <button
              className="h-10 px-4 rounded-lg text-xs font-bold tracking-wider uppercase border border-amber-500/40 text-amber-300 hover:bg-amber-500/10 transition-all cursor-pointer"
              style={{ fontFamily: "var(--font-trajan), serif" }}
            >
              Full Briefing
            </button>
          </Link>
          <Link href="/register">
            <button
              className="h-10 px-6 rounded-lg text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer shadow-lg"
              style={{
                background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
                color: "#050200",
                fontFamily: "var(--font-trajan), serif",
                boxShadow: "0 0 25px rgba(201, 168, 76, 0.35)",
              }}
            >
              REGISTER NOW <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
