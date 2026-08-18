"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X, Crosshair, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { CHRIST_CREST } from "@/lib/logos";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { registerCtaHref } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState("home");

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (pathname !== "/") return;

    const sections = ["about", "contact"];
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -40% 0px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const handleScroll = () => {
      if (window.scrollY < 100) {
        setActiveSection("home");
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const isLinkActive = (href: string) => {
    if (pathname === "/") {
      if (href === "/") return activeSection === "home";
      if (href === "/#about") return activeSection === "about";
      if (href === "/events") return false;
      if (href === "/#contact") return activeSection === "contact";
    } else {
      if (href === "/events" && pathname.startsWith("/events")) return true;
      return pathname === href;
    }
    return false;
  };

  const handleScrollClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 w-full z-40 transition-all duration-400",
        scrolled
          ? "backdrop-blur-xl shadow-lg border-b"
          : "bg-[#0B132B]/80 backdrop-blur-md border-b border-amber-500/10"
      )}
      style={
        scrolled
          ? {
              background: "rgba(11, 19, 43, 0.94)",
              borderColor: "rgba(201, 168, 76, 0.25)",
            }
          : undefined
      }
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 group relative z-50">
          <Image
            src={CHRIST_CREST.src}
            alt="CHRIST (Deemed to be University)"
            width={CHRIST_CREST.width}
            height={CHRIST_CREST.height}
            className="h-9 w-auto group-hover:scale-105 transition-transform duration-300"
            priority
          />
          <span
            className="font-black text-lg tracking-wider leading-tight text-amber-400"
            style={{ fontFamily: "var(--font-trajan), serif" }}
          >
            USHUS 2026
          </span>
        </Link>

        {/* ── Desktop Nav ───────────────────────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleScrollClick(e, link.href)}
                className="text-sm font-semibold transition-colors relative group tracking-wide text-neutral-300 hover:text-amber-300"
                style={{
                  fontFamily: "var(--font-trajan), serif",
                  color: active ? "#C9A84C" : undefined,
                  letterSpacing: "0.08em",
                }}
              >
                {link.label}
                {active && (
                  <div
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full"
                    style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
                  />
                )}
              </Link>
            );
          })}
          <div
            className="flex items-center gap-3 ml-4 pl-4 border-l border-amber-500/20"
          >
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-sm text-neutral-300 hover:text-amber-300 hover:bg-transparent"
                style={{ fontFamily: "var(--font-trajan), serif", letterSpacing: "0.05em" }}
              >
                Sign In
              </Button>
            </Link>
            <Link href={registerCtaHref}>
              <button
                className="h-10 px-5 text-xs font-bold tracking-wider uppercase rounded-md transition-all duration-300 flex items-center gap-1.5 cursor-pointer shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #E8C875, #C9A84C 60%, #8B6914)",
                  color: "#050200",
                  fontFamily: "var(--font-trajan), serif",
                  boxShadow: "0 0 20px rgba(201, 168, 76, 0.25)",
                }}
              >
                DEPLOY CREW
              </button>
            </Link>
          </div>
        </nav>

        {/* ── Mobile Toggle ─────────────────────────────────────────────────── */}
        <button
          className="md:hidden relative z-50 p-2 text-amber-400"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* ── Mobile Menu ───────────────────────────────────────────────────── */}
        {isOpen && (
          <div
            className="absolute top-full left-0 w-full backdrop-blur-xl shadow-2xl py-6 px-4 flex flex-col gap-4 md:hidden border-b"
            style={{
              background: "rgba(11, 19, 43, 0.98)",
              borderColor: "rgba(201, 168, 76, 0.25)",
            }}
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    setIsOpen(false);
                    handleScrollClick(e, link.href);
                  }}
                  className="text-base font-medium p-2.5 rounded-md transition-colors"
                  style={{
                    fontFamily: "var(--font-trajan), serif",
                    color: active ? "#C9A84C" : "#F5ECD7",
                    background: active ? "rgba(201, 168, 76, 0.1)" : "transparent",
                    border: active ? "1px solid rgba(201, 168, 76, 0.25)" : "1px solid transparent",
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
            <div
              className="flex flex-col gap-3 pt-4 mt-2 border-t border-amber-500/20"
            >
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <button
                  className="w-full h-10 rounded-md text-sm font-semibold transition-all border border-amber-500/40 text-amber-400 bg-transparent"
                  style={{ fontFamily: "var(--font-trajan), serif" }}
                >
                  Sign In
                </button>
              </Link>
              <Link href={registerCtaHref} onClick={() => setIsOpen(false)}>
                <button
                  className="w-full h-10 rounded-md text-sm font-bold tracking-wider uppercase transition-all"
                  style={{
                    background: "linear-gradient(135deg, #E8C875, #C9A84C)",
                    color: "#050200",
                    fontFamily: "var(--font-trajan), serif",
                  }}
                >
                  Register Now
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
