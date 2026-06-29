import Link from "next/link";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-background/50 backdrop-blur-xl pt-16 pb-8 relative z-10 overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50">
                <span className="font-bold text-sm text-primary tracking-tighter">U26</span>
              </div>
              <span className="font-bold text-lg tracking-tight">
                USHUS <span className="text-primary font-light">2026</span>
              </span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              The flagship national-level management fest hosted by Christ University, Bangalore Central Campus. Experience the Constellation of brilliant minds.
            </p>
            <div className="flex gap-4 pt-2">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Navigation</h3>
            <ul className="space-y-2">
              <li><Link href="/#about" className="text-muted-foreground hover:text-primary transition-colors text-sm">About Fest</Link></li>
              <li><Link href="/#events" className="text-muted-foreground hover:text-primary transition-colors text-sm">Events</Link></li>
              <li><Link href="/#schedule" className="text-muted-foreground hover:text-primary transition-colors text-sm">Schedule</Link></li>
              <li><Link href="/#faq" className="text-muted-foreground hover:text-primary transition-colors text-sm">FAQs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Legal</h3>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</Link></li>
              <li><Link href="/guidelines" className="text-muted-foreground hover:text-primary transition-colors text-sm">Code of Conduct</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025-2026 Christ University, Bangalore. All rights reserved.</p>
          <p>Designed and Built by Abhinav Rotti for USHUS 2026</p>
        </div>
      </div>
    </footer>
  );
}
