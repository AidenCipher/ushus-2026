"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Landmark, BookOpen, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function StoryPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-16 px-4 md:py-24">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Navigation & Header */}
        <div className="flex justify-between items-center">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>
          <div className="text-sm font-semibold tracking-widest text-primary uppercase">USHUS LEGACY</div>
        </div>

        {/* Hero title */}
        <div className="text-center space-y-6 border-b border-border pb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            The Journey of USHUS
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Originating from the Sanskrit word meaning &quot;dawn,&quot; USHUS marks the beginning of new eras, creative collaborations, and elite business leadership.
          </p>
        </div>

        {/* Narrative Section */}
        <section className="space-y-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Landmark className="w-6 h-6" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Our Foundation at Christ</h2>
              <p className="text-muted-foreground leading-relaxed">
                USHUS is the signature management festival of the School of Business and Management Studies at Christ University, Bangalore Central Campus. Designed as a crucible for ambitious management professionals, USHUS integrates academic theory with real-time industry pressure.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Over the years, the fest has evolved from a small localized case competition into a massive national-scale gathering, attracting Tier-1 business schools from across the country to compete across core and niche management verticals.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card">
                <CardContent className="p-6 space-y-2">
                  <div className="text-4xl font-black text-primary">10+</div>
                  <div className="text-sm font-semibold">Years of Legacy</div>
                  <p className="text-xs text-muted-foreground">Building business leaders since inception.</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-6 space-y-2">
                  <div className="text-4xl font-black text-primary">100+</div>
                  <div className="text-sm font-semibold">Institutions</div>
                  <p className="text-xs text-muted-foreground">Colleges participating from all over India.</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-6 space-y-2">
                  <div className="text-4xl font-black text-primary">5000+</div>
                  <div className="text-sm font-semibold">Alumni</div>
                  <p className="text-xs text-muted-foreground">Participants who went on to top corporate roles.</p>
                </CardContent>
              </Card>
              <Card className="bg-card">
                <CardContent className="p-6 space-y-2">
                  <div className="text-4xl font-black text-primary">₹15L+</div>
                  <div className="text-sm font-semibold">Prizes Awarded</div>
                  <p className="text-xs text-muted-foreground">Recognizing excellence in execution.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Historical Chapters */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <BookOpen className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold">Historical Impact</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <h3 className="text-xl font-bold">National Reach</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Focused on the future of business management, USHUS brings together diverse cohorts. We simulate real-world executive environments, allowing participants to experience boardroom dynamics firsthand.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">50+</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Colleges</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">1,500+</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Attendees</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">10+</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Events</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
              <h3 className="text-xl font-bold">Industry Relevance</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By integrating complex cross-domain corporate crisis scenarios, USHUS pushes participants to think holistically. Industry leaders serve as judges to provide real-world critique.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-border text-center">
                <div>
                  <div className="text-lg font-bold text-foreground">100%</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Case-Based</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground">Top</div>
                  <div className="text-[10px] text-muted-foreground uppercase">Recruiters</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Participant Testimonials */}
        <section className="space-y-8">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Quote className="text-primary w-6 h-6" />
            <h2 className="text-2xl font-bold">Testimonials from the Arena</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-6">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &quot;Competing in the Best Manager event at USHUS was by far the highlight of my MBA. The pressure-test rounds on day two forced me to utilize every finance and leadership skill I had. The campus hospitality was outstanding.&quot;
              </p>
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">R</div>
                <div>
                  <h4 className="text-xs font-bold">Rahul Menon</h4>
                  <p className="text-[10px] text-muted-foreground">IIM Kozhikode • Best Manager Winner</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-6">
              <p className="text-sm text-muted-foreground italic leading-relaxed">
                &quot;The boardroom dilemma simulation in the HR event felt incredibly real. Being grilled by executive corporate HR heads gave us a mirror into our strategic thinking capability. Incredible learning curve.&quot;
              </p>
              <div className="flex items-center gap-3 border-t border-border pt-4">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">S</div>
                <div>
                  <h4 className="text-xs font-bold">Sneha Reddy</h4>
                  <p className="text-[10px] text-muted-foreground">NMIMS Mumbai • HR Finalist</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <div className="text-center pt-16 mt-8 border-t border-border space-y-6">
          <h2 className="text-2xl font-bold">Ready to write your own chapter?</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            USHUS 2026 is coming on November 4th and 5th. Join 600+ participants competing for the ultimate management glory.
          </p>
          <Link href="/register">
            <Button size="lg">
              Register for USHUS 2026
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}
