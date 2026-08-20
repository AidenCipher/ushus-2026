import Image from "next/image";
import { CHRIST_CREST, USHUS_EMBLEM } from "@/lib/logos";

export function Navbar() {
  return (
    <header
      className="sticky top-0 w-full z-40 backdrop-blur-md border-b border-amber-500/10"
      style={{ background: "rgba(11, 19, 43, 0.9)" }}
    >
      <div className="container mx-auto px-4 h-16 sm:h-20 flex items-center justify-between">
        <a href="#top" className="flex items-center shrink-0">
          <Image
            src={USHUS_EMBLEM.src}
            alt="USHUS"
            width={USHUS_EMBLEM.width}
            height={USHUS_EMBLEM.height}
            className="h-9 w-9 sm:h-10 sm:w-10"
            priority
          />
        </a>

        <a href="#top" className="flex items-center shrink-0">
          <Image
            src={CHRIST_CREST.src}
            alt="CHRIST (Deemed to be University)"
            width={CHRIST_CREST.width}
            height={CHRIST_CREST.height}
            className="h-8 sm:h-9 w-auto"
            priority
          />
        </a>
      </div>
    </header>
  );
}
