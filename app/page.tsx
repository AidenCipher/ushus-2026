"use client";

import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StarryBackground } from "@/components/StarryBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, MapPin, Users, Sparkles, ChevronRight } from "lucide-react";
import { FEST_CONTENT } from "@/lib/content";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden selection:bg-primary/30 relative">
      <StarryBackground />
      <Navbar />

      <main className="flex-grow relative z-10">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          {/* Ambient Background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob" />
            <div className="absolute top-1/3 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000" />
            <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob animation-delay-4000" />
            
            {/* Stars overlay */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
          </div>

          <div className="container relative z-10 mx-auto px-4">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="max-w-4xl mx-auto text-center"
            >
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-sm text-primary mb-8">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">The flagship management fest is back</span>
              </motion.div>

              <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1]">
                Explore the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-400">
                  Constellation
                </span>
                <br />of Minds.
              </motion.h1>

              <motion.p variants={fadeIn} className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                Join us for two days of intense competition, networking, and celebration at Christ University, Bangalore Central Campus.
              </motion.p>

              <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full text-lg h-14 px-8 shadow-[0_0_30px_rgba(var(--primary),0.3)] hover:shadow-[0_0_40px_rgba(var(--primary),0.5)] transition-all">
                    Register Now <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#events" className="w-full sm:w-auto">
                  <Button variant="glass" size="lg" className="w-full text-lg h-14 px-8">
                    Explore Events
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={fadeIn} className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 pt-10 border-t border-white/10 text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Dates</h4>
                    <p className="text-sm text-muted-foreground">November 6-7, 2027</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <MapPin className="text-indigo-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Location</h4>
                    <p className="text-sm text-muted-foreground">Christ University, BLR</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Users className="text-purple-400 w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Attendees</h4>
                    <p className="text-sm text-muted-foreground">500+ Expected</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-24 bg-black/20 border-y border-white/5 relative">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-6">About <span className="text-primary">USHUS</span></h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  USHUS is the flagship national-level management fest hosted by the School of Business and Management Studies at Christ University, Bangalore Central Campus.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  The theme for 2027, <strong>"Constellation"</strong>, represents the coming together of brilliant, diverse minds from across the nation to form something greater than themselves. Just as stars connect to form meaningful patterns, we challenge future leaders to connect ideas, strategies, and innovations.
                </p>
                <Link href="/story">
                  <Button variant="outline" className="group">
                    Read our story 
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative aspect-square md:aspect-[4/3] rounded-2xl overflow-hidden glass border border-white/10 p-2"
              >
                {/* Placeholder for an impressive video or image */}
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-900/40 rounded-xl flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay" />
                   <Sparkles className="w-24 h-24 text-primary/40 animate-pulse" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Featured Events Section */}
        <section id="events" className="py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Featured <span className="text-primary">Events</span></h2>
              <p className="text-muted-foreground text-lg">
                Compete across multiple domains. Only the best will emerge victorious.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Marketing", slug: "marketing", desc: "Design disruptive campaigns, brand positions, and creative go-to-market strategies.", color: "from-red-500/20 to-transparent", border: "border-red-500/30 hover:border-red-500/50" },
                { name: "Finance", slug: "finance", desc: "Test your financial acumen, asset valuation, and portfolio management skills.", color: "from-teal-500/20 to-transparent", border: "border-teal-500/30 hover:border-teal-500/50" },
                { name: "HR", slug: "hr", desc: "Solve complex human resource dilemmas, leadership challenges, and people operations.", color: "from-yellow-500/20 to-transparent", border: "border-yellow-500/30 hover:border-yellow-500/50" },
                { name: "Operations", slug: "operations", desc: "Optimize logistics, solve supply chain bottlenecks, and design workflows.", color: "from-slate-500/20 to-transparent", border: "border-slate-500/30 hover:border-slate-500/50" },
                { name: "Best Manager", slug: "best-manager", desc: "The ultimate flagship event designed to identify the most comprehensive business leader.", color: "from-purple-500/20 to-transparent", border: "border-purple-500/30 hover:border-purple-500/50" },
                { name: "Sustainability", slug: "sustainability", desc: "Develop corporate action plans resolving carbon footprinting and greenwashing.", color: "from-emerald-500/20 to-transparent", border: "border-emerald-500/30 hover:border-emerald-500/50" }
              ].map((vert, i) => {
                return (
                  <motion.div
                    key={vert.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                  >
                    <Card className={`h-full glass hover:bg-white/5 transition-all duration-300 group ${vert.border} overflow-hidden relative`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${vert.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <CardContent className="p-8 relative z-10">
                        <h3 className="text-2xl font-bold mb-3">{vert.name}</h3>
                        <p className="text-muted-foreground mb-6">{vert.desc}</p>
                        <Link href={`/events/${vert.slug}`} className="text-primary text-sm font-medium flex items-center group-hover:underline">
                          View Domain Events <ArrowRight className="ml-1 w-4 h-4" />
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-12 text-center">
              <Link href="/events">
                <Button variant="outline" size="lg">
                  View All Events
                </Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section id="contact" className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-64 bg-primary/20 filter blur-[100px] rounded-full pointer-events-none" />
          
          <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto glass border border-primary/20 rounded-3xl p-12 shadow-[0_0_50px_rgba(var(--primary),0.1)]"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to make your mark?</h2>
              <p className="text-xl text-muted-foreground mb-8">
                Registrations are closing soon. Don't miss your chance to be part of the Constellation.
              </p>
              <Link href="/register">
                <Button size="lg" className="h-14 px-10 text-lg shadow-[0_0_30px_rgba(var(--primary),0.4)]">
                  Register Now
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
