import Link from "next/link";
import Image from "next/image";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { CHRIST_CREST } from "@/lib/logos";

export function Footer() {
  return (
    <footer
      className="pt-12 pb-8 relative z-10 border-t"
      style={{
        background: "rgba(10, 17, 40, 0.95)",
        borderColor: "rgba(201, 168, 76, 0.2)",
      }}
    >
      <div className="container mx-auto px-4 space-y-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src={CHRIST_CREST.src}
              alt="CHRIST (Deemed to be University)"
              width={CHRIST_CREST.width}
              height={CHRIST_CREST.height}
              className="h-8 w-auto"
            />
            <div>
              <p className="text-lg font-black tracking-wide text-amber-400" style={{ fontFamily: "var(--font-trajan), serif" }}>
                USHUS 2026
              </p>
              <p className="text-xs text-neutral-400 max-w-sm">
                School of Business and Management (MBA), Bangalore Central Campus, CHRIST (Deemed to be University).
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-amber-400 transition-colors">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-amber-400 transition-colors">
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-amber-400 transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div
          className="pt-6 text-center text-[11px] text-neutral-400 border-t"
          style={{ borderColor: "rgba(201, 168, 76, 0.15)" }}
        >
          © 2026 USHUS 2026 · School of Business and Management (MBA), Bangalore Central Campus, CHRIST (Deemed to be University).
        </div>
      </div>
    </footer>
  );
}
