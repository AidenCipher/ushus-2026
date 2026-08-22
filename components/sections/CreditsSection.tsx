"use client";

import { useEffect, useRef, useState } from "react";
import { LEADERSHIP, COMMITTEE } from "@/data/committee";

/**
 * CreditsSection — Team USHUS 2026
 *
 * Column layout:
 *  Left    : Leadership individual cards (no outer box) → Faculty Coordinators below
 *  Middle  : Student Coordinators → Core Committee
 *  Right   : Managing Committee → MDC
 */

const QUERY_EMAIL = "ushus.sbm@christuniversity.in";

/** A single bordered name+role card used for leadership */
function RoleCard({ role, name }: { role: string; name: string }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid rgba(201,168,76,0.25)", background: "rgba(12,20,48,0.85)" }}
    >
      <div
        className="px-3 py-1.5 text-center border-b"
        style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.22)" }}
      >
        <span
          className="text-[11px] font-extrabold uppercase tracking-[0.14em]"
          style={{ color: "#C9A84C", fontFamily: "var(--font-trajan), serif" }}
        >
          {role}
        </span>
      </div>
      <div className="px-3 py-3 text-center">
        <p className="text-[15px] font-semibold leading-snug" style={{ color: "#FFFFFF" }}>
          {name}
        </p>
      </div>
    </div>
  );
}

/** A panel block with a gold header and a name list */
function PanelBlock({
  title,
  subtitle,
  names,
  twoCol = false,
}: {
  title: string;
  subtitle?: string;
  names: string[];
  twoCol?: boolean;
}) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(201,168,76,0.3)", background: "rgba(12, 20, 48, 0.9)" }}
    >
      <div
        className="px-4 py-3 text-center border-b"
        style={{ background: "rgba(201,168,76,0.1)", borderColor: "rgba(201,168,76,0.3)" }}
      >
        <p
          className="text-xs font-extrabold uppercase tracking-[0.18em]"
          style={{ color: "#C9A84C", fontFamily: "var(--font-trajan), serif" }}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(245,236,215,0.45)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {names.length > 0 && (
        <div className={`px-4 py-3 ${twoCol ? "" : "text-center"}`}>
          {twoCol ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
              {names.map((n) => (
                <p key={n} className="text-[13px] leading-snug" style={{ color: "#FFFFFF" }}>
                  {n}
                </p>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {names.map((n) => (
                <p key={n} className="text-[14px] leading-snug" style={{ color: "#FFFFFF" }}>
                  {n}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CreditsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.06 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const facultyCoord = COMMITTEE.find((c) => c.title === "Faculty Coordinators");
  const studentCoord = COMMITTEE.find((c) => c.title === "Student Coordinators");
  const coreComm = COMMITTEE.find((c) => c.title === "Core Committee");
  const managingComm = COMMITTEE.find((c) => c.title === "Managing Committee");
  const mdc = COMMITTEE.find((c) => c.title === "MDC");

  return (
    <section
      id="credits"
      ref={ref}
      className="relative py-16 md:py-24 overflow-hidden"
      style={{ background: "#080e23" }}
      aria-label="Team USHUS 2026"
    >
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="relative container mx-auto px-4 max-w-6xl">
        {/* Section title */}
        <div
          className="text-center mb-10 transition-all duration-700"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)" }}
        >
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-black tracking-widest uppercase"
            style={{ fontFamily: "var(--font-trajan), serif", color: "#F5ECD7" }}
          >
            Team USHUS 2026
          </h2>
          <div className="mt-3 mx-auto w-20 h-px" style={{ background: "rgba(201,168,76,0.5)" }} />
        </div>

        {/* ── 3-column grid ── */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 transition-all duration-700 delay-150"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(28px)" }}
        >
          {/* ── Col 1: Leadership cards (no outer box) + Faculty Coordinators ── */}
          <div className="flex flex-col gap-3">
            {/* Individual leader cards — no wrapping box */}
            {LEADERSHIP.map((l) => (
              <RoleCard key={l.role} role={l.role} name={l.name} />
            ))}

            {/* Faculty Coordinators below leadership */}
            {facultyCoord && (
              <PanelBlock
                title="Faculty Coordinators"
                names={facultyCoord.members.map((m) => m.name)}
              />
            )}
          </div>

          {/* ── Col 2: Student Coordinators → Core Committee ── */}
          <div className="flex flex-col gap-3">
            {studentCoord && (
              <PanelBlock
                title="Student Coordinators"
                names={studentCoord.members.map((m) => m.name)}
              />
            )}
            {coreComm && (
              <PanelBlock
                title="Core Committee"
                names={coreComm.members.map((m) => m.name)}
                twoCol
              />
            )}
          </div>

          {/* ── Col 3: Managing Committee → MDC ── */}
          <div className="flex flex-col gap-3">
            {managingComm && (
              <PanelBlock
                title="Managing Committee"
                names={managingComm.members.map((m) => m.name)}
                twoCol
              />
            )}
            {mdc && (
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid rgba(201,168,76,0.3)", background: "rgba(12, 20, 48, 0.9)" }}
              >
                <div
                  className="px-4 py-3 text-center border-b"
                  style={{ background: "rgba(201,168,76,0.1)", borderColor: "rgba(201,168,76,0.3)" }}
                >
                  <p
                    className="text-xs font-extrabold uppercase tracking-[0.18em]"
                    style={{ color: "#C9A84C", fontFamily: "var(--font-trajan), serif" }}
                  >
                    MDC
                  </p>
                  <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "#FFFFFF" }}>
                    Media, Design &amp; Creative
                  </p>
                </div>
                {mdc.members.length > 0 && (
                  <div className="px-4 py-3 space-y-0.5 text-center">
                    {mdc.members.map((m) => (
                      <p key={m.name} className="text-[14px] leading-relaxed" style={{ color: "#FFFFFF" }}>
                        {m.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Query email — prominent ── */}
        <div
          className="mt-10 text-center transition-all duration-700 delay-300"
          style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)" }}
        >
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "rgba(245,236,215,0.45)" }}>
            For any queries, write to us at:
          </p>
          <a
            href={`mailto:${QUERY_EMAIL}`}
            className="text-lg md:text-xl font-bold tracking-wide transition-colors duration-200 hover:underline lowercase"
            style={{ color: "#C9A84C" }}
          >
            {QUERY_EMAIL}
          </a>
        </div>
      </div>
    </section>
  );
}
