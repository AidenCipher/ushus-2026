import Image from "next/image";
import { CHRIST_CREST, USHUS_EMBLEM } from "@/lib/logos";

export function Navbar() {
  return (
    <header
      className="sticky top-0 w-full z-40 backdrop-blur-md border-b border-amber-500/10"
      style={{ background: "rgba(11, 19, 43, 0.9)" }}
    >
      <div className="container mx-auto px-4 h-20 sm:h-24 flex items-center justify-between">
        {/* USHUS emblem — larger, with black "2026" centred in the inner circle */}
        <a href="#top" className="flex items-center gap-3 shrink-0">
          <div className="relative flex items-center justify-center">
            <Image
              src={USHUS_EMBLEM.src}
              alt="USHUS Logo"
              width={160}
              height={160}
              className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
              priority
            />
            {/* "2026" in black, perfectly centered, block font, bold */}
            <span
              className="absolute font-black text-[10px] sm:text-[11px] leading-none select-none"
              style={{
                color: "#000000",
                fontFamily: "sans-serif", // Block font
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                letterSpacing: "0.02em",
                fontWeight: 900,
              }}
            >
              2026
            </span>
          </div>
        </a>

        {/* Christ crest — white, larger */}
        <a href="#top" className="flex items-center shrink-0">
          <Image
            src={CHRIST_CREST.src}
            alt="CHRIST (Deemed to be University)"
            width={CHRIST_CREST.width}
            height={CHRIST_CREST.height}
            className="h-[80px] sm:h-[90px] w-auto"
            style={{ filter: "brightness(0) invert(1)" }}
            priority
          />
        </a>
      </div>
    </header>
  );
}
