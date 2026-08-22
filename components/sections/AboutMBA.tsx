"use client";

import { useEffect, useRef, useState } from "react";

export function AboutMBA() {
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
      id="about-mba"
      ref={ref}
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "#0B132B" }}
      aria-label="About the MBA Program"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 10% 60%, rgba(201,168,76,0.055) 0%, transparent 65%)",
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
          About MBA Programme
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
            The MBA programme at CHRIST (Deemed to be University) is designed to develop competent,
            confident and responsible business professionals and future leaders. The programme combines
            academic rigour with practical learning through case studies, projects, internships, industry
            interactions, guest lectures, workshops and experiential learning. Students develop a strong
            foundation in areas such as Finance, Marketing, Human Resources, Business Analytics, Operations
            and Strategy, while also strengthening their communication, leadership, teamwork, analytical
            and decision-making skills. The programme also encourages students to participate in
            management fests, clubs, conferences, competitions and other activities that support their
            overall professional and personal development.
          </p>
          <p>
            The programme places strong emphasis on industry exposure and career development. Students are
            provided opportunities to interact with leading companies and industry professionals and gain
            practical understanding of the changing business environment. The University&apos;s placement
            process provides students with opportunities across sectors such as consulting, banking and
            financial services, technology, FMCG, retail, manufacturing, healthcare and other industries,
            with roles in areas such as Marketing, Finance, Human Resources, Business Analytics, Operations,
            Consulting and General Management. Career guidance, skill-development programmes, resume
            building, mock interviews and pre-placement preparation further support students in becoming
            industry-ready leaders.
          </p>
        </div>
      </div>
    </section>
  );
}
