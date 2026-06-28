"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, FileText, Download, UploadCloud, Clock, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function EventPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Event Hub</h1>
        <p className="text-muted-foreground mt-1">Everything related to Best Manager (Finance).</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Current Round: The Corporate Crisis</CardTitle>
              <CardDescription>Round 1 • Started 2 hours ago</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-sm text-foreground/90 leading-relaxed">
                <p>
                  You are the newly appointed CEO of a failing retail chain. A major PR scandal has just hit the news regarding your supply chain ethics. 
                  You have 24 hours to formulate a comprehensive crisis management strategy, address the board, and draft a press release.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <Button className="w-full h-12 shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                  <UploadCloud className="w-4 h-4 mr-2" />
                  Submit Solution (PDF)
                </Button>
                <Button variant="outline" className="w-full h-12">
                  <Download className="w-4 h-4 mr-2" />
                  Download Case Study
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-danger mt-4 bg-danger/10 px-3 py-2 rounded-md w-fit">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Deadline: Today, 5:00 PM</span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Event Resources</CardTitle>
              <CardDescription>Helpful documents and links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { name: "Rulebook & Guidelines", type: "PDF", size: "2.4 MB" },
                  { name: "Scoring Rubric", type: "PDF", size: "1.1 MB" },
                  { name: "Submission Portal Guide", type: "Link", size: "External" },
                ].map((resource, i) => (
                  <motion.div 
                    key={resource.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-colors border border-transparent hover:border-white/5 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-background flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{resource.name}</p>
                        <p className="text-xs text-muted-foreground">{resource.type} • {resource.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {resource.type === "Link" ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle>Rounds Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { title: "Round 1: Corporate Crisis", status: "In Progress", active: true },
                  { title: "Round 2: Stress Interview", status: "Locked", active: false },
                  { title: "Round 3: Board Meeting", status: "Locked", active: false },
                  { title: "Finals: The Ultimate Pitch", status: "Locked", active: false },
                ].map((round, i) => (
                  <div key={round.title} className="flex gap-4 relative">
                    {i !== 3 && <div className="absolute left-[11px] top-7 bottom-[-20px] w-px bg-white/10" />}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10 ${round.active ? "bg-primary text-primary-foreground shadow-[0_0_10px_rgba(var(--primary),0.5)]" : "bg-white/10 text-muted-foreground"}`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${round.active ? "text-primary" : "text-foreground"}`}>{round.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{round.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-white/10 bg-gradient-to-br from-background to-primary/5">
            <CardContent className="p-6 text-center space-y-4">
              <Trophy className="w-12 h-12 text-primary/50 mx-auto" />
              <div>
                <h3 className="font-semibold">Event Heads</h3>
                <p className="text-sm text-muted-foreground mt-1">Need clarifications about a round? Contact the event heads.</p>
              </div>
              <Link href="/dashboard/support">
                <Button variant="outline" className="w-full">Contact Support</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
