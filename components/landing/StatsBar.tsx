"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
}

function StatCounter({ value, suffix = "", label }: StatItemProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = React.useState("0");

  React.useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          setDisplayValue(Math.round(latest).toString());
        }
      });
      return () => controls.stop();
    }
  }, [isInView, value, count]);

  return (
    <div ref={ref} className="text-center p-6 bg-white/5 border border-white/10 rounded-lg flex flex-col justify-center items-center shadow-lg" data-testid="stat-counter">
      <div className="text-3xl sm:text-4xl font-extrabold text-primary flex items-center">
        <span>{displayValue}</span>
        {suffix && <span className="ml-0.5">{suffix}</span>}
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground mt-2 uppercase tracking-wider font-semibold">{label}</p>
    </div>
  );
}

export function StatsBar() {
  const stats = [
    { value: 1500, suffix: "+", label: "Participants" },
    { value: 20, suffix: "+", label: "Events" },
    { value: 10, suffix: "+", label: "Verticals" },
    { value: 50, suffix: "+", label: "Colleges" }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full" data-testid="stats-bar">
      {stats.map((stat, idx) => (
        <StatCounter key={idx} value={stat.value} suffix={stat.suffix} label={stat.label} />
      ))}
    </div>
  );
}
