import Image from "next/image";
import { CHRIST_CREST } from "@/lib/logos";

export function Navbar() {
  return (
    <header
      className="sticky top-0 w-full z-40 backdrop-blur-md border-b border-amber-500/10"
      style={{ background: "rgba(11, 19, 43, 0.9)" }}
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <Image
            src={CHRIST_CREST.src}
            alt="CHRIST (Deemed to be University)"
            width={CHRIST_CREST.width}
            height={CHRIST_CREST.height}
            className="h-9 w-auto"
            priority
          />
          <span
            className="font-black text-lg tracking-wider leading-tight text-amber-400"
            style={{ fontFamily: "var(--font-trajan), serif" }}
          >
            USHUS 2026
          </span>
        </a>

        <a
          href="#events"
          className="h-10 px-5 text-xs font-bold tracking-wider uppercase rounded-md transition-all duration-300 flex items-center gap-1.5 shadow-lg"
          style={{
            background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
            color: "#050200",
            fontFamily: "var(--font-trajan), serif",
            boxShadow: "0 0 20px rgba(201, 168, 76, 0.25)",
          }}
        >
          Register
        </a>
      </div>
    </header>
  );
}
