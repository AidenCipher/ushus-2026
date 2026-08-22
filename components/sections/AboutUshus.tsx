"use client";

import { useEffect, useRef, useState } from "react";

export function AboutUshus() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about-ushus"
      ref={ref}
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "#0f1c3f" }}
      aria-label="About USHUS"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 55% 45%, rgba(201,168,76,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative container mx-auto px-4 max-w-5xl">
        {/* Heading */}
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-8 transition-all duration-700 delay-100"
          style={{
            fontFamily: "var(--font-trajan), serif",
            color: "#F5ECD7",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          About USHUS
        </h2>

        {/* Body */}
        <div
          className="space-y-5 text-base md:text-lg leading-relaxed transition-all duration-700 delay-200"
          style={{
            color: "rgba(245,236,215,0.82)",
            maxWidth: "72ch",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p>
            USHUS is the flagship National Management Fest organised by the MBA department, CHRIST (Deemed
            to be University), Bengaluru Central Campus. The two days&apos; events bring together talented
            students from colleges and universities across India to compete in exciting management events.
            The fest provides students with an opportunity to apply their knowledge in practical situations
            and showcase their skills in 10 major events. It is designed to encourage creativity, teamwork,
            leadership and quick decision-making in a fun and competitive environment.
          </p>
          <p>
            USHUS is more than just a competition; it is an opportunity to learn, connect and enjoy the
            vibrant campus experience at CHRIST. Participants get opportunities to interact with students
            from different institutions, make new connections and gain valuable experience. The fest also
            offers attractive cash prizes, exciting freebies, goodies and other rewards for winners and
            participants. With challenging events, a lively atmosphere and opportunities to showcase
            talent, USHUS provides a memorable and enriching experience for all the participants.
          </p>
        </div>
      </div>
    </section>
  );
}
