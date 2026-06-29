"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { StarryBackground } from "@/components/StarryBackground";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark, Users, BookOpen, Quote, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-background relative text-foreground py-16 px-4 md:py-24 overflow-hidden">
      <StarryBackground />
      
      {/* Background glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full filter blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10 space-y-16">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground hover:bg-white/5 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
          <div className="text-sm font-semibold tracking-widest text-primary uppercase">USHUS LEGACY</div>
        </div>

        {/* Hero title */}
        <div className="text-center space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-indigo-400 to-purple-500"
          >
            The Journey of USHUS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Originating from the Sanskrit word meaning &quot;dawn,&quot; USHUS marks the beginning of new eras, creative collaborations, and elite business leadership.
          </motion.p>
        </div>

        {/* Narrative Section */}
        <section className="space-y-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Landmark className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Our Foundation at Christ</h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                USHUS is the signature management festival of the School of Business and Management Studies at Christ University, Bangalore Central Campus. Designed as a crucible for ambitious management professionals, USHUS integrates academic theory with real-time industry pressure.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Over the years, the fest has evolved from a small localized case competition into a massive national-scale gathering, attracting Tier-1 business schools from across the country to compete across core and niche management verticals.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="glass border-white/5 p-6 hover:border-primary/20 transition-colors">
                <CardContent className="p-0 space-y-2">
                  <div className="text-4xl font-black text-primary">10+</div>
                  <div className="text-sm font-semibold">Years of Legacy</div>
                  <p className="text-xs text-muted-foreground">Building business leaders since inception.</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/5 p-6 hover:border-indigo-400/20 transition-colors">
                <CardContent className="p-0 space-y-2">
                  <div className="text-4xl font-black text-indigo-400">100+</div>
                  <div className="text-sm font-semibold">Institutions</div>
                  <p className="text-xs text-muted-foreground">Colleges participating from all over India.</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/5 p-6 hover:border-purple-400/20 transition-colors">
                <CardContent className="p-0 space-y-2">
                  <div className="text-4xl font-black text-purple-400">5000+</div>
                  <div className="text-sm font-semibold">Alumni</div>
                  <p className="text-xs text-muted-foreground">Participants who went on to top corporate roles.</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/5 p-6 hover:border-rose-500/20 transition-colors">
                <CardContent className="p-0 space-y-2">
                  <div className="text-4xl font-black text-rose-500">₹15L+</div>
                  <div className="text-sm font-semibold">Prizes Awarded</div>
                  <p className="text-xs text-muted-foreground">Recognizing excellence in execution.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Legacy Chapters (2025, 2026) */}
        <section className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <BookOpen className="text-primary w-6 h-6" /> Historical Chapters
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">USHUS 2025</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">Theme: Horizon</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Focused on the future of digitized supply chains and green investing, USHUS 2025 brought 40 colleges together. It was the first year we introduced simulated real-time trading terminals for our finance cohorts.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">40</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Colleges</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">1,200+</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Attendees</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">8</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Events</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">USHUS 2026</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">Theme: Constellation I</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Expanding to 10 events across marketing, HR, and operations, USHUS 2026 hit a record 1,500 registrations. The introduction of complex cross-domain corporate crisis scenarios pushed participants to think holistically.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">50</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Colleges</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">1,500+</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Attendees</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">10</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Events</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Participant Testimonials */}
        <section className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <Quote className="text-primary w-6 h-6" /> Testimonials from the Arena
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-6">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &quot;Competing in the Best Manager event at USHUS was by far the highlight of my MBA. The pressure-test rounds on day two forced me to utilize every finance and leadership skill I had. The campus hospitality was outstanding.&quot;
              </p>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">R</div>
                <div>
                  <h4 className="text-xs font-bold">Rahul Menon</h4>
                  <p className="text-[10px] text-muted-foreground">IIM Kozhikode • Best Manager Winner</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-between space-y-6">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &quot;The boardroom dilemma simulation in the HR event felt incredibly real. Being grilled by executive corporate HR heads gave us a mirror into our strategic thinking capability. Incredible learning curve.&quot;
              </p>
              <div className="flex items-center gap-3 border-t border-white/5 pt-4">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs">S</div>
                <div>
                  <h4 className="text-xs font-bold">Sneha Reddy</h4>
                  <p className="text-[10px] text-muted-foreground">NMIMS Mumbai • HR Finalist</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <div className="text-center pt-8 border-t border-white/10 space-y-6">
          <h2 className="text-2xl font-bold">Ready to write your own chapter?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            USHUS 2027 is coming on November 6th and 7th. Join 500+ participants competing for the ultimate management glory.
          </p>
          <Link href="/register">
            <Button size="lg" className="shadow-[0_0_20px_rgba(var(--primary),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary),0.5)] transition-all">
              Register for USHUS 2027
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
