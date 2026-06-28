"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Users, 
  Calendar, 
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardOverview() {
  const { data: session } = useSession();

  // Mock data for the dashboard overview
  const registeredEvent = {
    name: "Best Manager",
    vertical: "Finance",
    status: "CONFIRMED",
    date: "Jan 20, 2026 - 09:00 AM",
  };

  const nextSchedule = {
    title: "Opening Ceremony",
    time: "Jan 20, 2026 - 09:00 AM",
    venue: "Main Auditorium",
  };

  const recentUpdates = [
    { id: 1, text: "Welcome to USHUS 2026! Please collect your ID cards from the registration desk.", time: "2 hours ago" },
    { id: 2, text: "Round 1 details for Best Manager have been published.", time: "5 hours ago" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {session?.user?.name?.split(" ")[0] || "Participant"}!</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your USHUS 2026 journey.</p>
        </div>
      </div>

      {/* Quick Stats / Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Card className="glass border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registration Status</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{registeredEvent.status}</div>
              <p className="text-xs text-muted-foreground mt-1">
                For {registeredEvent.name} ({registeredEvent.vertical})
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Team</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2 Members</div>
              <p className="text-xs text-muted-foreground mt-1">
                Team registration complete
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
          <Card className="glass border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Up Next</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-md font-semibold line-clamp-1">{nextSchedule.title}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {nextSchedule.time} • {nextSchedule.venue}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 pt-4">
        {/* Main Event Card */}
        <Card className="glass border-white/10 lg:col-span-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full filter blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <CardTitle>My Event</CardTitle>
            </div>
            <CardDescription>Details about your registered event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
              <div>
                <h3 className="text-lg font-bold">{registeredEvent.name}</h3>
                <p className="text-sm text-muted-foreground">{registeredEvent.vertical} Domain</p>
              </div>
              <div className="mt-4 sm:mt-0 text-left sm:text-right">
                <div className="text-sm font-medium flex items-center sm:justify-end gap-1">
                  <Calendar className="w-4 h-4" /> {registeredEvent.date}
                </div>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-primary">Important Instruction</h4>
                <p className="text-xs text-primary/80 mt-1 leading-relaxed">
                  Round 1 submissions are due by 5:00 PM today. Ensure your presentation is uploaded in PDF format.
                </p>
              </div>
            </div>

            <Link href="/dashboard/event">
              <Button className="w-full sm:w-auto shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                View Event Hub <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card className="glass border-white/10 lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>Latest announcements from organisers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUpdates.map((update) => (
                <div key={update.id} className="flex gap-3 relative pb-4 last:pb-0">
                  <div className="absolute left-1.5 top-5 bottom-0 w-px bg-white/10 last:hidden" />
                  <div className="w-3 h-3 rounded-full bg-primary/50 border-2 border-background z-10 mt-1 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-foreground/90 leading-relaxed">{update.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{update.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/dashboard/updates">
                <Button variant="outline" className="w-full text-xs h-8">
                  View All Updates
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
