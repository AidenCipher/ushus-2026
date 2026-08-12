"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

// ── Lotus SVG Icon ─────────────────────────────────────────────────────────
function LotusIcon({ className = "", style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 24 C18 24 4 16 4 6 C4 2 10 0 18 7 C26 0 32 2 32 6 C32 16 18 24 18 24Z"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.2" />
      <path d="M18 24 C18 24 8 14 8 6 C8 2 12 0 18 6 C24 0 28 2 28 6 C28 14 18 24 18 24Z"
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.9" />
      <path d="M18 23 C18 23 12 13 12 6 C12 2 15 0 18 4 C21 0 24 2 24 6 C24 13 18 23 18 23Z"
        fill="currentColor" fillOpacity="0.35" stroke="currentColor" strokeWidth="0.8" />
      <line x1="18" y1="23" x2="18" y2="26" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#events", label: "Events" },
  { href: "/#contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
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

    const sections = ["about", "events", "contact"];
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
      if (href === "/#events") return activeSection === "events";
      if (href === "/#contact") return activeSection === "contact";
    } else {
      if (href === "/#events" && pathname.startsWith("/events")) return true;
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
        "fixed top-0 w-full z-50 transition-all duration-400",
        scrolled
          ? "backdrop-blur-xl shadow-md"
          : "bg-transparent"
      )}
      style={
        scrolled
          ? {
              background: "rgba(28, 15, 0, 0.88)",
              borderBottom: "1px solid rgba(201, 168, 76, 0.2)",
            }
          : undefined
      }
    >
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2.5 group relative z-50">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300"
            style={{
              background: "rgba(201, 168, 76, 0.12)",
              border: "1px solid rgba(201, 168, 76, 0.45)",
            }}
          >
            <div
              className="absolute inset-0 animate-pulse"
              style={{ background: "rgba(201, 168, 76, 0.15)" }}
            />
            <LotusIcon className="w-5 h-4 relative z-10" style={{ color: "#C9A84C" }} />
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span
              className="font-bold text-xs tracking-[0.18em] uppercase"
              style={{ color: "#A89070", fontFamily: "'Cinzel', serif" }}
            >
              USHUS 2026
            </span>
            <span
              className="font-black text-lg tracking-wide leading-tight"
              style={{ color: "#C9A84C", fontFamily: "'Cinzel', serif" }}
            >
              VIRENZA
            </span>
          </div>
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
                className={cn(
                  "text-sm font-semibold transition-colors relative group tracking-wide",
                )}
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: active ? "#C9A84C" : "#A89070",
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
                <span
                  className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-200"
                  style={{ background: "#C9A84C" }}
                />
              </Link>
            );
          })}
          <div
            className="flex items-center gap-3 ml-4 pl-4"
            style={{ borderLeft: "1px solid rgba(201, 168, 76, 0.2)" }}
          >
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-sm hover:bg-transparent"
                style={{ color: "#A89070", fontFamily: "'Cinzel', serif", letterSpacing: "0.05em" }}
              >
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <button
                className="h-9 px-5 text-xs font-semibold rounded-md transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #C9A84C, #8B6914)",
                  color: "#1C0F00",
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: "0.08em",
                  boxShadow: "0 0 20px rgba(201, 168, 76, 0.25)",
                }}
              >
                REGISTER
              </button>
            </Link>
          </div>
        </nav>

        {/* ── Mobile Toggle ─────────────────────────────────────────────────── */}
        <button
          className="md:hidden relative z-50 p-2"
          style={{ color: "#C9A84C" }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* ── Mobile Menu ───────────────────────────────────────────────────── */}
        
          {isOpen && (
            <div
 
 
 
 
              className="absolute top-full left-0 w-full backdrop-blur-xl shadow-2xl py-6 px-4 flex flex-col gap-4 md:hidden"
              style={{
                background: "rgba(28, 15, 0, 0.96)",
                borderBottom: "1px solid rgba(201, 168, 76, 0.2)",
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
                      fontFamily: "'Cinzel', serif",
                      color: active ? "#C9A84C" : "#A89070",
                      background: active ? "rgba(201, 168, 76, 0.08)" : "transparent",
                      border: active ? "1px solid rgba(201, 168, 76, 0.2)" : "1px solid transparent",
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div
                className="flex flex-col gap-3 pt-4 mt-2"
                style={{ borderTop: "1px solid rgba(201, 168, 76, 0.15)" }}
              >
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <button
                    className="w-full h-10 rounded-md text-sm font-semibold transition-all"
                    style={{
                      border: "1px solid rgba(201, 168, 76, 0.35)",
                      color: "#C9A84C",
                      background: "transparent",
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    Sign In
                  </button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <button
                    className="w-full h-10 rounded-md text-sm font-semibold transition-all"
                    style={{
                      background: "linear-gradient(135deg, #C9A84C, #8B6914)",
                      color: "#1C0F00",
                      fontFamily: "'Cinzel', serif",
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
