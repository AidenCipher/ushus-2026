"use client";

import { useEffect, useRef, useState } from "react";

export function AboutUniversity() {
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
      id="about-university"
      ref={ref}
      className="relative py-20 md:py-28 overflow-hidden"
      style={{ background: "#0f1c3f" }}
      aria-label="About Christ (Deemed to be University)"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 80% 50%, rgba(201,168,76,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative container mx-auto px-4 max-w-5xl">

        {/* Heading */}
        <h2
          className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight mb-8 transition-all duration-700 delay-100 whitespace-nowrap"
          style={{
            fontFamily: "var(--font-trajan), serif",
            color: "#F5ECD7",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          About Christ (Deemed to be University)
        </h2>

        {/* Body copy */}
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
            CHRIST (Deemed to be University) was founded on the educational vision of St Kuriakose Elias
            Chavara, a great educationalist and social reformer of the nineteenth century. The university
            began as Christ College in 1969 and introduced modern and innovative methods of education,
            academic discipline and holistic development. It received autonomy from the UGC in 2004 and
            was declared a Deemed to be University in 2008. CHRIST was one of the first institutions in
            India to be accredited by NAAC in 1998 and is currently accredited with an A+ Grade. It is
            ranked 63rd among Indian universities in the NIRF 2025 rankings.
          </p>
          <p>
            Today, CHRIST is a multidisciplinary university with more than 40,000 students and offers
            undergraduate, postgraduate and doctoral programmes in areas such as humanities, social
            sciences, sciences, commerce, management, engineering, architecture, education and law. It has
            campuses in Bengaluru, Lavasa and Ghaziabad. The university has a diverse student community
            from across India and around 60 countries. Along with academics and research, CHRIST encourages
            sports, music, literature and other creative activities, providing students with opportunities
            for overall personal and professional development.
          </p>
        </div>
      </div>
    </section>
  );
}
